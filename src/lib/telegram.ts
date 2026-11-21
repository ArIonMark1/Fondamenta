import "server-only";
import type { WithId } from "mongodb";
import type { LeadDocument, LeadStatus, WorkType } from "@/lib/leads";

export type Lead = WithId<LeadDocument>;

const workTypeLabels: Record<WorkType, string> = {
  new_build: "Нове будівництво",
  renovation: "Ремонт",
  roof: "Дах",
  facade: "Фасад",
  other: "Інше",
};

const statusLabels: Record<LeadStatus, string> = {
  pending: "⏳ В очікуванні",
  confirmed: "✅ Підтверджено",
  rejected: "❌ Відхилено",
};

/** Telegram's HTML parse mode only needs these three escaped. */
function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Clickable phone link: tel: URIs accept only digits and a leading +. */
function phoneLink(phone: string): string {
  const tel = phone.replace(/[^\d+]/g, "");
  return `<a href="tel:${tel}">${escapeHtml(phone)}</a>`;
}

function formatDate(d: Date): string {
  return d.toLocaleString("uk-UA", { timeZone: "Europe/Rome", dateStyle: "short", timeStyle: "short" });
}

/** Builds the notification text (Telegram HTML) from the stored lead. */
export function formatLeadMessage(lead: LeadDocument): string {
  // First line = what shows on the lock screen: who + what kind of job.
  const lines = [
    `🆕 <b>${escapeHtml(lead.name)}</b> — ${workTypeLabels[lead.workType]}`,
    "",
    `📞 ${phoneLink(lead.phone)}`,
  ];
  if (lead.email) lines.push(`✉️ ${escapeHtml(lead.email)}`);
  lines.push(`🌐 Мова сайту: ${lead.locale.toUpperCase()}`);
  if (lead.message) lines.push("", `<blockquote>${escapeHtml(lead.message)}</blockquote>`);
  lines.push("", `<i>${formatDate(lead.createdAt)}</i>`);

  const status = statusLabels[lead.status] ?? lead.status;
  const when = lead.status !== "pending" && lead.statusUpdatedAt ? ` · ${formatDate(lead.statusUpdatedAt)}` : "";
  lines.push(`<b>Статус:</b> ${status}${when}`);
  return lines.join("\n");
}

// ── Inline keyboards ────────────────────────────────────────────────
// callback_data = "<action>:<leadId>" (~32 bytes; Telegram's limit is 64).
export type CallbackAction = "confirm" | "reject" | "change";

const button = (text: string, action: CallbackAction, id: string) => ({ text, callback_data: `${action}:${id}` });

export function decisionKeyboard(id: string) {
  return { inline_keyboard: [[button("✅ Підтвердити", "confirm", id), button("❌ Відхилити", "reject", id)]] };
}

export function changeKeyboard(id: string) {
  return { inline_keyboard: [[button("↩️ Змінити", "change", id)]] };
}

/** Keyboard that matches the lead's current status. */
export function keyboardFor(lead: Lead) {
  const id = lead._id.toHexString();
  return lead.status === "pending" ? decisionKeyboard(id) : changeKeyboard(id);
}

// ── Bot API ─────────────────────────────────────────────────────────
/**
 * Calls a Bot API method. Never throws: Telegram problems must not break
 * the caller (the lead is already saved). Returns whether the call succeeded.
 */
export async function callTelegram(method: string, body: Record<string, unknown>): Promise<boolean> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn(`[telegram] TELEGRAM_BOT_TOKEN not set, skipping ${method}`);
    return false;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) {
      console.error(`[telegram] ${method} failed:`, res.status, await res.text());
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[telegram] ${method} error:`, err);
    return false;
  }
}

/** Sends a new lead to the owner's chat, with confirm/reject buttons. */
export async function notifyNewLead(lead: Lead): Promise<void> {
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!chatId) {
    console.warn("[telegram] TELEGRAM_CHAT_ID not set, skipping notification");
    return;
  }
  await callTelegram("sendMessage", {
    chat_id: chatId,
    text: formatLeadMessage(lead),
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
    reply_markup: keyboardFor(lead),
  });
}
