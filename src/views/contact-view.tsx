import Link from "next/link";
import { ContactLinks } from "@/components/contact-links";
import { PageHeader } from "@/components/page-header";
import { getContent } from "@/content";
import { type Locale, localePath } from "@/content/locales";
import styles from "./contact.module.css";

export function ContactView({ locale }: { locale: Locale }) {
  const { profile, contactChannels, openTo, resumeLinks, siteCopy: copy } = getContent(locale);

  return (
    <>
      <PageHeader
        eyebrow={copy.contact.eyebrow}
        intro={copy.contact.intro}
        title={copy.contact.title}
      />

      <section className="section-tight frame">
        <div className={styles.columns}>
          <div>
            <ContactLinks channels={contactChannels} />

            <div className="prose flow">
              <p>{copy.contact.basedIn(profile.location, profile.arrangement, profile.timezone)}</p>
              <p>
                {copy.contact.hiringHint}{" "}
                <Link href={localePath(locale, "/work/filomena")}>
                  {copy.contact.hiringLinkText}
                </Link>
                .
              </p>
            </div>
          </div>

          <aside className={styles.panel}>
            <h2 className={styles.panelTitle}>{copy.contact.resumeHeading}</h2>
            <div className={styles.downloads}>
              <Link className="button button-secondary" href={localePath(locale, "/cv")}>
                {locale === "es" ? "Leer CV online" : "Read CV online"}
              </Link>
              {resumeLinks.map((link) => (
                <a className="button button-secondary" download href={link.href} key={link.href}>
                  {link.label}
                </a>
              ))}
            </div>
            <p className="muted">{copy.contact.resumeNote}</p>
            <h2 className={styles.panelTitle}>{copy.contact.openToHeading}</h2>
            <ul className={styles.openTo}>
              {openTo.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </aside>
        </div>
      </section>
    </>
  );
}
