import Link from "next/link";
import { Fragment } from "react";
import { PageHeader } from "@/components/page-header";
import cv from "@/content/cv-public.json";
import { type Locale, localePath } from "@/content/locales";
import documents from "@/content/public-documents.json";
import { resumeDownloads, resumeFiles } from "@/content/site-config";
import styles from "./cv.module.css";

type Run = { text: string; bold: boolean; href: string };
type Block = { id: string; kind: string; runs: Run[] };

function InlineCopy({ runs }: { runs: Run[] }) {
  return runs.map((run, index) => {
    const text = run.bold ? <strong>{run.text}</strong> : run.text;
    return (
      // biome-ignore lint/suspicious/noArrayIndexKey: immutable exported text runs have no reorderable state.
      <Fragment key={`${index}-${run.text}`}>
        {run.href ? <a href={run.href}>{text}</a> : text}
      </Fragment>
    );
  });
}

function CopyBlocks({ blocks }: { blocks: Block[] }) {
  const groups: Block[][] = [];
  for (const block of blocks) {
    const previous = groups.at(-1);
    if (block.kind === "bullet" && previous?.[0].kind === "bullet") previous.push(block);
    else groups.push([block]);
  }
  return groups.map((group) =>
    group[0].kind === "bullet" ? (
      <ul key={group[0].id}>
        {group.map((block) => (
          <li key={block.id}>
            <InlineCopy runs={block.runs} />
          </li>
        ))}
      </ul>
    ) : (
      <p key={group[0].id}>
        <InlineCopy runs={group[0].runs} />
      </p>
    ),
  );
}

export function CvView({ locale }: { locale: Locale }) {
  const copy = cv.locales[locale];
  const spanish = locale === "es";
  return (
    <div lang={locale}>
      <PageHeader eyebrow="CV" title={copy.name} intro={copy.headline} />
      <div className={`frame ${styles.resume}`}>
        <div className={styles.actions}>
          <a className="button button-primary" href={resumeDownloads[locale]} download>
            {spanish ? "Descargar CV · PDF" : "Download CV · PDF"}
          </a>
          <Link className="button button-secondary" href={localePath(locale, "/contact")}>
            {spanish ? "Hablemos" : "Let’s talk"}
          </Link>
        </div>
        <p className="muted">{copy.location}</p>
        <p className="muted">
          PDF ·{" "}
          {(
            (documents.find((document) => document.href === resumeFiles[locale])?.bytes ?? 0) / 1024
          ).toFixed(1)}{" "}
          KiB · {spanish ? "3 páginas" : "3 pages"}
        </p>
        <nav aria-label={spanish ? "Secciones del CV" : "CV sections"} className={styles.contents}>
          {copy.sections.map((section) => (
            <a href={`#cv-${section.id}`} key={section.id}>
              {section.title}
            </a>
          ))}
        </nav>
        <section className={styles.section} aria-labelledby="cv-summary">
          <h2 id="cv-summary">{copy.summaryTitle}</h2>
          <p>
            <InlineCopy runs={copy.summary} />
          </p>
        </section>
        {copy.sections.map((section) => (
          <section className={styles.section} key={section.id} aria-labelledby={`cv-${section.id}`}>
            <h2 id={`cv-${section.id}`}>{section.title}</h2>
            {section.entries.map((entry) => (
              <article className={styles.entry} key={entry.id}>
                <h3>{entry.href ? <a href={entry.href}>{entry.title}</a> : entry.title}</h3>
                {entry.subtitle && <p className={styles.subtitle}>{entry.subtitle}</p>}
                {entry.details.length > 0 && <p className="muted">{entry.details.join(" · ")}</p>}
                {entry.keywords.length > 0 && <p>{entry.keywords.join(" · ")}</p>}
                <CopyBlocks blocks={entry.blocks} />
              </article>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
