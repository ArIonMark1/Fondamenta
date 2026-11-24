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

/** A "Metodo" step card, matched by its title (descriptions may contain other titles' words). */
const metodoStep = (page: import("@playwright/test").Page, title: string) =>
  page.locator("#metodo a").filter({ has: page.getByRole("heading", { name: title, exact: true }) });

for (const { lang, step, workType, label } of [
  { lang: "it", step: "Sopralluogo gratuito", workType: "inspection", label: "Sopralluogo gratuito" },
  { lang: "it", step: "Cantiere", workType: "construction", label: "Cantiere" },
  { lang: "en", step: "Turnkey handover", workType: "turnkey", label: "Turnkey handover" },
]) {
  test(`/${lang}: clicking the "${step}" step opens the form with that work type`, async ({ page }) => {
    await page.goto(`/${lang}`);
    await metodoStep(page, step).click();

    await expect(page).toHaveURL(/#preventivo$/);
    const form = contactForm(page);
    await expect(form).toBeInViewport();
    const select = form.locator('select[name="workType"]');
    await expect(select).toHaveValue(workType);
    await expect(select.locator("option:checked")).toHaveText(label);
  });
}

// Portfolio cards (demo content in the E2E build) link to the form with their category.
for (const { path, title, workType } of [
  { path: "/it", title: "Rifacimento tetto in legno ventilato", workType: "roof" },
  { path: "/en/progetti", title: "External insulation for an apartment block", workType: "facade" },
]) {
  test(`${path}: a portfolio card's quote link preselects its category`, async ({ page }) => {
    await page.goto(path);
    const card = page.locator("li[data-category]").filter({ has: page.getByRole("heading", { name: title, exact: true }) });
    await card.getByRole("link").click();

    await expect(page).toHaveURL(/#preventivo$/);
    await expect(contactForm(page).locator('select[name="workType"]')).toHaveValue(workType);
  });
}

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
  // 1. A visitor picks a "Metodo" step, lands on the form and sends it.
  await page.goto("/it");
  await metodoStep(page, "Sopralluogo gratuito").click();
  const form = contactForm(page);
  await form.locator('input[name="name"]').fill("Giulia Bianchi");
  await form.locator('input[name="phone"]').fill("+39 345 987 6543");
  await form.locator('input[name="email"]').fill("giulia@example.com");
  await form.locator('textarea[name="message"]').fill("Cappotto termico, Milano");
  await form.locator('input[name="consent"]').check();
  await form.getByRole("button", { name: "Invia richiesta" }).click();
  await expect(form.getByText("Grazie! Abbiamo ricevuto la tua richiesta")).toBeVisible();

  // 2. The lead is stored as pending.
  const leads = await leadsCollection();
  const lead = await eventually(() => leads.findOne({ name: "Giulia Bianchi" }));
  expect(lead).toMatchObject({ phone: "+39 345 987 6543", email: "giulia@example.com", workType: "inspection", status: "pending", locale: "it" });
  const id = lead._id.toHexString();

  // 3. The owner gets a Telegram message with confirm / reject buttons for this lead.
  const sent = await eventually(async () => (await telegram.calls()).find((c) => c.method === "sendMessage"));
  expect(sent.body.chat_id).toBe(String(E2E.chatId));
  expect(sent.body.text).toContain("Giulia Bianchi");
  expect(sent.body.text).toContain("Безкоштовний огляд");
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
