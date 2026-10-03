import Image from "next/image";
import Link from "next/link";
import portrait from "@/assets/portrait.avif";
import { CompanyMark } from "@/components/company-mark";
import { ExternalLink } from "@/components/external-link";
import { MetricList } from "@/components/metric-list";
import { TechnologyMark } from "@/components/technology-mark";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cardVariants } from "@/components/ui/card";
import { getContent } from "@/content";
import { type Locale, localePath } from "@/content/locales";
import { email, externalLinks } from "@/content/site-config";
import { publicTechnologyCatalog } from "@/content/technologies";
import { cn } from "@/lib/utils";
import { HeroView } from "./hero-view";
import styles from "./home.module.css";

export function HomeView({ locale }: { locale: Locale }) {
  const content = getContent(locale);
  const { profile, roles, filomena, academicResults, siteCopy: copy } = content;
  const showcaseScreens = [
    { id: "059", height: 680, label: locale === "es" ? "Rendir el examen" : "Taking the exam" },
    {
      id: "077",
      height: 727,
      label: locale === "es" ? "Evaluar las respuestas" : "Assessing answers",
    },
  ];
  const showcaseStack = filomena.stack.filter((item) =>
    ["Laravel", "Next.js", "React", "TypeScript", "MySQL", "Redis"].includes(item),
  );

  return (
    <>
      <HeroView locale={locale} />

      <section className="section-tight frame">
        <div className="section-head">
          <p className="eyebrow">{copy.home.workEyebrow}</p>
          <h2>{copy.home.workHeading}</h2>
        </div>

        <article
          data-slot="card"
          data-featured-project="filomena"
          className={cn(cardVariants(), styles.feature)}
        >
          <div className={styles.showcase}>
            <div className={styles.productScreens}>
              <figure>
                <Link className={styles.featureImage} href={localePath(locale, "/work/filomena")}>
                  <Image
                    alt={content.galleryAlt["040"]}
                    src="/filomena/filomena-040.webp"
                    width={1600}
                    height={723}
                    sizes="(min-width: 64rem) 34rem, (min-width: 52rem) 48vw, 90vw"
                    unoptimized
                  />
                </Link>
                <figcaption>
                  {locale === "es"
                    ? "Administrar y monitorear exámenes"
                    : "Managing and monitoring exams"}
                </figcaption>
              </figure>
              <div className={styles.screenPreviews}>
                {showcaseScreens.map((screen) => (
                  <figure key={screen.id}>
                    <div className={styles.previewImage}>
                      <Image
                        alt={content.galleryAlt[screen.id]}
                        src={`/filomena/filomena-${screen.id}.webp`}
                        width={1600}
                        height={screen.height}
                        sizes="(min-width: 64rem) 16rem, (min-width: 52rem) 23vw, 44vw"
                        unoptimized
                      />
                    </div>
                    <figcaption>{screen.label}</figcaption>
                  </figure>
                ))}
              </div>
            </div>

            <div className={styles.productStory}>
              <div className={styles.featureTop}>
                <Badge variant="outline">
                  {locale === "es" ? "Producto en producción" : "Production product"}
                </Badge>
                <p className="mono muted">{filomena.period}</p>
              </div>
              <div>
                <h3 className={styles.featureTitle}>
                  <Link href={localePath(locale, "/work/filomena")}>{filomena.name}</Link>
                </h3>
                <p className={styles.featureTagline}>{filomena.tagline}</p>
              </div>
              <p className={styles.featureContext}>{filomena.summary}</p>
              <p className={styles.featureAttribution}>{filomena.attribution}</p>
              <ul
                className="tags"
                aria-label={locale === "es" ? "Tecnologías del proyecto" : "Project technologies"}
              >
                {showcaseStack.map((item) => {
                  const technology = publicTechnologyCatalog.find(
                    (technology) => technology.name === item,
                  );
                  return (
                    <li key={item}>
                      <Badge variant="outline" className={cn("font-mono", styles.technologyChip)}>
                        {technology && <TechnologyMark technology={technology} size={16} />}
                        {item}
                      </Badge>
                    </li>
                  );
                })}
              </ul>
              <div className="actions">
                <Link className={buttonVariants()} href={localePath(locale, "/work/filomena")}>
                  {copy.actions.readCaseStudy}
                </Link>
                <ExternalLink
                  className={buttonVariants({ variant: "outline" })}
                  href={externalLinks.filomenaBackend}
                  locale={locale}
                >
                  {copy.actions.sourceOnGithub}
                </ExternalLink>
              </div>
            </div>
          </div>
          <div className={styles.showcaseMetrics}>
            <MetricList metrics={filomena.metrics.slice(0, 3)} />
          </div>
        </article>
      </section>

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
          <Link
            className={buttonVariants({ variant: "outline" })}
            href={localePath(locale, "/work")}
          >
            {copy.actions.fullExperience}
          </Link>
        </div>
      </section>

      <section className="section frame">
        <div className={styles.split}>
          <div className="portrait-frame">
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
          <Link
            className={buttonVariants({ variant: "outline" })}
            href={localePath(locale, "/education")}
          >
            {copy.actions.academicRecord}
          </Link>
        </div>
      </section>

      <section className="section-tight frame">
        <div data-slot="card" className={cn(cardVariants(), styles.closing)}>
          <h2>{copy.home.closingHeading}</h2>
          <p>{copy.home.closingBody}</p>
          <div className="actions">
            <a className={buttonVariants()} href={`mailto:${email}`}>
              {copy.actions.emailMe}
            </a>
            <Link
              className={buttonVariants({ variant: "outline" })}
              href={localePath(locale, "/contact")}
            >
              {copy.actions.allContact}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
