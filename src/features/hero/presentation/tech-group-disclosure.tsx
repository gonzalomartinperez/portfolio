"use client";

import { type ReactNode, useState } from "react";
import styles from "./tech-constellation.module.css";

/**
 * One technology group. Phones get a collapsed disclosure (heading button with the count);
 * wider screens show the plain heading and the list. CSS picks the variant, so the server
 * markup already matches the viewport and nothing shifts on hydration.
 */
export function TechGroupDisclosure({
  id,
  name,
  count,
  countLabel,
  children,
}: {
  id: string;
  name: string;
  count: number;
  countLabel: string;
  children: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  return (
    <section className={styles.group} aria-labelledby={id} data-expanded={expanded}>
      <h3 id={id}>
        <span className={styles.groupName}>{name}</span>
        <button
          type="button"
          className={styles.groupToggle}
          aria-expanded={expanded}
          aria-controls={`${id}-list`}
          onClick={() => setExpanded((value) => !value)}
        >
          <span>{name}</span>
          <span className="muted">
            {count}
            <span className="sr-only"> {countLabel}</span>
          </span>
        </button>
      </h3>
      {children}
    </section>
  );
}
