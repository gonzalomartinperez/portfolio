"use client";

import { useEffect, useRef } from "react";
import styles from "./ambient-field.module.css";

/** A restrained continuation of the hero's star field behind every page. */
export function AmbientField() {
  const field = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = field.current;
    if (!root) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    let animation: { kill(): void } | undefined;
    let cancelled = false;
    const sync = async () => {
      animation?.kill();
      animation = undefined;
      if (motion.matches) return;
      const { gsap } = await import("gsap");
      if (cancelled || motion.matches) return;
      animation = gsap.to(root.querySelectorAll("[data-ambient-stars]"), {
        y: -24,
        duration: 32,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        stagger: 8,
      });
    };
    void sync();
    motion.addEventListener("change", sync);
    return () => {
      cancelled = true;
      motion.removeEventListener("change", sync);
      animation?.kill();
    };
  }, []);

  return (
    <div ref={field} className={styles.field} aria-hidden="true">
      <div className={styles.starsNear} data-ambient-stars />
      <div className={styles.starsFar} data-ambient-stars />
      <div className={styles.orbit} />
    </div>
  );
}
