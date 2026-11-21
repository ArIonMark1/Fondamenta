import it, { type Dictionary } from "./it";
import en from "./en";

export const locales = ["it", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "it";

const dictionaries: Record<Locale, Dictionary> = { it, en };

export const hasLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale];

export type { Dictionary };
