"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink } from "@/components/external-link";
import { chrome } from "@/content/chrome";
import { contactChannels, contactLinks, profile } from "@/content/en/profile";
import { contactChannels as spanishContactChannels } from "@/content/es/profile";
import { defaultLocale, type Locale, localePath } from "@/content/locales";
import { privacy } from "@/content/privacy";
import { navigationPath } from "@/content/routes";
import { email } from "@/content/site-config";
import { ContactIcons } from "../components/contact-links";
import { Mark } from "../components/mark";
import { SolarExplorer } from "../features/solar-system/presentation/solar-explorer";
import styles from "./site-footer.module.css";

function localeFromPath(pathname: string): Locale {
  return pathname === "/es" || pathname.startsWith("/es/") ? "es" : defaultLocale;
}

/**
 * Shares one layout tree with the header, for the same reason: a language switch stays a
 * client-side navigation. Contact links and the identity line are language-independent.
 */
export function SiteFooter({
  assistantEnabled = false,
  analyticsEnabled = false,
}: {
  assistantEnabled?: boolean;
  analyticsEnabled?: boolean;
}) {
  const locale = localeFromPath(navigationPath(usePathname()));
  const copy = chrome[locale];
  const privacyCopy = privacy[locale];

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
      <div
        className={`frame ${styles.inner}`}
        data-analytics-region="site-footer"
        data-analytics-exposure="site-footer"
      >
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
                <Link
                  className={styles.link}
                  data-analytics-event="navigation_click"
                  data-analytics-destination={localePath(locale, route.path)}
                  href={localePath(locale, route.path)}
                >
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
        <SolarExplorer locale={locale} />
      </div>
      <p className={`frame ${styles.privacyNote}`} data-privacy-note>
        {copy.footerPrivacyNote}
      </p>
      <div className="frame">
        <details className={styles.privacyNote} data-privacy-disclosure>
          <summary>{privacyCopy.title}</summary>
          <div className="prose">
            <p>{privacyCopy.introduction}</p>
            <p>{privacyCopy.theme}</p>
            <p>{privacyCopy.hosting}</p>
            <p>{privacyCopy.external}</p>
            <p data-privacy-assistant={assistantEnabled ? "enabled" : "disabled"}>
              {assistantEnabled ? privacyCopy.assistantOn : privacyCopy.assistantOff}
            </p>
            <p data-privacy-analytics={analyticsEnabled ? "enabled" : "disabled"}>
              {analyticsEnabled ? privacyCopy.analyticsOn : privacyCopy.analyticsOff}
            </p>
            <p>
              {privacyCopy.contact} <a href={`mailto:${email}`}>{email}</a>.
            </p>
          </div>
        </details>
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
