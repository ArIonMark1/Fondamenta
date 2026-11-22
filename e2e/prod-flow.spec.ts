import { expect, test } from "@playwright/test";
import { MongoClient, type ObjectId } from "mongodb";

// LIVE end-to-end check (playwright.prod.config.ts only):
// production form → Atlas → webhook "confirm" → Atlas, then cleanup.
const { MONGODB_URI, MONGODB_DB, TELEGRAM_CHAT_ID, TELEGRAM_WEBHOOK_SECRET } = process.env;

test.skip(!MONGODB_URI || !TELEGRAM_CHAT_ID || !TELEGRAM_WEBHOOK_SECRET, "needs .env with MONGODB_URI and TELEGRAM_*");

let client: MongoClient;
let leadId: ObjectId | undefined;

test.beforeAll(async () => {
  client = await MongoClient.connect(MONGODB_URI!, { serverSelectionTimeoutMS: 10_000 });
});
test.afterAll(async () => {
  if (leadId) await client.db(MONGODB_DB || "fondamenta").collection("leads").deleteOne({ _id: leadId });
  await client?.close();
});

test("production: form → MongoDB → confirm via webhook → MongoDB", async ({ page, request }) => {
  const leads = client.db(MONGODB_DB || "fondamenta").collection("leads");
  const name = `E2E Test ${new Date().toISOString().slice(0, 16).replace("T", " ")}`;

  // 1. Submit the real form on the live site.
  await page.goto("/it");
  const form = page.locator("form").filter({ has: page.locator('input[name="phone"]') });
  await form.locator('input[name="name"]').fill(name);
  await form.locator('input[name="phone"]').fill("+39 000 000 0000");
  await form.locator('select[name="workType"]').selectOption("other");
  await form.locator('textarea[name="message"]').fill("Автоматичний тест, можна ігнорувати — заявку буде видалено.");
  await form.locator('input[name="consent"]').check();
  await form.getByRole("button", { name: "Invia richiesta" }).click();
  await expect(form.getByText("Grazie! Abbiamo ricevuto la tua richiesta")).toBeVisible({ timeout: 15_000 });

  // 2. The lead reached Atlas as pending.
  await expect.poll(async () => (await leads.findOne({ name }))?.status, { timeout: 15_000 }).toBe("pending");
  const lead = (await leads.findOne({ name }))!;
  leadId = lead._id;

  // 3. Simulate the owner pressing "Підтвердити" (exactly what Telegram sends).
  //    message_id is fake, so the Telegram message edit fails harmlessly; the DB write is what we verify.
  const res = await request.post("/api/telegram", {
    headers: { "x-telegram-bot-api-secret-token": TELEGRAM_WEBHOOK_SECRET! },
    data: {
      update_id: 1,
      callback_query: {
        id: "e2e-prod",
        from: { id: Number(TELEGRAM_CHAT_ID) },
        data: `confirm:${lead._id.toHexString()}`,
        message: { message_id: 2147483647, chat: { id: Number(TELEGRAM_CHAT_ID) } },
      },
    },
  });
  expect(res.status()).toBe(200);

  // 4. The confirmation is stored in Atlas.
  await expect.poll(async () => (await leads.findOne({ _id: lead._id }))?.status, { timeout: 15_000 }).toBe("confirmed");
  expect((await leads.findOne({ _id: lead._id }))?.statusUpdatedAt).toBeInstanceOf(Date);
});
