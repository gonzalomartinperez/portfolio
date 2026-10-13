"use client";

import { type CSSProperties, useEffect, useRef, useState } from "react";
import { usePageMotionPaused } from "./motion-state";
import { setSolarReady, solarExplorerSnapshot, useSolarExplorer } from "./solar-explorer-state";
import styles from "./solar-system.module.css";
import type { SolarEngine } from "./solar-system-engine";
import {
  type SolarLayout,
  type SolarPlanet,
  type SolarTextureVersions,
  solarCameraPoint,
  solarCameras,
  solarFallbackPerspective,
  solarFallbackScale,
  solarMoon,
  solarMoonOffset,
  solarOrbitPoint,
  solarPhase,
  solarPlanets,
  solarSun,
  solarTextureUrl,
} from "./solar-system-scene";

type Point = { x: number; y: number; z: number };
/** Fixed precision keeps server and browser math libraries from producing different markup. */
const css = (value: number, unit: string) => `${value.toFixed(4)}${unit}`;
const layouts = ["landscape", "portrait"] as const satisfies readonly SolarLayout[];
/**
 * Static-scene thumbnail widths. Each covers twice (the surface shows half the map) the body's
 * largest measured diameter at 3x density; see docs/assets/solar-system.md. The Sun, Jupiter and
 * Saturn reuse the compact reading maps, so phones download them once.
 */
const fallbackTextureWidths = {
  sun: 1024,
  mercury: 128,
  venus: 256,
  earth: 256,
  mars: 256,
  jupiter: 1024,
  saturn: 1024,
  uranus: 512,
  neptune: 512,
  pluto: 128,
  moon: 128,
} as const satisfies Record<SolarPlanet["name"] | "sun" | "moon", number>;
type FallbackBody = keyof typeof fallbackTextureWidths;
const fallbackTextureUrl = (name: FallbackBody, versions: SolarTextureVersions) =>
  solarTextureUrl(name, versions, fallbackTextureWidths[name]);

/**
 * Projects a body for both orientations; CSS picks the matching set with a container query.
 * The terminator overlay points away from the Sun so the static scene keeps coherent lighting.
 */
function fallbackBodyStyle(
  positions: Record<SolarLayout, Point>,
  radius: number,
  name: FallbackBody,
  versions: SolarTextureVersions,
): CSSProperties {
  const style: Record<string, string> = {
    "--surface": `url(${fallbackTextureUrl(name, versions)})`,
  };
  for (const layout of layouts) {
    const camera = solarCameras[layout];
    const point = solarCameraPoint(camera, positions[layout]);
    const unit = solarFallbackScale(camera) * 100;
    const suffix = layout === "portrait" ? "-portrait" : "";
    style[`--body-size${suffix}`] = css(2 * radius * unit, "cqmin");
    style[`--body-x${suffix}`] = css(point.x * unit, "cqmin");
    style[`--body-y${suffix}`] = css(-point.y * unit, "cqmin");
    style[`--body-depth${suffix}`] = css(point.depth * unit, "cqmin");
    style[`--light${suffix}`] = css((Math.atan2(point.x, point.y) * 180) / Math.PI, "deg");
  }
  return style as CSSProperties;
}

const planetPositions = (planet: (typeof solarPlanets)[number]) =>
  Object.fromEntries(
    layouts.map((layout) => [layout, solarOrbitPoint(planet, solarPhase(planet, layout))]),
  ) as Record<SolarLayout, Point>;

/** Decorative, compressed orbits; the complete SSR scene is also the reduced-motion fallback. */
export function SolarSystem({
  onReadyChange,
  textureVersions,
}: {
  onReadyChange: (ready: boolean) => void;
  textureVersions: SolarTextureVersions;
}) {
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
  const resumeInitialization = useRef<() => void>(() => {});

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
    if (!paused && !engine.current) resumeInitialization.current();
    if (root.current?.dataset.renderer === "webgl") {
      root.current.dataset.state = paused || document.hidden ? "paused" : "running";
    }
  }, [paused]);

  useEffect(() => {
    const element = root.current;
    const host = canvas.current;
    if (!element || !host || !canvasEnabled) return;
    // The engine owns this node; React can remove the host without reparenting conflicts.
    const createSurface = () => {
      const node = document.createElement("canvas");
      node.className = styles.canvas;
      node.dataset.solarCanvas = "";
      node.setAttribute("aria-hidden", "true");
      host.appendChild(node);
      return node;
    };
    let surface = createSurface();
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let generation = 0;
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
      if (engine.current) {
        engine.current.dispose();
        engine.current = null;
        // A disposed engine forces its context loss, so the next one needs a fresh canvas.
        surface.remove();
        surface = createSurface();
      }
      staticScene();
      if (reduced.matches || disposed || pausedRef.current) return;
      const load = async () => {
        try {
          const { createSolarSystemEngine } = await import("./solar-system-engine");
          if (disposed || token !== generation || reduced.matches || pausedRef.current) return;
          const query = new URLSearchParams(location.search);
          const requestedTime = query.get("solarTime");
          const fixedTime =
            requestedTime !== null && Number.isFinite(Number(requestedTime))
              ? Math.max(0, Math.min(100_000, Number(requestedTime)))
              : null;
          engine.current = createSolarSystemEngine(surface, {
            textureVersions,
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
                surface.remove();
                surface = createSurface();
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
    resumeInitialization.current = sync;
    sync();
    return () => {
      resumeInitialization.current = () => {};
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
  }, [canvasEnabled, onReadyChange, textureVersions]);

  return (
    <div
      ref={root}
      className={styles.system}
      style={
        {
          "--solar-perspective": css(solarFallbackPerspective(solarCameras.landscape) * 100, "cqh"),
          "--solar-perspective-portrait": css(
            solarFallbackPerspective(solarCameras.portrait) * 100,
            "cqh",
          ),
          "--sun-size": css(
            2 * solarSun.radius * solarFallbackScale(solarCameras.landscape) * 100,
            "cqmin",
          ),
          "--sun-size-portrait": css(
            2 * solarSun.radius * solarFallbackScale(solarCameras.portrait) * 100,
            "cqmin",
          ),
        } as CSSProperties
      }
      data-solar-system
      data-renderer="static"
      data-state="static"
      aria-hidden="true"
    >
      <div className={styles.fallback}>
        <span
          className={styles.sun}
          data-sun
          style={{ backgroundImage: `url(${fallbackTextureUrl("sun", textureVersions)})` }}
        />
        <span className={styles.corona} />
        {solarPlanets.map((planet) => (
          <span
            key={planet.name}
            className={styles.body}
            style={fallbackBodyStyle(
              planetPositions(planet),
              planet.radius,
              planet.name,
              textureVersions,
            )}
            data-planet={planet.name}
            data-orbit={planet.name}
          >
            {planet.name === "saturn" && <span className={`${styles.rings} ${styles.ringsBack}`} />}
            <span className={styles.surface} />
            {planet.name === "saturn" && (
              <span className={`${styles.rings} ${styles.ringsFront}`} />
            )}
          </span>
        ))}
        {solarPlanets
          .filter(({ name }) => name === "earth")
          .map((earth) => {
            const offset = solarMoonOffset(solarMoon.phase);
            const earthPositions = planetPositions(earth);
            const moonPositions = Object.fromEntries(
              layouts.map((layout) => [
                layout,
                {
                  x: earthPositions[layout].x + offset.x,
                  y: earthPositions[layout].y + offset.y,
                  z: earthPositions[layout].z + offset.z,
                },
              ]),
            ) as Record<SolarLayout, Point>;
            return (
              <span
                key="moon"
                className={styles.body}
                data-moon
                style={fallbackBodyStyle(moonPositions, solarMoon.radius, "moon", textureVersions)}
              >
                <span className={styles.surface} />
              </span>
            );
          })}
      </div>
      {canvasEnabled && <div ref={canvas} className={styles.canvasHost} data-solar-host />}
    </div>
  );
}
