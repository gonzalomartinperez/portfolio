import Link from "next/link";
import { CompanyMark } from "@/components/company-mark";
import { MetricList } from "@/components/metric-list";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cardVariants } from "@/components/ui/card";
import { getContent } from "@/content";
import { type Locale, localePath } from "@/content/locales";
import { cn } from "@/lib/utils";
import styles from "./work.module.css";

export function WorkView({ locale }: { locale: Locale }) {
  const { profile, roles, filomena, siteCopy: copy } = getContent(locale);

  return (
    <>
      <PageHeader
        eyebrow={copy.work.eyebrow}
        intro={copy.work.intro(profile.experienceLength, profile.experienceAsOf)}
        title={copy.work.title}
      >
        <nav className="actions flow-tight" aria-label={copy.work.experienceHeading}>
          {roles.map((role) => (
            <a
              key={role.slug}
              className={buttonVariants({ variant: "outline" })}
              href={`#${role.slug}`}
            >
              {role.company}
            </a>
          ))}
        </nav>
      </PageHeader>

      <section className="section-tight frame">
        <h2 className="eyebrow">{copy.work.experienceHeading}</h2>

        <ol className="flow">
          {roles.map((role) => (
            <li className={styles.role} key={role.slug} id={role.slug}>
              <div className={styles.meta}>
                <CompanyMark company={role.slug} />
                <p className={styles.period}>{role.period}</p>
                <p className={styles.place}>
                  {role.location} ·{" "}
                  {locale === "es"
                    ? { Remote: "Remoto", "On-site": "Presencial", Hybrid: "Híbrido" }[
                        role.arrangement
                      ]
                    : role.arrangement}
                </p>
              </div>

              <div className={styles.body}>
                <h3 className={styles.position}>
                  {role.position}
                  <span className={styles.company}>
                    {role.companyHref ? (
                      <a href={role.companyHref}>{role.company}</a>
                    ) : (
                      role.company
                    )}
                  </span>
                </h3>

                <p className={styles.context}>{role.context}</p>

                <ul className="marked-list">
                  {role.contributions.slice(0, 2).map((contribution) => (
                    <li key={contribution}>{contribution}</li>
                  ))}
                </ul>

                {role.contributions.length > 2 && (
                  <details className={styles.details}>
                    <summary>
                      {locale === "es" ? "Más contribuciones" : "More contributions"}{" "}
                      <span>({role.contributions.length - 2})</span>
                    </summary>
                    <ul className="marked-list flow-tight">
                      {role.contributions.slice(2).map((contribution) => (
                        <li key={contribution}>{contribution}</li>
                      ))}
                    </ul>
                  </details>
                )}

                {role.metrics ? <MetricList metrics={role.metrics} /> : null}
                {role.attribution ? <p className={styles.attribution}>{role.attribution}</p> : null}
                {role.links && (
                  <div className="actions">
                    {role.links.map((link) => (
                      <a
                        className={buttonVariants({ variant: "outline" })}
                        href={link.href}
                        key={link.href}
                      >
                        <CompanyMark company="pequeverso" />
                        {link.label}
                      </a>
                    ))}
                  </div>
                )}

                <ul className="tags">
                  {role.stack.map((item) => (
                    <li key={item}>
                      <Badge variant="outline" className="font-mono">
                        {item}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="section-tight frame">
        <div className="section-head">
          <p className="eyebrow">{copy.work.projectsEyebrow}</p>
          <h2>{copy.work.projectsHeading}</h2>
          <p>{copy.work.projectsBody}</p>
        </div>

        <article data-slot="card" className={cn(cardVariants(), styles.project, "flow")}>
          <div className={styles.projectHead}>
            <div>
              <h3 className={styles.projectTitle}>
                <Link href={localePath(locale, "/work/filomena")}>{filomena.name}</Link>
              </h3>
              <p className="muted">{filomena.tagline}</p>
            </div>
            <p className="mono muted">{filomena.period}</p>
          </div>

          <p className="lede">{filomena.summary}</p>
          <p className={styles.attribution}>{filomena.attribution}</p>
          <MetricList metrics={filomena.metrics} />

          <div className="actions">
            <Link className={buttonVariants()} href={localePath(locale, "/work/filomena")}>
              {copy.actions.readCaseStudy}
            </Link>
            {filomena.links
              .filter((link) => link.href.startsWith("https://github.com"))
              .map((link) => (
                <a
                  className={buttonVariants({ variant: "outline" })}
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </a>
              ))}
          </div>
        </article>
      </section>
    </>
  );
}
