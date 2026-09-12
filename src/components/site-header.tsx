"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { chrome } from "@/content/chrome";
import { defaultLocale, htmlLang, type Locale, localePath } from "@/content/locales";
import { LocaleSwitcher } from "./locale-switcher";
import { Mark } from "./mark";
import styles from "./site-header.module.css";
import { ThemeToggle } from "./theme-toggle";

function localeFromPath(pathname: string): Locale {
  return pathname === "/es" || pathname.startsWith("/es/") ? "es" : defaultLocale;
}

export function SiteHeader() {
  const pathname = usePathname();
  const locale = localeFromPath(pathname);
  const copy = chrome[locale];

  // The document is served as English so both languages share one layout tree, which is what
  // makes switching a client-side navigation. Correct the root language once mounted; the
  // Spanish content itself already carries `lang` in the server HTML for assistive technology.
  useEffect(() => {
    document.documentElement.lang = htmlLang[locale];
  }, [locale]);

  const routes = [
    { path: "/about", label: copy.nav.about },
    { path: "/work", label: copy.nav.work },
    { path: "/stack", label: copy.nav.stack },
    { path: "/education", label: copy.nav.education },
    { path: "/contact", label: copy.nav.contact },
  ];

  return (
    <header className={styles.header}>
      <div className={`frame ${styles.inner}`}>
        <Link className={styles.brand} href={localePath(locale, "/")}>
          <Mark size={26} />
          <span className={styles.brandText}>
            <span className={styles.brandName}>Gonzalo Martin Perez</span>
            <span className={styles.brandRole}>{copy.roleSubtitle}</span>
          </span>
        </Link>

        <div className={styles.controls}>
          <nav aria-label={copy.mainNavLabel} className={styles.nav}>
            <ul className={styles.list}>
              {routes.map((route) => {
                const href = localePath(locale, route.path);
                const active = pathname === href || pathname.startsWith(`${href}/`);
                return (
                  <li key={route.path}>
                    <Link
                      aria-current={active ? "page" : undefined}
                      className={styles.link}
                      href={href}
                    >
                      {route.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <LocaleSwitcher label={copy.languageLabel} locale={locale} />
          <ThemeToggle
            neutralLabel={copy.themeToggleNeutral}
            toDarkLabel={copy.themeToDark}
            toLightLabel={copy.themeToLight}
          />
        </div>
      </div>
    </header>
  );
}
