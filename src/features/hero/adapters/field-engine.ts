import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  NormalBlending,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "three";
import { buildConstellation } from "../domain/constellation";

export type FieldEngine = {
  render(deltaSeconds: number): void;
  resize(): void;
  setQuality(level: number): void;
  dispose(): void;
  setExpansion(progress: number): void;
  setRestingRegion(top: number, bottom: number): { centerY: number; radius: number };
  setPointer(pointer: { x: number; y: number } | null): void;
  setLight(light: boolean): void;
  setTime(seconds: number | null): void;
  setPulse(phase: number, avatar: boolean, origin: { x: number; y: number }): void;
  containsPoint(x: number, y: number): boolean;
};

const vertexShader = `
attribute float seed;
uniform float time;
uniform float progress;
uniform float pixelRatio;
uniform float aspect;
uniform vec2 pointer;
uniform float pulsePhase;
uniform float pulseReach;
uniform float avatarPulse;
uniform vec2 pulseOrigin;
uniform float pointerStrength;
uniform float restDistance;
varying float depth;
varying float sparkle;
varying float waveLight;
varying float rim;
varying float shimmer;
varying float spriteSize;
void main() {
  vec3 p = position;
  float angle = time * 0.035;
  p.xz = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * p.xz;
  p *= 1.0 + sin(time * 0.45 + seed * 6.283) * 0.012;
  float envelope = pow(sin(pulsePhase * 3.14159265), 2.0);
  float lift = 0.0;
  float shellWave = 0.0;
  if (avatarPulse > 0.0 && pulsePhase > 0.0 && pulsePhase < 1.0) {
    lift = envelope * exp(-pulsePhase * 1.4) * 2.0;
    float latitude = acos(clamp(p.y, -1.0, 1.0));
    shellWave = exp(-pow((latitude - pulsePhase * 3.14159265) * 3.5, 2.0)) * lift;
  }
  float twist = lift * (0.55 + p.y * 0.4);
  p.xz = mat2(cos(twist), -sin(twist), sin(twist), cos(twist)) * p.xz;
  p *= 1.0 + lift * 0.12 + shellWave * 0.16;
  p.z += shellWave * 0.12;
  vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
  vec4 projected = projectionMatrix * viewPosition;
  vec2 screen = projected.xy / projected.w;
  vec2 pulseDelta = (screen - pulseOrigin) * vec2(aspect, 1.0);
  float radius = length(pulseDelta);
  float waveWidth = mix(max(pulseReach * 0.12, 0.035), 1.0 / 7.0, avatarPulse);
  float ring = exp(-pow((radius - pulsePhase * pulseReach) / waveWidth, 2.0)) * envelope;
  projected.xy += (screen - pulseOrigin) * ring * (0.22 + avatarPulse * 0.18) * projected.w;
  waveLight = ring * 0.18 + shellWave * 0.24;
  vec2 delta = screen - pointer;
  vec2 isotropicDelta = delta * vec2(aspect, 1.0);
  float influence = exp(-dot(isotropicDelta, isotropicDelta) * 35.0) * pointerStrength;
  projected.xy += delta * influence * 0.28 * projected.w;
  gl_Position = projected;
  depth = (p.z + 1.0) * 0.5;
  sparkle = seed;
  // The shell's silhouette catches light; points facing the camera stay calm.
  vec3 normal = normalize(mat3(modelViewMatrix) * p);
  rim = pow(1.0 - abs(normal.z), 2.0);
  // Deterministic scintillation from the seed; a fixed time freezes it for captures.
  shimmer = 0.88 + 0.12 * sin(time * (1.1 + seed * 2.3) + seed * 41.0);
  waveLight += influence * 0.22;
  // Perspective size: subtle depth at rest, real parallax only while the camera flies through.
  // Inside the shell every point is near, so the growth recedes before the toolkit settles.
  float flight = smoothstep(0.2, 0.38, progress) * (1.0 - smoothstep(0.44, 0.58, progress));
  float nearness = restDistance / max(0.05, -viewPosition.z);
  float perspective = clamp(nearness, 0.85, mix(1.2, 4.0, flight));
  float limit = mix(3.0, 5.5, flight) * max(1.0, pixelRatio * 0.6);
  float size = (1.0 + seed * 0.7) * pixelRatio * (1.0 + progress * 0.25) * perspective;
  gl_PointSize = clamp(size, 1.0, limit);
  spriteSize = gl_PointSize;
}
`;
const fragmentShader = `
uniform vec3 nearColor;
uniform vec3 farColor;
varying float depth;
varying float sparkle;
varying float waveLight;
varying float rim;
varying float shimmer;
varying float spriteSize;
void main() {
  // Small points keep the designed square grain; enlarged ones become soft round sprites.
  float roundness = smoothstep(2.5, 4.0, spriteSize);
  float distanceFromCentre = length(gl_PointCoord - 0.5) * 2.0;
  float sprite = mix(1.0, 1.0 - smoothstep(0.45, 1.0, distanceFromCentre), roundness);
  if (sprite <= 0.0) discard;
  float highlight = smoothstep(0.35, 0.85, sparkle + depth * 0.18);
  vec3 color = mix(farColor, nearColor, highlight);
  // Pulse waves and the hover dent tint toward the near colour, not just brighter alpha.
  color = mix(color, nearColor, clamp(waveLight * 2.5, 0.0, 0.6));
  float alpha = (0.28 + depth * 0.58 + rim * 0.16 + waveLight) * shimmer;
  gl_FragColor = vec4(color, min(1.0, alpha) * sprite);
  #include <colorspace_fragment>
}
`;

export function createFieldEngine(canvas: HTMLCanvasElement): FieldEngine {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  });
  const scene = new Scene();
  const camera = new PerspectiveCamera(40, 1, 0.01, 100);
  const compact = matchMedia("(max-width: 767px)").matches;
  const data = buildConstellation(compact ? 12000 : 24000);
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(data.positions, 3));
  geometry.setAttribute("seed", new BufferAttribute(data.seeds, 1));
  // Spread reduced draw ranges over the whole shell, not its latitude-ordered prefix.
  geometry.setIndex(
    new BufferAttribute(
      Uint16Array.from({ length: data.count }, (_, index) => (index * 7919) % data.count),
      1,
    ),
  );
  const material = new ShaderMaterial({
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    uniforms: {
      time: { value: 0 },
      progress: { value: 0 },
      pixelRatio: { value: 1 },
      aspect: { value: 1 },
      pointer: { value: new Vector2(10, 10) },
      pulsePhase: { value: 0 },
      pulseReach: { value: 1.65 },
      avatarPulse: { value: 0 },
      pulseOrigin: { value: new Vector2() },
      pointerStrength: { value: 0 },
      restDistance: { value: 5 },
      nearColor: { value: new Color("#c0efff") },
      farColor: { value: new Color("#2777e9") },
    },
  });
  const points = new Points(geometry, material);
  scene.add(points);
  let progress = 0;
  let elapsed = 0;
  let fixedTime: number | null = null;
  let width = 1;
  let height = 1;
  let pixelRatio = 0;
  let cameraExpansion = -1;
  let restingCenter = 0.68;
  let fittingDistance = 0;
  const minimumRestingDistance = 5;
  const restingDistance = () =>
    Math.max(minimumRestingDistance, (width < 768 ? 2.8 : 3) / camera.aspect, fittingDistance);
  const pointer = new Vector2(10, 10);
  // The hover dent fades in and out in place instead of sliding off to the parked pointer.
  let pointerTarget = 0;
  let pointerStrength = 0;
  const updateCamera = () => {
    const expansion = Math.min(1, Math.max(0, (progress - 0.2) / 0.35));
    material.uniforms.progress.value = progress;
    if (cameraExpansion === expansion) return;
    cameraExpansion = expansion;
    const startDistance = restingDistance();
    material.uniforms.restDistance.value = startDistance;
    camera.position.z = startDistance + (0.4 - startDistance) * expansion;
    camera.setViewOffset(
      width,
      height,
      0,
      -height * (restingCenter - 0.5) * (1 - expansion),
      width,
      height,
    );
    camera.updateProjectionMatrix();
  };
  let quality = 0;
  const render = (delta = 0) => {
    elapsed += delta;
    material.uniforms.time.value = fixedTime ?? elapsed;
    pointerStrength += (pointerTarget - pointerStrength) * (1 - Math.exp(-delta * 9));
    if (pointerTarget > 0) material.uniforms.pointer.value.lerp(pointer, 1 - Math.exp(-delta * 9));
    else if (pointerStrength < 0.02) {
      pointerStrength = 0;
      material.uniforms.pointer.value.copy(pointer);
    }
    material.uniforms.pointerStrength.value = pointerStrength;
    renderer.render(scene, camera);
  };
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const nextWidth = Math.max(1, rect.width);
    const nextHeight = Math.max(1, rect.height);
    const ratio = Math.min(devicePixelRatio || 1, [1.75, 1.4, 1][quality]);
    if (width === nextWidth && height === nextHeight && pixelRatio === ratio) return;
    width = nextWidth;
    height = nextHeight;
    pixelRatio = ratio;
    renderer.setDrawingBufferSize(width, height, ratio);
    material.uniforms.pixelRatio.value = ratio;
    camera.aspect = width / height;
    material.uniforms.aspect.value = camera.aspect;
    cameraExpansion = -1;
    updateCamera();
    render();
  };
  resize();
  return {
    render,
    resize,
    setRestingRegion(top, bottom) {
      const radius = Math.max(24, (bottom - top) / 2);
      const centerY = (top + bottom) / 2;
      restingCenter = centerY / height;
      fittingDistance = Math.sqrt(
        1 + (height / (2 * Math.tan((camera.fov * Math.PI) / 360) * radius)) ** 2,
      );
      cameraExpansion = -1;
      updateCamera();
      render();
      const actualRadius =
        height /
        (2 * Math.tan((camera.fov * Math.PI) / 360) * Math.sqrt(restingDistance() ** 2 - 1));
      return { centerY, radius: actualRadius };
    },
    setQuality(level) {
      if (quality === level) return;
      quality = level;
      geometry.setDrawRange(0, Math.round(data.seeds.length * [1, 0.75, 0.5][quality]));
      resize();
    },
    setExpansion(value) {
      if (progress === value) return;
      progress = value;
      updateCamera();
    },
    setPointer(value) {
      pointer.set(value?.x ?? 10, value?.y ?? 10);
      if (value && pointerTarget === 0 && pointerStrength < 0.01)
        material.uniforms.pointer.value.copy(pointer);
      pointerTarget = value ? 1 : 0;
    },
    setPulse(phase, avatar, origin) {
      material.uniforms.pulsePhase.value = phase;
      material.uniforms.avatarPulse.value = avatar ? 1 : 0;
      material.uniforms.pulseOrigin.value.set(origin.x, origin.y);
      const radius =
        camera.position.z <= 1
          ? 2.4
          : 1 / (Math.tan((camera.fov * Math.PI) / 360) * Math.sqrt(camera.position.z ** 2 - 1));
      const centerY = -2 * (restingCenter - 0.5) * (1 - cameraExpansion);
      material.uniforms.pulseReach.value = avatar
        ? 1.65
        : Math.min(2.4, radius + Math.hypot(origin.x * camera.aspect, origin.y - centerY));
    },
    containsPoint(x, y) {
      if (Math.abs(x) > 1 || Math.abs(y) > 1 || progress >= 0.8) return false;
      if (camera.position.z <= 1) return true;
      const radius =
        1 / (Math.tan((camera.fov * Math.PI) / 360) * Math.sqrt(camera.position.z ** 2 - 1));
      const centreY = -2 * (restingCenter - 0.5) * (1 - cameraExpansion);
      return Math.hypot(x * camera.aspect, y - centreY) <= radius;
    },
    setLight(light) {
      material.uniforms.nearColor.value.set(light ? "#164886" : "#e3ffff");
      material.uniforms.farColor.value.set(light ? "#437ebc" : "#559cee");
      // Blending is draw state, so switching it never recompiles the program.
      material.blending = light ? NormalBlending : AdditiveBlending;
      render();
    },
    setTime(value) {
      fixedTime = value;
      render();
    },
    dispose() {
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
