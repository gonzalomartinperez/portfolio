import cv from "./cv-public.json" with { type: "json" };
import type { Locale } from "./locales";

/** Contractual titles and dates come from the reviewed bilingual CV projection. */
export function experienceFacts(locale: Locale, id: string) {
  const experience = cv.locales[locale].sections.find((section) => section.id === "experience");
  const entry = experience?.entries.find((item) => item.id === id);
  if (!entry?.subtitle || !entry.details[0]) {
    throw new Error(`Missing reviewed experience fact: ${locale}/${id}`);
  }
  return { position: entry.subtitle, period: entry.details[0] };
}
