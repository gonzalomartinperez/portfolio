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
  start(): void;
  stop(): void;
  dispose(): void;
  setExpansion(progress: number): void;
  setPointer(pointer: { x: number; y: number } | null): void;
  setLight(light: boolean): void;
  setTime(seconds: number | null): void;
};

const vertexShader = `
attribute float seed;
uniform float time;
uniform float progress;
uniform float pixelRatio;
uniform float aspect;
uniform vec2 pointer;
varying float depth;
varying float sparkle;
void main() {
  vec3 p = position;
  float angle = time * 0.035;
  p.xz = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * p.xz;
  p *= 1.0 + sin(time * 0.45 + seed * 6.283) * 0.012;
  vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
  vec4 projected = projectionMatrix * viewPosition;
  vec2 screen = projected.xy / projected.w;
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
void main() {
  float highlight = smoothstep(0.35, 0.85, sparkle + depth * 0.18);
  vec3 color = mix(farColor, nearColor, highlight);
  gl_FragColor = vec4(color, 0.28 + depth * 0.58);
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
      nearColor: { value: new Color("#c0efff") },
      farColor: { value: new Color("#2777e9") },
    },
  });
  const points = new Points(geometry, material);
  scene.add(points);
  let progress = 0;
  let frame = 0;
  let lastTime = 0;
  let elapsed = 0;
  let fixedTime: number | null = null;
  let width = 1;
  let height = 1;
  const pointer = new Vector2(10, 10);
  const updateCamera = () => {
    const expansion = Math.min(1, Math.max(0, (progress - 0.2) / 0.35));
    const startDistance = Math.max(5.6, 3 / camera.aspect);
    camera.position.z = startDistance + (0.4 - startDistance) * expansion;
    camera.setViewOffset(width, height, 0, -height * 0.18 * (1 - expansion), width, height);
    camera.updateProjectionMatrix();
    material.uniforms.progress.value = progress;
  };
  const render = (now: number, advance = false) => {
    const delta = advance && lastTime ? Math.min((now - lastTime) / 1000, 0.05) : 0;
    if (advance) lastTime = now;
    elapsed += delta;
    material.uniforms.time.value = fixedTime ?? elapsed;
    material.uniforms.pointer.value.lerp(pointer, 1 - Math.exp(-delta * 9));
    renderer.render(scene, camera);
  };
  const tick = (now: number) => {
    render(now, true);
    frame = requestAnimationFrame(tick);
  };
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    width = Math.max(1, rect.width);
    height = Math.max(1, rect.height);
    const ratio = Math.min(devicePixelRatio || 1, 1.75);
    renderer.setPixelRatio(ratio);
    renderer.setSize(width, height, false);
    material.uniforms.pixelRatio.value = ratio;
    camera.aspect = width / height;
    material.uniforms.aspect.value = camera.aspect;
    updateCamera();
    render(performance.now());
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();
  return {
    start() {
      if (!frame && fixedTime === null) {
        lastTime = 0;
        frame = requestAnimationFrame(tick);
      }
    },
    stop() {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
    },
    setExpansion(value) {
      progress = value;
      updateCamera();
      if (!frame) render(performance.now());
    },
    setPointer(value) {
      pointer.set(value?.x ?? 10, value?.y ?? 10);
    },
    setLight(light) {
      material.uniforms.nearColor.value.set(light ? "#164886" : "#e3ffff");
      material.uniforms.farColor.value.set(light ? "#437ebc" : "#559cee");
      material.blending = light ? NormalBlending : AdditiveBlending;
      material.needsUpdate = true;
      render(performance.now());
    },
    setTime(value) {
      fixedTime = value;
      render(performance.now());
    },
    dispose() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    },
  };
}
