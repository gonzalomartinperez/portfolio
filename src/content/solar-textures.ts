import "server-only";

import type { SolarTextureVersions } from "@/components/solar-system-scene";
import manifest from "../../public/images/solar-system/manifest.json";

/** Content addresses invalidate browser and CDN caches when an owned map changes. */
export const solarTextureVersions: SolarTextureVersions = Object.fromEntries(
  manifest.assets.map(({ file, sha256 }) => [file.replace(/\.webp$/, ""), sha256]),
);
