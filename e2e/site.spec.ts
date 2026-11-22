import { expect, test, type Page } from "@playwright/test";

/** Collects everything that would mean "the site is broken" while a page is open. */
function watchForErrors(page: Page) {
  const problems: string[] = [];
  page.on("pageerror", (e) => problems.push(`pageerror: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && problems.push(`console.error: ${m.text()}`));
  page.on("response", (r) => r.status() >= 400 && problems.push(`HTTP ${r.status()}: ${r.url()}`));
  page.on("requestfailed", (r) => problems.push(`request failed: ${r.url()} (${r.failure()?.errorText})`));
  return problems;
}

test.describe("routing", () => {
  test("/ redirects to Italian by default", async ({ request }) => {
    const res = await request.get("/", { maxRedirects: 0, headers: { "accept-language": "de-DE" } });
    expect(res.status()).toBe(307);
    expect(res.headers().location).toMatch(/\/it$/);
  });

  test("/ redirects to English for English browsers", async ({ request }) => {
    const res = await request.get("/", { maxRedirects: 0, headers: { "accept-language": "en-US,en;q=0.9" } });
    expect(res.headers().location).toMatch(/\/en$/);
  });

  test("unknown locale is a 404", async ({ request }) => {
    expect((await request.get("/xx")).status()).toBe(404);
  });

  test("health endpoint reports a reachable database", async ({ request }) => {
    const res = await request.get("/api/health");
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ status: "ok", db: "ok", telegram: true });
  });

  test("telegram webhook rejects requests without the secret", async ({ request }) => {
    expect((await request.post("/api/telegram", { data: {} })).status()).toBe(401);
  });
});

for (const [lang, send] of [
  ["it", "Invia richiesta"],
  ["en", "Send request"],
] as const) {
  test(`/${lang} renders without errors and shows the contact form`, async ({ page }) => {
    const problems = watchForErrors(page);
    const res = await page.goto(`/${lang}`);
    expect(res?.status()).toBe(200);
    await expect(page.locator("html")).toHaveAttribute("lang", lang);

    const form = page.locator("form").filter({ has: page.locator('input[name="phone"]') });
    await form.scrollIntoViewIfNeeded();
    await expect(form.getByRole("button", { name: send })).toBeVisible();

    // Scroll through the page so lazy images and scroll effects load too.
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 50));
      }
    });
    await page.waitForLoadState("networkidle");
    expect(problems, `problems on /${lang}`).toEqual([]);
  });
}
