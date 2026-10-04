"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { usePageMotionPaused } from "./motion-state";
import { setSolarReady, solarExplorerSnapshot, useSolarExplorer } from "./solar-explorer-state";
import styles from "./solar-system.module.css";
import type { SolarEngine } from "./solar-system-engine";
import { solarOrbitPoint, solarPhase, solarPlanets, solarTextureUrl } from "./solar-system-scene";

/** Decorative, compressed orbits; the complete SSR scene is also the reduced-motion fallback. */
export function SolarSystem({ onReadyChange }: { onReadyChange: (ready: boolean) => void }) {
  const explorer = useSolarExplorer();
  const revisions = useRef({
    reset: explorer.resetRevision,
    rotation: explorer.rotation,
    zoom: explorer.zoom,
  });
  const [canvasEnabled, setCanvasEnabled] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const engine = useRef<SolarEngine | null>(null);
  const paused = usePageMotionPaused();
  const pausedRef = useRef(paused);

  useEffect(() => {
    const active = engine.current;
    if (!active || !explorer.ready) return;
    active.setHost(explorer.host);
    active.setImmersive(Boolean(explorer.host));
  }, [explorer.host, explorer.ready]);

  useEffect(() => {
    if (explorer.ready) engine.current?.highlightBody(explorer.selected);
  }, [explorer.selected, explorer.ready]);

  useEffect(() => {
    if (revisions.current.reset !== explorer.resetRevision) engine.current?.resetView();
    if (revisions.current.rotation !== explorer.rotation)
      engine.current?.rotateView(explorer.rotation - revisions.current.rotation);
    if (revisions.current.zoom !== explorer.zoom)
      engine.current?.zoomView(Math.exp(explorer.zoom - revisions.current.zoom));
    revisions.current = {
      reset: explorer.resetRevision,
      rotation: explorer.rotation,
      zoom: explorer.zoom,
    };
  }, [explorer.resetRevision, explorer.rotation, explorer.zoom]);

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
    const element = root.current;
    const host = canvas.current;
    if (!element || !host || !canvasEnabled) return;
    // The engine owns this node; React can remove the host without reparenting conflicts.
    const surface = document.createElement("canvas");
    surface.className = styles.canvas;
    surface.dataset.solarCanvas = "";
    surface.setAttribute("aria-hidden", "true");
    host.appendChild(surface);
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false,
      generation = 0;
    let idle: number | undefined;
    const staticScene = () => {
      element.dataset.renderer = "static";
      element.dataset.state = "static";
      setSolarReady(false);
      onReadyChange(false);
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
              const currentExplorer = solarExplorerSnapshot();
              engine.current?.setHost(currentExplorer.host);
              engine.current?.setImmersive(Boolean(currentExplorer.host));
              engine.current?.highlightBody(currentExplorer.selected);
              setSolarReady(true);
              onReadyChange(true);
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
      engine.current?.setHost(null);
      engine.current?.dispose();
      engine.current = null;
      setSolarReady(false);
      onReadyChange(false);
      surface.remove();
      theme.disconnect();
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, [canvasEnabled, onReadyChange]);

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
            "--body-left": `calc(50% + ${desktop.x * 0.72}vmin)`,
            "--body-top": `calc(50% - ${(desktop.y * 0.819 - desktop.z * 0.574) * 0.72}vmin)`,
            "--mobile-left": `calc(50% + ${mobile.x * 0.72}vmin)`,
            "--mobile-top": `calc(50% - ${(mobile.y * 0.819 - mobile.z * 0.574) * 0.72}vmin)`,
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
      {canvasEnabled && <div ref={canvas} className={styles.canvasHost} data-solar-host />}
    </div>
  );
}
