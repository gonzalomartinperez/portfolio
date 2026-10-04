"use client";

import { useState } from "react";
import styles from "./ambient-field.module.css";
import { usePageMotionPaused } from "./motion-state";
import { SolarSystem } from "./solar-system";

export function AmbientField() {
  const paused = usePageMotionPaused();
  const [ready, setReady] = useState(false);
  return (
    <div
      className={styles.field}
      aria-hidden="true"
      data-ambient-field
      data-state={ready ? (paused ? "paused" : "running") : "static"}
    >
      <div className={styles.nebula} />
      <div className={styles.starsNear} />
      <div className={styles.starsFar} />
      <SolarSystem onReadyChange={setReady} />
    </div>
  );
}
