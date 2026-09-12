"use client";

import { useEffect, useRef } from "react";
import { techMarks } from "@/content/tech-marks";
import { BrandMark } from "./brand-mark";
import styles from "./tech-field.module.css";

/**
 * The technology field, revealed as it scrolls into view.
 *
 * This used a CSS scroll timeline, which is not implemented in Safari — so on iOS the tiles
 * simply never moved. An IntersectionObserver reveal behaves the same everywhere, costs one
 * observer for the whole grid, and disconnects once every tile has been shown, so nothing
 * remains attached to the scroll path.
 *
 * Tiles start visible in the server HTML and are only hidden once the observer is attached, so
 * a visitor without JavaScript sees the finished grid rather than an empty one.
 */
export function TechField({ label }: { label: string }) {
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tiles = [...list.children] as HTMLElement[];
    for (const tile of tiles) tile.dataset.reveal = "pending";

    let remaining = tiles.length;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const tile = entry.target as HTMLElement;
          tile.dataset.reveal = "shown";
          observer.unobserve(tile);
          remaining -= 1;
        }
        if (remaining <= 0) observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.1 },
    );
    for (const tile of tiles) observer.observe(tile);

    return () => observer.disconnect();
  }, []);

  return (
    <ul aria-label={label} className={styles.field} ref={listRef}>
      {techMarks.map((mark, index) => (
        <li className={styles.tile} key={mark.icon} style={{ "--order": index % 6 } as never}>
          <span className={styles.glyph}>
            <BrandMark name={mark.icon} size={26} />
          </span>
          <span className={styles.name}>{mark.name}</span>
        </li>
      ))}
    </ul>
  );
}
