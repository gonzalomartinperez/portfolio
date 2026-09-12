import Link from "next/link";
import { HeroStage } from "@/components/hero/hero-stage";
import { StaticConstellation } from "@/components/hero/static-constellation";
import { TechConstellation } from "@/components/hero/tech-constellation";
import { Mark } from "@/components/mark";
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
        <Link className="button button-primary" href={localePath(locale, "/work")}>
          {copy.actions.seeWork}
        </Link>
        <Link className="button button-secondary" href={localePath(locale, "/contact")}>
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
          <TechConstellation heading={copy.stack.fieldHeading} note={copy.stack.fieldIntro} />
        }
        core={
          <span aria-hidden="true" className={styles.core}>
            <Mark size={40} />
          </span>
        }
        hero={hero}
        pauseLabel={copy.hero.pauseAnimation}
        playLabel={copy.hero.playAnimation}
        still={<StaticConstellation />}
      />

      <div className={`frame ${styles.proof}`}>
        {copy.hero.proof.map((item) => (
          <div key={item.label}>
            <p className={styles.proofValue}>{item.value}</p>
            <p className={styles.proofLabel}>{item.label}</p>
          </div>
        ))}
        <p className={styles.proofNote}>
          {copy.hero.proofNote}{" "}
          <Link href={localePath(locale, "/work")}>{copy.hero.proofNoteLink}</Link>
        </p>
      </div>
    </>
  );
}
