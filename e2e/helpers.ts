import { MongoClient } from "mongodb";
import { E2E } from "./config.mjs";

const telegramBase = `http://127.0.0.1:${E2E.telegramPort}`;

export type TelegramCall = { method: string; body: Record<string, unknown> };

export const telegram = {
  calls: async (): Promise<TelegramCall[]> => (await fetch(`${telegramBase}/__calls`)).json(),
  reset: async () => void (await fetch(`${telegramBase}/__reset`, { method: "POST" })),
};

let client: MongoClient | undefined;
export async function leadsCollection() {
  client ??= await MongoClient.connect(`mongodb://127.0.0.1:${E2E.mongoPort}`);
  return client.db("e2e").collection("leads");
}
export async function closeDb() {
  await client?.close();
  client = undefined;
}

/** Polls until `fn` returns a truthy value (after() work and DB writes are async). */
export async function eventually<T>(fn: () => Promise<T | undefined | null | false>, timeoutMs = 5000): Promise<T> {
  const end = Date.now() + timeoutMs;
  for (;;) {
    const v = await fn();
    if (v) return v;
    if (Date.now() > end) throw new Error("condition not met in time");
    await new Promise((r) => setTimeout(r, 100));
  }
}
