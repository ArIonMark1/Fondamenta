import { ObjectId } from "mongodb";
import { describe, expect, it, vi } from "vitest";
import { workTypes } from "@/lib/leads";
import {
  callTelegram,
  changeKeyboard,
  decisionKeyboard,
  formatLeadMessage,
  keyboardFor,
  notifyNewLead,
} from "@/lib/telegram";
import { sampleLead } from "../helpers/db";
import { mockTelegram } from "../helpers/telegram";

describe("formatLeadMessage", () => {
  it("contains the key lead data and the pending status", () => {
    const text = formatLeadMessage(sampleLead());
    expect(text).toContain("<b>Mario Rossi</b> — Ремонт");
    expect(text).toContain('<a href="tel:+393331234567">+39 333 123 4567</a>');
    expect(text).toContain("✉️ mario@example.com");
    expect(text).toContain("Мова сайту: IT");
    expect(text).toContain("<blockquote>Ristrutturazione bagno</blockquote>");
    expect(text).toContain("<b>Статус:</b> ⏳ В очікуванні");
  });

  it("has a Ukrainian label for every work type", () => {
    for (const workType of workTypes) {
      const firstLine = formatLeadMessage(sampleLead({ workType })).split("\n")[0];
      expect(firstLine).toMatch(/— \S/);
      expect(firstLine).not.toContain("undefined");
    }
    expect(formatLeadMessage(sampleLead({ workType: "inspection" }))).toContain("— Безкоштовний огляд");
    expect(formatLeadMessage(sampleLead({ workType: "turnkey" }))).toContain("— Під ключ");
  });

  it("escapes HTML in user input so Telegram does not reject the message", () => {
    const text = formatLeadMessage(sampleLead({ name: "<b>Evil</b> & Co", message: "a < b > c", email: "x@y.it<script>" }));
    expect(text).toContain("&lt;b&gt;Evil&lt;/b&gt; &amp; Co");
    expect(text).toContain("a &lt; b &gt; c");
    expect(text).toContain("x@y.it&lt;script&gt;");
    expect(text).not.toContain("<script>");
  });

  it("omits optional email and message lines", () => {
    const text = formatLeadMessage(sampleLead({ email: null, message: "" }));
    expect(text).not.toContain("✉️");
    expect(text).not.toContain("<blockquote>");
  });

  it("shows the decision and its time only for decided leads", () => {
    const decidedAt = new Date("2026-11-22T12:30:00Z");
    expect(formatLeadMessage(sampleLead({ status: "confirmed", statusUpdatedAt: decidedAt }))).toMatch(/✅ Підтверджено · .+/);
    expect(formatLeadMessage(sampleLead({ status: "rejected", statusUpdatedAt: decidedAt }))).toMatch(/❌ Відхилено · .+/);
    expect(formatLeadMessage(sampleLead({ status: "pending", statusUpdatedAt: decidedAt }))).not.toContain(" · ");
  });
});

describe("inline keyboards", () => {
  const id = new ObjectId().toHexString();

  it("decision keyboard has confirm and reject buttons for the lead", () => {
    const [[confirm, reject]] = decisionKeyboard(id).inline_keyboard;
    expect(confirm.callback_data).toBe(`confirm:${id}`);
    expect(reject.callback_data).toBe(`reject:${id}`);
  });

  it("change keyboard reopens the decision", () => {
    expect(changeKeyboard(id).inline_keyboard[0][0].callback_data).toBe(`change:${id}`);
  });

  it("callback_data fits Telegram's 64-byte limit", () => {
    for (const kb of [decisionKeyboard(id), changeKeyboard(id)]) {
      for (const b of kb.inline_keyboard.flat()) expect(Buffer.byteLength(b.callback_data)).toBeLessThanOrEqual(64);
    }
  });

  it("keyboardFor matches the stored status", () => {
    const _id = new ObjectId();
    expect(keyboardFor({ ...sampleLead(), _id })).toEqual(decisionKeyboard(_id.toHexString()));
    expect(keyboardFor({ ...sampleLead({ status: "confirmed" }), _id })).toEqual(changeKeyboard(_id.toHexString()));
  });
});

describe("callTelegram", () => {
  it("posts JSON to the Bot API and returns true on success", async () => {
    const tg = mockTelegram();
    await expect(callTelegram("sendMessage", { chat_id: "1", text: "hi" })).resolves.toBe(true);
    expect(tg.fetchMock).toHaveBeenCalledWith(
      "https://api.telegram.org/bottest-token/sendMessage",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ chat_id: "1", text: "hi" }) }),
    );
  });

  it("honours TELEGRAM_API_URL (used by E2E tests)", async () => {
    vi.stubEnv("TELEGRAM_API_URL", "http://127.0.0.1:3199");
    const tg = mockTelegram();
    await callTelegram("getMe", {});
    expect(tg.fetchMock.mock.calls[0][0]).toBe("http://127.0.0.1:3199/bottest-token/getMe");
  });

  it("skips the request when the token is missing", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const tg = mockTelegram();
    await expect(callTelegram("sendMessage", {})).resolves.toBe(false);
    expect(tg.fetchMock).not.toHaveBeenCalled();
  });

  it.each(["http-error", "network-error"] as const)("never throws on %s, returns false and logs", async (mode) => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    mockTelegram(mode);
    await expect(callTelegram("sendMessage", {})).resolves.toBe(false);
    expect(log).toHaveBeenCalled();
  });
});

describe("notifyNewLead", () => {
  it("sends the lead to the owner's chat with decision buttons", async () => {
    const tg = mockTelegram();
    const lead = { ...sampleLead(), _id: new ObjectId() };
    await notifyNewLead(lead);

    const [msg] = tg.byMethod("sendMessage");
    expect(msg.body).toMatchObject({
      chat_id: "111",
      parse_mode: "HTML",
      text: formatLeadMessage(lead),
      reply_markup: decisionKeyboard(lead._id.toHexString()),
    });
  });

  it("does nothing when TELEGRAM_CHAT_ID is missing", async () => {
    vi.stubEnv("TELEGRAM_CHAT_ID", "");
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const tg = mockTelegram();
    await notifyNewLead({ ...sampleLead(), _id: new ObjectId() });
    expect(tg.calls).toHaveLength(0);
  });
});
