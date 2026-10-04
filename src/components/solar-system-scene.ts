/** Artistic space and time compression; these orbits are not an ephemeris. */
export const solarPlanets = [
  {
    name: "mercury",
    diameter: 30,
    mobileDiameter: 17,
    x: 0.12,
    y: 0.145,
    period: 140,
    phase: 215,
    tilt: 0.034,
    spin: 220,
  },
  {
    name: "venus",
    diameter: 38,
    mobileDiameter: 21,
    x: 0.19,
    y: 0.19,
    period: 210,
    phase: 20,
    tilt: 177.4,
    spin: 400,
  },
  {
    name: "earth",
    diameter: 44,
    mobileDiameter: 24,
    x: 0.25,
    y: 0.22,
    period: 280,
    phase: 140,
    tilt: 23.4,
    spin: 140,
  },
  {
    name: "mars",
    diameter: 34,
    mobileDiameter: 18,
    x: 0.285,
    y: 0.25,
    period: 360,
    phase: 325,
    tilt: 25.2,
    spin: 150,
  },
  {
    name: "jupiter",
    diameter: 90,
    mobileDiameter: 48,
    x: 0.32,
    y: 0.28,
    period: 450,
    phase: 70,
    tilt: 3.1,
    spin: 75,
  },
  {
    name: "saturn",
    diameter: 72,
    mobileDiameter: 40,
    x: 0.36,
    y: 0.31,
    period: 560,
    phase: 190,
    mobilePhase: 30,
    tilt: 26.7,
    spin: 85,
  },
  {
    name: "uranus",
    diameter: 48,
    mobileDiameter: 28,
    x: 0.39,
    y: 0.34,
    period: 680,
    phase: 285,
    tilt: 97.8,
    spin: 120,
  },
  {
    name: "neptune",
    diameter: 48,
    mobileDiameter: 28,
    x: 0.42,
    y: 0.37,
    period: 800,
    phase: 110,
    mobilePhase: 145,
    tilt: 28.3,
    spin: 110,
  },
  {
    name: "pluto",
    diameter: 28,
    mobileDiameter: 17,
    x: 0.445,
    y: 0.4,
    period: 960,
    phase: 250,
    tilt: 119.6,
    spin: 220,
  },
].map((planet, index) => ({
  ...planet,
  orbitRadius: [10, 13, 16, 19, 25, 30, 35, 40, 45][index],
  radius: [0.4, 0.65, 0.7, 0.55, 1.7, 1.45, 1, 1, 0.35][index],
  eccentricity: [0.206, 0.007, 0.017, 0.093, 0.049, 0.057, 0.046, 0.011, 0.249][index],
  inclination: [7, 3.4, 0, 1.85, 1.3, 2.49, 0.77, 1.77, 17.16][index],
  ascendingNode: [48.3, 76.7, 0, 49.6, 100.5, 113.7, 74, 131.8, 110.3][index],
}));

export type SolarPlanet = (typeof solarPlanets)[number];
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
export type SolarTextureVersions = Readonly<Record<string, string>>;
export const solarTextureUrl = (name: string, versions: SolarTextureVersions) => {
  const version = versions[name];
  if (!version) throw new Error(`Missing solar texture version: ${name}`);
  return `/images/solar-system/${name}.webp?v=${version}`;
};

/** Shared initial camera projection, expressed in container units for server-rendered CSS. */
export const solarCamera = { fieldOfView: 35, elevation: 35, framingRadius: 60 } as const;
export const solarFallbackScale =
  Math.cos((solarCamera.fieldOfView * Math.PI) / 360) / (2 * solarCamera.framingRadius);
export const solarFallbackPerspective =
  1 / (2 * Math.tan((solarCamera.fieldOfView * Math.PI) / 360));
export function solarCameraPoint(point: { x: number; y: number; z: number }) {
  const elevation = (solarCamera.elevation * Math.PI) / 180;
  return {
    x: point.x,
    y: point.y * Math.cos(elevation) - point.z * Math.sin(elevation),
    depth: point.y * Math.sin(elevation) + point.z * Math.cos(elevation),
  };
}
export const solarPhase = (planet: SolarPlanet, _mobile: boolean) => (planet.phase * Math.PI) / 180;

export function solarOrbitPoint(
  planet: SolarPlanet,
  angle: number,
  _width = 0,
  _height = 0,
  _mobile = false,
) {
  // Solve Kepler's equation; spatial and temporal scales are deliberately compressed.
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
