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

// Portfolio, "Prima e Dopo" and reviews. The E2E build shows the demo content
// (SHOW_DEMO_CONTENT=1, see e2e/server.mjs); the live site hides it.
for (const lang of ["it", "en"] as const) {
  test(`/${lang}/progetti renders without errors`, async ({ page }) => {
    const problems = watchForErrors(page);
    const res = await page.goto(`/${lang}/progetti`);
    expect(res?.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("main li[data-category]").first()).toBeVisible();

    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 50));
      }
    });
    await page.waitForLoadState("networkidle");
    expect(problems, `problems on /${lang}/progetti`).toEqual([]);
  });
}

test("homepage shows portfolio, before/after and reviews sections", async ({ page }) => {
  await page.goto("/it");
  for (const id of ["progetti", "prima-e-dopo", "recensioni"]) {
    await expect(page.locator(`section#${id}`)).toHaveCount(1);
  }
  await expect(page.locator("#progetti li[data-category]")).toHaveCount(6);
  await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Progetti" })).toHaveAttribute("href", "/it/progetti");
});

test("portfolio filter shows only the chosen category", async ({ page }) => {
  await page.goto("/it/progetti");
  const cards = page.locator("main li[data-category]");
  const total = await cards.count();
  const filters = page.getByRole("group", { name: "Filtra per categoria" });

  await filters.getByRole("button", { name: "Tetti" }).click();
  await expect(filters.getByRole("button", { name: "Tetti" })).toHaveAttribute("aria-pressed", "true");
  await expect(cards.first()).toBeVisible();
  const roofCount = await cards.count();
  expect(roofCount).toBeLessThan(total);
  await expect(cards.and(page.locator(':not([data-category="roof"])'))).toHaveCount(0);

  await filters.getByRole("button", { name: "Tutti" }).click();
  await expect(cards).toHaveCount(total);
});

test("before/after slider moves with the keyboard", async ({ page }) => {
  await page.goto("/en");
  const slider = page.getByRole("slider", { name: /Before and after comparison/ });
  await slider.scrollIntoViewIfNeeded();
  await expect(slider).toHaveValue("50");
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(slider).toHaveValue("52");
  await page.keyboard.press("Home");
  await expect(slider).toHaveValue("0");
});

test("language switch on /it/progetti stays on the projects page", async ({ page }) => {
  await page.goto("/it/progetti");
  await page.getByRole("group", { name: "Language" }).getByRole("link", { name: "en" }).click();
  await expect(page).toHaveURL(/\/en\/progetti$/);
});

// Local SEO and the office map.
test("/it describes the business for search engines", async ({ page }) => {
  await page.goto("/it");
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  const business = blocks.map((b) => JSON.parse(b)).find((d) => d["@type"] === "GeneralContractor");
  expect(business?.address).toMatchObject({ streetAddress: "Via Pistola, 10", postalCode: "33080", addressLocality: "Porcia" });

  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/it$/);
  await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", /\/en$/);
  await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute("href", /\/it$/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/images\/hero_buildings\.jpg$/);
  await expect(page.getByRole("contentinfo").locator("address")).toContainText("Via Pistola, 10, 33080 Porcia (PN)");
});

test("the map loads from Google only after the visitor asks for it", async ({ page }) => {
  // No real Google request in tests: answer the embed with an empty page.
  const googleRequests: string[] = [];
  await page.route(/google\.com\/maps/, (route) => {
    googleRequests.push(route.request().url());
    return route.fulfill({ status: 200, contentType: "text/html", body: "<html></html>" });
  });

  await page.goto("/it");
  const show = page.getByRole("button", { name: "Mostra la mappa" });
  await show.scrollIntoViewIfNeeded();
  await page.waitForLoadState("networkidle");
  expect(googleRequests).toEqual([]);
  await expect(page.getByRole("contentinfo").locator("iframe")).toHaveCount(0);

  await show.click();
  const map = page.getByRole("contentinfo").locator("iframe");
  await expect(map).toHaveAttribute("src", /maps\?q=Via%20Pistola%2C%2010%2C%2033080%20Porcia%20PN/);
  await expect.poll(() => googleRequests.length).toBeGreaterThan(0);
  await expect(page.getByRole("link", { name: "Indicazioni stradali" })).toHaveAttribute("href", /maps\/dir\/.*destination=/);
});

test("sitemap.xml and robots.txt are served", async ({ request }) => {
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  for (const path of ["/it<", "/en<", "/it/progetti<", "/en/progetti<"]) expect(xml).toContain(path);

  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  const txt = await robots.text();
  expect(txt).toMatch(/Disallow: \/api\//);
  expect(txt).toMatch(/Sitemap: https?:\/\/.+\/sitemap\.xml/);
});

for (const { width, name } of [
  { width: 1440, name: "desktop" },
  { width: 390, name: "mobile" },
]) {
  test(`reviews slideshow scrolls with the arrows (${name})`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/it");
    const carousel = page.getByRole("region", { name: "RECENSIONI DEI CLIENTI" });
    await carousel.scrollIntoViewIfNeeded();
    const track = carousel.locator("ul");
    const prev = carousel.getByRole("button", { name: "Recensione precedente" });
    const next = carousel.getByRole("button", { name: "Recensione successiva" });

    await expect(prev).toBeDisabled();
    await expect(next).toBeEnabled();
    await next.click();
    await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(0);
    await expect(prev).toBeEnabled();

    // Scroll to the end: "next" turns off.
    await track.evaluate((el) => el.scrollTo({ left: el.scrollWidth, behavior: "auto" }));
    await expect(next).toBeDisabled();
  });
}
