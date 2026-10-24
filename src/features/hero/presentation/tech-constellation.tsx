import { type Locale, localePath } from "@config/locales";
import {
  compareTechnologyNames,
  highlightedTechnologyCatalog,
  homeStackTechnologies,
  type Technology,
  technologyGroups,
} from "@content/technologies";
import Link from "next/link";
import type { ReactNode } from "react";
import { TechnologyMark } from "@/shared/technology/technology-mark";
import { getSceneMarkIdentity } from "../domain/scene-technologies";
import styles from "./tech-constellation.module.css";

function MarkIdentity({ item }: { item: Technology }) {
  return (
    <span
      className={styles.identity}
      data-tech-icon={getSceneMarkIdentity(item) ? item.id : undefined}
      data-scene-brand={getSceneMarkIdentity(item)}
    >
      <span className={styles.glyph}>
        <TechnologyMark technology={item} size={22} />
      </span>
      <span className={styles.name} data-scene-label>
        {item.name}
      </span>
    </span>
  );
}

/**
 * Never rendered in place (the stage keeps it hidden): the scene runtime clones its copy and
 * marks into the inert logo cloud, so the page does not list the stack a second time.
 */
export function TechSceneSource({
  heading,
  note,
  locale = "en",
}: {
  heading: string;
  note: string;
  locale?: Locale;
}) {
  return (
    <>
      <div data-scene-copy>
        <p className="eyebrow">
          {locale === "es" ? "De la idea al sistema" : "From idea to system"}
        </p>
        <h2 className={styles.heading}>{heading}</h2>
        <p className={styles.note}>{note}</p>
      </div>
      {highlightedTechnologyCatalog.filter(getSceneMarkIdentity).map((item) => (
        <MarkIdentity item={item} key={item.id} />
      ))}
    </>
  );
}

/** The home stack: a short, grouped selection that links each tool to its context. */
export function CondensedStack({
  eyebrow,
  heading,
  note,
  locale = "en",
  children,
}: {
  eyebrow: string;
  heading: string;
  note: string;
  locale?: Locale;
  /** The full-catalogue disclosure, kept closed by default. */
  children?: ReactNode;
}) {
  return (
    <section
      className={`section-tight frame ${styles.constellation}`}
      aria-labelledby="technology-heading"
    >
      <div className={styles.intro}>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className={styles.heading} id="technology-heading">
          {heading}
        </h2>
        <p className={styles.note}>{note}</p>
        <Link className="text-link" href={localePath(locale, "/stack")}>
          {locale === "es"
            ? "Explorar tecnologías y aplicaciones →"
            : "Explore technologies and applications →"}
        </Link>
      </div>
      <div className={styles.groups}>
        {technologyGroups.map((group) => {
          const items = homeStackTechnologies
            .filter((item) => item.category === group.id)
            .sort(compareTechnologyNames);
          if (!items.length) return null;
          return (
            <section
              className={styles.group}
              key={group.id}
              aria-labelledby={`home-tech-${group.id}`}
            >
              <h3 id={`home-tech-${group.id}`}>{group.name[locale]}</h3>
              <ul className={styles.marks}>
                {items.map((item) => (
                  <li key={item.id}>
                    <Link
                      className={styles.mark}
                      href={localePath(locale, `/stack#tech-${item.id}`)}
                    >
                      <span className={styles.identity}>
                        <span className={styles.glyph}>
                          <TechnologyMark technology={item} size={22} />
                        </span>
                        <span className={styles.name}>{item.name}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      {children}
    </section>
  );
}
