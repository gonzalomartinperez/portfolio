"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { createFieldEngine, type FieldEngine, type FieldPalette } from "./field-engine";
import styles from "./hero-stage.module.css";

type Mode = "static" | "running" | "paused";

function channels(value: string): [number, number, number] | null {
  const parts = value.match(/[\d.]+/g);
  if (!parts || parts.length < 3) return null;
  return [Number(parts[0]) / 255, Number(parts[1]) / 255, Number(parts[2]) / 255];
}

function readPalette(element: Element): FieldPalette | null {
  const style = getComputedStyle(element);
  const near = channels(style.getPropertyValue("--field-near"));
  const far = channels(style.getPropertyValue("--field-far"));
  if (!near || !far) return null;
  return { near, far, additive: style.getPropertyValue("--field-additive").trim() !== "0" };
}

/**
 * The field, spanning the hero and the section beneath it.
 *
 * One canvas sits sticky behind both: scrolling past the hero disperses the shell outward and
 * the technology marks resolve inside the dispersing field, so the two sections read as one
 * continuous movement rather than two separate visuals.
 *
 * Scroll progress is written straight to the engine through a `requestAnimationFrame` callback.
 * It never becomes React state — that would re-render the whole subtree on every frame.
 *
 * Fallback behaviour is unchanged: without WebGL2, without JavaScript, or under reduced motion
 * the server-rendered still stays visible and the marks below are simply shown.
 */
export function HeroStage({
  still,
  core,
  hero,
  constellation,
  pauseLabel,
  playLabel,
}: {
  still: ReactNode;
  /** The identity mark, held at the centre of the field in every state. */
  core: ReactNode;
  hero: ReactNode;
  constellation: ReactNode;
  pauseLabel: string;
  playLabel: string;
}) {
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FieldEngine | null>(null);
  const pausedByUser = useRef(false);
  const onScreen = useRef(true);
  const [mode, setMode] = useState<Mode>("static");

  const sync = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) return;
    const shouldRun = onScreen.current && !pausedByUser.current && !document.hidden;
    if (shouldRun) engine.start();
    else engine.stop();
  }, []);

  // Progress through the stage drives both the field and the marks, so it is tracked even when
  // there is no field to drive — otherwise a visitor without WebGL2 would never see the marks.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    let frame = 0;
    const updateProgress = () => {
      frame = 0;
      const rect = stage.getBoundingClientRect();
      const travel = Math.max(1, rect.height - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / travel));
      stage.style.setProperty("--stage-progress", progress.toFixed(3));
      engineRef.current?.setExpansion(progress);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(updateProgress);
    };
    updateProgress();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = stageRef.current;
    if (!canvas || !stage) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches) return;

    const engine = createFieldEngine(canvas);
    if (!engine) return;
    engineRef.current = engine;

    const applyPalette = () => {
      const palette = readPalette(document.documentElement);
      if (palette) engine.setPalette(palette);
    };
    applyPalette();
    setMode("running");
    engine.start();
    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen.current = entry.isIntersecting;
        sync();
      },
      { threshold: 0 },
    );
    observer.observe(stage);

    const handleVisibility = () => sync();
    document.addEventListener("visibilitychange", handleVisibility);

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const aspect = rect.width / rect.height;
      engine.setPointer({
        x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
        y: (1 - ((event.clientY - rect.top) / rect.height) * 2) / aspect,
      });
    };
    const releasePointer = () => engine.setPointer(null);
    stage.addEventListener("pointermove", handlePointerMove);
    stage.addEventListener("pointerleave", releasePointer);
    stage.addEventListener("pointercancel", releasePointer);

    const handleMotionChange = () => {
      if (!reducedMotion.matches) return;
      engine.stop();
      setMode("static");
    };
    reducedMotion.addEventListener("change", handleMotionChange);

    const themeObserver = new MutationObserver(applyPalette);
    themeObserver.observe(document.documentElement, { attributeFilter: ["data-theme"] });

    return () => {
      observer.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibility);
      stage.removeEventListener("pointermove", handlePointerMove);
      stage.removeEventListener("pointerleave", releasePointer);
      stage.removeEventListener("pointercancel", releasePointer);
      reducedMotion.removeEventListener("change", handleMotionChange);
      engine.dispose();
      engineRef.current = null;
    };
  }, [sync]);

  const toggle = () => {
    pausedByUser.current = !pausedByUser.current;
    setMode(pausedByUser.current ? "paused" : "running");
    sync();
  };

  return (
    <div className={styles.stage} data-mode={mode} ref={stageRef}>
      <div className={styles.viewport}>
        <div className={styles.still}>{still}</div>
        {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: a canvas without tabindex is not focusable, and this one is decorative. */}
        <canvas aria-hidden="true" className={styles.canvas} ref={canvasRef} />
        <div className={styles.core}>{core}</div>
        {mode !== "static" && (
          <button className={styles.toggle} onClick={toggle} type="button">
            <span aria-hidden="true" className={styles.toggleIcon} />
            {mode === "paused" ? playLabel : pauseLabel}
          </button>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.heroPane}>{hero}</div>
        <div className={styles.constellationPane}>{constellation}</div>
      </div>
    </div>
  );
}
