import { expect, test } from "@playwright/test";
import { E2E } from "./config.mjs";
import { closeDb, eventually, leadsCollection, telegram } from "./helpers";

test.beforeEach(async () => {
  await (await leadsCollection()).deleteMany({});
  await telegram.reset();
});
test.afterAll(closeDb);

const contactForm = (page: import("@playwright/test").Page) =>
  page.locator("form").filter({ has: page.locator('input[name="phone"]') });

test("empty submission shows field errors and saves nothing", async ({ page }) => {
  await page.goto("/it");
  const form = contactForm(page);
  await form.getByRole("button", { name: "Invia richiesta" }).click();

  await expect(form.getByText("Controlla i campi evidenziati.")).toBeVisible();
  await expect(form.getByText("Inserisci nome e cognome.")).toBeVisible();
  await expect(form.getByText("Inserisci un numero di telefono valido.")).toBeVisible();
  await expect(form.getByText("È necessario il consenso per inviare la richiesta.")).toBeVisible();
  expect(await (await leadsCollection()).countDocuments()).toBe(0);
  expect(await telegram.calls()).toEqual([]);
});

test("invalid submission keeps what the user typed", async ({ page }) => {
  await page.goto("/en");
  const form = contactForm(page);
  await form.locator('input[name="name"]').fill("John Smith");
  await form.locator('input[name="phone"]').fill("abc");
  await form.getByRole("button", { name: "Send request" }).click();

  await expect(form.getByText("Please check the highlighted fields.")).toBeVisible();
  await expect(form.locator('input[name="name"]')).toHaveValue("John Smith");
  await expect(form.locator('input[name="phone"]')).toHaveAttribute("aria-invalid", "true");
});

test("full flow: form → MongoDB → Telegram notification → confirm button → MongoDB", async ({ page, request }) => {
  // 1. A visitor fills in and sends the form.
  await page.goto("/it");
  const form = contactForm(page);
  await form.locator('input[name="name"]').fill("Giulia Bianchi");
  await form.locator('input[name="phone"]').fill("+39 345 987 6543");
  await form.locator('input[name="email"]').fill("giulia@example.com");
  await form.locator('select[name="workType"]').selectOption("facade");
  await form.locator('textarea[name="message"]').fill("Cappotto termico, Milano");
  await form.locator('input[name="consent"]').check();
  await form.getByRole("button", { name: "Invia richiesta" }).click();
  await expect(form.getByText("Grazie! Abbiamo ricevuto la tua richiesta")).toBeVisible();

  // 2. The lead is stored as pending.
  const leads = await leadsCollection();
  const lead = await eventually(() => leads.findOne({ name: "Giulia Bianchi" }));
  expect(lead).toMatchObject({ phone: "+39 345 987 6543", email: "giulia@example.com", workType: "facade", status: "pending", locale: "it" });
  const id = lead._id.toHexString();

  // 3. The owner gets a Telegram message with confirm / reject buttons for this lead.
  const sent = await eventually(async () => (await telegram.calls()).find((c) => c.method === "sendMessage"));
  expect(sent.body.chat_id).toBe(String(E2E.chatId));
  expect(sent.body.text).toContain("Giulia Bianchi");
  expect(sent.body.text).toContain("Фасад");
  expect(JSON.stringify(sent.body.reply_markup)).toContain(`confirm:${id}`);

  // 4. The owner presses "Підтвердити": Telegram calls our webhook.
  const res = await request.post("/api/telegram", {
    headers: { "x-telegram-bot-api-secret-token": E2E.webhookSecret },
    data: {
      update_id: 1,
      callback_query: {
        id: "cq-e2e",
        from: { id: E2E.chatId },
        data: `confirm:${id}`,
        message: { message_id: 7, chat: { id: E2E.chatId } },
      },
    },
  });
  expect(res.status()).toBe(200);

  // 5. The decision is in the database and the Telegram message was updated.
  const updated = await leads.findOne({ _id: lead._id });
  expect(updated?.status).toBe("confirmed");
  expect(updated?.statusUpdatedAt).toBeInstanceOf(Date);

  const calls = await telegram.calls();
  const edit = calls.find((c) => c.method === "editMessageText");
  expect(edit?.body.text).toContain("✅ Підтверджено");
  expect(JSON.stringify(edit?.body.reply_markup)).toContain(`change:${id}`);
  expect(calls.find((c) => c.method === "answerCallbackQuery")?.body.text).toBe("Заявку підтверджено");
});
