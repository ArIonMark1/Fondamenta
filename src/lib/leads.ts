import { z } from "zod";

export const workTypes = ["new_build", "renovation", "roof", "facade", "other"] as const;
export type WorkType = (typeof workTypes)[number];

export const leadSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s().-]{6,20}$/),
  email: z.union([z.literal(""), z.email().max(200)]),
  workType: z.enum(workTypes),
  message: z.string().trim().max(2000),
  consent: z.literal("on"),
  locale: z.enum(["it", "en"]),
});

export type LeadInput = z.infer<typeof leadSchema>;
export type LeadField = "name" | "phone" | "email" | "message" | "consent";

/** pending until the owner confirms/rejects it from the Telegram notification. */
export const leadStatuses = ["pending", "confirmed", "rejected"] as const;
export type LeadStatus = (typeof leadStatuses)[number];

/** Shape stored in the `leads` collection. */
export type LeadDocument = Omit<LeadInput, "consent" | "email"> & {
  email: string | null;
  consentAt: Date;
  status: LeadStatus;
  statusUpdatedAt?: Date;
  createdAt: Date;
  userAgent: string | null;
};

export type LeadFormState =
  | { status: "idle" }
  | { status: "success" }
  | { status: "invalid"; fields: LeadField[]; values: Record<string, string> }
  | { status: "error"; values: Record<string, string> };
