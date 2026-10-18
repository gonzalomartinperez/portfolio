import type { ReactNode } from "react";
import styles from "./page-header.module.css";

export function PageHeader({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: ReactNode;
}) {
  return (
    <div className={styles.header}>
      <div className={`frame ${styles.inner}`}>
        <p className="eyebrow">{eyebrow}</p>
        <h1 className={styles.title}>{title}</h1>
        {intro ? <p className={styles.intro}>{intro}</p> : null}
        {children}
      </div>
    </div>
  );
}
