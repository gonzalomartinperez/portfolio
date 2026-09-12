import styles from "./brand-mark.module.css";

/**
 * One brand glyph, referenced from a cached sprite at `/brands.svg`.
 *
 * The paths used to be inlined, which pushed the stack page to 73 KB gzipped because every
 * glyph appears exactly once and so nothing deduplicates. As an external sprite the markup per
 * icon is a single `<use>`, and the 30 KB sprite is fetched once and reused across pages.
 *
 * Decorative by default: every use pairs the glyph with a visible text label, so naming it
 * again would only make screen readers repeat themselves.
 */
export function BrandMark({ name, size = 20 }: { name: string; size?: number }) {
  return (
    <svg aria-hidden="true" className={styles.mark} height={size} role="presentation" width={size}>
      <use href={`/brands.svg#${name}`} />
    </svg>
  );
}
