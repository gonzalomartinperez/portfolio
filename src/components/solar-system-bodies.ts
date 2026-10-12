import {
  BackSide,
  BufferAttribute,
  BufferGeometry,
  Color,
  DataTexture,
  DoubleSide,
  Group,
  Line,
  LinearFilter,
  Mesh,
  PlaneGeometry,
  Quaternion,
  RepeatWrapping,
  RingGeometry,
  type ShaderMaterial,
  SphereGeometry,
  Vector3,
} from "three";
import { type ResourceTracker, type SharedUniforms, valueNoise3 } from "./solar-system-resources";
import {
  type SolarLayout,
  type SolarPlanet,
  type SolarTextureName,
  solarMoon,
  solarMoonOffset,
  solarOrbitPoint,
  solarPhase,
  solarPlanets,
  solarSun,
} from "./solar-system-scene";
import {
  atmosphereFragment,
  billboardVertex,
  cloudFragment,
  coronaFragment,
  markerFragment,
  orbitFragment,
  orbitVertex,
  planetFragment,
  ringFragment,
  ringVertex,
  sphereVertex,
  sunFragment,
} from "./solar-system-shaders";
import type { SolarTextures } from "./solar-system-textures";

type SolarBody = {
  name: string;
  mesh: Mesh;
  orbit: Group;
  tilt: Group;
  config?: SolarPlanet;
  clouds?: Mesh;
  atmosphere?: Mesh;
  rings?: Mesh;
  trail?: ShaderMaterial;
};
type SurfaceName = SolarPlanet["name"] | "moon";

/** Limb glow inside the disc (`inner`) and an additive shell of `shell` radii outside it. */
const atmospheres: Partial<
  Record<SurfaceName, { color: number; inner: number; shell: number; shellStrength: number }>
> = {
  venus: { color: 0xffe2a8, inner: 0.85, shell: 1.07, shellStrength: 1.1 },
  earth: { color: 0x4f9dff, inner: 0.75, shell: 1.065, shellStrength: 1.35 },
  mars: { color: 0xffa070, inner: 0.35, shell: 1.04, shellStrength: 0.55 },
  jupiter: { color: 0xffd9a8, inner: 0.22, shell: 1.025, shellStrength: 0.35 },
  saturn: { color: 0xffe2b0, inner: 0.22, shell: 1.025, shellStrength: 0.3 },
  uranus: { color: 0x9fe8ff, inner: 0.55, shell: 1.04, shellStrength: 0.7 },
  neptune: { color: 0x5d8dff, inner: 0.6, shell: 1.04, shellStrength: 0.8 },
};
/**
 * Photometric character per body: `bump` derives relief from albedo, `lunar` blends in the
 * Lommel–Seeliger response of airless regolith, `terminator` softens the day/night edge of thick
 * atmospheres and `limb` darkens gas giants toward their edges.
 */
const surfaces: Record<
  SurfaceName,
  { bump: number; lunar: number; terminator: number; limb: number }
> = {
  mercury: { bump: 1.6, lunar: 0.75, terminator: 0, limb: 0 },
  venus: { bump: 0, lunar: 0, terminator: 0.18, limb: 0.35 },
  earth: { bump: 0, lunar: 0, terminator: 0.06, limb: 0 },
  mars: { bump: 1.2, lunar: 0.35, terminator: 0.03, limb: 0 },
  jupiter: { bump: 0, lunar: 0, terminator: 0.1, limb: 0.6 },
  saturn: { bump: 0, lunar: 0, terminator: 0.1, limb: 0.55 },
  uranus: { bump: 0, lunar: 0, terminator: 0.12, limb: 0.7 },
  neptune: { bump: 0, lunar: 0, terminator: 0.12, limb: 0.65 },
  pluto: { bump: 0.9, lunar: 0.6, terminator: 0, limb: 0 },
  moon: { bump: 1.8, lunar: 0.8, terminator: 0, limb: 0 },
};
/** Ring extents in planetary radii. */
const ringExtents = {
  saturn: { inner: 1.24, outer: 2.27 },
  uranus: { inner: 1.6, outer: 2.0 },
} as const;
/** Corona quad half-size in solar radii; beyond it the falloff is imperceptible. */
const coronaSpan = 6;
const markerInner = 0.86;
const cloudDriftPerSecond = 0.012;
/** A faint bluish earthshine keeps night sides reading as spheres, not holes, on black. */
const darkAmbient = [0.022, 0.026, 0.038] as const;
const inkAmbient = [0.05, 0.06, 0.08] as const;

/**
 * Angular noise for the corona, tileable in both directions: columns run around the Sun and rows
 * evolve over time. Red holds broad streamers, green finer rays. Generated once, sampled per pixel.
 */
function createStreamerMap(tracker: ResourceTracker) {
  const width = 512;
  const rows = 64;
  const noise = valueNoise3(7);
  const fbm = (x: number, y: number, z: number, octaves: number) => {
    let value = 0;
    let amplitude = 0.5;
    let frequency = 1;
    for (let octave = 0; octave < octaves; octave++) {
      value += amplitude * noise(x * frequency, y * frequency, z * frequency);
      amplitude *= 0.5;
      frequency *= 2.03;
    }
    return value;
  };
  const data = new Uint8Array(width * rows * 4);
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < width; column++) {
      const angle = (column / width) * Math.PI * 2;
      // Blending with the row one period earlier makes the time axis loop without a seam.
      const sample = (scale: number, octaves: number, offset: number) => {
        const x = Math.cos(angle) * scale;
        const y = Math.sin(angle) * scale;
        const now = fbm(x, y, row * 0.12 + offset, octaves);
        const looped = fbm(x, y, (row - rows) * 0.12 + offset, octaves);
        return ((rows - row) * now + row * looped) / rows;
      };
      const index = (row * width + column) * 4;
      data[index] = Math.round(sample(2.4, 4, 0) * 255);
      data[index + 1] = Math.round(sample(7, 3, 31) * 255);
      data[index + 3] = 255;
    }
  }
  const texture = tracker.texture(new DataTexture(data, width, rows));
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.magFilter = LinearFilter;
  texture.minFilter = LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

function radialRing(tracker: ResourceTracker, inner: number, outer: number, segments: number) {
  const shape = tracker.geometry(new RingGeometry(inner, outer, segments, 1));
  const positions = shape.getAttribute("position");
  const uv = shape.getAttribute("uv");
  for (let index = 0; index < positions.count; index++) {
    const radius = Math.hypot(positions.getX(index), positions.getY(index));
    uv.setXY(index, (radius - inner) / (outer - inner), 0.5);
  }
  return shape;
}

/**
 * The Sun, its corona, nine orbiting bodies with the Moon around Earth, ring systems, orbit
 * guides and the explorer's selection halo. Positions derive only from `elapsed`, so any frame,
 * including the first, is fully placed before it is drawn.
 */
export function createSolarBodies({
  root,
  shared,
  tracker,
  textures,
  lite,
}: {
  root: Group;
  shared: SharedUniforms;
  tracker: ResourceTracker;
  textures: SolarTextures;
  /** CPU rasterizers transform every vertex in software; large bodies share the lighter mesh. */
  lite: boolean;
}) {
  const detailed = tracker.geometry(
    lite ? new SphereGeometry(1, 64, 36) : new SphereGeometry(1, 128, 72),
  );
  const standard = tracker.geometry(new SphereGeometry(1, 64, 36));
  const bodies: SolarBody[] = [];
  const surfacesMaterials: ShaderMaterial[] = [];
  const ringBindings: {
    material: ShaderMaterial;
    rings: Mesh;
    planet: Mesh;
    planetMaterial: ShaderMaterial;
  }[] = [];
  const scratch = { center: new Vector3(), normal: new Vector3(), rotation: new Quaternion() };

  const surface = (
    name: SurfaceName,
    extra: Record<string, { value: unknown }> = {},
    defines: Record<string, string> = {},
  ) => {
    const character = surfaces[name];
    const atmosphere = atmospheres[name];
    const value = tracker.shader({
      readingStrength: 0.72,
      vertexShader: sphereVertex,
      fragmentShader: planetFragment,
      uniforms: {
        dayMap: { value: textures.get(name) ?? null },
        sunPosition: shared.sunPosition,
        sunColor: shared.sunColor,
        ambientColor: { value: new Color(...darkAmbient) },
        bump: { value: character.bump },
        lunar: { value: character.lunar },
        terminator: { value: character.terminator },
        limb: { value: character.limb },
        atmosphereColor: { value: new Color(atmosphere?.color ?? 0x000000) },
        atmosphereStrength: { value: atmosphere?.inner ?? 0 },
        nightAlpha: { value: 1 },
        ...extra,
      },
      defines,
      depthWrite: true,
    });
    surfacesMaterials.push(value);
    return value;
  };

  const sunMaterial = tracker.shader({
    readingStrength: 0.94,
    vertexShader: sphereVertex,
    fragmentShader: sunFragment,
    uniforms: {
      sunMap: { value: textures.get("sun") },
      time: shared.time,
      intensity: { value: 2.2 },
    },
    depthWrite: true,
  });
  const sunMesh = new Mesh(detailed, sunMaterial);
  sunMesh.name = "sun";
  sunMesh.scale.setScalar(solarSun.radius);
  const sunTilt = new Group();
  const sunOrbit = new Group();
  sunTilt.add(sunMesh);
  sunOrbit.add(sunTilt);
  root.add(sunOrbit);
  bodies.push({ name: "sun", mesh: sunMesh, orbit: sunOrbit, tilt: sunTilt });

  const coronaMaterial = tracker.shader({
    readingStrength: 0.94,
    vertexShader: billboardVertex,
    fragmentShader: coronaFragment,
    uniforms: {
      streamerMap: { value: createStreamerMap(tracker) },
      time: shared.time,
      sunRatio: { value: 1 / coronaSpan },
      strength: { value: 1 },
      lightMode: shared.lightMode,
    },
  });
  const corona = new Mesh(tracker.geometry(new PlaneGeometry(2, 2)), coronaMaterial);
  corona.name = "sun-corona";
  corona.renderOrder = 2;
  corona.frustumCulled = false;
  corona.scale.set(solarSun.radius * coronaSpan, solarSun.radius * coronaSpan, 1);
  root.add(corona);

  let moon: SolarBody | undefined;
  let earth: SolarBody | undefined;
  for (const config of solarPlanets) {
    const orbit = new Group();
    const tilt = new Group();
    orbit.name = `${config.name}-orbit`;
    tilt.rotation.set(0, 0, (config.tilt * Math.PI) / 180);
    let material: ShaderMaterial;
    if (config.name === "earth") {
      const available = (name: SolarTextureName) => ({ value: textures.has(name) ? 1 : 0 });
      material = surface(
        "earth",
        {
          nightMap: { value: textures.get("earth-night") ?? null },
          normalMap: { value: textures.get("earth-normal") ?? null },
          specularMap: { value: textures.get("earth-specular") ?? null },
          cloudMap: { value: textures.get("earth-clouds") ?? null },
          cloudOffset: { value: 0 },
          hasNight: available("earth-night"),
          hasNormal: available("earth-normal"),
          hasSpecular: available("earth-specular"),
          hasClouds: available("earth-clouds"),
        },
        { EARTH: "" },
      );
    } else if (config.name === "saturn") {
      material = surface(
        "saturn",
        {
          ringMap: { value: textures.get("saturn-rings") ?? null },
          ringNormal: { value: new Vector3(0, 1, 0) },
          planetCenter: { value: new Vector3() },
          ringInner: { value: ringExtents.saturn.inner },
          ringOuter: { value: ringExtents.saturn.outer },
        },
        { RINGED: "" },
      );
    } else material = surface(config.name);
    const mesh = new Mesh(config.radius > 1.5 ? detailed : standard, material);
    mesh.name = config.name;
    mesh.scale.setScalar(config.radius);
    tilt.add(mesh);
    orbit.add(tilt);
    root.add(orbit);
    const body: SolarBody = { name: config.name, mesh, orbit, tilt, config };

    const atmosphere = atmospheres[config.name];
    if (atmosphere) {
      body.atmosphere = new Mesh(
        standard,
        tracker.shader({
          readingStrength: 0.78,
          vertexShader: sphereVertex,
          fragmentShader: atmosphereFragment,
          uniforms: {
            sunPosition: shared.sunPosition,
            glowColor: { value: new Color(atmosphere.color) },
            glowStrength: { value: atmosphere.shellStrength },
            innerRatio: { value: 1 / atmosphere.shell },
            lightMode: shared.lightMode,
          },
          side: BackSide,
        }),
      );
      body.atmosphere.name = `${config.name}-atmosphere`;
      body.atmosphere.scale.setScalar(config.radius * atmosphere.shell);
      body.atmosphere.renderOrder = 1;
      tilt.add(body.atmosphere);
    }

    if (config.name === "earth") {
      earth = body;
      body.clouds = new Mesh(
        standard,
        tracker.shader({
          readingStrength: 0.72,
          vertexShader: sphereVertex,
          fragmentShader: cloudFragment,
          uniforms: {
            cloudMap: { value: textures.get("earth-clouds") ?? null },
            sunPosition: shared.sunPosition,
            sunColor: shared.sunColor,
            nightAlpha: { value: 1 },
          },
        }),
      );
      body.clouds.name = "earth-clouds";
      body.clouds.visible = textures.has("earth-clouds");
      body.clouds.scale.setScalar(config.radius * 1.012);
      body.clouds.renderOrder = 1;
      tilt.add(body.clouds);

      const moonMesh = new Mesh(standard, surface("moon"));
      moonMesh.name = "moon";
      moonMesh.scale.setScalar(solarMoon.radius);
      const moonTilt = new Group();
      const moonOrbit = new Group();
      moonOrbit.name = "earth-moon-orbit";
      moonTilt.add(moonMesh);
      moonOrbit.add(moonTilt);
      orbit.add(moonOrbit);
      moon = { name: "moon", mesh: moonMesh, orbit: moonOrbit, tilt: moonTilt };
      bodies.push(moon);
    }

    if (config.name === "saturn" || config.name === "uranus") {
      const extent = ringExtents[config.name];
      const ringMap = textures.get("saturn-rings");
      const textured = config.name === "saturn" && Boolean(ringMap);
      const ringMaterial = tracker.shader({
        readingStrength: 0.72,
        vertexShader: ringVertex,
        fragmentShader: ringFragment,
        uniforms: {
          ringMap: { value: ringMap ?? null },
          textured: { value: textured ? 1 : 0 },
          sunPosition: shared.sunPosition,
          sunColor: shared.sunColor,
          planetCenter: { value: new Vector3() },
          planetRadius: { value: 1 },
          ringNormal: { value: new Vector3(0, 1, 0) },
          opacity: { value: textured ? 0.95 : 0.55 },
        },
        side: DoubleSide,
      });
      const shape = radialRing(tracker, extent.inner, extent.outer, 192);
      shape.rotateX(-Math.PI / 2);
      body.rings = new Mesh(shape, ringMaterial);
      body.rings.name = `${config.name}-rings`;
      body.rings.renderOrder = 1;
      body.rings.scale.setScalar(config.radius);
      tilt.add(body.rings);
      ringBindings.push({
        material: ringMaterial,
        rings: body.rings,
        planet: mesh,
        planetMaterial: material,
      });
    }

    const segments = 320;
    const positions = new Float32Array((segments + 1) * 3);
    const along = new Float32Array(segments + 1);
    for (let index = 0; index <= segments; index++) {
      const point = solarOrbitPoint(config, (index / segments) * Math.PI * 2);
      positions.set([point.x, point.y, point.z], index * 3);
      along[index] = index / segments;
    }
    const path = tracker.geometry(new BufferGeometry());
    path.setAttribute("position", new BufferAttribute(positions, 3));
    path.setAttribute("along", new BufferAttribute(along, 1));
    body.trail = tracker.shader({
      readingStrength: 0.4,
      vertexShader: orbitVertex,
      fragmentShader: orbitFragment,
      uniforms: {
        head: { value: 0 },
        base: { value: 0.05 },
        trail: { value: 0.3 },
        lineColor: { value: new Color(0x8cc8ff) },
      },
    });
    const line = new Line(path, body.trail);
    line.name = `${config.name}-path`;
    line.frustumCulled = false;
    root.add(line);
    bodies.push(body);
  }

  const markerMaterial = tracker.shader({
    readingStrength: 0,
    vertexShader: billboardVertex,
    fragmentShader: markerFragment,
    uniforms: { markerColor: { value: new Color(0x8edbff) }, strength: { value: 0 } },
  });
  const marker = new Mesh(radialRing(tracker, markerInner, 1, 160), markerMaterial);
  marker.name = "solar-selection";
  marker.renderOrder = 5;
  marker.visible = false;
  root.add(marker);

  const earthMaterial = earth?.mesh.material as ShaderMaterial | undefined;
  const cloudMaterial = earth?.clouds?.material as ShaderMaterial | undefined;

  return {
    bodies,
    earthMaterial,
    rings: bodies.find(({ name }) => name === "saturn")?.rings,
    /** Places every body for the orbital clock; `layout` selects the initial phases. */
    update(elapsed: number, layout: SolarLayout) {
      shared.time.value = elapsed;
      sunMesh.rotation.y = (elapsed * Math.PI * 2) / solarSun.spin;
      for (const body of bodies) {
        const config = body.config;
        if (!config) continue;
        const mean = solarPhase(config, layout) + (elapsed * Math.PI * 2) / config.period;
        const position = solarOrbitPoint(config, mean);
        body.orbit.position.set(position.x, position.y, position.z);
        body.mesh.rotation.y = 0.7 + (elapsed * Math.PI * 2) / config.spin;
        if (body.trail) body.trail.uniforms.head.value = (((mean / (Math.PI * 2)) % 1) + 1) % 1;
        if (body.clouds && earthMaterial) {
          const drift = elapsed * cloudDriftPerSecond;
          body.clouds.rotation.y = body.mesh.rotation.y + drift;
          // Sample the cloud map where the rotated shell sits, for shadows on the surface.
          earthMaterial.uniforms.cloudOffset.value = -drift / (Math.PI * 2);
        }
      }
      if (moon) {
        const angle = solarMoon.phase + (elapsed * Math.PI * 2) / solarMoon.period;
        const offset = solarMoonOffset(angle);
        moon.orbit.position.set(offset.x, offset.y, offset.z);
        // Tidally locked: the same hemisphere always faces Earth.
        moon.mesh.rotation.y = -angle + Math.PI / 2;
      }
      root.updateMatrixWorld(true);
      for (const binding of ringBindings) {
        const center = binding.planet.getWorldPosition(scratch.center);
        const normal = scratch.normal
          .set(0, 1, 0)
          .applyQuaternion(binding.rings.getWorldQuaternion(scratch.rotation));
        const radius = binding.planet.scale.x;
        binding.material.uniforms.planetCenter.value.copy(center);
        binding.material.uniforms.planetRadius.value = radius;
        binding.material.uniforms.ringNormal.value.copy(normal);
        const planet = binding.planetMaterial.uniforms;
        if (!planet.ringNormal) continue;
        planet.planetCenter.value.copy(center);
        planet.ringNormal.value.copy(normal);
        planet.ringInner.value = ringExtents.saturn.inner * radius;
        planet.ringOuter.value = ringExtents.saturn.outer * radius;
      }
    },
    /** Fades the selection halo in around `name`, or hides it. */
    updateMarker(name: string | null, delta: number) {
      const selected = bodies.find((body) => body.name === name);
      marker.visible = Boolean(selected);
      if (!selected) {
        markerMaterial.uniforms.strength.value = 0;
        return;
      }
      selected.mesh.getWorldPosition(marker.position);
      const radius = selected.mesh.scale.x * (selected.rings ? 2.5 : 1.55);
      marker.scale.set(radius, radius, 1);
      const current = markerMaterial.uniforms.strength.value as number;
      const ease = delta > 0 ? Math.min(1, delta * 4) : 1;
      markerMaterial.uniforms.strength.value = current + (0.55 - current) * ease;
    },
    applyTheme(ink: boolean, immersive: boolean, highlighted: string | null) {
      const nightAlpha = ink ? 0.16 : 1;
      for (const value of surfacesMaterials) {
        value.uniforms.nightAlpha.value = nightAlpha;
        value.uniforms.ambientColor.value.setRGB(...(ink ? inkAmbient : darkAmbient));
      }
      if (cloudMaterial) cloudMaterial.uniforms.nightAlpha.value = ink ? 0.1 : 1;
      coronaMaterial.uniforms.strength.value = ink ? 0.9 : immersive ? 1.25 : 0.85;
      sunMaterial.uniforms.intensity.value = immersive ? 3.2 : ink ? 2.6 : 2.2;
      for (const body of bodies) {
        if (!body.trail) continue;
        const selected = body.name === highlighted;
        body.trail.uniforms.lineColor.value.set(ink ? 0x4a7fb3 : 0x8cc8ff);
        body.trail.uniforms.base.value = selected ? 0.32 : ink || immersive ? 0.07 : 0.05;
        body.trail.uniforms.trail.value = selected ? 0.55 : ink ? 0.22 : 0.3;
      }
    },
  };
}
export type SolarBodies = ReturnType<typeof createSolarBodies>;
