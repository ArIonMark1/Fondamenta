import { timingSafeEqual } from "node:crypto";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { LeadDocument, LeadStatus } from "@/lib/leads";
import {
  callTelegram,
  changeKeyboard,
  decisionKeyboard,
  formatLeadMessage,
  type CallbackAction,
} from "@/lib/telegram";

/** Subset of a Telegram Update that we care about. */
type Update = {
  callback_query?: {
    id: string;
    from: { id: number };
    data?: string;
    message?: { message_id: number; chat: { id: number } };
  };
};

const decisions: Partial<Record<CallbackAction, { status: LeadStatus; toast: string }>> = {
  confirm: { status: "confirmed", toast: "Заявку підтверджено" },
  reject: { status: "rejected", toast: "Заявку відхилено" },
};

function secretMatches(header: string | null): boolean {
  const expected = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!expected || !header) return false;
  const a = Buffer.from(header);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Telegram retries any non-2xx response, so after the auth check we always
// answer 200 and only log problems.
const ok = () => new Response("ok");

export async function POST(request: Request) {
  if (!secretMatches(request.headers.get("x-telegram-bot-api-secret-token"))) {
    return new Response("unauthorized", { status: 401 });
  }

  let update: Update;
  try {
    update = await request.json();
  } catch {
    return ok();
  }

  const cq = update.callback_query;
  if (!cq) return ok();

  const answer = (text?: string) => callTelegram("answerCallbackQuery", { callback_query_id: cq.id, text });

  // Only the owner may change statuses.
  if (String(cq.from.id) !== process.env.TELEGRAM_CHAT_ID) {
    await answer("Немає доступу");
    return ok();
  }

  const [action, id] = (cq.data ?? "").split(":") as [CallbackAction, string | undefined];
  if (!id || !ObjectId.isValid(id) || !cq.message) {
    await answer("Некоректна дія");
    return ok();
  }
  const target = { chat_id: cq.message.chat.id, message_id: cq.message.message_id };

  try {
    if (action === "change") {
      // Just reopen the choice; the stored status stays until a new decision.
      await callTelegram("editMessageReplyMarkup", { ...target, reply_markup: decisionKeyboard(id) });
      await answer();
      return ok();
    }

    const decision = decisions[action];
    if (!decision) {
      await answer("Некоректна дія");
      return ok();
    }

    const db = await getDb();
    const lead = await db
      .collection<LeadDocument>("leads")
      .findOneAndUpdate(
        { _id: new ObjectId(id) },
        { $set: { status: decision.status, statusUpdatedAt: new Date() } },
        { returnDocument: "after" },
      );
    if (!lead) {
      await answer("Заявку не знайдено");
      return ok();
    }

    // Re-render from the DB document so Telegram always mirrors the stored status.
    await callTelegram("editMessageText", {
      ...target,
      text: formatLeadMessage(lead),
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
      reply_markup: changeKeyboard(id),
    });
    await answer(decision.toast);
  } catch (err) {
    console.error("[telegram-webhook] failed to handle callback:", err);
    await answer("Помилка, спробуйте ще раз");
  }
  return ok();
}
