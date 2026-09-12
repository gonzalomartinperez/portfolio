import * as en from "./en";
import * as es from "./es";
import type { Locale } from "./locales";

const registry = { en, es };

/** Everything a page needs for one language, resolved in one call. */
export function getContent(locale: Locale) {
  return registry[locale];
}

export type Content = ReturnType<typeof getContent>;
