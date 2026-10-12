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

/**
 * Loads the local maps and keeps their compressed bytes, so a layout or explorer change can
 * re-decode at another size without another request. `limit` returns the largest dimension to
 * upload for a map under the current conditions.
 */
export function createSolarTextures(
  renderer: WebGLRenderer,
  versions: SolarTextureVersions,
  limit: (name: SolarTextureName) => number,
) {
  const textures = new Map<SolarTextureName, Texture>();
  const blobs = new Map<SolarTextureName, Blob>();
  let disposed = false;
  let generation = 0;
  const requests = new AbortController();

  const targetSize = (name: SolarTextureName, width: number, height: number) => {
    const largest = Math.min(renderer.capabilities.maxTextureSize, limit(name));
    const factor = Math.min(1, largest / Math.max(width, height));
    return {
      width: Math.max(1, Math.round(width * factor)),
      height: Math.max(1, Math.round(height * factor)),
    };
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
    const url = new URL(solarTextureUrl(name, versions), location.href).href;
    try {
      const response = await fetch(url, { signal: requests.signal });
      if (!response.ok) throw new Error(`Solar texture request failed: ${name}`);
      const blob = await response.blob();
      const source = await decode(name, blob);
      if (disposed) {
        release(source);
        return;
      }
      const texture = new Texture(source);
      texture.userData.sourceUrl = url;
      configure(texture, name);
      textures.set(name, texture);
      blobs.set(name, blob);
    } catch (error) {
      if (!disposed && !optionalTextures.has(name)) throw error;
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
     * Re-decodes maps whose upload size changed. A newer call supersedes an older one; `onUpload`
     * runs after each replacement so callers can discount the one-frame upload stall.
     */
    async refit(onUpload: () => void) {
      const current = ++generation;
      for (const [name, texture] of textures) {
        const blob = blobs.get(name);
        if (!blob) continue;
        const previous = texture.image as TextureSource;
        const decoded = await decode(name, blob);
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
      blobs.clear();
    },
  };
}
export type SolarTextures = ReturnType<typeof createSolarTextures>;
