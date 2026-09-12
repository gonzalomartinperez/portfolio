import {
  buildConstellation,
  CAMERA_DISTANCE,
  FOCAL_LENGTH,
  POINT_COUNT_COMPACT,
  POINT_COUNT_DESKTOP,
} from "./constellation";

/**
 * WebGL2 point-cloud renderer for the hero.
 *
 * Written directly against the API rather than pulling in a 3D library: this is one element on
 * one route, and the nearest alternative costs ~185 KB gzipped. See docs/research for the
 * comparison.
 *
 * Displacement happens entirely in the vertex shader, driven by two uniforms. The CPU eases
 * those uniforms rather than touching per-point data, so pointer interaction costs nothing per
 * point and recovery can be shaped independently of frame rate.
 */

const VERTEX_SHADER = `#version 300 es
precision highp float;

in vec3 aPosition;
in float aSeed;

uniform float uTime;
uniform vec2 uPointer;
uniform float uPointerStrength;
uniform float uAspect;
uniform float uPointScale;
uniform float uInfluenceRadius;
uniform float uExpansion;

out float vDepth;

void main() {
  float angle = uTime * 0.11;
  float c = cos(angle);
  float s = sin(angle);
  vec3 spun = vec3(
    aPosition.x * c + aPosition.z * s,
    aPosition.y,
    -aPosition.x * s + aPosition.z * c
  );

  // Expansion pushes each point out along its own radius, with per-point variance so the
  // shell dissolves unevenly instead of inflating like a balloon.
  spun *= 1.0 + uExpansion * (1.1 + aSeed * 2.4);

  // A slow tilt on the other axis: a sphere rotating on one axis alone reads as a flat disc.
  float tilt = sin(uTime * 0.07) * 0.28;
  float ct = cos(tilt);
  float st = sin(tilt);
  vec3 p = vec3(spun.x, spun.y * ct - spun.z * st, spun.y * st + spun.z * ct);

  // A small per-point drift so the cloud breathes instead of rotating rigidly.
  p.y += sin(uTime * 0.35 + aSeed * 6.2831) * 0.022;

  float distance = max(${CAMERA_DISTANCE.toFixed(1)} - p.z, 0.05);
  float scale = ${FOCAL_LENGTH.toFixed(1)} / distance;
  vec2 projected = p.xy * scale;

  // Displacement is computed in aspect-corrected space so the falloff stays circular.
  vec2 corrected = vec2(projected.x, projected.y / uAspect);
  vec2 toPoint = corrected - uPointer;
  float pointerDistance = length(toPoint);
  float falloff = smoothstep(uInfluenceRadius, 0.0, pointerDistance);
  vec2 direction = pointerDistance > 0.0001 ? toPoint / pointerDistance : vec2(0.0, 1.0);
  float variation = 0.7 + aSeed * 0.6;
  corrected += direction * falloff * uPointerStrength * 0.38 * variation;

  gl_Position = vec4(corrected.x, corrected.y * uAspect, 0.0, 1.0);
  gl_PointSize = uPointScale * scale * (0.6 + aSeed * 0.7) * (1.0 - uExpansion * 0.35);
  vDepth = clamp((p.z + 1.0) * 0.5, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `#version 300 es
precision highp float;

in float vDepth;
out vec4 fragColor;

uniform vec3 uFarColor;
uniform vec3 uNearColor;
uniform float uExpansion;

void main() {
  vec2 offset = gl_PointCoord * 2.0 - 1.0;
  float radial = dot(offset, offset);
  if (radial > 1.0) discard;

  float edge = smoothstep(1.0, 0.25, radial);
  vec3 color = mix(uFarColor, uNearColor, vDepth);
  fragColor = vec4(color, edge * (0.30 + vDepth * 0.48) * (1.0 - uExpansion * 0.55));
}
`;

export type FieldPalette = {
  near: [number, number, number];
  far: [number, number, number];
  /** Additive blending glows on a dark ground; a light ground needs ordinary alpha blending. */
  additive: boolean;
};

const DEFAULT_PALETTE: FieldPalette = {
  near: [0x4c / 255, 0xd6 / 255, 0xff / 255],
  far: [0x78 / 255, 0x84 / 255, 0x9a / 255],
  additive: true,
};

const MAX_FRAME_SECONDS = 0.05;
const POINTER_ENGAGE_RATE = 4.5;
const POINTER_RELEASE_RATE = 1.7;

export type FieldEngine = {
  start: () => void;
  stop: () => void;
  setPointer: (point: { x: number; y: number } | null) => void;
  setPalette: (palette: FieldPalette) => void;
  /** 0 keeps the shell intact; 1 disperses it into a field. */
  setExpansion: (value: number) => void;
  dispose: () => void;
};

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

function link(gl: WebGL2RenderingContext) {
  const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
  if (!vertex || !fragment) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }
  return program;
}

/**
 * Returns `null` when WebGL2 is unavailable or the program fails to build, which the caller
 * treats as "keep the static fallback" rather than as an error.
 */
export function createFieldEngine(canvas: HTMLCanvasElement): FieldEngine | null {
  const context = canvas.getContext("webgl2", {
    alpha: true,
    antialias: false,
    depth: false,
    powerPreference: "default",
    premultipliedAlpha: false,
  });
  return context ? createEngine(canvas, context) : null;
}

function createEngine(canvas: HTMLCanvasElement, gl: WebGL2RenderingContext): FieldEngine | null {
  const compact = window.matchMedia("(width < 40rem)").matches;
  const count = compact ? POINT_COUNT_COMPACT : POINT_COUNT_DESKTOP;
  const constellation = buildConstellation(count);

  let program: WebGLProgram | null = null;
  let vao: WebGLVertexArrayObject | null = null;
  let positionBuffer: WebGLBuffer | null = null;
  let seedBuffer: WebGLBuffer | null = null;
  let uniforms: Record<string, WebGLUniformLocation | null> = {};

  let frame = 0;
  let running = false;
  let contextLost = false;
  let elapsed = 0;
  let lastTimestamp = 0;

  let palette: FieldPalette = DEFAULT_PALETTE;

  const pointer = { x: 0, y: 0 };
  const pointerTarget = { x: 0, y: 0, active: false };
  let pointerStrength = 0;
  let expansion = 0;
  let expansionTarget = 0;

  function buildResources() {
    program = link(gl);
    if (!program) return false;

    vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, constellation.positions, gl.STATIC_DRAW);
    const positionLocation = gl.getAttribLocation(program, "aPosition");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0);

    seedBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, seedBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, constellation.seeds, gl.STATIC_DRAW);
    const seedLocation = gl.getAttribLocation(program, "aSeed");
    gl.enableVertexAttribArray(seedLocation);
    gl.vertexAttribPointer(seedLocation, 1, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);

    uniforms = {};
    for (const name of [
      "uTime",
      "uPointer",
      "uPointerStrength",
      "uAspect",
      "uPointScale",
      "uInfluenceRadius",
      "uExpansion",
      "uFarColor",
      "uNearColor",
    ]) {
      uniforms[name] = gl.getUniformLocation(program, name);
    }

    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.clearColor(0, 0, 0, 0);
    return true;
  }

  function releaseResources() {
    if (positionBuffer) gl.deleteBuffer(positionBuffer);
    if (seedBuffer) gl.deleteBuffer(seedBuffer);
    if (vao) gl.deleteVertexArray(vao);
    if (program) gl.deleteProgram(program);
    positionBuffer = null;
    seedBuffer = null;
    vao = null;
    program = null;
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    const cap = 2;
    const ratio = Math.min(window.devicePixelRatio || 1, cap);
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    gl.viewport(0, 0, width, height);
  }

  function render(seconds: number) {
    if (!program || contextLost) return;
    resize();

    const aspect = canvas.width / Math.max(canvas.height, 1);
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    // Relative to canvas size, so density reads the same on a phone as on a desktop.
    const pointScale = (canvas.width / 640) * 3.4 * ratio;

    gl.blendFunc(gl.SRC_ALPHA, palette.additive ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // biome-ignore lint/correctness/useHookAtTopLevel: gl.useProgram is the WebGL call, not a React hook.
    gl.useProgram(program);
    gl.bindVertexArray(vao);

    gl.uniform1f(uniforms.uTime ?? null, seconds);
    gl.uniform2f(uniforms.uPointer ?? null, pointer.x, pointer.y);
    gl.uniform1f(uniforms.uPointerStrength ?? null, pointerStrength);
    gl.uniform1f(uniforms.uAspect ?? null, aspect);
    gl.uniform1f(uniforms.uPointScale ?? null, Math.max(1.6, pointScale));
    gl.uniform1f(uniforms.uInfluenceRadius ?? null, 0.42);
    gl.uniform1f(uniforms.uExpansion ?? null, expansion);
    gl.uniform3fv(uniforms.uFarColor ?? null, palette.far);
    gl.uniform3fv(uniforms.uNearColor ?? null, palette.near);

    gl.drawArrays(gl.POINTS, 0, constellation.count);
    gl.bindVertexArray(null);
  }

  function tick(timestamp: number) {
    if (!running) return;
    const delta = lastTimestamp
      ? Math.min((timestamp - lastTimestamp) / 1000, MAX_FRAME_SECONDS)
      : 0;
    lastTimestamp = timestamp;
    elapsed += delta;

    // Easing the influence rather than the points gives a settled recovery for free.
    const target = pointerTarget.active ? 1 : 0;
    const rate = pointerTarget.active ? POINTER_ENGAGE_RATE : POINTER_RELEASE_RATE;
    pointerStrength += (target - pointerStrength) * Math.min(1, delta * rate);
    expansion += (expansionTarget - expansion) * Math.min(1, delta * 6);
    pointer.x += (pointerTarget.x - pointer.x) * Math.min(1, delta * 8);
    pointer.y += (pointerTarget.y - pointer.y) * Math.min(1, delta * 8);

    render(elapsed);
    frame = requestAnimationFrame(tick);
  }

  function handleContextLost(event: Event) {
    // Normative: without preventDefault the context is never restored.
    event.preventDefault();
    contextLost = true;
    running = false;
    cancelAnimationFrame(frame);
    frame = 0;
  }

  function handleContextRestored() {
    contextLost = false;
    releaseResources();
    if (buildResources()) {
      start();
    }
  }

  canvas.addEventListener("webglcontextlost", handleContextLost);
  canvas.addEventListener("webglcontextrestored", handleContextRestored);

  if (!buildResources()) {
    canvas.removeEventListener("webglcontextlost", handleContextLost);
    canvas.removeEventListener("webglcontextrestored", handleContextRestored);
    releaseResources();
    return null;
  }

  function start() {
    if (running || contextLost) return;
    running = true;
    lastTimestamp = 0;
    frame = requestAnimationFrame(tick);
  }

  function stop() {
    running = false;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  }

  // One frame immediately, so the canvas is never blank before the first tick.
  render(0);

  return {
    start,
    stop,
    setExpansion(value) {
      expansionTarget = Math.max(0, Math.min(1, value));
      if (!running) render(elapsed);
    },
    setPalette(next) {
      palette = next;
      if (!running) render(elapsed);
    },
    setPointer(point) {
      if (!point) {
        pointerTarget.active = false;
        return;
      }
      pointerTarget.active = true;
      pointerTarget.x = point.x;
      pointerTarget.y = point.y;
    },
    dispose() {
      stop();
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      canvas.removeEventListener("webglcontextrestored", handleContextRestored);
      releaseResources();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    },
  };
}
