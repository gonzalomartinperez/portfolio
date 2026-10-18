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

/** Frozen path exceptions have an owner and an explicit cutover, not a root-wide escape. */
export const placementExceptions = [
  {
    id: "EX-CONTENT",
    owner:
      "Site coordinator and public editorial/document pipeline owner; private authoring remains external and excluded.",
    reason:
      "39 committed public editorial/config/data modules include generated cv-public.json and public-documents.json, neutral locale/type modules, server-only registry and texture-manifest readers. Relocating simultaneously expands publication, cache and provenance risk without helping the shared/presentation slice.",
    removal: [
      "Coordinator approves content namespace and updates guard roots/neutral type permissions atomically.",
      "Rebase exporter/document-manifest outputs, script and browser imports, source-text checks, asset-relative manifest reader, NOTICE and active documentation.",
      "Approved JSON/PDF/artwork bytes, provenance revisions/hashes, URLs and content claims remain unchanged; no private inputs become CI prerequisites.",
      "Existing content, document, rendered, type/build, browser, caching and architecture checks pass through protected PR integration; remove old path exception and old folder without forwarding barrels.",
    ],
    paths: [
      "src/content/about-copy.ts",
      "src/content/academic-catalogue.ts",
      "src/content/chrome.ts",
      "src/content/cv-public.json",
      "src/content/en/about.ts",
      "src/content/en/education.ts",
      "src/content/en/experience.ts",
      "src/content/en/gallery.ts",
      "src/content/en/index.ts",
      "src/content/en/profile.ts",
      "src/content/en/projects.ts",
      "src/content/en/site.ts",
      "src/content/en/stack.ts",
      "src/content/es/about.ts",
      "src/content/es/education.ts",
      "src/content/es/experience.ts",
      "src/content/es/gallery.ts",
      "src/content/es/index.ts",
      "src/content/es/profile.ts",
      "src/content/es/projects.ts",
      "src/content/es/site.ts",
      "src/content/es/stack.ts",
      "src/content/experience-facts.ts",
      "src/content/filomena-gallery.ts",
      "src/content/filomena-image-dimensions.json",
      "src/content/index.ts",
      "src/content/locales.ts",
      "src/content/privacy.ts",
      "src/content/public-documents.json",
      "src/content/routes.ts",
      "src/content/site-config.ts",
      "src/content/site-copy.ts",
      "src/content/solar-texture-cache.ts",
      "src/content/solar-texture-contract.ts",
      "src/content/solar-textures.ts",
      "src/content/tech-marks.ts",
      "src/content/technologies.ts",
      "src/content/tool-carousel-copy.ts",
      "src/content/types.ts",
    ],
  },
  {
    id: "EX-CONTRACTS",
    owner:
      "API contract owner for schema/provenance approval; site coordinator for copied snapshot paths, guard/generator consumers and protected integration.",
    reason:
      "Nine imported API/schema/provenance files have generator, hash, example, transport-validation and security-scan consumers. They are API-owned snapshots, not page domain entities.",
    removal: [
      "API contract owner and coordinator approve the exact snapshot/provenance-preserving path cutover.",
      "Extend architecture source inventory and module resolver for root contracts before moving; preserve adapter-only type/runtime boundary rules.",
      "Update generator input/output commands, all file readers/example/hash consumers and documentation; generated type output and schemas have zero semantic drift.",
      "Update current-path scanner coverage separately from commit:path historical allowlists; retain historical secret-scan entries unchanged.",
      "Contract generation/checks, transport/schema examples, scanner fixtures, type/build and architecture checks pass protected PR integration; remove src/contracts exception and directory.",
    ],
    paths: [
      "src/contracts/openapi.json",
      "src/contracts/product-event.schema.json",
      "src/contracts/product-interaction-source.json",
      "src/contracts/product-interaction.examples.json",
      "src/contracts/product-interaction.schema.json",
      "src/contracts/source.json",
      "src/contracts/sse.examples.json",
      "src/contracts/sse.schema.json",
      "src/contracts/types.d.ts",
    ],
  },
  {
    id: "EX-MEDIA",
    owner:
      "Site identity/assets owner coordinated with source consumer and provenance-document updates.",
    reason:
      "Three src/assets image inputs are owned identity media; avatar generation, Next static image metadata, portrait source provenance and responsive image rendering rely on them. They are not domain source modules.",
    removal: [
      "Preserve image bytes, SHA-256 provenance and metadata; originals remain originals.",
      "Rebase generator and Next imports, update asset provenance docs, and verify generated public identity files have no unexpected byte drift.",
      "Both themes/mobile/desktop portrait crops, image dimensions/optimization, document/content checks and static build pass protected PR integration.",
      "Remove src/assets exception after all source references move; do not relocate public/ or framework-owned src/app/icon files.",
    ],
    paths: ["src/assets/avatar.png", "src/assets/portrait-source.png", "src/assets/portrait.avif"],
  },
];
const exceptionPaths = new Set(placementExceptions.flatMap(({ paths }) => paths));

export const isSharedPresentation = (file) =>
  /^src\/shared\/(?:ui|identity|technology|navigation|contact|editorial)\//.test(file);
export const isNeutralShared = (file) => /^src\/shared\/(?:ui|styles|motion)\//.test(file);

export function placementViolation(file) {
  if (exceptionPaths.has(file)) return null;
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
  return "unregistered module placement: unknown source root or undeclared exception";
}
