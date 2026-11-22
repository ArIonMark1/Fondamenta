import { describe, expect, it } from "vitest";
import { leadSchema } from "@/lib/leads";

const valid = {
  name: "Mario Rossi",
  phone: "+39 333 123-4567",
  email: "mario@example.com",
  workType: "roof",
  message: "Rifacimento tetto",
  consent: "on",
  locale: "it",
};

const failedFields = (input: Record<string, unknown>) => {
  const r = leadSchema.safeParse(input);
  return r.success ? [] : r.error.issues.map((i) => String(i.path[0]));
};

describe("leadSchema", () => {
  it("accepts a complete, valid lead and trims text", () => {
    const r = leadSchema.safeParse({ ...valid, name: "  Mario Rossi  " });
    expect(r.success).toBe(true);
    expect(r.data?.name).toBe("Mario Rossi");
  });

  it("allows an empty email and an empty message", () => {
    expect(failedFields({ ...valid, email: "", message: "" })).toEqual([]);
  });

  it.each([
    ["name", { name: "" }],
    ["name", { name: "A" }],
    ["name", { name: "x".repeat(101) }],
    ["phone", { phone: "abc" }],
    ["phone", { phone: "123" }],
    ["phone", { phone: "1".repeat(21) }],
    ["email", { email: "not-an-email" }],
    ["message", { message: "x".repeat(2001) }],
    ["consent", { consent: "" }],
    ["consent", { consent: "yes" }],
    ["workType", { workType: "pool" }],
    ["locale", { locale: "de" }],
  ])("rejects an invalid %s (%j)", (field, patch) => {
    expect(failedFields({ ...valid, ...patch })).toContain(field);
  });

  it("reports every invalid field at once", () => {
    expect(failedFields({ ...valid, name: "", phone: "", consent: "" }).sort()).toEqual(["consent", "name", "phone"]);
  });
});
