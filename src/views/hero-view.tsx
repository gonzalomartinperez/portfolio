import { type Locale, localePath } from "@config/locales";
import { getContent } from "@content";
import Link from "next/link";
import { HeroStage } from "@/features/hero/presentation/hero-stage";
import { StaticConstellation } from "@/features/hero/presentation/static-constellation";
import { TechSceneSource } from "@/features/hero/presentation/tech-constellation";
import { Mark } from "@/shared/identity/mark";
import { buttonVariants } from "@/shared/ui/button";
import styles from "./hero.module.css";

export function HeroView({ locale }: { locale: Locale }) {
  const { profile, siteCopy: copy } = getContent(locale);

  const hero = (
    <div className={`frame ${styles.inner}`}>
      <p className={`eyebrow ${styles.eyebrow}`}>
        {profile.heroProof.map((part, index) => (
          <span className={styles.proofPart} key={part}>
            {index > 0 && (
              <>
                {" "}
                <span aria-hidden="true" className={styles.proofSeparator}>
                  ·
                </span>{" "}
              </>
            )}
            {part}
          </span>
        ))}
      </p>

      <h1 className={styles.name}>{profile.name}</h1>
      <p className={styles.proposition}>{profile.headline}</p>

      <div className={`actions ${styles.actions}`}>
        <Link className={buttonVariants()} href={localePath(locale, "/work")}>
          {copy.actions.seeWork}
        </Link>
        <Link
          className={buttonVariants({ variant: "outline" })}
          href={localePath(locale, "/contact")}
        >
          {copy.actions.getInTouch}
        </Link>
      </div>

      <p className={styles.availability}>
        <span aria-hidden="true" className={styles.pulse} />
        <span>{profile.currentPosition}</span>
        <span aria-hidden="true" className={styles.separator}>
          ·
        </span>
        <span className={styles.openToRemote}>{copy.hero.openToRemote}</span>
      </p>
    </div>
  );

  return (
    <HeroStage
      sceneSource={
        <TechSceneSource
          heading={copy.stack.fieldHeading}
          note={copy.stack.fieldIntro}
          locale={locale}
        />
      }
      core={
        <span aria-hidden="true" className={styles.core}>
          <Mark size={64} />
        </span>
      }
      hero={hero}
      avatarLabel={copy.hero.avatarInteraction}
      still={<StaticConstellation />}
    />
  );
}

/** Working principles, shown on the home page after the evidence. */
export function HeroPrinciples({ locale }: { locale: Locale }) {
  const { siteCopy: copy } = getContent(locale);
  return (
    <section className={`frame ${styles.principles}`} aria-label={copy.hero.principlesLabel}>
      {copy.hero.principles.map((item) => (
        <div key={item.title}>
          <h2 className={styles.principleTitle}>{item.title}</h2>
          <p className={styles.principleDescription}>{item.description}</p>
        </div>
      ))}
      <Link className={styles.principlesLink} href={localePath(locale, "/work")}>
        {copy.hero.principlesLink}
      </Link>
    </section>
  );
}
