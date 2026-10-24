import { type Locale, localePath } from "@config/locales";
import {
  compareTechnologyNames,
  highlightedTechnologyCatalog,
  technologyGroups,
} from "@content/technologies";
import Link from "next/link";
import { TechnologyMark } from "@/shared/technology/technology-mark";
import { getSceneMarkIdentity } from "../domain/scene-technologies";
import styles from "./tech-constellation.module.css";
import { TechGroupDisclosure } from "./tech-group-disclosure";

export function TechConstellation({
  sceneHeading,
  sceneNote,
  heading,
  note,
  locale = "en",
}: {
  /** Copy the animated scene clones over the logo cloud. */
  sceneHeading: string;
  sceneNote: string;
  /** Copy for the grouped list below, so the page does not repeat the scene heading. */
  heading: string;
  note: string;
  locale?: Locale;
}) {
  const eyebrow = locale === "es" ? "De la idea al sistema" : "From idea to system";
  const explore =
    locale === "es"
      ? "Explorar tecnologías y aplicaciones →"
      : "Explore technologies and applications →";
  return (
    <section className={`frame ${styles.constellation}`} aria-labelledby="technology-heading">
      {/* Never rendered in place: the scene runtime clones it into the inert logo cloud. */}
      <div className={styles.sceneSource} data-scene-copy aria-hidden="true">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className={styles.heading}>{sceneHeading}</h2>
        <p className={styles.note}>{sceneNote}</p>
      </div>
      <div className={styles.intro}>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className={styles.heading} id="technology-heading">
          {heading}
        </h2>
        <p className={styles.note}>{note}</p>
        <Link className="text-link" href={localePath(locale, "/stack")}>
          {explore}
        </Link>
      </div>
      <div className={styles.groups}>
        {technologyGroups.map((group) => {
          const items = highlightedTechnologyCatalog
            .filter((item) => item.category === group.id)
            .sort(compareTechnologyNames);
          return (
            <TechGroupDisclosure
              key={group.id}
              id={`home-tech-${group.id}`}
              name={group.name[locale]}
              count={items.length}
              countLabel={locale === "es" ? "tecnologías" : "technologies"}
            >
              <ul className={styles.marks} id={`home-tech-${group.id}-list`}>
                {items.map((item) => (
                  <li key={item.id}>
                    <Link
                      className={styles.mark}
                      href={localePath(locale, `/stack#tech-${item.id}`)}
                    >
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
                      {item.status === "developing" && (
                        <span
                          className={styles.status}
                          title={locale === "es" ? "En consolidación" : "In development"}
                        >
                          <span aria-hidden="true">◌</span>
                          <span className="sr-only">
                            {locale === "es" ? "En consolidación" : "In development"}
                          </span>
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </TechGroupDisclosure>
          );
        })}
      </div>
    </section>
  );
}
