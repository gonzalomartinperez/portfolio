import { type Locale, localePath } from "@config/locales";
import { getContent } from "@content";
import Link from "next/link";
import { ContactLinks } from "@/shared/contact/contact-links";
import { PageHeader } from "@/shared/editorial/page-header";
import { cn } from "@/shared/styles/cn";
import { buttonVariants } from "@/shared/ui/button";
import { cardVariants } from "@/shared/ui/card";
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
          <div data-analytics-region="contact-channels" data-analytics-exposure="contact-channels">
            <ContactLinks channels={contactChannels} />

            <div className="prose flow">
              <p>{copy.contact.basedIn(profile.location, profile.arrangement, profile.timezone)}</p>
              <p>
                {copy.contact.hiringHint}{" "}
                <Link href={localePath(locale, "/work")}>{copy.contact.hiringLinkText}</Link>.
              </p>
            </div>
          </div>

          <aside
            data-slot="card"
            className={cn(cardVariants(), styles.panel)}
            data-analytics-region="contact-resume"
            data-analytics-exposure="contact-resume"
          >
            <h2 className={styles.panelTitle}>{copy.contact.resumeHeading}</h2>
            <div className={styles.downloads}>
              <Link
                className={buttonVariants({ variant: "outline" })}
                href={localePath(locale, "/cv")}
              >
                {locale === "es" ? "Leer CV online" : "Read CV online"}
              </Link>
              {resumeLinks.map((link) => (
                <a
                  className={buttonVariants({ variant: "outline" })}
                  download={link.download}
                  href={link.href}
                  key={link.href}
                >
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
