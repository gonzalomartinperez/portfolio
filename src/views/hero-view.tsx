import Link from "next/link";
import { HeroStage } from "@/components/hero/hero-stage";
import { StaticConstellation } from "@/components/hero/static-constellation";
import { TechConstellation } from "@/components/hero/tech-constellation";
import { Mark } from "@/components/mark";
import { buttonVariants } from "@/components/ui/button";
import { getContent } from "@/content";
import { type Locale, localePath } from "@/content/locales";
import styles from "./hero.module.css";

export function HeroView({ locale }: { locale: Locale }) {
  const { profile, siteCopy: copy } = getContent(locale);

  const hero = (
    <div className={`frame ${styles.inner}`}>
      <p className={`eyebrow ${styles.eyebrow}`}>
        {profile.role} · {profile.location} · {profile.arrangement}
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
        {profile.currentPosition} · {copy.hero.openToRemote}
      </p>
    </div>
  );

  return (
    <>
      <HeroStage
        constellation={
          <TechConstellation
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
        pauseLabel={copy.hero.pauseAnimation}
        playLabel={copy.hero.playAnimation}
        avatarLabel={copy.hero.avatarInteraction}
        still={<StaticConstellation />}
      />

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
    </>
  );
}
