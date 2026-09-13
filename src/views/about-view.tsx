import Image from "next/image";
import Link from "next/link";
import portrait from "@/assets/portrait.avif";
import { PageHeader } from "@/components/page-header";
import { getContent } from "@/content";
import { type Locale, localePath } from "@/content/locales";
import styles from "./about.module.css";

export function AboutView({ locale }: { locale: Locale }) {
  const { profile, degree, siteCopy: copy } = getContent(locale);

  return (
    <>
      <PageHeader eyebrow={copy.about.eyebrow} intro={profile.intro} title={copy.about.title} />

      <section className="section-tight frame">
        <div className={styles.split}>
          <div className="prose">
            <p>
              {profile.name} — {profile.role}, {profile.location} ({profile.timezone}).{" "}
              {copy.home.experienceSince(profile.experienceLength, profile.experienceSince)}.
            </p>
            {copy.about.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </div>

          <aside className={styles.aside}>
            <div className={styles.portrait}>
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

      <section className="section-tight frame">
        <div className="section-head">
          <p className="eyebrow">{copy.about.principlesEyebrow}</p>
          <h2>{copy.about.principlesHeading}</h2>
        </div>

        <div className={styles.principles}>
          {copy.about.principles.map((principle, index) => (
            <article className={styles.principle} key={principle.title}>
              <span className={styles.number} aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <h3>{principle.title}</h3>
                <p className="flow-tight">{principle.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="section-tight frame">
        <div className="section-head">
          <p className="eyebrow">{copy.about.lookingEyebrow}</p>
          <h2>{copy.about.lookingHeading}</h2>
          <p>{copy.about.lookingBody}</p>
        </div>
        <div className="actions flow">
          <Link className="button button-primary" href={localePath(locale, "/work")}>
            {copy.actions.seeWork}
          </Link>
          <Link className="button button-secondary" href={localePath(locale, "/contact")}>
            {copy.actions.getInTouch}
          </Link>
        </div>
      </section>
    </>
  );
}
