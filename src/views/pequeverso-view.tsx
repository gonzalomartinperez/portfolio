import { type Locale, localePath } from "@config/locales";
import { getContent } from "@content";
import { pequeversoGallery, pequeversoGalleryFlows } from "@content/pequeverso-gallery";
import imageDimensions from "@content/pequeverso-image-dimensions.json";
import Link from "next/link";
import { GalleryCarousel } from "@/features/project-gallery/presentation/gallery-carousel";
import { MetricList } from "@/shared/editorial/metric-list";
import { PageHeader } from "@/shared/editorial/page-header";
import { ExternalLink } from "@/shared/navigation/external-link";
import { cn } from "@/shared/styles/cn";
import { Badge } from "@/shared/ui/badge";
import { buttonVariants } from "@/shared/ui/button";
import { cardVariants } from "@/shared/ui/card";
import styles from "./case-study.module.css";

export function PequeversoView({ locale }: { locale: Locale }) {
  const {
    pequeverso: project,
    pequeversoCaseStudy: study,
    pequeversoGalleryAlt: galleryAlt,
    siteCopy: copy,
  } = getContent(locale);

  const slides = pequeversoGallery.map((shot) => ({
    id: shot.id,
    src: `/pequeverso/pequeverso-${shot.id}.webp`,
    alt: galleryAlt[shot.id],
    fit: "fit" in shot ? shot.fit : undefined,
    ...imageDimensions[shot.id],
  }));

  const prose = (paragraphs: readonly string[]) => (
    <div className="prose">
      {paragraphs.map((paragraph) => (
        <p key={paragraph.slice(0, 40)}>{paragraph}</p>
      ))}
    </div>
  );

  return (
    <>
      <PageHeader eyebrow={study.eyebrow} intro={project.summary} title={study.title}>
        <ul className="tags flow-tight">
          {project.stack.map((item) => (
            <li key={item}>
              <Badge variant="outline" className="font-mono">
                {item}
              </Badge>
            </li>
          ))}
        </ul>
      </PageHeader>

      <div className={`section-tight frame ${styles.body}`}>
        <section className={styles.block}>
          <MetricList metrics={project.metrics} />
          <p className="muted">{project.attribution}</p>
        </section>

        <section className={styles.block}>
          <h2>{study.overview.heading}</h2>
          {prose(study.overview.body)}
        </section>

        <section className={styles.block}>
          <h2>{study.problem.heading}</h2>
          {prose(study.problem.body)}
        </section>

        <section className={styles.block}>
          <h2>{study.built.heading}</h2>
          {prose(study.built.body)}
        </section>

        <section className={styles.block}>
          <h2>{copy.pequeverso.architectureHeading}</h2>
          <p className="muted">{copy.pequeverso.architectureCaption}</p>
          <ol className={styles.architecture}>
            {study.architecture.map((step) => (
              <li data-slot="card" className={cn(cardVariants(), styles.layer)} key={step.layer}>
                <span className={styles.layerName}>{step.layer}</span>
                <span className={styles.layerDetail}>{step.detail}</span>
              </li>
            ))}
          </ol>
        </section>

        <section className={styles.block}>
          <h2>{copy.pequeverso.decisionsHeading}</h2>
          <div className={styles.decisions}>
            {study.decisions.map((decision) => (
              <article
                data-slot="card"
                className={cn(cardVariants(), "p-5")}
                key={decision.heading}
              >
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
          <h2>{copy.pequeverso.galleryHeading}</h2>
          <p className="muted">{copy.pequeverso.galleryCaption}</p>
          <GalleryCarousel
            locale={locale}
            label={copy.pequeverso.galleryLabel}
            nextLabel={copy.filomena.galleryNext}
            slideLabels={slides.map((_, position) =>
              copy.filomena.galleryPosition(position + 1, slides.length),
            )}
            previousLabel={copy.filomena.galleryPrevious}
            slides={slides}
            frame="uniform"
            flows={pequeversoGalleryFlows}
          />
        </section>

        <section className={styles.block}>
          <h2>{study.status.heading}</h2>
          {prose(study.status.body)}
        </section>

        <section className={styles.block}>
          <h2>{copy.pequeverso.evidenceHeading}</h2>
          <div className={styles.evidence}>
            {project.links.map((link) => (
              <ExternalLink
                data-slot="card"
                className={cn(cardVariants(), styles.evidenceLink)}
                href={link.href}
                key={link.href}
                locale={locale}
              >
                <span className={styles.evidenceLabel}>{link.label}</span>
                <span className={styles.evidenceDescription}>{link.description}</span>
              </ExternalLink>
            ))}
          </div>
          <p className="muted">{copy.pequeverso.evidenceNote}</p>
        </section>

        <div className="actions">
          <Link
            className={buttonVariants({ variant: "outline" })}
            href={localePath(locale, "/work")}
          >
            {copy.actions.backToWork}
          </Link>
          <Link className={buttonVariants()} href={localePath(locale, "/contact")}>
            {copy.actions.getInTouch}
          </Link>
        </div>
      </div>
    </>
  );
}
