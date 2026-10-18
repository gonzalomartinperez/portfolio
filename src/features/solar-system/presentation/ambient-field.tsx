"use client";

import { useState } from "react";
import { usePageMotionPaused } from "../../../shared/motion/motion-state";
import type { SolarTextureVersions } from "../domain/solar-system-scene";
import styles from "./ambient-field.module.css";
import { SolarSystem } from "./solar-system";

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
