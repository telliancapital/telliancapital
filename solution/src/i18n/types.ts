import type { Locale } from "../content";

export type { Locale };

export type LocaleValue =
  | { de?: string | null; en?: string | null; fr?: string | null }
  | string
  | null
  | undefined;

/**
 * Resolve a {de, en, fr} object to a single string in the active language.
 * Falls back to German, then English, then French, then the provided default.
 *
 * Accepts plain strings too, so you can drop it everywhere without guards.
 */
export function pickLocale(value: LocaleValue, lang: Locale, fallback = ""): string {
  if (value == null) return fallback;
  if (typeof value === "string") return value || fallback;
  const primary = value[lang];
  if (primary && primary.trim()) return primary;
  const order: Locale[] = ["de", "en", "fr"].filter((l) => l !== lang) as Locale[];
  for (const l of order) {
    const candidate = value[l];
    if (candidate && candidate.trim()) return candidate;
  }
  return fallback;
}
