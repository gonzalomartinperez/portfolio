"use client";

import { type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { createFieldEngine, type FieldEngine, type FieldPalette } from "./field-engine";
import styles from "./particle-field.module.css";

type Mode = "static" | "running" | "paused";

/** Parses the `rgb(r g b)` form a computed custom property resolves to. */
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
 * Mounts the live point cloud over its server-rendered still.
 *
 * The still arrives as `children` so it stays a Server Component, and it remains the visible
 * layer whenever the field never starts: no WebGL2, a failed program link, or reduced motion.
 * Pausing is different — the canvas stays visible and simply holds its last frame.
 *
 * React state changes only when the mode changes — never per frame.
 */
export function ParticleField({
  children,
  pauseLabel,
  playLabel,
}: {
  children: ReactNode;
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
      const rect = stage.getBoundingClientRect();
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

    // The theme only changes when the toggle writes data-theme; the system preference is
    // deliberately not followed.
    const themeObserver = new MutationObserver(applyPalette);
    themeObserver.observe(document.documentElement, {
      attributeFilter: ["data-theme"],
    });

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
      <div className={`${styles.layer} ${styles.staticLayer}`}>{children}</div>
      {/* biome-ignore lint/a11y/noAriaHiddenOnFocusable: a canvas without tabindex is not focusable, and this one is decorative — hiding it is the documented treatment. */}
      <canvas aria-hidden="true" className={`${styles.layer} ${styles.canvas}`} ref={canvasRef} />
      {mode !== "static" && (
        <button className={styles.toggle} onClick={toggle} type="button">
          <span aria-hidden="true" className={styles.toggleIcon} />
          {mode === "paused" ? playLabel : pauseLabel}
        </button>
      )}
    </div>
  );
}
