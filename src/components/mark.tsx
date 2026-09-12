/**
 * Vertex — the site's identity mark.
 *
 * Five outer nodes and a core, joined by one path that traces a G while staying a legible
 * node graph. Geometry is shared with the hero particle field. Inherits `currentColor`, so
 * the standalone favicon at `src/app/icon.svg` repeats these coordinates with literal colours.
 */
export function Mark({ size = 28, title }: { size?: number; title?: string }) {
  return (
    <svg
      aria-hidden={title ? undefined : "true"}
      role={title ? "img" : undefined}
      aria-label={title}
      fill="none"
      height={size}
      viewBox="0 0 32 32"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23 9H9v14h14v-7h-7"
        opacity="0.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.75"
      />
      <circle cx="23" cy="9" fill="currentColor" r="2" />
      <circle cx="9" cy="9" fill="currentColor" r="2" />
      <circle cx="9" cy="23" fill="currentColor" r="2" />
      <circle cx="23" cy="23" fill="currentColor" r="2" />
      <circle cx="16" cy="16" fill="currentColor" r="2.75" />
    </svg>
  );
}
