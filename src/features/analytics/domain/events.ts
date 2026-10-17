export const sections = [
  "home",
  "about",
  "work",
  "filomena",
  "stack",
  "education",
  "cv",
  "contact",
] as const;

export type Section = (typeof sections)[number];
export type Locale = "en" | "es";
export type PageContext = { section: Section; locale: Locale };

export type EventName =
  | "page_view"
  | "navigation_click"
  | "section_open"
  | "cv_link_open"
  | "contact_link_open"
  | "company_link_open";

const targets = {
  section_open: ["rampy", "teamcubation", "cooperativa-obrera", "independent"],
  cv_link_open: ["en", "es"],
  contact_link_open: ["email", "linkedin", "github"],
  company_link_open: ["rampy", "teamcubation", "cooperativa-obrera"],
} as const;

export type Target = (typeof targets)[keyof typeof targets][number];
export type EventIntent = PageContext & { event_name: EventName; target?: Target };

/** Validate event-specific dimensions, rejecting rather than stripping extra data. */
export function eventIntent(value: unknown): EventIntent | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (
    ![Object.prototype, null].includes(Object.getPrototypeOf(record)) ||
    !["event_name", "section", "locale"].every((key) => Object.hasOwn(record, key)) ||
    Reflect.ownKeys(record).some(
      (key) =>
        typeof key !== "string" || !["event_name", "section", "locale", "target"].includes(key),
    )
  )
    return null;
  const { event_name, section, locale, target } = record;
  if (!sections.some((item) => item === section) || (locale !== "en" && locale !== "es"))
    return null;
  if (event_name === "page_view" || event_name === "navigation_click") {
    if (Object.hasOwn(record, "target")) return null;
  } else {
    if (typeof event_name !== "string" || !Object.hasOwn(targets, event_name)) return null;
    const allowed = targets[event_name as keyof typeof targets] as readonly string[];
    if (typeof target !== "string" || !allowed.includes(target)) return null;
    if ((event_name === "section_open" || event_name === "company_link_open") && section !== "work")
      return null;
    if (event_name === "cv_link_open" && section !== "cv") return null;
  }
  return {
    event_name: event_name as EventName,
    section: section as Section,
    locale,
    ...(target === undefined ? {} : { target: target as Target }),
  };
}

const pageSections: Readonly<Record<string, Section>> = {
  "/": "home",
  "/about": "about",
  "/work": "work",
  "/work/filomena": "filomena",
  "/stack": "stack",
  "/education": "education",
  "/cv": "cv",
  "/contact": "contact",
};

/** Only exact public routes become dimensions; unknown paths are never sent. */
export function pageContext(pathname: string | null): PageContext | null {
  if (pathname === null) return null;
  const locale = pathname === "/es" || pathname.startsWith("/es/") ? "es" : "en";
  const path = locale === "es" ? pathname.slice(3) || "/" : pathname;
  const section = Object.hasOwn(pageSections, path) ? pageSections[path] : undefined;
  return section ? { section, locale } : null;
}
