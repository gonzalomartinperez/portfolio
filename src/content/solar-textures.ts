import "server-only";

import manifest from "../../public/images/solar-system/manifest.json";
import { solarTextureVersion } from "./solar-texture-cache";
import type { SolarTextureVersions } from "./solar-texture-contract";

/** Content addresses invalidate browser and CDN caches when an owned map changes. */
export const solarTextureVersions: SolarTextureVersions = Object.fromEntries(
  manifest.assets.map(({ file, width, sha256, variants = [] }) => [
    file.replace(/\.webp$/, ""),
    Object.fromEntries(
      [...variants, { width, sha256 }].map((map) => [map.width, solarTextureVersion(map.sha256)]),
    ),
  ]),
);
