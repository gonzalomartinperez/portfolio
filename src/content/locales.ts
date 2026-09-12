export const locales = ["en", "es"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  es: "Español",
};

/** Short label for the switcher, where space is tight. */
export const localeCodes: Record<Locale, string> = {
  en: "EN",
  es: "ES",
};

export const htmlLang: Record<Locale, string> = {
  en: "en",
  es: "es",
};

/**
 * English is served without a prefix so the site's existing URLs keep working; Spanish lives
 * under `/es`. Path segments stay in English in both languages, so a link can be translated by
 * adding or removing the prefix and nothing else.
 */
export function localePath(locale: Locale, path: string): string {
  const clean = path === "/" ? "" : path;
  return locale === defaultLocale ? clean || "/" : `/es${clean}`;
}

/** Strips the locale prefix, giving the shared route used to switch languages in place. */
export function stripLocale(pathname: string): string {
  if (pathname === "/es") return "/";
  if (pathname.startsWith("/es/")) return pathname.slice(3);
  return pathname;
}
