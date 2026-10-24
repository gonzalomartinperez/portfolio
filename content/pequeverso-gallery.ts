/**
 * Captures from the public Pequeverso repositories, grouped by application.
 *
 * Ids are shared by both locales because they are filenames; only the alt text is translated.
 * The assistant ran locally with a fixture provider and the back office shows synthetic data,
 * so no capture contains buyer, account or conversation data.
 */
export const pequeversoGallery = [
  "store-home",
  "assistant-desktop",
  "assistant-mobile",
  "backoffice-sign-in",
  "backoffice-dashboard",
  "backoffice-access",
] as const;

export type PequeversoShot = (typeof pequeversoGallery)[number];

export const pequeversoGalleryFlows = [
  { id: "store", en: "Store", es: "Tienda", shots: ["store-home"] },
  {
    id: "assistant",
    en: "Assistant",
    es: "Asistente",
    shots: ["assistant-desktop", "assistant-mobile"],
  },
  {
    id: "backoffice",
    en: "Back office",
    es: "Back office",
    shots: ["backoffice-sign-in", "backoffice-dashboard", "backoffice-access"],
  },
] as const;
