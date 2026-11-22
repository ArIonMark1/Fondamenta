// Smoke-check a deployed site — `npm run check:prod [-- https://other-url]`.
// Read-only: never submits the form or sends Telegram messages.
const base = (process.argv[2] || "https://fondamenta-ashen.vercel.app").replace(/\/+$/, "");
const token = process.env.TELEGRAM_BOT_TOKEN;

let failed = 0;
async function check(name, fn) {
  try {
    const detail = await fn();
    console.log(`✅ ${name}${detail ? `  (${detail})` : ""}`);
  } catch (err) {
    failed++;
    console.log(`❌ ${name}\n   → ${err.message}`);
  }
}
/** `message` may be a function so it is only built when the check fails. */
function assert(cond, message) {
  if (!cond) throw new Error(typeof message === "function" ? message() : message);
}
const get = (path, init) => fetch(base + path, { redirect: "manual", signal: AbortSignal.timeout(15000), ...init });

console.log(`Checking ${base}\n`);

await check("/ redirects to a language", async () => {
  const res = await get("/", { headers: { "accept-language": "it-IT" } });
  const loc = res.headers.get("location") ?? "";
  assert([307, 308].includes(res.status) && /\/(it|en)$/.test(loc), `got ${res.status} → ${loc || "(no location)"}`);
  return `${res.status} → ${loc}`;
});

for (const lang of ["it", "en"]) {
  await check(`/${lang} loads with the contact form`, async () => {
    const res = await get(`/${lang}`);
    assert(res.status === 200, `HTTP ${res.status}${res.headers.get("location")?.includes("vercel.com") ? " (Vercel login wall — Deployment Protection)" : ""}`);
    const html = await res.text();
    assert(html.includes('name="phone"'), "contact form not found in HTML");
    return `HTTP 200, ${Math.round(html.length / 1024)} KB`;
  });
}

await check("unknown page returns 404", async () => {
  const res = await get("/xx");
  assert(res.status === 404, `HTTP ${res.status}`);
});

await check("/api/health — database reachable from the deployment", async () => {
  const res = await get("/api/health");
  assert(res.status !== 404, "HTTP 404 — /api/health is not deployed yet (push to main)");
  const body = await res.json().catch(() => ({}));
  assert(res.status === 200 && body.db === "ok",
    `HTTP ${res.status} ${JSON.stringify(body)} — check MongoDB Atlas → Network Access (Vercel needs 0.0.0.0/0) and MONGODB_URI on Vercel`);
  assert(body.telegram === true, "TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID are not set on Vercel");
  return "db ok, telegram configured";
});

await check("/api/telegram rejects requests without the secret", async () => {
  const res = await get("/api/telegram", { method: "POST", body: "{}", headers: { "content-type": "application/json" } });
  assert(res.status === 401, `HTTP ${res.status}`);
});

await check("Telegram webhook points here and has no delivery errors", async () => {
  assert(token, "TELEGRAM_BOT_TOKEN not set in .env (needed to read webhook info)");
  const { result: info } = await (await fetch(`https://api.telegram.org/bot${token}/getWebhookInfo`)).json();
  assert(info.url === `${base}/api/telegram`, `webhook url is ${info.url || "(not set)"} — run: npm run tg:webhook -- ${base}`);
  assert(!info.last_error_message, () => `last error: ${info.last_error_message} at ${new Date(info.last_error_date * 1000).toISOString()}`);
  assert(!info.pending_update_count, `${info.pending_update_count} updates waiting to be delivered`);
  return info.url;
});

console.log(failed ? `\n${failed} check(s) failed.` : "\nAll checks passed.");
process.exit(failed ? 1 : 0);
