import Image from "next/image";
import Link from "next/link";
import portrait from "@/assets/portrait.avif";
import { CompanyMark } from "@/components/company-mark";
import { MetricList } from "@/components/metric-list";
import { getContent } from "@/content";
import { type Locale, localePath } from "@/content/locales";
import { email, externalLinks } from "@/content/site-config";
import { HeroView } from "./hero-view";
import styles from "./home.module.css";

export function HomeView({ locale }: { locale: Locale }) {
  const content = getContent(locale);
  const { profile, roles, filomena, academicResults, siteCopy: copy } = content;

  return (
    <>
      <HeroView locale={locale} />

      <section className="section-tight frame">
        <div className="section-head">
          <p className="eyebrow">{copy.home.experienceEyebrow}</p>
          <h2>{copy.home.experienceHeading}</h2>
        </div>

        <ol className={styles.roles}>
          {roles.map((role) => (
            <li className={styles.role} key={role.slug}>
              <div className={styles.roleIdentity}>
                <CompanyMark company={role.slug} />
                <p className={styles.rolePeriod}>{role.period}</p>
              </div>
              <div>
                <p>
                  <Link
                    className={styles.rolePosition}
                    href={localePath(locale, `/work#${role.slug}`)}
                  >
                    {role.position}
                  </Link>{" "}
                  <span className={styles.roleCompany}>· {role.company}</span>
                </p>
                <p className={styles.roleContext}>{role.context}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="actions flow">
          <Link className="button button-secondary" href={localePath(locale, "/work")}>
            {copy.actions.fullExperience}
          </Link>
        </div>
      </section>

      <section className="section-tight frame">
        <div className="section-head">
          <p className="eyebrow">{copy.home.workEyebrow}</p>
          <h2>{copy.home.workHeading}</h2>
        </div>

        <article className={styles.feature}>
          <div className={styles.featureTop}>
            <div>
              <h3 className={styles.featureTitle}>
                <Link href={localePath(locale, "/work/filomena")}>{filomena.name}</Link>
              </h3>
              <p className="muted">{filomena.tagline}</p>
            </div>
            <p className="mono muted">{filomena.period}</p>
          </div>

          <Link className={styles.featureImage} href={localePath(locale, "/work/filomena")}>
            <Image
              alt={content.galleryAlt["040"]}
              src="/filomena/filomena-040.webp"
              width={1600}
              height={720}
              sizes="(min-width: 72rem) 64rem, 90vw"
              unoptimized
            />
          </Link>
          <p className="lede">{filomena.summary}</p>
          <MetricList metrics={filomena.metrics} />

          <ul className="tags">
            {filomena.stack.map((item) => (
              <li className="tag" key={item}>
                {item}
              </li>
            ))}
          </ul>

          <div className="actions">
            <Link className="button button-primary" href={localePath(locale, "/work/filomena")}>
              {copy.actions.readCaseStudy}
            </Link>
            <a className="button button-secondary" href={externalLinks.filomenaBackend}>
              {copy.actions.sourceOnGithub}
            </a>
          </div>
        </article>
      </section>

      <section className="section frame">
        <div className={styles.split}>
          <div className={styles.portrait}>
            <Image
              alt={`${profile.name}, ${profile.role}`}
              placeholder="blur"
              sizes="(min-width: 52rem) 20rem, 100vw"
              src={portrait}
              unoptimized
            />
          </div>

          <div>
            <div className="section-head">
              <p className="eyebrow">{copy.home.whoEyebrow}</p>
              <h2>{copy.home.whoHeading}</h2>
            </div>
            <div className="prose flow-tight">
              <p>{profile.summary}</p>
              <p>{copy.home.whoParagraph}</p>
            </div>

            <dl className={styles.facts}>
              <div>
                <dt className={styles.factLabel}>{copy.home.factCurrently}</dt>
                <dd className={styles.factValue}>{profile.currentPosition}</dd>
              </div>
              <div>
                <dt className={styles.factLabel}>{copy.home.factExperience}</dt>
                <dd className={styles.factValue}>
                  {copy.home.experienceSince(profile.experienceLength, profile.experienceSince)}
                </dd>
              </div>
              <div>
                <dt className={styles.factLabel}>{copy.home.factBasedIn}</dt>
                <dd className={styles.factValue}>
                  {profile.location} ({profile.timezone})
                </dd>
              </div>
              <div>
                <dt className={styles.factLabel}>{copy.home.factLanguages}</dt>
                <dd className={styles.factValue}>{copy.home.languagesValue}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section className="section-tight frame">
        <div className="section-head">
          <p className="eyebrow">{copy.home.educationEyebrow}</p>
          <h2>{copy.home.educationHeading}</h2>
          <p>{copy.home.educationBody}</p>
        </div>
        <div className="flow">
          <MetricList metrics={academicResults} />
        </div>
        <div className="actions flow">
          <Link className="button button-secondary" href={localePath(locale, "/education")}>
            {copy.actions.academicRecord}
          </Link>
        </div>
      </section>

      <section className="section-tight frame">
        <div className={styles.closing}>
          <h2>{copy.home.closingHeading}</h2>
          <p>{copy.home.closingBody}</p>
          <div className="actions">
            <a className="button button-primary" href={`mailto:${email}`}>
              {copy.actions.emailMe}
            </a>
            <Link className="button button-secondary" href={localePath(locale, "/contact")}>
              {copy.actions.allContact}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
