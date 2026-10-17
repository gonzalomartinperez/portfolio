import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  type Group,
  Mesh,
  OrthographicCamera,
  type PerspectiveCamera,
  PlaneGeometry,
  Points,
  RepeatWrapping,
  Scene,
  ShaderMaterial,
  SphereGeometry,
  Vector3,
  type WebGLRenderer,
  WebGLRenderTarget,
} from "three";
import { solarCameras } from "../domain/solar-system-scene";
import { type ResourceTracker, type SharedUniforms, seededRandom } from "./solar-system-resources";
import {
  beltFragment,
  beltVertex,
  galaxyBakeFragment,
  galaxyBakeVertex,
  meteorFragment,
  skyFragment,
  skyVertex,
  starFragment,
  starVertex,
} from "./solar-system-shaders";

/** The band is soft and faint, so this resolution holds its detail at a quarter of the cost. */
const galaxySize = { width: 1024, height: 512 } as const;
/** Stars sit far beyond the outer orbits; the galaxy sphere encloses them. */
const starDistance = 1200;
const skyRadius = 1500;
const starPalette = [
  [0.62, 0.74, 1.0],
  [0.8, 0.87, 1.0],
  [1.0, 1.0, 1.0],
  [1.0, 0.94, 0.82],
  [1.0, 0.82, 0.62],
  [1.0, 0.7, 0.5],
] as const;
/** Shooting stars repeat on a 47-second cycle, independent of the orbital clock. */
const meteorCycle = 47;
const meteorWindows = [
  { start: 18, duration: 1.6, strength: 1 },
  { start: 37, duration: 1.1, strength: 0.6 },
] as const;
const meteorDepth = 60;

type Belt = {
  name: string;
  count: number;
  inner: number;
  outer: number;
  thickness: number;
  size: number;
  strength: number;
  color: number;
  seed: number;
};
const belts = (sparse: boolean): Belt[] => [
  {
    name: "asteroid-belt",
    count: sparse ? 1400 : 2600,
    inner: 21.6,
    outer: 24.6,
    thickness: 0.9,
    size: 0.55,
    strength: 0.85,
    color: 0xb8a58e,
    seed: 9127,
  },
  {
    name: "kuiper-belt",
    count: sparse ? 700 : 1300,
    inner: 51,
    outer: 62,
    thickness: 4.5,
    size: 0.75,
    strength: 0.35,
    color: 0x9fb6d8,
    seed: 3301,
  },
];

/** The galactic plane crosses the initial landscape frame diagonally behind the Sun. */
function galacticFrame() {
  const elevation = (solarCameras.landscape.elevation * Math.PI) / 180;
  const view = new Vector3(0, -Math.sin(elevation), -Math.cos(elevation));
  const up = new Vector3(0, Math.cos(elevation), -Math.sin(elevation));
  const tilt = 0.62;
  const across = new Vector3(Math.cos(tilt), 0, 0).addScaledVector(up, Math.sin(tilt));
  const pole = new Vector3().crossVectors(view, across).normalize();
  const core = view.clone().addScaledVector(across, -0.55).projectOnPlane(pole).normalize();
  return { pole, core };
}

function createStarField(count: number, pole: Vector3, tracker: ResourceTracker) {
  const random = seededRandom(48271);
  const direction = new Vector3();
  const positions = new Float32Array(count * 3);
  const tints = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  for (let index = 0; index < count; index++) {
    do direction.set(random() * 2 - 1, random() * 2 - 1, random() * 2 - 1);
    while (direction.lengthSq() > 1 || direction.lengthSq() < 1e-4);
    direction.normalize();
    // About 40 % of stars crowd toward the galactic plane, as in the real sky.
    if (random() < 0.4)
      direction.addScaledVector(pole, -direction.dot(pole) * (0.8 + random() * 0.18)).normalize();
    direction.multiplyScalar(starDistance).toArray(positions, index * 3);
    // Most stars are faint pinpricks; only a few reach the size of a soft glow.
    const magnitude = random() ** 5;
    sizes[index] = 0.32 + magnitude * 2.6;
    const temperature =
      starPalette[Math.min(starPalette.length - 1, Math.floor(random() ** 1.4 * 6))];
    const brightness = 0.45 + magnitude * 1.1;
    for (let channel = 0; channel < 3; channel++)
      tints[index * 3 + channel] = temperature[channel] * brightness;
    phases[index] = random();
  }
  const field = tracker.geometry(new BufferGeometry());
  field.setAttribute("position", new BufferAttribute(positions, 3));
  field.setAttribute("tint", new BufferAttribute(tints, 3));
  field.setAttribute("size", new BufferAttribute(sizes, 1));
  field.setAttribute("phase", new BufferAttribute(phases, 1));
  return field;
}

/** Belt particles orbit in the vertex shader, following Kepler's third law from Jupiter's period. */
function createBeltField(belt: Belt, tracker: ResourceTracker) {
  const random = seededRandom(belt.seed);
  const orbits = new Float32Array(belt.count * 4);
  const sizes = new Float32Array(belt.count);
  const shades = new Float32Array(belt.count);
  for (let index = 0; index < belt.count; index++) {
    const spread = (random() + random() + random()) / 3;
    const radius = belt.inner + (belt.outer - belt.inner) * spread;
    const periodSeconds = 450 * (radius / 27) ** 1.5;
    orbits.set(
      [
        radius,
        random() * Math.PI * 2,
        (random() - 0.5) * belt.thickness * (0.4 + spread),
        (Math.PI * 2) / periodSeconds,
      ],
      index * 4,
    );
    sizes[index] = belt.size * (0.35 + random() ** 4 * 1.8);
    shades[index] = 0.55 + random() * 0.6;
  }
  const field = tracker.geometry(new BufferGeometry());
  field.setAttribute("position", new BufferAttribute(new Float32Array(belt.count * 3), 3));
  field.setAttribute("orbit", new BufferAttribute(orbits, 4));
  field.setAttribute("size", new BufferAttribute(sizes, 1));
  field.setAttribute("shade", new BufferAttribute(shades, 1));
  return field;
}

/**
 * Everything beyond the planets: a baked Milky Way, the star field, the asteroid and Kuiper
 * belts and occasional shooting stars. The meteor is parented to the camera so its path is
 * independent of orbits and camera motion.
 */
export function createSolarSky({
  renderer,
  scene,
  root,
  camera,
  shared,
  tracker,
  compact,
  lite,
  twinkle,
}: {
  renderer: WebGLRenderer;
  scene: Scene;
  root: Group;
  camera: PerspectiveCamera;
  shared: SharedUniforms;
  tracker: ResourceTracker;
  compact: boolean;
  /** Skips the full-screen galaxy pass and thins the star field for CPU rasterizers. */
  lite: boolean;
  twinkle: boolean;
}) {
  const { pole, core } = galacticFrame();
  const galaxy = new WebGLRenderTarget(galaxySize.width, galaxySize.height, { depthBuffer: false });
  galaxy.texture.wrapS = RepeatWrapping;
  const skyMaterial = tracker.shader({
    readingStrength: 0.2,
    vertexShader: skyVertex,
    fragmentShader: skyFragment,
    uniforms: { galaxy: { value: galaxy.texture }, strength: { value: 0.04 } },
    side: BackSide,
  });
  const sky = new Mesh(tracker.geometry(new SphereGeometry(skyRadius, 48, 24)), skyMaterial);
  sky.name = "milky-way";
  sky.renderOrder = -3;
  sky.frustumCulled = false;
  if (!lite) scene.add(sky);

  const starMaterial = tracker.shader({
    readingStrength: 0.18,
    vertexShader: starVertex,
    fragmentShader: starFragment,
    uniforms: {
      time: shared.time,
      pixelRatio: shared.pixelRatio,
      brightness: { value: 1 },
      twinkle: { value: twinkle ? 1 : 0 },
      lightMode: shared.lightMode,
      inkColor: shared.inkColor,
    },
  });
  const stars = new Points(
    createStarField((compact ? 3200 : 6500) / (lite ? 2 : 1), pole, tracker),
    starMaterial,
  );
  stars.name = "solar-stars";
  stars.renderOrder = -2;
  stars.frustumCulled = false;
  scene.add(stars);

  const beltMaterials = belts(compact || lite).map((belt) => {
    const value = tracker.shader({
      readingStrength: 0.35,
      vertexShader: beltVertex,
      fragmentShader: beltFragment,
      uniforms: {
        time: shared.time,
        pixelScale: { value: 1 },
        sunPosition: shared.sunPosition,
        dustColor: { value: new Color(belt.color) },
        strength: { value: belt.strength },
        lightMode: shared.lightMode,
        inkColor: shared.inkColor,
      },
    });
    const points = new Points(createBeltField(belt, tracker), value);
    points.name = belt.name;
    points.frustumCulled = false;
    root.add(points);
    return { value, strength: belt.strength };
  });

  const meteorMaterial = tracker.shader({
    readingStrength: 0.6,
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: meteorFragment,
    uniforms: { strength: { value: 0 }, lightMode: shared.lightMode, inkColor: shared.inkColor },
    depthTest: false,
  });
  // The quad's origin is the meteor head; the tail extends along negative X.
  const meteor = new Mesh(
    tracker.geometry(new PlaneGeometry(1, 1).translate(-0.5, 0, 0)),
    meteorMaterial,
  );
  meteor.name = "shooting-star";
  meteor.frustumCulled = false;
  meteor.renderOrder = 4;
  meteor.visible = false;
  camera.add(meteor);

  /** Path of the current shooting star, drawn once per window from a deterministic seed. */
  let path = { key: Number.NaN, startX: 0, startY: 0, directionX: 0, directionY: 0, reach: 0 };
  const updateMeteor = (elapsed: number) => {
    const cycle = Math.floor(elapsed / meteorCycle);
    const local = elapsed - cycle * meteorCycle;
    const active = meteorWindows.find(
      ({ start, duration }) => local >= start && local <= start + duration,
    );
    meteor.visible = Boolean(active);
    if (!active) return;
    const halfHeight = Math.tan((camera.fov * Math.PI) / 360) * meteorDepth;
    const key = cycle * meteorCycle + active.start;
    if (path.key !== key) {
      const random = seededRandom(1 + cycle * 7 + active.start);
      const startX = (random() * 1.2 - 0.6) * halfHeight * camera.aspect;
      const angle = Math.PI + 0.35 + random() * 0.5 * (random() > 0.5 ? 1 : -1);
      path = {
        key,
        startX,
        startY: (0.25 + random() * 0.6) * halfHeight,
        directionX: Math.cos(angle) * (startX > 0 ? 1 : -1),
        directionY: Math.sin(angle),
        reach: halfHeight * (0.7 + random() * 0.4),
      };
    }
    const progress = (local - active.start) / active.duration;
    const travel = path.reach * (1 - (1 - progress) ** 1.6);
    meteor.position.set(
      path.startX + path.directionX * travel,
      path.startY + path.directionY * travel,
      -meteorDepth,
    );
    meteor.rotation.set(0, 0, Math.atan2(path.directionY, path.directionX));
    meteor.scale.set(halfHeight * 0.42 * Math.min(1, progress * 3 + 0.2), halfHeight * 0.012, 1);
    meteorMaterial.uniforms.strength.value =
      Math.sin(Math.min(1, progress) * Math.PI) * active.strength;
  };

  return {
    /** Renders the galaxy into its target; repeat after a restored GPU context. */
    bake() {
      if (lite) return;
      const material = new ShaderMaterial({
        vertexShader: galaxyBakeVertex,
        fragmentShader: galaxyBakeFragment,
        uniforms: { pole: { value: pole }, core: { value: core } },
        depthTest: false,
        depthWrite: false,
      });
      const quad = new Mesh(new PlaneGeometry(2, 2), material);
      const bakeScene = new Scene();
      bakeScene.add(quad);
      const previous = renderer.getRenderTarget();
      renderer.setRenderTarget(galaxy);
      renderer.render(bakeScene, new OrthographicCamera(-1, 1, 1, -1, 0, 1));
      renderer.setRenderTarget(previous);
      quad.geometry.dispose();
      material.dispose();
    },
    /** GPU bytes held by the baked galaxy target. */
    bytes: lite ? 0 : galaxySize.width * galaxySize.height * 4,
    update(elapsed: number) {
      updateMeteor(elapsed);
    },
    /** Belt points are sized in drawing-buffer pixels at a unit view distance. */
    setPixelScale(value: number) {
      for (const belt of beltMaterials) belt.value.uniforms.pixelScale.value = value;
    },
    applyTheme(ink: boolean, immersive: boolean) {
      sky.visible = !ink && !lite;
      skyMaterial.uniforms.strength.value = immersive ? 0.075 : 0.04;
      starMaterial.uniforms.brightness.value = ink ? 0.75 : immersive ? 1.15 : 0.85;
      for (const belt of beltMaterials)
        belt.value.uniforms.strength.value = belt.strength * (ink ? 0.6 : immersive ? 1.2 : 1);
    },
    get meteorVisible() {
      return meteor.visible;
    },
    dispose() {
      galaxy.dispose();
    },
  };
}
export type SolarSky = ReturnType<typeof createSolarSky>;
