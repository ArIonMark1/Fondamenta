import { afterAll, describe, expect, it, vi } from "vitest";
import { resetMongoClient, withUnreachableDb } from "../helpers/db";

// connection() only works inside a Next.js request; here it is a no-op.
vi.mock("next/server", () => ({ connection: async () => {} }));
const { GET } = await import("@/app/api/health/route");

afterAll(resetMongoClient);

describe("GET /api/health", () => {
  it("returns 200 when the database answers", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(await res.json()).toEqual({ status: "ok", db: "ok", telegram: true });
  });

  it("returns 503 without leaking error details when the database is unreachable", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await withUnreachableDb(() => GET());
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body).toEqual({ status: "error", db: "error", telegram: true });
    expect(JSON.stringify(body)).not.toMatch(/mongodb:|127\.0\.0\.1/);
  });

  it("reports telegram: false when the bot is not configured", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "");
    expect((await (await GET()).json()).telegram).toBe(false);
  });
});
