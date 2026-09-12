import type { CSSProperties } from "react";
import { buildConstellation, POINT_COUNT_STATIC, projectConstellation } from "./constellation";
import styles from "./static-constellation.module.css";

/**
 * The hero visual in its resting state: server-rendered, no JavaScript, no canvas.
 *
 * It is what a visitor sees before the field mounts, when WebGL2 is unavailable, and whenever
 * reduced motion is preferred — so it has to be a finished image, not a placeholder.
 *
 * Each point carries its depth as a custom property and mixes the two themed field colours in
 * CSS, so the same markup follows the active theme.
 */
export function StaticConstellation() {
  const points = projectConstellation(buildConstellation(POINT_COUNT_STATIC), 0.6);

  return (
    <svg
      aria-hidden="true"
      className={styles.field}
      focusable="false"
      viewBox="-1.1 -1.1 2.2 2.2"
      xmlns="http://www.w3.org/2000/svg"
    >
      {points.map((point, index) => (
        <rect
          x={point.x.toFixed(4)}
          y={(-point.y).toFixed(4)}
          fillOpacity={(0.34 + point.depth * 0.44).toFixed(3)}
          // biome-ignore lint/suspicious/noArrayIndexKey: positions are generated deterministically and never reordered.
          key={index}
          width="0.006"
          height="0.006"
          style={{ "--depth": point.depth.toFixed(4) } as CSSProperties}
        />
      ))}
    </svg>
  );
}
