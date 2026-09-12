import Link from "next/link";
import { MetricList } from "@/components/metric-list";
import { PageHeader } from "@/components/page-header";
import { getContent } from "@/content";
import { type Locale, localePath } from "@/content/locales";
import styles from "./filomena.module.css";

export function FilomenaView({ locale }: { locale: Locale }) {
  const { filomena, filomenaCaseStudy: study, siteCopy: copy } = getContent(locale);

  const prose = (paragraphs: readonly string[]) => (
    <div className="prose">
      {paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 40)}>{paragraph}</p>
      ))}
    </div>
  );

  return (
    <>
      <PageHeader
        eyebrow={`${copy.filomena.caseStudyLabel} · ${filomena.period}`}
        intro={filomena.summary}
        title={`${filomena.name} — ${filomena.tagline}`}
      >
        <ul className="tags flow-tight">
          {filomena.stack.map((item) => (
            <li className="tag" key={item}>
              {item}
            </li>
          ))}
        </ul>
      </PageHeader>

      <div className={`section-tight frame ${styles.body}`}>
        <section className={styles.block}>
          <MetricList metrics={filomena.metrics} />
        </section>

        <section className={styles.block}>
          <h2>{study.problem.heading}</h2>
          {prose(study.problem.body)}
        </section>

        <section className={styles.block}>
          <h2>{study.audience.heading}</h2>
          {prose(study.audience.body)}
        </section>

        <section className={styles.block}>
          <h2>{study.role.heading}</h2>
          <p className={styles.attribution}>{filomena.attribution}</p>
          {prose(study.role.body)}
        </section>

        <section className={styles.block}>
          <h2>{study.approach.heading}</h2>
          {prose(study.approach.body)}
        </section>

        <section className={styles.block}>
          <h2>{copy.filomena.architectureHeading}</h2>
          <p className="muted">{copy.filomena.architectureCaption}</p>
          <ol className={styles.architecture}>
            {study.architecture.map((step) => (
              <li className={styles.layer} key={step.layer}>
                <span className={styles.layerName}>{step.layer}</span>
                <span className={styles.layerDetail}>{step.detail}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.block}>
          <h2>{copy.filomena.decisionsHeading}</h2>
          <div className={styles.decisions}>
            {study.decisions.map((decision) => (
              <article className="card" key={decision.heading}>
                <h3>{decision.heading}</h3>
                {decision.body.map((paragraph) => (
                  <p className="flow-tight" key={paragraph.slice(0, 40)}>
                    {paragraph}
                  </p>
                ))}
              </article>
            ))}
          </div>
        </section>

        <section className={styles.block}>
          <h2>{copy.filomena.changesHeading}</h2>
          <div className={styles.tableScroll}>
            <table className={styles.changes}>
              <caption>{copy.filomena.changesCaption}</caption>
              <thead>
                <tr>
                  <th scope="col">{copy.filomena.columnAspect}</th>
                  <th scope="col">{copy.filomena.columnBefore}</th>
                  <th scope="col">{copy.filomena.columnAfter}</th>
                </tr>
              </thead>
              <tbody>
                {study.changes.map((change) => (
                  <tr key={change.aspect}>
                    <th scope="row">{change.aspect}</th>
                    <td className={styles.before}>{change.before}</td>
                    <td className={styles.after}>{change.after}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className={styles.block}>
          <h2>{study.delivery.heading}</h2>
          {prose(study.delivery.body)}
        </section>

        <section className={styles.block}>
          <h2>{study.outcomes.heading}</h2>
          {prose(study.outcomes.body)}
        </section>

        <section className={styles.block}>
          <h2>{study.lessons.heading}</h2>
          {prose(study.lessons.body)}
        </section>

        <section className={styles.block}>
          <h2>{copy.filomena.evidenceHeading}</h2>
          <div className={styles.evidence}>
            {filomena.links.map((link) => (
              <a className={styles.evidenceLink} href={link.href} key={link.href}>
                <span className={styles.evidenceLabel}>{link.label}</span>
                <span className={styles.evidenceDescription}>{link.description}</span>
              </a>
            ))}
          </div>
          <p className="muted">{copy.filomena.evidenceNote}</p>
        </section>

        <div className="actions">
          <Link className="button button-secondary" href={localePath(locale, "/work")}>
            {copy.actions.backToWork}
          </Link>
          <Link className="button button-primary" href={localePath(locale, "/contact")}>
            {copy.actions.getInTouch}
          </Link>
        </div>
      </div>
    </>
  );
}
