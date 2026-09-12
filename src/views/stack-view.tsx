import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { getContent } from "@/content";
import { type Locale, localePath } from "@/content/locales";
import styles from "./stack.module.css";

export function StackView({ locale }: { locale: Locale }) {
  const { stackGroups, siteCopy: copy } = getContent(locale);

  return (
    <>
      <PageHeader eyebrow={copy.stack.eyebrow} intro={copy.stack.intro} title={copy.stack.title} />

      <section className="section-tight frame">
        <div className={styles.groups}>
          {stackGroups.map((group) => (
            <article className={styles.group} id={group.id} key={group.id}>
              <div>
                <h2 className={styles.groupName}>{group.name}</h2>
                <p className={styles.evidence}>{group.evidence}</p>
              </div>
              <ul className={styles.items}>
                {group.items.map((item) => (
                  <li className={styles.item} key={item}>
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="section-tight frame">
        <div className="section-head">
          <h2>{copy.stack.noteHeading}</h2>
          <p>{copy.stack.noteScope}</p>
          <p>{copy.stack.noteLogos}</p>
        </div>
        <div className="actions flow">
          <Link className="button button-secondary" href={localePath(locale, "/work")}>
            {copy.actions.fullExperience}
          </Link>
        </div>
      </section>
    </>
  );
}
