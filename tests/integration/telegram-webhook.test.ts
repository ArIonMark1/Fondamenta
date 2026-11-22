import { ObjectId } from "mongodb";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/telegram/route";
import { changeKeyboard, decisionKeyboard } from "@/lib/telegram";
import { clearLeads, leads, resetMongoClient, sampleLead, withUnreachableDb } from "../helpers/db";
import { mockTelegram } from "../helpers/telegram";

const OWNER = 111;
const SECRET = "test-webhook-secret";

/** Builds the request Telegram sends when a button is pressed. */
function callback(data: string, opts: { from?: number; secret?: string | null; body?: string } = {}) {
  const headers = new Headers({ "content-type": "application/json" });
  const secret = opts.secret === undefined ? SECRET : opts.secret;
  if (secret !== null) headers.set("x-telegram-bot-api-secret-token", secret);
  const update = {
    update_id: 1,
    callback_query: {
      id: "cq-1",
      from: { id: opts.from ?? OWNER },
      data,
      message: { message_id: 42, chat: { id: OWNER } },
    },
  };
  return new Request("http://localhost/api/telegram", { method: "POST", headers, body: opts.body ?? JSON.stringify(update) });
}

async function insertLead(overrides = {}) {
  const { insertedId } = await (await leads()).insertOne(sampleLead(overrides));
  return insertedId;
}

const toast = (tg: ReturnType<typeof mockTelegram>) => tg.byMethod("answerCallbackQuery")[0]?.body.text;

beforeEach(clearLeads);
afterAll(resetMongoClient);

describe("POST /api/telegram — auth and input", () => {
  it.each([
    ["missing", null],
    ["wrong", "nope"],
    ["wrong length", SECRET + "x"],
  ])("rejects a %s secret with 401", async (_, secret) => {
    const tg = mockTelegram();
    const res = await POST(callback("confirm:x", { secret }));
    expect(res.status).toBe(401);
    expect(tg.calls).toHaveLength(0);
  });

  it("answers 200 to malformed JSON so Telegram does not retry", async () => {
    mockTelegram();
    expect((await POST(callback("", { body: "{not json" }))).status).toBe(200);
  });

  it("ignores updates without a callback_query", async () => {
    const tg = mockTelegram();
    const res = await POST(callback("", { body: JSON.stringify({ update_id: 1, message: { text: "hi" } }) }));
    expect(res.status).toBe(200);
    expect(tg.calls).toHaveLength(0);
  });

  it("refuses buttons pressed by anyone but the owner", async () => {
    const tg = mockTelegram();
    const id = await insertLead();
    const res = await POST(callback(`confirm:${id}`, { from: 999 }));
    expect(res.status).toBe(200);
    expect(toast(tg)).toBe("Немає доступу");
    expect((await (await leads()).findOne({ _id: id }))?.status).toBe("pending");
  });

  it.each(["confirm:not-an-id", "confirm", "", `explode:${new ObjectId()}`])("rejects bad callback data %j", async (data) => {
    const tg = mockTelegram();
    await POST(callback(data));
    expect(toast(tg)).toBe("Некоректна дія");
  });
});

describe("POST /api/telegram — decisions are written to MongoDB", () => {
  it("confirm → status confirmed in DB, message re-rendered with the change button", async () => {
    const tg = mockTelegram();
    const id = await insertLead();
    const res = await POST(callback(`confirm:${id}`));
    expect(res.status).toBe(200);

    const lead = await (await leads()).findOne({ _id: id });
    expect(lead?.status).toBe("confirmed");
    expect(lead?.statusUpdatedAt).toBeInstanceOf(Date);

    const [edit] = tg.byMethod("editMessageText");
    expect(edit.body).toMatchObject({ chat_id: OWNER, message_id: 42, parse_mode: "HTML", reply_markup: changeKeyboard(id.toHexString()) });
    expect(edit.body.text).toContain("✅ Підтверджено");
    expect(toast(tg)).toBe("Заявку підтверджено");
  });

  it("reject → status rejected in DB", async () => {
    const tg = mockTelegram();
    const id = await insertLead();
    await POST(callback(`reject:${id}`));
    expect((await (await leads()).findOne({ _id: id }))?.status).toBe("rejected");
    expect(tg.byMethod("editMessageText")[0].body.text).toContain("❌ Відхилено");
    expect(toast(tg)).toBe("Заявку відхилено");
  });

  it("change → shows the decision buttons again and keeps the stored status", async () => {
    const tg = mockTelegram();
    const id = await insertLead({ status: "confirmed" });
    await POST(callback(`change:${id}`));
    expect((await (await leads()).findOne({ _id: id }))?.status).toBe("confirmed");
    expect(tg.byMethod("editMessageReplyMarkup")[0].body.reply_markup).toEqual(decisionKeyboard(id.toHexString()));
  });

  it("a decision can be changed after confirming", async () => {
    mockTelegram();
    const id = await insertLead();
    await POST(callback(`confirm:${id}`));
    await POST(callback(`change:${id}`));
    await POST(callback(`reject:${id}`));
    expect((await (await leads()).findOne({ _id: id }))?.status).toBe("rejected");
  });

  it("unknown lead id → 'not found' toast, nothing edited", async () => {
    const tg = mockTelegram();
    await POST(callback(`confirm:${new ObjectId()}`));
    expect(toast(tg)).toBe("Заявку не знайдено");
    expect(tg.byMethod("editMessageText")).toHaveLength(0);
  });

  // Regression: on Vercel, Atlas was unreachable and confirmations silently never reached the DB.
  it("database unreachable → still 200, error toast and a logged error", async () => {
    const log = vi.spyOn(console, "error").mockImplementation(() => {});
    const tg = mockTelegram();
    const res = await withUnreachableDb(() => POST(callback(`confirm:${new ObjectId()}`)));
    expect(res.status).toBe(200);
    expect(toast(tg)).toBe("Помилка, спробуйте ще раз");
    expect(log).toHaveBeenCalledWith("[telegram-webhook] failed to handle callback:", expect.anything());
  });
});
