import {
  LinearMipmapLinearFilter,
  NoColorSpace,
  RepeatWrapping,
  SRGBColorSpace,
  Texture,
  type WebGLRenderer,
} from "three";
import {
  type SolarTextureName,
  type SolarTextureVersions,
  solarTextureNames,
  solarTextureUrl,
  solarTextureWidths,
} from "./solar-system-scene";

export type TextureSource = ImageBitmap | HTMLCanvasElement | HTMLImageElement;

/** Earth detail maps enrich the scene but are not required to render it. */
const optionalTextures = new Set<SolarTextureName>([
  "earth-normal",
  "earth-specular",
  "earth-night",
  "earth-clouds",
]);
/** Linear material data rather than color; see docs/assets/solar-system.md. */
const dataTextures = new Set<SolarTextureName>(["earth-normal", "earth-specular"]);

export const sourceWidth = (source: TextureSource) =>
  source instanceof HTMLImageElement ? source.naturalWidth : source.width;
const release = (source: TextureSource) => {
  if ("close" in source) source.close();
};

type RetainedMap = { blob: Blob; url: string; width: number };

/**
 * Loads the smallest published variant of each map that covers its current upload size, and
 * keeps the compressed bytes, so a layout or explorer change can re-decode at another size. A
 * refit that needs more detail than any retained variant fetches the next larger one first.
 * `limit` returns the largest dimension to upload for a map under the current conditions.
 */
export function createSolarTextures(
  renderer: WebGLRenderer,
  versions: SolarTextureVersions,
  limit: (name: SolarTextureName) => number,
) {
  const textures = new Map<SolarTextureName, Texture>();
  /** Retained compressed maps per published width. */
  const retained = new Map<SolarTextureName, Map<number, RetainedMap>>();
  const pending = new Map<string, Promise<RetainedMap>>();
  let disposed = false;
  let generation = 0;
  const requests = new AbortController();

  const largestUpload = (name: SolarTextureName) =>
    Math.min(renderer.capabilities.maxTextureSize, limit(name));
  const targetSize = (name: SolarTextureName, width: number, height: number) => {
    const factor = Math.min(1, largestUpload(name) / Math.max(width, height));
    return {
      width: Math.max(1, Math.round(width * factor)),
      height: Math.max(1, Math.round(height * factor)),
    };
  };
  /** Every map is at least as wide as it is tall, so its width is its largest dimension. */
  const variantWidth = (name: SolarTextureName) => {
    const widths = solarTextureWidths(name, versions);
    const needed = largestUpload(name);
    return widths.find((width) => width >= needed) ?? widths[widths.length - 1];
  };
  /** The smallest retained variant that covers the current upload size, else the largest. */
  const retainedFor = (name: SolarTextureName) => {
    const maps = [...(retained.get(name) ?? [])].sort(([a], [b]) => a - b);
    const needed = largestUpload(name);
    return (maps.find(([width]) => width >= needed) ?? maps[maps.length - 1])?.[1];
  };

  const fetchVariant = (name: SolarTextureName, width: number) => {
    const url = new URL(solarTextureUrl(name, versions, width), location.href).href;
    const existing = retained.get(name)?.get(width);
    if (existing) return Promise.resolve(existing);
    let request = pending.get(url);
    if (!request) {
      request = fetch(url, { signal: requests.signal })
        .then(async (response) => {
          if (!response.ok) throw new Error(`Solar texture request failed: ${name}`);
          const map = { blob: await response.blob(), url, width };
          if (!disposed) {
            const maps = retained.get(name) ?? new Map<number, RetainedMap>();
            maps.set(width, map);
            retained.set(name, maps);
          }
          return map;
        })
        .finally(() => pending.delete(url));
      pending.set(url, request);
    }
    return request;
  };

  /** Decodes off the main thread when supported. No Y flip: the shaders sample top-down UVs. */
  const decode = async (name: SolarTextureName, blob: Blob): Promise<TextureSource> => {
    const colorSpaceConversion = dataTextures.has(name) ? "none" : "default";
    if (typeof createImageBitmap === "function") {
      try {
        const full = await createImageBitmap(blob, {
          imageOrientation: "from-image",
          premultiplyAlpha: "none",
          colorSpaceConversion,
        });
        const target = targetSize(name, full.width, full.height);
        if (target.width === full.width) return full;
        const resized = await createImageBitmap(full, {
          resizeWidth: target.width,
          resizeHeight: target.height,
          resizeQuality: "high",
          premultiplyAlpha: "none",
          colorSpaceConversion,
        });
        full.close();
        return resized;
      } catch {
        // Older engines reject some options; the image element path below covers them.
      }
    }
    const url = URL.createObjectURL(blob);
    try {
      const image = new Image();
      image.src = url;
      await image.decode();
      const target = targetSize(name, image.naturalWidth, image.naturalHeight);
      if (target.width === image.naturalWidth) return image;
      const scaled = document.createElement("canvas");
      scaled.width = target.width;
      scaled.height = target.height;
      scaled.getContext("2d")?.drawImage(image, 0, 0, target.width, target.height);
      return scaled;
    } finally {
      URL.revokeObjectURL(url);
    }
  };

  const configure = (texture: Texture, name: SolarTextureName) => {
    texture.flipY = false;
    texture.premultiplyAlpha = false;
    texture.colorSpace = dataTextures.has(name) ? NoColorSpace : SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    texture.minFilter = LinearMipmapLinearFilter;
    if (name !== "saturn-rings") texture.wrapS = RepeatWrapping;
    texture.needsUpdate = true;
  };

  const loadOne = async (name: SolarTextureName) => {
    try {
      const map = await fetchVariant(name, variantWidth(name));
      const source = await decode(name, map.blob);
      if (disposed) {
        release(source);
        return;
      }
      const texture = new Texture(source);
      texture.userData.sourceUrl = map.url;
      configure(texture, name);
      textures.set(name, texture);
    } catch (error) {
      if (!disposed && !optionalTextures.has(name)) throw error;
    }
  };

  /** Fetches a larger variant when the retained ones are too small; failures keep what exists. */
  const ensureCoverage = async (name: SolarTextureName) => {
    const width = variantWidth(name);
    if ([...(retained.get(name)?.keys() ?? [])].some((known) => known >= width)) return;
    try {
      await fetchVariant(name, width);
    } catch {
      // An aborted or failed upgrade leaves the retained detail in place.
    }
  };

  return {
    /** Rejects when a required map fails; optional Earth maps may be missing afterwards. */
    async load() {
      await Promise.all(solarTextureNames.map(loadOne));
    },
    get: (name: SolarTextureName) => textures.get(name),
    has: (name: SolarTextureName) => textures.has(name),
    get size() {
      return textures.size;
    },
    values: () => textures.values(),
    /** Approximate GPU bytes, including a third for mipmaps. */
    bytes() {
      let total = 0;
      for (const texture of textures.values()) {
        const source = texture.image as TextureSource;
        total += Math.ceil((source.width * source.height * 4 * 4) / 3);
      }
      return total;
    },
    /**
     * Re-decodes maps whose upload size changed, fetching larger variants first when needed. A
     * newer call supersedes an older one; `onUpload` runs after each replacement so callers can
     * discount the one-frame upload stall. Disposal aborts in-flight variant requests.
     */
    async refit(onUpload: () => void) {
      const current = ++generation;
      const coverage = new Map([...textures.keys()].map((name) => [name, ensureCoverage(name)]));
      for (const [name, texture] of textures) {
        await coverage.get(name);
        if (disposed || current !== generation) return;
        const map = retainedFor(name);
        const previous = texture.image as TextureSource;
        if (
          !map ||
          (texture.userData.sourceUrl === map.url &&
            sourceWidth(previous) === Math.min(map.width, largestUpload(name)))
        )
          continue;
        const decoded = await decode(name, map.blob);
        if (disposed || current !== generation) {
          release(decoded);
          return;
        }
        if (sourceWidth(decoded) === sourceWidth(previous)) {
          release(decoded);
          continue;
        }
        release(previous);
        // three.js keeps the original GPU allocation and only sub-uploads into it, so a new size
        // needs the old storage released first.
        texture.dispose();
        texture.image = decoded;
        texture.userData.sourceUrl = map.url;
        texture.needsUpdate = true;
        onUpload();
      }
    },
    dispose() {
      disposed = true;
      requests.abort();
      for (const texture of textures.values()) {
        const source = texture.image as TextureSource;
        texture.dispose();
        release(source);
      }
      textures.clear();
      retained.clear();
    },
  };
}
export type SolarTextures = ReturnType<typeof createSolarTextures>;
