export type Lang = "de" | "en";

export type LocaleValue = { de?: string | null; en?: string | null } | string | null | undefined;

/**
 * Resolve a {de, en} object to a single string in the active language.
 * Falls back to the other language, then to the provided default.
 *
 * Accepts plain strings too, so you can drop it everywhere without guards.
 */
export function pickLocale(value: LocaleValue, lang: Lang, fallback = ""): string {
  if (value == null) return fallback;
  if (typeof value === "string") return value || fallback;
  const primary = value[lang];
  if (primary && primary.trim()) return primary;
  const other: Lang = lang === "de" ? "en" : "de";
  const secondary = value[other];
  if (secondary && secondary.trim()) return secondary;
  return fallback;
}
