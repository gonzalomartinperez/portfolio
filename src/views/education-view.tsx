import Link from "next/link";
import { MetricList } from "@/components/metric-list";
import { PageHeader } from "@/components/page-header";
import { getContent } from "@/content";
import { type Locale, localePath } from "@/content/locales";
import styles from "./education.module.css";

export function EducationView({ locale }: { locale: Locale }) {
  const content = getContent(locale);
  const {
    academicEvidence,
    academicResults,
    coursework,
    credentialNote,
    credentials,
    degree,
    languageNote,
    professionalPractice,
    profile,
    rankingCaveat,
    rankings,
    siteCopy: copy,
  } = content;

  return (
    <>
      <PageHeader
        eyebrow={copy.education.eyebrow}
        intro={copy.education.intro}
        title={copy.education.title}
      />

      <section className="section-tight frame">
        <article className={styles.degree}>
          <div className={styles.degreeTop}>
            <div>
              <h2>{degree.qualification}</h2>
              <p className="muted">
                <a href={degree.institutionHref}>{degree.institution}</a> · {degree.location}
              </p>
            </div>
            <span className={styles.status}>{degree.status}</span>
          </div>
          <p className="mono muted">{degree.period}</p>
          <p>{degree.programme}</p>
        </article>

        <div className="flow">
          <MetricList metrics={academicResults} />
        </div>
      </section>

      <section className="section-tight frame">
        <div className={styles.columns}>
          <div>
            <div className="section-head">
              <p className="eyebrow">{copy.education.courseworkEyebrow}</p>
              <h2>{copy.education.courseworkHeading}</h2>
            </div>
            <ul className={`${styles.courses} flow-tight`}>
              {coursework.map((course) => (
                <li className={styles.course} key={course}>
                  {course}
                </li>
              ))}
            </ul>
            <p className="muted flow-tight">
              {professionalPractice.title}: {professionalPractice.detail}
            </p>
          </div>

          <div>
            <div className="section-head">
              <p className="eyebrow">{copy.education.contextEyebrow}</p>
              <h2>{copy.education.contextHeading}</h2>
            </div>
            <ul className={`${styles.rankings} flow-tight`}>
              {rankings.map((ranking) => (
                <li className={styles.ranking} key={ranking.source}>
                  <span className={styles.rankingPosition}>{ranking.position}</span>
                  <a className={styles.rankingSource} href={ranking.href}>
                    {ranking.source}
                  </a>
                  <span className={styles.rankingEdition}>{ranking.edition}</span>
                </li>
              ))}
            </ul>
            <p className="muted flow-tight">{rankingCaveat}</p>
          </div>
        </div>
      </section>

      <section className="section-tight frame">
        <div className="section-head">
          <p className="eyebrow">{copy.education.projectEyebrow}</p>
          <h2>{copy.education.projectHeading}</h2>
          <p>{copy.education.projectBody}</p>
        </div>
        <div className="actions flow">
          <Link className="button button-primary" href={localePath(locale, "/work/filomena")}>
            {copy.actions.readCaseStudy}
          </Link>
        </div>
      </section>

      <section className="section-tight frame">
        <div className={styles.columns}>
          <div>
            <div className="section-head">
              <p className="eyebrow">{copy.education.certificationsEyebrow}</p>
              <h2>{copy.education.certificationsHeading}</h2>
            </div>
            <ul className="flow-tight">
              {credentials.map((credential) => (
                <li className={styles.credential} key={credential.title}>
                  <span>
                    <span className={styles.credentialTitle}>{credential.title}</span>
                    <span className={styles.credentialIssuer}>{credential.issuer}</span>
                  </span>
                  <span className="mono muted">{credential.date}</span>
                </li>
              ))}
            </ul>
            <p className="muted flow-tight">{credentialNote}</p>
          </div>

          <div>
            <div className="section-head">
              <p className="eyebrow">{copy.education.languagesEyebrow}</p>
              <h2>{copy.education.languagesHeading}</h2>
            </div>
            <ul className="marked-list flow-tight">
              {profile.languages.map((entry) => (
                <li key={entry.language}>
                  <strong>{entry.language}</strong> — {entry.level}
                </li>
              ))}
            </ul>
            <p className="muted flow-tight">{languageNote}</p>
          </div>
        </div>
      </section>

      <section className="section-tight frame">
        <div className="section-head">
          <p className="eyebrow">{copy.education.evidenceEyebrow}</p>
          <h2>{copy.education.evidenceHeading}</h2>
          <p>{copy.education.evidenceBody}</p>
        </div>
        <div className="actions flow">
          {academicEvidence.map((link) => (
            <a className="button button-secondary" href={link.href} key={link.href}>
              {link.label}
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
