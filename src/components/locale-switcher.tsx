"use client";

import Link from "next/link";
import { type Locale, localeCodes, localeNames, locales, stripLocale } from "@/content/locales";
import styles from "./locale-switcher.module.css";

/**
 * Switches language while staying on the same page.
 *
 * Path segments are identical in both languages, so the target is the current path with the
 * prefix added or removed. These are real links, so they work without JavaScript, are
 * shareable, and let a crawler follow both versions.
 */
export function LocaleSwitcher({
  locale,
  label,
  pathname,
}: {
  locale: Locale;
  label: string;
  pathname: string;
}) {
  const route = stripLocale(pathname);

  return (
    <nav aria-label={label} className={styles.switcher}>
      <ul className={styles.list}>
        {locales.map((option) => {
          const href = option === "en" ? route : `/es${route === "/" ? "" : route}`;
          const current = option === locale;
          return (
            <li key={option}>
              <Link
                aria-current={current ? "true" : undefined}
                className={styles.option}
                hrefLang={option}
                href={href}
                lang={option}
                title={localeNames[option]}
              >
                {localeCodes[option]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
