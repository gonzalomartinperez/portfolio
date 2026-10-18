import { type PageContext, type Section, sections } from "./events.ts";

export const layoutRevision = "portfolio-v1";
export const viewports = ["mobile", "tablet", "desktop"] as const;
export type Viewport = (typeof viewports)[number];

export const sharedRegions = ["site-header", "site-footer"] as const;
export const pageRegions = {
  home: ["home-featured", "home-experience", "home-about", "home-education", "home-contact"],
  about: ["about-story", "about-focus", "about-principles", "about-opportunities"],
  work: [
    "work-rampy",
    "work-teamcubation",
    "work-cooperativa",
    "work-independent",
    "work-projects",
  ],
  filomena: ["filomena-problem", "filomena-approach", "filomena-outcomes", "filomena-evidence"],
  stack: ["stack-catalogue", "stack-scope"],
  education: [
    "education-degree",
    "education-curriculum",
    "education-credentials",
    "education-evidence",
  ],
  cv: ["cv-downloads", "cv-summary"],
  contact: ["contact-channels", "contact-resume"],
} as const satisfies Record<Section, readonly string[]>;

export type Region = (typeof sharedRegions)[number] | (typeof pageRegions)[Section][number];
type InteractionContext = PageContext & {
  region_id: Region;
  layout_revision: typeof layoutRevision;
  viewport: Viewport;
};
export type ExposureIntent = InteractionContext & { event_name: "section_exposure" };
export type InteractionIntent =
  | ExposureIntent
  | (InteractionContext & { event_name: "public_click"; cell_x: number; cell_y: number });

export function regionAllowed(section: Section, region: unknown): region is Region {
  return [...sharedRegions, ...pageRegions[section]].some((item) => item === region);
}

export function viewportCohort(width: number): Viewport | null {
  if (!Number.isFinite(width) || width <= 0) return null;
  return width >= 1024 ? "desktop" : width >= 832 ? "tablet" : "mobile";
}

/** V2 is deliberately separate: the original six-event validator stays unchanged. */
export function interactionIntent(value: unknown): InteractionIntent | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const common = ["event_name", "section", "locale", "region_id", "layout_revision", "viewport"];
  const click = record.event_name === "public_click";
  const allowed = click ? [...common, "cell_x", "cell_y"] : common;
  if (
    ![Object.prototype, null].includes(Object.getPrototypeOf(record)) ||
    !allowed.every((key) => Object.hasOwn(record, key)) ||
    Reflect.ownKeys(record).some((key) => typeof key !== "string" || !allowed.includes(key))
  )
    return null;
  const { event_name, section, locale, region_id, layout_revision, viewport, cell_x, cell_y } =
    record;
  if (
    (!click && event_name !== "section_exposure") ||
    !sections.some((item) => item === section) ||
    (locale !== "en" && locale !== "es") ||
    !regionAllowed(section as Section, region_id) ||
    layout_revision !== layoutRevision ||
    !viewports.some((item) => item === viewport)
  )
    return null;
  const context: InteractionContext = {
    section: section as Section,
    locale,
    region_id,
    layout_revision,
    viewport: viewport as Viewport,
  };
  if (!click) return { ...context, event_name: "section_exposure" };
  if (
    typeof cell_x !== "number" ||
    !Number.isInteger(cell_x) ||
    cell_x < 0 ||
    cell_x > 7 ||
    typeof cell_y !== "number" ||
    !Number.isInteger(cell_y) ||
    cell_y < 0 ||
    cell_y > 7
  )
    return null;
  return { ...context, event_name: "public_click", cell_x, cell_y };
}
