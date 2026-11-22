import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { clearLeads, leads, resetMongoClient, withUnreachableDb } from "../helpers/db";
import { mockTelegram } from "../helpers/telegram";

// Next.js request-scoped APIs don't exist outside a request; replace them.
const afterCallbacks: Array<() => unknown> = [];
vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "user-agent": "Mozilla/5.0 (vitest)" }),
}));
vi.mock("next/server", () => ({
  after: (cb: () => unknown) => void afterCallbacks.push(cb),
}));

const { submitLead } = await import("@/app/actions");

/** Simulates the response being sent: runs everything scheduled with after(). */
async function flushAfter() {
  while (afterCallbacks.length) await afterCallbacks.shift()!();
}

function form(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.set(k, v);
  return fd;
}

const validFields = {
  name: "Mario Rossi",
  phone: "+39 333 123 4567",
  email: "mario@example.com",
  workType: "new_build",
  message: "Villa con piscina",
  consent: "on",
  locale: "it",
};

beforeEach(async () => {
  afterCallbacks.length = 0;
  await clearLeads();
});
afterAll(resetMongoClient);

describe("submitLead (form → MongoDB → Telegram)", () => {
  it("saves a valid lead as pending and notifies Telegram after the response", async () => {
    const tg = mockTelegram();
    const state = await submitLead({ status: "idle" }, form(validFields));
    expect(state).toEqual({ status: "success" });

    const saved = await (await leads()).find().toArray();
    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      name: "Mario Rossi",
      phone: "+39 333 123 4567",
      email: "mario@example.com",
      workType: "new_build",
      status: "pending",
      locale: "it",
      userAgent: "Mozilla/5.0 (vitest)",
    });
    expect(saved[0].consentAt).toBeInstanceOf(Date);

    // Telegram is called only after the response (after()), never blocking the form.
    expect(tg.calls).toHaveLength(0);
    await flushAfter();
    const [msg] = tg.byMethod("sendMessage");
    expect(msg.body.chat_id).toBe("111");
    expect(msg.body.text).toContain("Mario Rossi");
    expect(JSON.stringify(msg.body.reply_markup)).toContain(`confirm:${saved[0]._id.toHexString()}`);
  });

  it("stores an empty email as null", async () => {
    mockTelegram();
    await submitLead({ status: "idle" }, form({ ...validFields, email: "" }));
    expect((await (await leads()).findOne())?.email).toBeNull();
  });

  it("returns invalid with the failed fields and echoes the typed values", async () => {
    const tg = mockTelegram();
    const input = { ...validFields, name: "M", phone: "abc", consent: "" };
    const state = await submitLead({ status: "idle" }, form(input));

    expect(state.status).toBe("invalid");
    if (state.status !== "invalid") return;
    expect(state.fields.sort()).toEqual(["consent", "name", "phone"]);
    expect(state.values).toMatchObject({ name: "M", phone: "abc", email: "mario@example.com" });
    expect(await (await leads()).countDocuments()).toBe(0);
    await flushAfter();
    expect(tg.calls).toHaveLength(0);
  });

  it("silently accepts but drops honeypot (bot) submissions", async () => {
    const tg = mockTelegram();
    const state = await submitLead({ status: "idle" }, form({ ...validFields, company_website: "http://spam" }));
    expect(state).toEqual({ status: "success" });
    expect(await (await leads()).countDocuments()).toBe(0);
    await flushAfter();
    expect(tg.calls).toHaveLength(0);
  });

  it("still saves the lead when Telegram is down", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockTelegram("network-error");
    const state = await submitLead({ status: "idle" }, form(validFields));
    await expect(flushAfter()).resolves.toBeUndefined();
    expect(state).toEqual({ status: "success" });
    expect(await (await leads()).countDocuments()).toBe(1);
  });

  it("returns error (keeping the typed values) when the database is unreachable", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const tg = mockTelegram();
    const state = await withUnreachableDb(() => submitLead({ status: "idle" }, form(validFields)));

    expect(state.status).toBe("error");
    if (state.status === "error") expect(state.values.name).toBe("Mario Rossi");
    expect(log).toHaveBeenCalledWith("[submitLead] failed to save lead:", expect.anything());
    await flushAfter();
    expect(tg.calls).toHaveLength(0); // no notification for a lead that wasn't saved
  });
});
