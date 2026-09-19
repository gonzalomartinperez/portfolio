import type { CSSProperties } from "react";
import { buildStaticLayers } from "./constellation";
import styles from "./static-constellation.module.css";

/**
 * The hero visual in its resting state: server-rendered, no JavaScript, no canvas.
 *
 * It is what a visitor sees before the field mounts, when WebGL2 is unavailable, and whenever
 * reduced motion is preferred — so it has to be a finished image, not a placeholder.
 *
 * Squares share 32 depth layers, reducing HTML and React payload without removing points.
 * CSS mixes the themed field colours so the same markup follows the active theme.
 */
export function StaticConstellation() {
  const layers = buildStaticLayers();

  return (
    <svg
      aria-hidden="true"
      className={styles.field}
      focusable="false"
      viewBox="-1.1 -1.1 2.2 2.2"
      xmlns="http://www.w3.org/2000/svg"
    >
      {layers.map((layer) => (
        <path
          d={layer.path}
          fillOpacity={(0.34 + layer.depth * 0.44).toFixed(3)}
          key={layer.depth}
          style={{ "--depth": layer.depth.toFixed(4) } as CSSProperties}
        />
      ))}
    </svg>
  );
}
