"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import styles from "./hero-stage.module.css";
import type { SceneRuntime } from "./scene-runtime";

type Mode = "static" | "running" | "paused";

export function HeroStage({
  still,
  core,
  hero,
  constellation,
  pauseLabel,
  playLabel,
}: {
  still: ReactNode;
  core: ReactNode;
  hero: ReactNode;
  constellation: ReactNode;
  pauseLabel: string;
  playLabel: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<SceneRuntime | null>(null);
  const pausedRef = useRef(false);
  const [mode, setMode] = useState<Mode>("static");

  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const shortViewport = matchMedia("(max-height: 649px)");
    let cancelled = false;
    let generation = 0;
    const clear = () => {
      runtimeRef.current?.dispose();
      runtimeRef.current = null;
      setMode("static");
    };
    const initialize = async () => {
      const token = ++generation;
      clear();
      if (motion.matches || shortViewport.matches) return;
      try {
        const { mountScene } = await import("./scene-runtime");
        if (cancelled || token !== generation) return;
        runtimeRef.current = mountScene(stage, canvas);
        runtimeRef.current.sync(pausedRef.current);
        setMode(pausedRef.current ? "paused" : "running");
      } catch {
        if (!cancelled) clear();
      }
    };
    const lost = (event: Event) => {
      event.preventDefault();
      generation += 1;
      clear();
    };
    const restored = () => {
      void initialize();
    };
    canvas.addEventListener("webglcontextlost", lost);
    canvas.addEventListener("webglcontextrestored", restored);
    motion.addEventListener("change", restored);
    shortViewport.addEventListener("change", restored);
    void initialize();
    return () => {
      cancelled = true;
      generation += 1;
      runtimeRef.current?.dispose();
      runtimeRef.current = null;
      canvas.removeEventListener("webglcontextlost", lost);
      canvas.removeEventListener("webglcontextrestored", restored);
      motion.removeEventListener("change", restored);
      shortViewport.removeEventListener("change", restored);
    };
  }, []);

  const toggle = () => {
    pausedRef.current = !pausedRef.current;
    setMode(pausedRef.current ? "paused" : "running");
    runtimeRef.current?.sync(pausedRef.current);
  };

  return (
    <div className={styles.stage} data-mode={mode} data-scene ref={stageRef}>
      <div className={styles.journey} data-scene-journey>
        <div className={styles.viewport} data-scene-viewport>
          <div className={styles.heroPane} data-scene-hero>
            {hero}
          </div>
          <div className={styles.still}>{still}</div>
          {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: this decorative canvas has no tab stop or interaction. */}
          <canvas aria-hidden="true" className={styles.canvas} ref={canvasRef} />
          <div className={styles.core} data-scene-core>
            {core}
          </div>
          <div className={styles.logoCloud} data-logo-cloud aria-hidden="true" inert />
          {mode !== "static" && (
            <button
              className={styles.toggle}
              onClick={toggle}
              type="button"
              aria-pressed={mode === "paused"}
            >
              <span aria-hidden="true">{mode === "paused" ? "▶" : "Ⅱ"}</span>
              {mode === "paused" ? playLabel : pauseLabel}
            </button>
          )}
          <div className={styles.scrollCue} aria-hidden="true">
            ↓
          </div>
        </div>
      </div>
      <div className={styles.constellationPane}>{constellation}</div>
    </div>
  );
}
