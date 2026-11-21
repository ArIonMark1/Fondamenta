// Manage the Telegram webhook — `npm run tg:webhook -- <https-base-url> | --info | --delete`
// Example (local dev via tunnel): npm run tg:webhook -- https://xxx.trycloudflare.com
const token = process.env.TELEGRAM_BOT_TOKEN;
const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
if (!token) {
  console.error("TELEGRAM_BOT_TOKEN is not set (check .env)");
  process.exit(1);
}

const api = async (method, body) => {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
  return res.json();
};

const arg = process.argv[2];

if (!arg || arg === "--info") {
  const { result } = await api("getWebhookInfo");
  console.log({
    url: result.url || "(not set)",
    pending_update_count: result.pending_update_count,
    last_error: result.last_error_message ?? null,
    last_error_at: result.last_error_date ? new Date(result.last_error_date * 1000).toISOString() : null,
  });
} else if (arg === "--delete") {
  console.log(await api("deleteWebhook", { drop_pending_updates: true }));
} else {
  if (!secret) {
    console.error("TELEGRAM_WEBHOOK_SECRET is not set (check .env)");
    process.exit(1);
  }
  const base = arg.replace(/\/+$/, "");
  if (!base.startsWith("https://")) {
    console.error("Telegram requires an https:// URL");
    process.exit(1);
  }
  const url = `${base}/api/telegram`;
  const res = await api("setWebhook", {
    url,
    secret_token: secret,
    allowed_updates: ["callback_query"],
    drop_pending_updates: true,
  });
  console.log(res.ok ? `Webhook set: ${url}` : res);
}
