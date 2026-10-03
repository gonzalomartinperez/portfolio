"use client";

import { type ComponentType, useCallback, useEffect, useState } from "react";
import styles from "./ambient-field.module.css";
import type { AmbientParticlesProps } from "./ambient-particles";
import { usePageMotionPaused } from "./motion-state";
import { SolarSystem } from "./solar-system";

export function AmbientField() {
  const paused = usePageMotionPaused();
  const [Renderer, setRenderer] = useState<ComponentType<AmbientParticlesProps> | null>(null);
  const [ready, setReady] = useState(false);
  const onReady = useCallback(() => setReady(true), []);

  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let generation = 0;
    let idle: number | undefined;
    let timer: number | undefined;
    const cancel = () => {
      if (idle !== undefined) window.cancelIdleCallback(idle);
      if (timer !== undefined) window.clearTimeout(timer);
    };
    const sync = () => {
      cancel();
      const token = ++generation;
      if (motion.matches) {
        setRenderer(null);
        setReady(false);
        return;
      }
      const load = async () => {
        try {
          const { default: component } = await import("./ambient-particles");
          if (token === generation) setRenderer(() => component);
        } catch {
          // The server-rendered star field remains complete if the optional engine cannot load.
        }
      };
      if (typeof window.requestIdleCallback === "function") {
        idle = window.requestIdleCallback(() => void load(), { timeout: 2_000 });
      } else {
        timer = window.setTimeout(() => void load(), 350);
      }
    };
    sync();
    motion.addEventListener("change", sync);
    return () => {
      generation += 1;
      cancel();
      motion.removeEventListener("change", sync);
    };
  }, []);

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
      <SolarSystem />
      {Renderer && <Renderer paused={paused} onReady={onReady} />}
    </div>
  );
}
