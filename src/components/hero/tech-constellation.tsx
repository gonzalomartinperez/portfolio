import { BrandMark } from "@/components/brand-mark";
import { techMarks } from "@/content/tech-marks";
import styles from "./tech-constellation.module.css";

/**
 * The technology marks, resolving inside the dispersing field.
 *
 * Positions are deterministic — derived from the index, not random — so the server and client
 * agree and the arrangement is stable between visits. Each mark fades and settles as the stage
 * progresses, driven entirely by the `--stage-progress` custom property the stage writes; no
 * per-item JavaScript and no scroll listener of its own.
 */
export function TechConstellation({ heading, note }: { heading: string; note: string }) {
  return (
    <div className={`frame ${styles.constellation}`}>
      <div className={styles.intro}>
        <h2 className={styles.heading}>{heading}</h2>
        <p className={styles.note}>{note}</p>
      </div>

      <ul className={styles.marks}>
        {techMarks.map((mark, index) => {
          // A phyllotactic spiral spreads the marks evenly without clustering.
          const angle = index * 2.399963;
          const radius = Math.sqrt((index + 0.6) / techMarks.length);
          return (
            <li
              className={styles.mark}
              key={mark.icon}
              style={
                {
                  "--x": (Math.cos(angle) * radius).toFixed(4),
                  "--y": (Math.sin(angle) * radius).toFixed(4),
                  "--i": index,
                } as never
              }
            >
              <span className={styles.glyph}>
                <BrandMark name={mark.icon} size={22} />
              </span>
              <span className={styles.name}>{mark.name}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
