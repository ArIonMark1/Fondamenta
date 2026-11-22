import { connection } from "next/server";
import { getDb } from "@/lib/mongodb";

/**
 * Liveness probe: is the database reachable from this deployment?
 * Used by `npm run check:prod`. Never exposes error details or secrets.
 */
export async function GET() {
  await connection(); // always run at request time, never prerender at build

  const telegram = Boolean(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID);
  const headers = { "Cache-Control": "no-store" };

  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return Response.json({ status: "ok", db: "ok", telegram }, { headers });
  } catch (err) {
    console.error("[health] database check failed:", err);
    return Response.json({ status: "error", db: "error", telegram }, { status: 503, headers });
  }
}
