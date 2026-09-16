import { spanish } from "./es";

export type Language = "es" | "en";
export const LANGUAGE_STORAGE_KEY = "adelvio-language";
export const isLanguage = (value: unknown): value is Language =>
  value === "es" || value === "en";

/** Explicit link, saved choice, first supported browser preference, Spanish fallback. */
export function resolveLanguage(
  query: unknown,
  saved: unknown,
  preferences: readonly string[],
): Language {
  if (isLanguage(query)) return query;
  if (isLanguage(saved)) return saved;
  for (const preference of preferences) {
    const code = preference.toLowerCase().split(/[-_]/)[0];
    if (isLanguage(code)) return code;
  }
  return "es";
}

export function translate(
  language: Language,
  source: string,
  values: Record<string, string | number> = {},
) {
  const text = language === "es" ? (spanish[source] ?? source) : source;
  return text.replace(/\{(\w+)\}/g, (match, key) =>
    values[key] === undefined ? match : String(values[key]),
  );
}
