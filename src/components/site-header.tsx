"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type Locale, localePath } from "@/content/locales";
import { LocaleSwitcher } from "./locale-switcher";
import { Mark } from "./mark";
import styles from "./site-header.module.css";
import { ThemeToggle } from "./theme-toggle";

/**
 * Only plain strings cross this boundary. The site copy contains functions, which a Server
 * Component cannot hand to a Client Component, so the layout resolves the labels first.
 */
export type HeaderCopy = {
  roleSubtitle: string;
  mainNavLabel: string;
  languageLabel: string;
  routes: { path: string; label: string }[];
  theme: { neutral: string; toLight: string; toDark: string };
};

export function SiteHeader({ locale, copy }: { locale: Locale; copy: HeaderCopy }) {
  const pathname = usePathname();

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
              {copy.routes.map((route) => {
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
            neutralLabel={copy.theme.neutral}
            toDarkLabel={copy.theme.toDark}
            toLightLabel={copy.theme.toLight}
          />
        </div>
      </div>
    </header>
  );
}
