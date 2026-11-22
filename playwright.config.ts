import { defineConfig, devices } from "@playwright/test";
import { E2E } from "./e2e/config.mjs";

const baseURL = `http://127.0.0.1:${E2E.appPort}`;

export default defineConfig({
  testDir: "./e2e",
  testIgnore: ["prod-flow.spec.ts"], // live-site only (playwright.prod.config.ts)
  fullyParallel: false, // specs share one database and one fake Telegram
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"], ["html", { open: "never" }]],
  use: { baseURL, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "node e2e/server.mjs",
    url: `${baseURL}/api/health`,
    timeout: 300_000, // includes `next build`
    reuseExistingServer: false,
    stdout: "pipe",
  },
});
