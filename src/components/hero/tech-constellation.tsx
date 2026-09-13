import Link from "next/link";
import { TechnologyMark } from "@/components/technology-mark";
import { type Locale, localePath } from "@/content/locales";
import { technologyCatalog, technologyGroups } from "@/content/technologies";
import styles from "./tech-constellation.module.css";

export function TechConstellation({
  heading,
  note,
  locale = "en",
}: {
  heading: string;
  note: string;
  locale?: Locale;
}) {
  return (
    <section className={`frame ${styles.constellation}`} aria-labelledby="technology-heading">
      <div className={styles.intro} data-scene-copy>
        <p className="eyebrow">
          {locale === "es" ? "De la idea al sistema" : "From idea to system"}
        </p>
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
        {technologyGroups.map((group) => (
          <section
            className={styles.group}
            key={group.id}
            aria-labelledby={`home-tech-${group.id}`}
          >
            <h3 id={`home-tech-${group.id}`}>{group.name[locale]}</h3>
            <ul className={styles.marks}>
              {technologyCatalog
                .filter((item) => item.category === group.id)
                .map((item) => (
                  <li key={item.id}>
                    <Link
                      className={styles.mark}
                      href={localePath(locale, `/stack#tech-${item.id}`)}
                    >
                      <span
                        className={styles.identity}
                        data-tech-icon={item.icon ? item.id : undefined}
                        data-scene-brand={item.icon === "springboot" ? "spring" : item.icon}
                      >
                        <span className={styles.glyph}>
                          <TechnologyMark technology={item} size={22} />
                        </span>
                        <span className={styles.name} data-scene-label>
                          {item.name}
                        </span>
                      </span>
                      {item.status === "developing" && (
                        <span className={styles.status}>
                          {locale === "es" ? "En consolidación" : "In development"}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        ))}
      </div>
    </section>
  );
}
