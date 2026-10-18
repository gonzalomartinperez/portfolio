import "server-only";

import type { Locale } from "../config/locales";
import * as en from "./en";
import * as es from "./es";

const registry = { en, es };

/** Everything a page needs for one language, resolved in one call. */
export function getContent(locale: Locale) {
  return registry[locale];
}

export type Content = ReturnType<typeof getContent>;
