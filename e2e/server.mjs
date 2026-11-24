// E2E test server — started by Playwright (see playwright.config.ts).
// Runs the real Next.js production build against throwaway infrastructure:
//   • in-memory MongoDB          → mongodb://127.0.0.1:27117
//   • fake Telegram Bot API      → http://127.0.0.1:3199  (GET /__calls, POST /__reset)
//   • next build + next start    → http://127.0.0.1:3100
// Explicit env vars take precedence over .env, so real Atlas / the real bot are never touched.
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { MongoMemoryServer } from "mongodb-memory-server";
import { E2E } from "./config.mjs";

const mongo = await MongoMemoryServer.create({ instance: { ip: "127.0.0.1", port: E2E.mongoPort } });

const calls = [];
const telegram = createServer((req, res) => {
  let raw = "";
  req.on("data", (c) => (raw += c));
  req.on("end", () => {
    const json = (status, body) => {
      res.writeHead(status, { "content-type": "application/json" });
      res.end(JSON.stringify(body));
    };
    if (req.url === "/__calls") return json(200, calls);
    if (req.url === "/__reset") {
      calls.length = 0;
      return json(200, { ok: true });
    }
    const m = req.url?.match(/^\/bot([^/]+)\/(\w+)$/);
    if (!m || m[1] !== E2E.botToken) return json(401, { ok: false, description: "Unauthorized" });
    calls.push({ method: m[2], body: raw ? JSON.parse(raw) : {} });
    json(200, { ok: true, result: true });
  });
});
await new Promise((r) => telegram.listen(E2E.telegramPort, "127.0.0.1", r));

const env = {
  ...process.env,
  MONGODB_URI: `mongodb://127.0.0.1:${E2E.mongoPort}`,
  MONGODB_DB: "e2e",
  TELEGRAM_API_URL: `http://127.0.0.1:${E2E.telegramPort}`,
  TELEGRAM_BOT_TOKEN: E2E.botToken,
  TELEGRAM_CHAT_ID: String(E2E.chatId),
  TELEGRAM_WEBHOOK_SECRET: E2E.webhookSecret,
  NEXT_TELEMETRY_DISABLED: "1",
  // Build with the demo portfolio / before-after / reviews (hidden on the live site).
  SHOW_DEMO_CONTENT: "1",
};
const next = (args) => spawn(process.execPath, ["node_modules/next/dist/bin/next", ...args], { env, stdio: "inherit" });

let app;
const shutdown = async (code = 0) => {
  app?.kill();
  telegram.close();
  await mongo.stop();
  process.exit(code);
};
process.on("SIGINT", () => shutdown());
process.on("SIGTERM", () => shutdown());

if (!process.env.E2E_SKIP_BUILD) {
  const build = next(["build"]);
  const code = await new Promise((r) => build.on("exit", r));
  if (code !== 0) await shutdown(code ?? 1);
}
app = next(["start", "-p", String(E2E.appPort), "-H", "127.0.0.1"]);
app.on("exit", (code) => shutdown(code ?? 0));
