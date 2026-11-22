import { defineConfig, devices } from "@playwright/test";

// Runs browser tests against the LIVE site — `npm run test:prod [-- --grep ...]`.
// site.spec.ts is read-only; prod-flow.spec.ts submits one clearly-labelled test
// lead (real Telegram notification) and deletes it from the database afterwards.
// Needs .env (MONGODB_URI, TELEGRAM_*) — loaded by the npm script.
export default defineConfig({
  testDir: "./e2e",
  testMatch: ["site.spec.ts", "prod-flow.spec.ts"],
  workers: 1,
  retries: 1, // the network to a remote site can blip
  reporter: [["list"]],
  use: {
    baseURL: process.env.PROD_URL || "https://fondamenta-ashen.vercel.app",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
