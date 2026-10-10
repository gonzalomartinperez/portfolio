"use client";

import { Pause, Play } from "lucide-react";
import { type ReactNode, useEffect, useLayoutEffect, useRef, useState } from "react";
import { setPageMotionPaused, usePageMotionPaused } from "../motion-state";
import styles from "./hero-stage.module.css";
import type { SceneRuntime } from "./scene-runtime";

type Mode = "static" | "running" | "paused";

let cachedMountScene: typeof import("./scene-runtime").mountScene | undefined;

export function HeroStage({
  still,
  core,
  hero,
  constellation,
  pauseLabel,
  playLabel,
  avatarLabel,
}: {
  still: ReactNode;
  core: ReactNode;
  hero: ReactNode;
  constellation: ReactNode;
  pauseLabel: string;
  playLabel: string;
  avatarLabel: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasHostRef = useRef<HTMLDivElement>(null);
  const runtimeRef = useRef<SceneRuntime | null>(null);
  const paused = usePageMotionPaused();
  const pausedRef = useRef(paused);
  const [mode, setMode] = useState<Mode>("static");

  useEffect(() => {
    pausedRef.current = paused;
    runtimeRef.current?.sync(paused);
    setMode((current) => (current === "static" ? current : paused ? "paused" : "running"));
  }, [paused]);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    const canvasHost = canvasHostRef.current;
    if (!stage || !canvasHost) return;
    let canvas: HTMLCanvasElement | null = null;
    const detach = () => {
      canvas?.removeEventListener("webglcontextlost", lost);
      canvas?.removeEventListener("webglcontextrestored", restored);
    };
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const shortViewport = matchMedia("(max-height: 649px)");
    let cancelled = false;
    let generation = 0;
    const clear = () => {
      runtimeRef.current?.dispose();
      runtimeRef.current = null;
      stage.dataset.mode = "static";
      setMode("static");
    };
    const initialize = () => {
      const token = ++generation;
      clear();
      if (motion.matches || shortViewport.matches) return;
      const mount = (mountScene: NonNullable<typeof cachedMountScene>) => {
        if (cancelled || token !== generation) return;
        try {
          detach();
          // Measure the final animated layout, rather than reallocating the GPU
          // buffer for a transient static viewport during a warm route commit.
          stage.dataset.mode = pausedRef.current ? "paused" : "running";
          runtimeRef.current = mountScene(stage, canvasHost);
          canvas = runtimeRef.current.canvas;
          canvas.addEventListener("webglcontextlost", lost);
          canvas.addEventListener("webglcontextrestored", restored);
          runtimeRef.current.sync(pausedRef.current);
          setMode(pausedRef.current ? "paused" : "running");
        } catch {
          clear();
        }
      };
      // A warm Home navigation must draw before paint, without flashing the static layout.
      if (cachedMountScene) {
        mount(cachedMountScene);
        return;
      }
      void import("./scene-runtime")
        .then(({ mountScene }) => {
          cachedMountScene = mountScene;
          mount(mountScene);
        })
        .catch(() => {
          if (!cancelled && token === generation) clear();
        });
    };
    const lost = (event: Event) => {
      event.preventDefault();
      generation += 1;
      clear();
    };
    const restored = () => {
      initialize();
    };
    motion.addEventListener("change", restored);
    shortViewport.addEventListener("change", restored);
    initialize();
    return () => {
      cancelled = true;
      generation += 1;
      runtimeRef.current?.release();
      runtimeRef.current = null;
      detach();
      motion.removeEventListener("change", restored);
      shortViewport.removeEventListener("change", restored);
    };
  }, []);

  const toggle = () => {
    setPageMotionPaused(!paused);
  };

  return (
    <div className={styles.stage} data-mode={mode} data-scene ref={stageRef}>
      <div className={styles.journey} data-scene-journey>
        <div className={styles.viewport} data-scene-viewport>
          <div className={styles.backdrop} data-scene-backdrop aria-hidden="true" />
          <div className={styles.heroPane} data-scene-hero>
            {hero}
          </div>
          <div className={styles.still}>{still}</div>
          <div className={styles.canvasHost} ref={canvasHostRef} />
          <div className={styles.core} data-scene-core>
            <button
              type="button"
              className={styles.avatar}
              data-scene-avatar
              aria-label={avatarLabel}
              onClick={(event) => {
                if (event.detail === 0) runtimeRef.current?.activateAvatar();
              }}
            >
              <span className={styles.avatarArt} data-scene-avatar-art>
                {core}
              </span>
            </button>
          </div>
          <div className={styles.logoCloud} data-logo-cloud aria-hidden="true" inert />
          {mode !== "static" && (
            <button
              className={styles.toggle}
              onClick={toggle}
              type="button"
              aria-label={mode === "paused" ? playLabel : pauseLabel}
              title={mode === "paused" ? playLabel : pauseLabel}
              aria-pressed={mode === "paused"}
            >
              {mode === "paused" ? (
                <Play aria-hidden="true" size={18} />
              ) : (
                <Pause aria-hidden="true" size={18} />
              )}
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
