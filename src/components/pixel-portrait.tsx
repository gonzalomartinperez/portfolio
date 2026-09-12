import styles from "./pixel-portrait.module.css";
import {
  SPRITE_HEIGHT,
  SPRITE_WIDTH,
  spriteBody,
  spriteEyes,
  spritePalette,
} from "./pixel-portrait-data";

/**
 * The pixel portrait, with an idle bob and an occasional blink.
 *
 * Both animations are CSS on two groups, so nothing runs on the main thread and the whole
 * thing is inert under reduced motion. It is decorative next to the real photograph, so it is
 * hidden from assistive technology unless a label is supplied.
 */
export function PixelPortrait({ size = 96, label }: { size?: number; label?: string }) {
  const rects = (source: readonly [number, number, number, string][]) =>
    source.map(([x, y, width, key]) => (
      <rect
        fill={spritePalette[key]}
        height="1"
        key={`${x}-${y}-${key}`}
        width={width}
        x={x}
        y={y}
      />
    ));

  return (
    <svg
      aria-hidden={label ? undefined : "true"}
      aria-label={label}
      className={styles.sprite}
      height={(size / SPRITE_WIDTH) * SPRITE_HEIGHT}
      role={label ? "img" : undefined}
      shapeRendering="crispEdges"
      viewBox={`0 0 ${SPRITE_WIDTH} ${SPRITE_HEIGHT}`}
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g className={styles.bob}>
        {rects(spriteBody)}
        <g className={styles.eyesOpen}>{rects(spriteEyes)}</g>
        <g className={styles.eyesShut}>
          <rect fill={spritePalette.M} height="1" width="3" x="6" y="12" />
          <rect fill={spritePalette.M} height="1" width="3" x="15" y="12" />
        </g>
      </g>
    </svg>
  );
}
