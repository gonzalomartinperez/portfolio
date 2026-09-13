import Image from "next/image";
import Link from "next/link";
import { MetricList } from "@/components/metric-list";
import { PageHeader } from "@/components/page-header";
import { getContent } from "@/content";
import { academicAreas, academicCatalogue, academicEntry } from "@/content/academic-catalogue";
import { type Locale, localePath } from "@/content/locales";
import documents from "@/content/public-documents.json";
import styles from "./education.module.css";

export function EducationView({ locale }: { locale: Locale }) {
  const content = getContent(locale);
  const {
    academicEvidence,
    academicResults,
    curriculumNote,
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
      >
        <nav
          className="actions flow-tight"
          aria-label={locale === "es" ? "Registro académico" : "Academic record"}
        >
          <a className="button button-secondary" href="#results">
            {copy.education.title}
          </a>
          <a className="button button-secondary" href="#curriculum">
            {copy.education.curriculumHeading}
          </a>
          <a className="button button-secondary" href="#credentials">
            {copy.education.certificationsHeading}
          </a>
          <a className="button button-secondary" href="#evidence">
            {copy.education.evidenceHeading}
          </a>
        </nav>
      </PageHeader>

      <section className="section-tight frame">
        <article className={styles.degree}>
          <a className={styles.institutionLogo} href={degree.institutionHref}>
            <Image
              src="/brands/universidad-nacional-del-sur.png"
              width={325}
              height={80}
              alt="Universidad Nacional del Sur"
              unoptimized
            />
          </a>
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

        <div className="flow" id="results">
          <MetricList metrics={academicResults} />
        </div>
      </section>

      <section className="section-tight frame">
        <div className="section-head">
          <p className="eyebrow">{copy.education.curriculumEyebrow}</p>
          <h2 id="curriculum">{copy.education.curriculumHeading}</h2>
          <p>{curriculumNote}</p>
        </div>
        <div className="flow">
          {[1, 2, 3, 4, 5, 0].map((year) => (
            <details className={styles.record} key={year}>
              <summary>
                {year
                  ? `${locale === "es" ? "Año" : "Year"} ${year}`
                  : locale === "es"
                    ? "Requisitos de inglés"
                    : "English requirements"}
              </summary>
              <ul className={styles.records}>
                {academicCatalogue
                  .filter((entry) => entry.year === year)
                  .map((entry) => (
                    <li key={entry.id} id={entry.id}>
                      <div>
                        <strong>{entry.name[locale]}</strong>
                        {locale === "en" && (
                          <span className={styles.original} lang="es">
                            {entry.name.es}
                          </span>
                        )}
                        <span className={styles.original}>
                          {entry.code}
                          {year > 0 &&
                            ` · ${locale === "es" ? "Cuatrimestre" : "Semester"} ${entry.semester}`}{" "}
                          · <time dateTime={entry.completed}>{entry.completed}</time>
                        </span>
                        {entry.kind === "practice" && (
                          <span className={styles.original}>
                            {locale === "es" ? "Práctica profesional" : "Professional practice"}
                          </span>
                        )}
                        {entry.kind === "project" && (
                          <Link href={localePath(locale, "/work/filomena")}>Filomena</Link>
                        )}
                      </div>
                      <span className={styles.grade}>
                        {entry.grade === "AP"
                          ? locale === "es"
                            ? "AP · Aprobado"
                            : "AP · Passed"
                          : `${entry.grade} / 10`}
                      </span>
                    </li>
                  ))}
              </ul>
            </details>
          ))}
        </div>
      </section>

      <section className="section-tight frame">
        <div className={styles.columns}>
          <div>
            <div className="section-head">
              <p className="eyebrow">{copy.education.courseworkEyebrow}</p>
              <h2>{copy.education.courseworkHeading}</h2>
            </div>
            <div className="flow-tight">
              {academicAreas.map((area) => (
                <article className={styles.area} key={area.id}>
                  <h3>{area.title[locale]}</h3>
                  <p className="muted">{area.description[locale]}</p>
                  <ul className={styles.subjects}>
                    {area.courseIds.map((id) => {
                      const course = academicEntry(id);
                      return (
                        <li key={id}>
                          {course.name[locale]} <span className="mono">· {course.grade} / 10</span>
                        </li>
                      );
                    })}
                  </ul>
                </article>
              ))}
            </div>
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
              <h2 id="credentials">{copy.education.certificationsHeading}</h2>
            </div>
            <ul className="flow-tight">
              {credentials.map((credential) => (
                <li className={styles.credential} key={credential.title}>
                  <span>
                    <span className={styles.credentialTitle}>{credential.title}</span>
                    <span className={styles.credentialIssuer}>{credential.issuer}</span>
                  </span>
                  <span className="mono muted">{credential.date}</span>
                  {credential.evidence && (
                    <a
                      className={styles.certificateLink}
                      href={credential.evidence.href}
                      aria-label={`${locale === "es" ? "Ver certificado" : "View certificate"}: ${credential.title} (${credential.evidence.format})`}
                    >
                      {locale === "es" ? "Ver certificado" : "View certificate"} (
                      {credential.evidence.format})
                    </a>
                  )}
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
          <h2 id="evidence">{copy.education.evidenceHeading}</h2>
          <p>
            {locale === "es"
              ? "Documentos originales disponibles directamente, sin servicios externos ni visores adicionales."
              : "Original documents available directly, without external services or additional viewers."}
          </p>
          <p className="muted">
            {locale === "es"
              ? "El analítico es un registro histórico emitido el 22 de diciembre de 2025. Su validez administrativa de seis meses ya finalizó; los resultados se muestran como constancia de esa fecha, no como certificado vigente."
              : "The transcript is a historical record issued on 22 December 2025. Its six-month administrative validity has expired; results are presented as recorded on that date, not as a currently valid certificate."}
          </p>
        </div>
        <div className="actions flow">
          {academicEvidence.map((link) => (
            <div key={link.href}>
              <a className="button button-secondary" href={link.href}>
                {link.label}
              </a>
              <p className="muted">
                {link.description} ·{" "}
                {(
                  (documents.find((document) => document.href === link.href)?.bytes ?? 0) / 1024
                ).toFixed(1)}{" "}
                KiB
              </p>
              <a href={link.href} download>
                {locale === "es" ? "Descargar PDF" : "Download PDF"}
              </a>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
