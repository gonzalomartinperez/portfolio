import type { Technology } from "@content/technologies";
import { BrandMark } from "../identity/brand-mark";
import {
  getTechnologyIllustration,
  technologyIllustrationSprite,
} from "./technology-illustrations";
import styles from "./technology-mark.module.css";

export function TechnologyMark({
  technology,
  size = 24,
}: {
  technology: Pick<Technology, "icon" | "category" | "id">;
  size?: number;
}) {
  if (technology.icon) return <BrandMark name={technology.icon} size={size} />;

  // Pages repeat these marks dozens of times; referencing a shared sprite keeps each drawing
  // out of the HTML and the RSC payload.
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      data-representation="illustration"
      className={styles.illustration}
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <use href={`${technologyIllustrationSprite}#${getTechnologyIllustration(technology)}`} />
    </svg>
  );
}
