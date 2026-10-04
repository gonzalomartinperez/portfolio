"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { usePageMotionPaused } from "./motion-state";
import styles from "./solar-system.module.css";
import type { SolarEngine } from "./solar-system-engine";
import { solarOrbitPoint, solarPhase, solarPlanets, solarTextureUrl } from "./solar-system-scene";

/** Decorative, compressed orbits; the complete SSR scene is also the reduced-motion fallback. */
export function SolarSystem() {
  const [canvasEnabled, setCanvasEnabled] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<SolarEngine | null>(null);
  const paused = usePageMotionPaused();
  const pausedRef = useRef(paused);

  useEffect(() => {
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      if (motion.matches && root.current) {
        root.current.dataset.renderer = "static";
        root.current.dataset.state = "static";
      }
      setCanvasEnabled(!motion.matches);
    };
    sync();
    motion.addEventListener("change", sync);
    return () => motion.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    pausedRef.current = paused;
    engine.current?.setPaused(paused || document.hidden);
    if (root.current?.dataset.renderer === "webgl") {
      root.current.dataset.state = paused || document.hidden ? "paused" : "running";
    }
  }, [paused]);

  useEffect(() => {
    const element = root.current,
      surface = canvas.current;
    if (!element || !surface || !canvasEnabled) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false,
      generation = 0;
    let idle: number | undefined;
    const staticScene = () => {
      element.dataset.renderer = "static";
      element.dataset.state = "static";
    };
    const light = () => document.documentElement.dataset.theme === "light";
    const sync = () => {
      const token = ++generation;
      if (idle !== undefined) cancelIdleCallback(idle);
      engine.current?.dispose();
      engine.current = null;
      staticScene();
      if (reduced.matches || disposed) return;
      const load = async () => {
        try {
          const { createSolarSystemEngine } = await import("./solar-system-engine");
          if (disposed || token !== generation || reduced.matches) return;
          const query = new URLSearchParams(location.search);
          const requestedTime = query.get("solarTime");
          const fixedTime =
            requestedTime !== null && Number.isFinite(Number(requestedTime))
              ? Math.max(0, Math.min(100_000, Number(requestedTime)))
              : null;
          engine.current = createSolarSystemEngine(surface, {
            paused: pausedRef.current || document.hidden,
            light: light(),
            fixedTime,
            debug: query.get("solarDebug") === "1",
            onReady() {
              if (disposed || token !== generation) return;
              element.dataset.renderer = "webgl";
              element.dataset.state = pausedRef.current || document.hidden ? "paused" : "running";
            },
            onUnavailable(reason) {
              if (disposed || token !== generation) return;
              staticScene();
              if (reason === "texture") {
                engine.current?.dispose();
                engine.current = null;
              }
            },
          });
        } catch {
          // Optional WebGL must never replace a complete fallback with an empty field.
          if (!disposed && token === generation) staticScene();
        }
      };
      if (typeof requestIdleCallback === "function")
        idle = requestIdleCallback(() => void load(), { timeout: 2000 });
      else void load();
    };
    const visibility = () => {
      engine.current?.setPaused(pausedRef.current || document.hidden);
      if (element.dataset.renderer === "webgl")
        element.dataset.state = pausedRef.current || document.hidden ? "paused" : "running";
    };
    const theme = new MutationObserver(() => engine.current?.setLight(light()));
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", visibility);
    sync();
    return () => {
      disposed = true;
      generation++;
      if (idle !== undefined) cancelIdleCallback(idle);
      engine.current?.dispose();
      engine.current = null;
      theme.disconnect();
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [canvasEnabled]);

  return (
    <div
      ref={root}
      className={styles.system}
      data-solar-system
      data-renderer="static"
      data-state="static"
      aria-hidden="true"
    >
      <div className={styles.fallback}>
        <span
          className={styles.sun}
          data-sun
          style={{ backgroundImage: `url(${solarTextureUrl("sun")})` }}
        />
        {solarPlanets.map((planet) => {
          const desktop = solarOrbitPoint(planet, solarPhase(planet, false), 1, 1);
          const mobile = solarOrbitPoint(planet, solarPhase(planet, true), 1, 1, true);
          const style = {
            "--body-size": `${planet.diameter}px`,
            "--mobile-size": `${planet.mobileDiameter}px`,
            "--body-left": `${62 + desktop.x * 100}%`,
            "--body-top": `${46 - desktop.y * 100}%`,
            "--mobile-left": `${72 + mobile.x * 100}%`,
            "--mobile-top": `${46 - mobile.y * 100}%`,
            "--surface": `url(${solarTextureUrl(planet.name)})`,
          } as CSSProperties;
          return (
            <span
              key={planet.name}
              className={styles.body}
              style={style}
              data-planet={planet.name}
              data-orbit={planet.name}
            >
              {planet.name === "saturn" && (
                <span className={`${styles.rings} ${styles.ringsBack}`} />
              )}
              <span className={styles.surface} />
              {planet.name === "saturn" && (
                <span className={`${styles.rings} ${styles.ringsFront}`} />
              )}
              {planet.name === "earth" && <span className={styles.moon} data-moon />}
            </span>
          );
        })}
      </div>
      {canvasEnabled && <canvas ref={canvas} className={styles.canvas} data-solar-canvas />}
    </div>
  );
}
