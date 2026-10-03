"use client";

import { type CSSProperties, useEffect, useRef } from "react";
import { usePageMotionPaused } from "./motion-state";
import styles from "./solar-system.module.css";

const planets = [
  { name: "mercury", size: 12, radius: 130, period: 100, phase: 215 },
  { name: "venus", size: 22, radius: 200, period: 150, phase: 20 },
  { name: "earth", size: 26, radius: 285, period: 210, phase: 145 },
  { name: "mars", size: 18, radius: 370, period: 280, phase: 325 },
  { name: "jupiter", size: 62, radius: 480, period: 390, phase: 70 },
  { name: "saturn", size: 49, radius: 600, period: 510, phase: 190 },
  { name: "uranus", size: 35, radius: 720, period: 650, phase: 285 },
  { name: "neptune", size: 34, radius: 850, period: 800, phase: 110 },
] as const;

/** Decorative, deliberately non-scale orbits; no astronomical claims or pointer targets. */
export function SolarSystem() {
  const root = useRef<HTMLDivElement>(null);
  const paused = usePageMotionPaused();
  const pausedRef = useRef(paused);
  const animations = useRef<{ pause: () => unknown; resume: () => unknown }[]>([]);

  useEffect(() => {
    pausedRef.current = paused;
    for (const animation of animations.current) {
      if (paused || document.hidden) animation.pause();
      else animation.resume();
    }
  }, [paused]);

  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    let disposed = false;
    let generation = 0;
    let cleanup: (() => void) | undefined;
    const sync = async () => {
      const token = ++generation;
      cleanup?.();
      animations.current = [];
      if (reduced.matches) return;
      const engine = await import("gsap").catch(() => null);
      if (!engine || disposed || token !== generation) return;
      const { gsap } = engine;
      const context = gsap.context(() => {
        const tweens = planets.map((planet) => {
          const orbit = element.querySelector(`[data-orbit="${planet.name}"]`);
          return gsap.fromTo(
            orbit,
            { rotation: planet.phase },
            { rotation: planet.phase + 360, duration: planet.period, repeat: -1, ease: "none" },
          );
        });
        animations.current = tweens;
        if (pausedRef.current || document.hidden) for (const tween of tweens) tween.pause();
      }, element);
      cleanup = () => context.revert();
    };
    const visibility = () => {
      for (const animation of animations.current) {
        if (document.hidden || pausedRef.current) animation.pause();
        else animation.resume();
      }
    };
    void sync();
    reduced.addEventListener("change", sync);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      disposed = true;
      generation += 1;
      cleanup?.();
      animations.current = [];
      reduced.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  return (
    <div ref={root} className={styles.system} data-solar-system aria-hidden="true">
      <div className={styles.plane}>
        <span className={styles.sun} />
        {planets.map((planet) => (
          <div
            key={planet.name}
            className={styles.orbit}
            data-orbit={planet.name}
            style={
              {
                "--orbit-radius": `${planet.radius}px`,
                "--planet-size": `${planet.size}px`,
                transform: `rotate(${planet.phase}deg)`,
              } as CSSProperties
            }
          >
            <span className={`${styles.planet} ${styles[planet.name]}`} data-planet={planet.name}>
              {planet.name === "saturn" && <span className={styles.rings} />}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
