"use client";

import { useState } from "react";
import styles from "./ambient-field.module.css";
import { usePageMotionPaused } from "./motion-state";
import { SolarSystem } from "./solar-system";
import type { SolarTextureVersions } from "./solar-system-scene";

export function AmbientField({ textureVersions }: { textureVersions: SolarTextureVersions }) {
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
      <SolarSystem textureVersions={textureVersions} onReadyChange={setReady} />
    </div>
  );
}
