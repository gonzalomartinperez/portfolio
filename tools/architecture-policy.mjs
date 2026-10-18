const featureLayers = new Map([
  ["analytics", new Set(["domain", "application", "adapters"])],
  ["architecture-diagrams", new Set(["domain", "presentation"])],
  ["assistant", new Set(["domain", "application", "adapters", "presentation"])],
  ["hero", new Set(["domain", "adapters", "presentation"])],
  ["project-gallery", new Set(["presentation"])],
  ["solar-system", new Set(["domain", "adapters", "presentation"])],
  ["technology-catalogue", new Set(["domain", "presentation"])],
  ["tool-carousel", new Set(["domain", "presentation"])],
]);
const featureFacades = new Set([
  "analytics/entry.tsx",
  "analytics/config.ts",
  "assistant/entry.tsx",
  "solar-system/texture-data.ts",
]);
const sharedCapabilities = new Set([
  "ui",
  "styles",
  "motion",
  "identity",
  "technology",
  "navigation",
  "contact",
  "editorial",
]);

export const publicEntries = new Set([
  "solar-system/texture-data.ts",
  "analytics/entry.tsx",
  "analytics/application/availability.ts",
  "analytics/config.ts",
  "solar-system/presentation/ambient-field.tsx",
  "solar-system/presentation/solar-explorer.tsx",
  "hero/presentation/hero-stage.tsx",
  "hero/domain/constellation.ts",
  "hero/presentation/static-constellation.tsx",
  "hero/presentation/tech-constellation.tsx",
  "architecture-diagrams/presentation/experience-architecture.tsx",
  "technology-catalogue/presentation/technology-catalogue.tsx",
  "tool-carousel/presentation/tool-carousel.tsx",
  "project-gallery/presentation/gallery-carousel.tsx",
  "assistant/presentation/assistant-host.tsx",
  "assistant/application/availability.ts",
]);

// These are owned module registries, not transitional placement exceptions.
export const contentPaths = new Set([
  "content/about-copy.ts",
  "content/academic-catalogue.ts",
  "content/chrome.ts",
  "content/cv-public.json",
  "content/en/about.ts",
  "content/en/education.ts",
  "content/en/experience.ts",
  "content/en/gallery.ts",
  "content/en/index.ts",
  "content/en/profile.ts",
  "content/en/projects.ts",
  "content/en/site.ts",
  "content/en/stack.ts",
  "content/es/about.ts",
  "content/es/education.ts",
  "content/es/experience.ts",
  "content/es/gallery.ts",
  "content/es/index.ts",
  "content/es/profile.ts",
  "content/es/projects.ts",
  "content/es/site.ts",
  "content/es/stack.ts",
  "content/experience-facts.ts",
  "content/filomena-gallery.ts",
  "content/filomena-image-dimensions.json",
  "content/index.ts",
  "content/privacy.ts",
  "content/public-documents.json",
  "content/site-copy.ts",
  "content/tech-marks.ts",
  "content/technologies.ts",
  "content/tool-carousel-copy.ts",
  "content/types.ts",
]);
export const configPaths = new Set([
  "config/locales.ts",
  "config/routes.ts",
  "config/site.ts",
  "config/solar-textures.ts",
]);
export const contractPaths = new Set([
  "contracts/assistant-api/openapi.json",
  "contracts/assistant-api/product-event.schema.json",
  "contracts/assistant-api/product-interaction-source.json",
  "contracts/assistant-api/product-interaction.examples.json",
  "contracts/assistant-api/product-interaction.schema.json",
  "contracts/assistant-api/source.json",
  "contracts/assistant-api/sse.examples.json",
  "contracts/assistant-api/sse.schema.json",
  "contracts/assistant-api/types.d.ts",
]);
export const mediaPaths = new Set([
  "media/identity/avatar.png",
  "media/identity/portrait-source.png",
  "media/identity/portrait.avif",
]);
export const isSharedPresentation = (file) =>
  /^src\/shared\/(?:ui|identity|technology|navigation|contact|editorial)\//.test(file);
export const isNeutralShared = (file) => /^src\/shared\/(?:ui|styles|motion)\//.test(file);

export function placementViolation(file) {
  if (file.split("/").some((part) => !part || part === "." || part === ".."))
    return "unregistered module placement: source paths must be canonical";
  if (contentPaths.has(file) || configPaths.has(file) || contractPaths.has(file)) return null;
  if (mediaPaths.has(file)) return null;
  if (file.startsWith("public/")) return null;
  if (/^src\/(?:app|views|shell)\/.+/.test(file)) return null;
  if (file.startsWith("src/shared/")) {
    const [, , capability, ...rest] = file.split("/");
    if (sharedCapabilities.has(capability) && rest.length) return null;
    return "unregistered module placement: unknown shared capability";
  }
  if (file.startsWith("src/features/")) {
    const relative = file.slice("src/features/".length);
    if (!relative.includes("/"))
      return "unregistered module placement: feature code must live in an owned feature directory";
    if (featureFacades.has(relative)) return null;
    const [feature, layer, ...rest] = relative.split("/");
    if (!featureLayers.has(feature)) return "unregistered module placement: unknown feature";
    if (rest.length && featureLayers.get(feature).has(layer)) return null;
    return "unregistered module placement: unknown feature layer or undeclared facade";
  }
  return "unregistered module placement: unknown source root or unregistered resource";
}
