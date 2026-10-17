import {
  type BufferGeometry,
  Color,
  CustomBlending,
  OneFactor,
  OneMinusSrcAlphaFactor,
  ShaderMaterial,
  type Texture,
  Vector3,
} from "three";
import type { ReadingUniforms } from "./solar-system-reading";

/** Premultiplied "over": alpha 1 covers the page, alpha 0 adds light to it. */
const premultipliedOver = {
  blending: CustomBlending,
  blendSrc: OneFactor,
  blendDst: OneMinusSrcAlphaFactor,
  blendSrcAlpha: OneFactor,
  blendDstAlpha: OneMinusSrcAlphaFactor,
  premultipliedAlpha: true,
  transparent: true,
} as const;

/** Uniform objects shared by reference, so one assignment updates every material. */
export function createSharedUniforms() {
  return {
    time: { value: 0 },
    sunPosition: { value: new Vector3() },
    sunColor: { value: new Color(1, 0.955, 0.9).multiplyScalar(2.7) },
    lightMode: { value: 0 },
    inkColor: { value: new Color(0x1d3557) },
    pixelRatio: { value: 1 },
  };
}
export type SharedUniforms = ReturnType<typeof createSharedUniforms>;

type SolarShaderParameters = ConstructorParameters<typeof ShaderMaterial>[0] & {
  /** How far the material recedes behind reading text, from 0 (never) to 1 (fully). */
  readingStrength?: number;
};

/**
 * Tracks GPU-backed geometries, materials and textures for one engine so disposal is complete. Every
 * material it creates uses premultiplied blending and the shared reading mask.
 */
export function createResourceTracker(reading: ReadingUniforms) {
  const geometries = new Set<BufferGeometry>();
  const materials = new Set<ShaderMaterial>();
  const textures = new Set<Texture>();
  return {
    texture<T extends Texture>(value: T) {
      textures.add(value);
      return value;
    },
    geometry<T extends BufferGeometry>(value: T) {
      geometries.add(value);
      return value;
    },
    shader({ readingStrength = 0.6, uniforms, ...parameters }: SolarShaderParameters) {
      const value = new ShaderMaterial({
        ...premultipliedOver,
        depthWrite: false,
        ...parameters,
        uniforms: { ...uniforms, ...reading, readingStrength: { value: readingStrength } },
      });
      materials.add(value);
      return value;
    },
    dispose() {
      for (const value of geometries) value.dispose();
      for (const value of materials) value.dispose();
      for (const value of textures) value.dispose();
      geometries.clear();
      materials.clear();
      textures.clear();
    },
  };
}
export type ResourceTracker = ReturnType<typeof createResourceTracker>;

/** Smooth value noise in [0, 1) on an integer lattice; deterministic for a given seed. */
export function valueNoise3(seed: number) {
  const hash = (x: number, y: number, z: number) => {
    let h = (x * 374761393 + y * 668265263 + z * 2147483647 + seed * 144269504) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const fade = (t: number) => t * t * (3 - 2 * t);
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
  return (x: number, y: number, z: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const zi = Math.floor(z);
    const u = fade(x - xi);
    const v = fade(y - yi);
    const w = fade(z - zi);
    const corner = (dx: number, dy: number, dz: number) => hash(xi + dx, yi + dy, zi + dz);
    return lerp(
      lerp(lerp(corner(0, 0, 0), corner(1, 0, 0), u), lerp(corner(0, 1, 0), corner(1, 1, 0), u), v),
      lerp(lerp(corner(0, 0, 1), corner(1, 0, 1), u), lerp(corner(0, 1, 1), corner(1, 1, 1), u), v),
      w,
    );
  };
}

/** Deterministic Park–Miller generator, so every visit draws the same sky. */
export function seededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
}
