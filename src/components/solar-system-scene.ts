/**
 * Artistic space and time compression; these orbits are not an ephemeris.
 *
 * Shared by the server-rendered fallback and the WebGL engine so both draw the same initial
 * composition. Orbital elements (eccentricity, inclination, ascending node, axial tilt) keep
 * their real values; distances, body sizes and periods are stylized for the viewport.
 * `phase` and `portraitPhase` are initial mean anomalies in degrees, chosen so every body is
 * visible on common desktop and phone viewports, and clear of the home hero text where
 * possible, at time zero in each orientation. Periods and spins are in seconds.
 */
export const solarPlanets = [
  {
    name: "mercury",
    orbitRadius: 9,
    radius: 0.42,
    period: 140,
    phase: 6,
    portraitPhase: 140,
    tilt: 0.034,
    spin: 220,
    eccentricity: 0.206,
    inclination: 7,
    ascendingNode: 48.3,
  },
  {
    name: "venus",
    orbitRadius: 12.5,
    radius: 0.74,
    period: 210,
    phase: 310,
    portraitPhase: 300,
    tilt: 177.4,
    spin: 400,
    eccentricity: 0.007,
    inclination: 3.4,
    ascendingNode: 76.7,
  },
  {
    name: "earth",
    orbitRadius: 16,
    radius: 0.8,
    period: 280,
    phase: 152,
    portraitPhase: 166,
    tilt: 23.4,
    spin: 140,
    eccentricity: 0.017,
    inclination: 0,
    ascendingNode: 0,
  },
  {
    name: "mars",
    orbitRadius: 19.5,
    radius: 0.56,
    period: 360,
    phase: 58,
    portraitPhase: 64,
    tilt: 25.2,
    spin: 150,
    eccentricity: 0.093,
    inclination: 1.85,
    ascendingNode: 49.6,
  },
  {
    name: "jupiter",
    orbitRadius: 27,
    radius: 2.05,
    period: 450,
    phase: 50,
    portraitPhase: 328,
    tilt: 3.1,
    spin: 75,
    eccentricity: 0.049,
    inclination: 1.3,
    ascendingNode: 100.5,
  },
  {
    name: "saturn",
    orbitRadius: 33.5,
    radius: 1.7,
    period: 560,
    phase: 306,
    portraitPhase: 354,
    tilt: 26.7,
    spin: 85,
    eccentricity: 0.057,
    inclination: 2.49,
    ascendingNode: 113.7,
  },
  {
    name: "uranus",
    orbitRadius: 39,
    radius: 1.12,
    period: 680,
    phase: 44,
    portraitPhase: 8,
    tilt: 97.8,
    spin: 120,
    eccentricity: 0.046,
    inclination: 0.77,
    ascendingNode: 74,
  },
  {
    name: "neptune",
    orbitRadius: 44,
    radius: 1.08,
    period: 800,
    phase: 72,
    portraitPhase: 298,
    tilt: 28.3,
    spin: 110,
    eccentricity: 0.011,
    inclination: 1.77,
    ascendingNode: 131.8,
  },
  {
    name: "pluto",
    orbitRadius: 48,
    radius: 0.3,
    period: 960,
    phase: 234,
    portraitPhase: 180,
    tilt: 119.6,
    spin: 220,
    eccentricity: 0.249,
    inclination: 17.16,
    ascendingNode: 110.3,
  },
] as const;

export type SolarPlanet = (typeof solarPlanets)[number];

/** Sun and Moon dimensions in scene units. The Moon keeps its real 5.14° orbital inclination. */
export const solarSun = { radius: 3.4, spin: 180 } as const;
export const solarMoon = {
  radius: 0.22,
  distance: 2.15,
  period: 72,
  phase: 0.8,
  inclination: 5.14,
} as const;

export const solarTextureNames = [
  "sun",
  ...solarPlanets.map(({ name }) => name),
  "moon",
  "earth-clouds",
  "earth-night",
  "saturn-rings",
  "earth-normal",
  "earth-specular",
] as const;
export type SolarTextureName = (typeof solarTextureNames)[number];
export type SolarTextureVersions = Readonly<Record<string, string>>;
export const solarTextureUrl = (name: string, versions: SolarTextureVersions) => {
  const version = versions[name];
  if (!version) throw new Error(`Missing solar texture version: ${name}`);
  return `/images/solar-system/${name}.webp?v=${version}`;
};

/**
 * Initial camera per orientation, in container units so server-rendered CSS can match it.
 * Landscape frames a low, cinematic plane wider than the viewport; portrait raises the camera
 * so the orbits use the tall screen instead of a thin horizontal band.
 */
export const solarCameras = {
  landscape: { fieldOfView: 34, elevation: 27, framingRadius: 26 },
  portrait: { fieldOfView: 34, elevation: 52, framingRadius: 21 },
} as const;
export type SolarLayout = keyof typeof solarCameras;
export type SolarCamera = (typeof solarCameras)[SolarLayout];
export const solarLayout = (width: number, height: number): SolarLayout =>
  width < height ? "portrait" : "landscape";

/** CSS units per scene unit for `cqmin`, and the CSS perspective in `cqh`, for one camera. */
export const solarFallbackScale = (camera: SolarCamera) =>
  Math.cos((camera.fieldOfView * Math.PI) / 360) / (2 * camera.framingRadius);
export const solarFallbackPerspective = (camera: SolarCamera) =>
  1 / (2 * Math.tan((camera.fieldOfView * Math.PI) / 360));
/** The camera distance that fits the framing radius in the shorter viewport dimension. */
export const solarCameraDistance = (camera: SolarCamera, aspect: number) =>
  (camera.framingRadius / Math.sin((Math.PI * camera.fieldOfView) / 360)) * Math.max(1, 1 / aspect);

export function solarCameraPoint(camera: SolarCamera, point: { x: number; y: number; z: number }) {
  const elevation = (camera.elevation * Math.PI) / 180;
  return {
    x: point.x,
    y: point.y * Math.cos(elevation) - point.z * Math.sin(elevation),
    depth: point.y * Math.sin(elevation) + point.z * Math.cos(elevation),
  };
}

export const solarPhase = (planet: SolarPlanet, layout: SolarLayout) =>
  ((layout === "portrait" ? planet.portraitPhase : planet.phase) * Math.PI) / 180;

/** Mean anomaly in radians to a heliocentric position, solving Kepler's equation. */
export function solarOrbitPoint(planet: SolarPlanet, angle: number) {
  let eccentricAnomaly = angle;
  for (let iteration = 0; iteration < 5; iteration++)
    eccentricAnomaly -=
      (eccentricAnomaly - planet.eccentricity * Math.sin(eccentricAnomaly) - angle) /
      (1 - planet.eccentricity * Math.cos(eccentricAnomaly));
  const a = planet.orbitRadius;
  const x = a * (Math.cos(eccentricAnomaly) - planet.eccentricity);
  const z = a * Math.sqrt(1 - planet.eccentricity ** 2) * Math.sin(eccentricAnomaly);
  const inclination = (planet.inclination * Math.PI) / 180;
  const node = (planet.ascendingNode * Math.PI) / 180;
  return {
    x: x * Math.cos(node) - z * Math.cos(inclination) * Math.sin(node),
    y: z * Math.sin(inclination),
    z: x * Math.sin(node) + z * Math.cos(inclination) * Math.cos(node),
  };
}

/** The Moon's offset from Earth for an orbital angle; shared by WebGL and the fallback. */
export function solarMoonOffset(angle: number) {
  const inclination = (solarMoon.inclination * Math.PI) / 180;
  const z = Math.sin(angle) * solarMoon.distance;
  return {
    x: Math.cos(angle) * solarMoon.distance,
    y: z * Math.sin(inclination),
    z: z * Math.cos(inclination),
  };
}
