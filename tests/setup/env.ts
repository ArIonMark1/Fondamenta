import { inject } from "vitest";

// Runs before every test file. Real secrets from .env are never used in tests.
process.env.MONGODB_URI = inject("mongoUri");
process.env.MONGODB_DB = `test_${process.env.VITEST_POOL_ID ?? "0"}_${Math.random().toString(36).slice(2, 8)}`;
process.env.TELEGRAM_BOT_TOKEN = "test-token";
process.env.TELEGRAM_CHAT_ID = "111";
process.env.TELEGRAM_WEBHOOK_SECRET = "test-webhook-secret";
delete process.env.TELEGRAM_API_URL;
