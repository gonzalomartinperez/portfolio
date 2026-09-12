import { techMarks } from "@/content/tech-marks";
import { BrandMark } from "./brand-mark";
import styles from "./tech-field.module.css";

/**
 * The technology field.
 *
 * Every tile drifts as the section passes through the viewport, driven by a CSS scroll
 * timeline. That means no JavaScript, no scroll listener and nothing on the main thread; where
 * the browser does not support scroll timelines the tiles simply sit still, which is a
 * perfectly good version of the same section. Reduced motion pins them deliberately.
 *
 * Tiles are assigned to one of three depth lanes by position, so neighbours move at different
 * rates and the field reads as having depth rather than sliding as one block.
 */
export function TechField({ label }: { label: string }) {
  return (
    <ul aria-label={label} className={styles.field}>
      {techMarks.map((mark, index) => (
        <li className={styles.tile} data-depth={index % 3} key={mark.icon}>
          <span className={styles.glyph}>
            <BrandMark name={mark.icon} size={26} />
          </span>
          <span className={styles.name}>{mark.name}</span>
        </li>
      ))}
    </ul>
  );
}
