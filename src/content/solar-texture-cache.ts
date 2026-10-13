import manifest from "../../public/images/solar-system/manifest.json" with { type: "json" };

/**
 * The `v` query of a solar map URL: a 64-bit SHA-256 prefix. That is ample to tell revisions of
 * one file apart, and every page embeds one per published map, so the full digest would cost
 * markup on every route.
 */
export const solarTextureVersion = (sha256: string) => sha256.slice(0, 16);

/** Published maps, originals and delivery variants alike. */
export const solarTextureFiles = manifest.assets.flatMap((asset) => [
  asset,
  ...(asset.variants ?? []),
]);

/**
 * A year-long immutable lifetime applies only when the query equals the version of the bytes
 * this build serves, so a stale or not-yet-deployed version keeps the default revalidating
 * response instead of pinning the wrong bytes in a browser or CDN cache.
 */
export const solarTextureCacheRules = solarTextureFiles.map(({ file, sha256 }) => ({
  source: `/images/solar-system/${file}`,
  has: [{ type: "query" as const, key: "v", value: solarTextureVersion(sha256) }],
  headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
}));
