import type { Collection } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { LeadDocument } from "@/lib/leads";

const globalForMongo = globalThis as unknown as { _mongoClient?: Promise<import("mongodb").MongoClient> };

export async function leads(): Promise<Collection<LeadDocument>> {
  return (await getDb()).collection<LeadDocument>("leads");
}

export async function clearLeads() {
  await (await leads()).deleteMany({});
}

/** Closes and forgets the cached client so the next getDb() reconnects with current env. */
export async function resetMongoClient() {
  const pending = globalForMongo._mongoClient;
  globalForMongo._mongoClient = undefined;
  if (pending) await pending.then((c) => c.close()).catch(() => {});
}

/**
 * Points the app at a MongoDB that cannot be reached, runs `fn`, then restores
 * the real test database. Simulates what happened on Vercel (Atlas unreachable).
 */
export async function withUnreachableDb<T>(fn: () => Promise<T>): Promise<T> {
  const realUri = process.env.MONGODB_URI;
  await resetMongoClient();
  // Port 9 (discard) is never a MongoDB server; short timeout keeps the test fast.
  process.env.MONGODB_URI = "mongodb://127.0.0.1:9/?serverSelectionTimeoutMS=300&connectTimeoutMS=300";
  try {
    return await fn();
  } finally {
    await resetMongoClient();
    process.env.MONGODB_URI = realUri;
  }
}

export function sampleLead(overrides: Partial<LeadDocument> = {}): LeadDocument {
  const now = new Date("2026-11-22T10:00:00Z");
  return {
    name: "Mario Rossi",
    phone: "+39 333 123 4567",
    email: "mario@example.com",
    workType: "renovation",
    message: "Ristrutturazione bagno",
    locale: "it",
    consentAt: now,
    status: "pending",
    createdAt: now,
    userAgent: "vitest",
    ...overrides,
  };
}
