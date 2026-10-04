"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "@/components/external-link";
import { Button } from "@/components/ui/button";
import { chrome } from "@/content/chrome";
import { contactChannels, contactLinks, profile } from "@/content/en/profile";
import { contactChannels as spanishContactChannels } from "@/content/es/profile";
import { defaultLocale, type Locale, localePath } from "@/content/locales";
import { navigationPath } from "@/content/routes";
import { ContactIcons } from "./contact-links";
import { Mark } from "./mark";
import { setPageMotionPaused, usePageMotionPaused } from "./motion-state";
import styles from "./site-footer.module.css";

function localeFromPath(pathname: string): Locale {
  return pathname === "/es" || pathname.startsWith("/es/") ? "es" : defaultLocale;
}

/**
 * Shares one layout tree with the header, for the same reason: a language switch stays a
 * client-side navigation. Contact links and the identity line are language-independent.
 */
export function SiteFooter() {
  const paused = usePageMotionPaused();
  const locale = localeFromPath(navigationPath(usePathname()));
  const copy = chrome[locale];

  const routes = [
    { path: "/about", label: copy.nav.about },
    { path: "/work", label: copy.nav.work },
    { path: "/work/filomena", label: copy.nav.caseStudy },
    { path: "/stack", label: copy.nav.stack },
    { path: "/education", label: copy.nav.education },
    { path: "/cv", label: copy.nav.cv },
    { path: "/contact", label: copy.nav.contact },
  ];

  return (
    <footer className={styles.footer}>
      <div className={`frame ${styles.inner}`}>
        <div className={styles.identity}>
          <span className={styles.identityTop}>
            <Mark size={24} />
            <span className={styles.name}>{profile.name}</span>
          </span>
          <p className="muted">
            {copy.roleSubtitle} · {profile.location} · {profile.timezone}
          </p>
          <ContactIcons channels={locale === "es" ? spanishContactChannels : contactChannels} />
        </div>

        <nav aria-label={copy.footerNavLabel}>
          <h2 className={styles.groupTitle}>{copy.footerSite}</h2>
          <ul className={styles.list}>
            {routes.map((route) => (
              <li key={route.path}>
                <Link className={styles.link} href={localePath(locale, route.path)}>
                  {route.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className={styles.groupTitle}>{copy.footerElsewhere}</h2>
          <ul className={styles.list}>
            {contactLinks.map((link) => (
              <li key={link.href}>
                {link.href.startsWith("http") ? (
                  <ExternalLink className={styles.link} href={link.href} locale={locale}>
                    {link.label}
                  </ExternalLink>
                ) : (
                  <a className={styles.link} href={link.href}>
                    {link.label}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={`frame ${styles.colophon}`}>
        <span>© 2026 {profile.name}</span>
        <span>{copy.colophon}</span>
        <Button
          variant="ghost"
          size="sm"
          className={styles.motionToggle}
          aria-pressed={paused}
          data-motion-toggle
          onClick={() => setPageMotionPaused(!paused)}
        >
          <span aria-hidden="true">{paused ? "▶" : "Ⅱ"}</span>
          {paused ? copy.resumeMotion : copy.pauseMotion}
        </Button>
      </div>
      <p className={`frame ${styles.credits}`} data-visual-credits>
        <span>{copy.planetTextureCredit}</span>
        <ExternalLink href="https://www.solarsystemscope.com/textures/" locale={locale}>
          Solar System Scope
        </ExternalLink>
        <span>·</span>
        <ExternalLink href="https://creativecommons.org/licenses/by/4.0/" locale={locale}>
          CC BY 4.0
        </ExternalLink>
        <span>· {copy.plutoCredit}:</span>
        <ExternalLink
          href="https://science.nasa.gov/resource/pluto-global-color-map/"
          locale={locale}
        >
          NASA/JHUAPL/SwRI
        </ExternalLink>
      </p>
    </footer>
  );
}
