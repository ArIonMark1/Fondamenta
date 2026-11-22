import { vi } from "vitest";

export type TelegramCall = { method: string; body: Record<string, unknown> };
type Mode = "ok" | "http-error" | "network-error";

/**
 * Replaces global fetch with a fake Telegram Bot API.
 * Records every call so tests can assert what the app sent.
 */
export function mockTelegram(mode: Mode = "ok") {
  const calls: TelegramCall[] = [];
  let current: Mode = mode;

  const fetchMock = vi.fn(async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input instanceof Request ? input.url : input);
    const method = url.split("/").pop() ?? "";
    calls.push({ method, body: init?.body ? JSON.parse(String(init.body)) : {} });

    if (current === "network-error") throw new TypeError("fetch failed");
    if (current === "http-error") return new Response('{"ok":false,"description":"Bad Request"}', { status: 400 });
    return Response.json({ ok: true, result: true });
  });
  vi.stubGlobal("fetch", fetchMock);

  return {
    calls,
    fetchMock,
    setMode: (m: Mode) => (current = m),
    /** Calls to one Bot API method, e.g. byMethod("sendMessage"). */
    byMethod: (m: string) => calls.filter((c) => c.method === m),
  };
}
