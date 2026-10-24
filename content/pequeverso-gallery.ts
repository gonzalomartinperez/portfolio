/**
 * Captures from the public Pequeverso repositories, grouped by application.
 *
 * Ids are shared by both locales because they are filenames; only the alt text is translated.
 * Assistant captures come from the 2026-10-18 local fixture runs (no real model); back-office
 * captures use the documented synthetic MOCK data and test accounts. No capture contains buyer,
 * account or conversation data. `contain` keeps panel and phone captures at their natural
 * proportions inside the shared thumbnail frame instead of cropping or enlarging them.
 */
export const pequeversoGallery = [
  { id: "store-home" },
  { id: "store-support" },
  { id: "assistant-panel-welcome", fit: "contain" },
  { id: "assistant-panel-answer", fit: "contain" },
  { id: "assistant-waiting" },
  { id: "assistant-expanded" },
  { id: "assistant-mobile-answer", fit: "contain" },
  { id: "backoffice-mobile-status", fit: "contain" },
  { id: "backoffice-availability", fit: "contain" },
  { id: "backoffice-quality" },
  { id: "backoffice-budget" },
  { id: "backoffice-runs" },
  { id: "backoffice-catalog" },
  { id: "backoffice-daily" },
  { id: "backoffice-analytics" },
  { id: "backoffice-access" },
] as const satisfies readonly { id: string; fit?: "contain" }[];

export type PequeversoShot = (typeof pequeversoGallery)[number]["id"];

export const pequeversoGalleryFlows = [
  { id: "store", en: "Store", es: "Tienda", shots: ["store-home", "store-support"] },
  {
    id: "assistant",
    en: "Assistant",
    es: "Asistente",
    shots: [
      "assistant-panel-welcome",
      "assistant-panel-answer",
      "assistant-waiting",
      "assistant-expanded",
      "assistant-mobile-answer",
    ],
  },
  {
    id: "backoffice",
    en: "Back office",
    es: "Back office",
    shots: [
      "backoffice-mobile-status",
      "backoffice-availability",
      "backoffice-quality",
      "backoffice-budget",
      "backoffice-runs",
      "backoffice-catalog",
      "backoffice-daily",
      "backoffice-analytics",
      "backoffice-access",
    ],
  },
] as const;
