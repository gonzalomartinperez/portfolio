import { Bot, Boxes, PanelsTopLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import portrait from "@/assets/portrait.avif";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { getContent } from "@/content";
import { type Locale, localePath } from "@/content/locales";
import styles from "./about.module.css";

export function AboutView({ locale }: { locale: Locale }) {
  const { profile, degree, siteCopy: copy } = getContent(locale);

  const focusIcons = { ai: Bot, product: PanelsTopLeft, systems: Boxes };

  return (
    <>
      <PageHeader eyebrow={copy.about.eyebrow} intro={copy.about.intro} title={copy.about.title} />

      <section
        aria-label={copy.about.eyebrow}
        className={`section-tight frame ${styles.introduction}`}
      >
        <div className={styles.split}>
          <div className="prose">
            {copy.about.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>

          <aside className={styles.aside}>
            <div className={`portrait-frame ${styles.portrait}`}>
              <Image
                alt={`${profile.name}, ${profile.role}`}
                placeholder="blur"
                sizes="(min-width: 52rem) 18rem, 100vw"
                src={portrait}
                unoptimized
              />
            </div>
            <dl className={styles.facts}>
              <div>
                <dt className="eyebrow">{copy.home.factBasedIn}</dt>
                <dd>{profile.location}</dd>
              </div>
              <div>
                <dt className="eyebrow">{copy.home.factExperience}</dt>
                <dd>
                  {copy.home.experienceSince(profile.experienceLength, profile.experienceSince)}
                  <span className={styles.asOf}>
                    {copy.about.experienceAsOf(profile.experienceAsOf)}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="eyebrow">{copy.about.asideCurrently}</dt>
                <dd>{profile.currentPosition}</dd>
              </div>
              <div>
                <dt className="eyebrow">{copy.about.asideArrangement}</dt>
                <dd>
                  {profile.arrangement}, {profile.timezone}
                </dd>
              </div>
              <div>
                <dt className="eyebrow">{copy.about.asideLanguages}</dt>
                <dd>
                  {profile.languages
                    .map((entry) => `${entry.language} — ${entry.level}`)
                    .join("; ")}
                </dd>
              </div>
              <div>
                <dt className="eyebrow">{copy.about.asideAvailability}</dt>
                <dd>{profile.availability}</dd>
              </div>
              <div>
                <dt className="eyebrow">{copy.education.eyebrow}</dt>
                <dd>
                  {degree.qualification}, {degree.institutionShort}
                </dd>
              </div>
            </dl>
          </aside>
        </div>
      </section>

      <section aria-labelledby="about-focus-heading" className="section-tight frame">
        <div className="section-head">
          <p className="eyebrow">{copy.about.focusEyebrow}</p>
          <h2 id="about-focus-heading">{copy.about.focusHeading}</h2>
        </div>
        <div className={styles.focus}>
          {copy.about.focus.map((area) => {
            const Icon = focusIcons[area.id];
            return (
              <article className={styles.focusArea} key={area.id}>
                <Icon aria-hidden="true" className={styles.focusIcon} size={24} strokeWidth={1.5} />
                <h3>{area.title}</h3>
                <p>{area.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="about-principles-heading" className="section-tight frame">
        <div className="section-head">
          <p className="eyebrow">{copy.about.principlesEyebrow}</p>
          <h2 id="about-principles-heading">{copy.about.principlesHeading}</h2>
          <p>{copy.about.principlesIntro}</p>
        </div>

        <ol className={styles.principles}>
          {copy.about.principles.map((principle, index) => (
            <li className={styles.principle} key={principle.title}>
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{principle.title}</h3>
                <p>{principle.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section
        aria-labelledby="about-looking-heading"
        className={`section-tight frame ${styles.looking}`}
      >
        <div className="section-head">
          <p className="eyebrow">{copy.about.lookingEyebrow}</p>
          <h2 id="about-looking-heading">{copy.about.lookingHeading}</h2>
          {copy.about.lookingParagraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
        </div>
        <div className="actions flow">
          <Link className={buttonVariants()} href={localePath(locale, "/work")}>
            {copy.actions.seeWork}
          </Link>
          <Link
            className={buttonVariants({ variant: "outline" })}
            href={localePath(locale, "/contact")}
          >
            {copy.actions.getInTouch}
          </Link>
        </div>
      </section>
    </>
  );
}
