// Shared by e2e/server.mjs, playwright.config.ts and the specs. Test-only values.
export const E2E = {
  appPort: 3100,
  mongoPort: 27117,
  telegramPort: 3199,
  botToken: "e2e-token",
  chatId: 111,
  webhookSecret: "e2e-webhook-secret",
};
