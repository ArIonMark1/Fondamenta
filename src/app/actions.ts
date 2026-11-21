"use server";

import { headers } from "next/headers";
import { after } from "next/server";
import { getDb } from "@/lib/mongodb";
import { notifyNewLead } from "@/lib/telegram";
import { leadSchema, type LeadDocument, type LeadField, type LeadFormState } from "@/lib/leads";

const fieldNames = ["name", "phone", "email", "workType", "message", "consent", "locale"] as const;

export async function submitLead(_prev: LeadFormState, formData: FormData): Promise<LeadFormState> {
  const raw: Record<string, string> = {};
  for (const key of fieldNames) {
    const v = formData.get(key);
    raw[key] = typeof v === "string" ? v : "";
  }
  const values = raw; // echoed back on error so the form keeps what the user typed

  // Honeypot: real users never fill this hidden field. Pretend success for bots.
  const trap = formData.get("company_website");
  if (typeof trap === "string" && trap.trim() !== "") return { status: "success" };

  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    const fields = [
      ...new Set(parsed.error.issues.map((i) => String(i.path[0]))),
    ].filter((f): f is LeadField => ["name", "phone", "email", "message", "consent"].includes(f));
    return { status: "invalid", fields, values };
  }

  const { name, phone, email, workType, message, locale } = parsed.data;
  const now = new Date();
  const doc: LeadDocument = {
    name,
    phone,
    workType,
    message,
    locale,
    email: email || null,
    consentAt: now,
    status: "pending",
    createdAt: now,
    userAgent: (await headers()).get("user-agent")?.slice(0, 300) ?? null,
  };

  try {
    const db = await getDb();
    const { insertedId } = await db.collection<LeadDocument>("leads").insertOne(doc);
    // Runs after the response is sent: a slow/down Telegram never delays the form.
    after(() => notifyNewLead({ ...doc, _id: insertedId }));
    return { status: "success" };
  } catch (err) {
    console.error("[submitLead] failed to save lead:", err);
    return { status: "error", values };
  }
}
