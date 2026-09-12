/**
 * Shared geometry for the hero identity.
 *
 * The static SVG fallback and the WebGL field draw the same point cloud, so the fallback is a
 * still of the real thing rather than a different picture. Generation is deterministic: the
 * server-rendered SVG and any client render must agree exactly or hydration would mismatch.
 */

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** Mulberry32. Small, fast, and stable across runtimes — which is the property that matters here. */
function seededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type Constellation = {
  /** Interleaved x, y, z on a jittered spherical shell. */
  positions: Float32Array;
  /** One stable 0–1 value per point, for size and phase variation. */
  seeds: Float32Array;
  count: number;
};

/**
 * Fibonacci sphere on a thin shell, which is what produces the bright silhouette.
 * @param count number of points
 * @param seed any integer; the same seed always produces the same cloud
 */
export function buildConstellation(count: number, seed = 20260912): Constellation {
  const random = seededRandom(seed);
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);

  for (let i = 0; i < count; i += 1) {
    const y = 1 - (i / (count - 1)) * 2;
    const ringRadius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = GOLDEN_ANGLE * i;
    // A thin shell rather than a filled volume: even surface distribution projects densest
    // at the silhouette, which is what produces the bright rim. The slight thickness breaks
    // up the moire a mathematically perfect shell would show.
    const radius = 0.965 + random() * 0.035;

    positions[i * 3] = Math.cos(theta) * ringRadius * radius;
    positions[i * 3 + 1] = y * radius;
    positions[i * 3 + 2] = Math.sin(theta) * ringRadius * radius;
    seeds[i] = random();
  }

  return { positions, seeds, count };
}

export const CAMERA_DISTANCE = 3.2;
export const FOCAL_LENGTH = 2.0;

export type ProjectedPoint = {
  x: number;
  y: number;
  /** 0 at the far edge of the cloud, 1 at the near edge. */
  depth: number;
  seed: number;
};

/**
 * Perspective projection matching the vertex shader, for the static fallback.
 * Returns points in a -1..1 box, ordered far to near so painting order gives depth.
 */
export function projectConstellation(
  constellation: Constellation,
  rotationY: number,
): ProjectedPoint[] {
  const { positions, seeds, count } = constellation;
  const cos = Math.cos(rotationY);
  const sin = Math.sin(rotationY);
  const points: ProjectedPoint[] = [];

  for (let i = 0; i < count; i += 1) {
    const x = positions[i * 3];
    const y = positions[i * 3 + 1];
    const z = positions[i * 3 + 2];

    const rx = x * cos + z * sin;
    const rz = -x * sin + z * cos;
    const distance = Math.max(CAMERA_DISTANCE - rz, 0.05);
    const scale = FOCAL_LENGTH / distance;

    points.push({
      x: rx * scale,
      y: y * scale,
      depth: (rz + 1) / 2,
      seed: seeds[i],
    });
  }

  return points.sort((a, b) => a.depth - b.depth);
}

/** Point counts tuned to keep the draw cheap on small devices. */
export const POINT_COUNT_DESKTOP = 11000;
export const POINT_COUNT_COMPACT = 7000;
/** The still is inlined into the HTML, so its count is a payload decision, not a visual one. */
export const POINT_COUNT_STATIC = 400;
