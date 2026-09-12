import Link from "next/link";
import { type Locale, localePath } from "@/content/locales";
import type { SiteCopy } from "@/content/site-copy";
import type { EvidenceLink } from "@/content/types";
import { Mark } from "./mark";
import styles from "./site-footer.module.css";

type FooterProfile = {
  name: string;
  role: string;
  location: string;
  arrangement: string;
  timezone: string;
};

export function SiteFooter({
  locale,
  copy,
  profile,
  contactLinks,
}: {
  locale: Locale;
  copy: SiteCopy;
  profile: FooterProfile;
  contactLinks: readonly EvidenceLink[];
}) {
  const routes = [
    { path: "/about", label: copy.nav.about },
    { path: "/work", label: copy.nav.work },
    { path: "/work/filomena", label: copy.nav.caseStudy },
    { path: "/stack", label: copy.nav.stack },
    { path: "/education", label: copy.nav.education },
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
            {profile.role} · {profile.location} · {profile.arrangement} ({profile.timezone})
          </p>
        </div>

        <nav aria-label={copy.chrome.footerNavLabel}>
          <h2 className={styles.groupTitle}>{copy.chrome.footerSite}</h2>
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
          <h2 className={styles.groupTitle}>{copy.chrome.footerElsewhere}</h2>
          <ul className={styles.list}>
            {contactLinks.map((link) => (
              <li key={link.href}>
                <a className={styles.link} href={link.href}>
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={`frame ${styles.colophon}`}>
        <span>
          © {new Date().getFullYear()} {profile.name}
        </span>
        <span className="mono">{copy.chrome.colophon}</span>
      </div>
    </footer>
  );
}
