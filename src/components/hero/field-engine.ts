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
import { buildConstellation } from "./constellation";

export type FieldEngine = {
  render(deltaSeconds: number): void;
  resize(): void;
  setQuality(level: number): void;
  dispose(): void;
  setExpansion(progress: number): void;
  setPointer(pointer: { x: number; y: number } | null): void;
  setLight(light: boolean): void;
  setTime(seconds: number | null): void;
  setPulse(phase: number, avatar: boolean, origin: { x: number; y: number }): void;
  containsPoint(x: number, y: number): boolean;
  setReadingBoundary(y: number): void;
};

const vertexShader = `
attribute float seed;
uniform float time;
uniform float progress;
uniform float pixelRatio;
uniform float aspect;
uniform vec2 pointer;
uniform float pulsePhase;
uniform float avatarPulse;
uniform vec2 pulseOrigin;
uniform float readingBoundary;
varying float depth;
varying float sparkle;
varying float waveLight;
void main() {
  vec3 p = position;
  float angle = time * 0.035;
  p.xz = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * p.xz;
  p *= 1.0 + sin(time * 0.45 + seed * 6.283) * 0.012;
  vec4 restingProjection = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  float envelope = pow(sin(pulsePhase * 3.14159265), 2.0);
  float twist = envelope * avatarPulse * (0.65 + p.y * 0.5);
  p.xz = mat2(cos(twist), -sin(twist), sin(twist), cos(twist)) * p.xz;
  p *= 1.0 + envelope * avatarPulse * 0.16;
  vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
  vec4 projected = projectionMatrix * viewPosition;
  vec2 screen = projected.xy / projected.w;
  vec2 pulseDelta = (screen - pulseOrigin) * vec2(aspect, 1.0);
  float radius = length(pulseDelta);
  float ring = exp(-pow((radius - pulsePhase * 1.65) * 7.0, 2.0)) * envelope;
  projected.xy += (screen - pulseOrigin) * ring * (0.22 + avatarPulse * 0.18) * projected.w;
  float readingGuard = smoothstep(readingBoundary - 0.22, readingBoundary, restingProjection.y / restingProjection.w);
  projected = mix(projected, restingProjection, readingGuard * (1.0 - smoothstep(0.0, 0.2, progress)));
  waveLight = ring * 0.18;
  vec2 delta = screen - pointer;
  vec2 isotropicDelta = delta * vec2(aspect, 1.0);
  float influence = exp(-dot(isotropicDelta, isotropicDelta) * 35.0);
  projected.xy += delta * influence * 0.28 * projected.w;
  gl_Position = projected;
  depth = (p.z + 1.0) * 0.5;
  sparkle = seed;
  gl_PointSize = clamp((1.0 + seed * 0.7) * pixelRatio * (1.0 + progress * 0.25), 1.0, 3.0);
}
`;
const fragmentShader = `
uniform vec3 nearColor;
uniform vec3 farColor;
varying float depth;
varying float sparkle;
varying float waveLight;
void main() {
  float highlight = smoothstep(0.35, 0.85, sparkle + depth * 0.18);
  vec3 color = mix(farColor, nearColor, highlight);
  gl_FragColor = vec4(color, min(1.0, 0.28 + depth * 0.58 + waveLight));
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
      avatarPulse: { value: 0 },
      pulseOrigin: { value: new Vector2() },
      readingBoundary: { value: 1 },
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
  const pointer = new Vector2(10, 10);
  const updateCamera = () => {
    const expansion = Math.min(1, Math.max(0, (progress - 0.2) / 0.35));
    material.uniforms.progress.value = progress;
    if (cameraExpansion === expansion) return;
    cameraExpansion = expansion;
    const startDistance = Math.max(5.6, 3 / camera.aspect);
    camera.position.z = startDistance + (0.4 - startDistance) * expansion;
    camera.setViewOffset(width, height, 0, -height * 0.18 * (1 - expansion), width, height);
    camera.updateProjectionMatrix();
  };
  let quality = 0;
  const render = (delta = 0) => {
    elapsed += delta;
    material.uniforms.time.value = fixedTime ?? elapsed;
    material.uniforms.pointer.value.lerp(pointer, 1 - Math.exp(-delta * 9));
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
    },
    setPulse(phase, avatar, origin) {
      material.uniforms.pulsePhase.value = phase;
      material.uniforms.avatarPulse.value = avatar ? 1 : 0;
      material.uniforms.pulseOrigin.value.set(origin.x, origin.y);
    },
    containsPoint(x, y) {
      if (Math.abs(x) > 1 || Math.abs(y) > 1 || progress >= 0.8) return false;
      if (camera.position.z <= 1) return true;
      const radius =
        1 / (Math.tan((camera.fov * Math.PI) / 360) * Math.sqrt(camera.position.z ** 2 - 1));
      const centreY = -0.36 * (1 - cameraExpansion);
      return Math.hypot(x * camera.aspect, y - centreY) <= radius;
    },
    setReadingBoundary(y) {
      material.uniforms.readingBoundary.value = y;
    },
    setLight(light) {
      material.uniforms.nearColor.value.set(light ? "#164886" : "#e3ffff");
      material.uniforms.farColor.value.set(light ? "#437ebc" : "#559cee");
      material.blending = light ? NormalBlending : AdditiveBlending;
      material.needsUpdate = true;
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
