import {
  CustomBlending,
  DoubleSide,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  MaxEquation,
  Mesh,
  OneFactor,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  type Texture,
  Vector2,
  type WebGLRenderer,
  WebGLRenderTarget,
} from "three";

/** Elements whose text the decorative scene must not compete with, in content and footer. */
const blockSelector =
  "h1, h2, h3, h4, h5, h6, p, li, dt, dd, figcaption, blockquote, label, th, td, summary";
/** The footer sets short labels in spans and links rather than paragraphs. */
const textSelector = `main :is(${blockSelector}), footer :is(${blockSelector}, span, a)`;
const capacity = 192;
/** The mask is smooth by construction, so a quarter-resolution target is enough. */
const maskScale = 0.25;
/** Feather in CSS pixels; narrow screens use less so the scene shows between paragraphs. */
const featherCss = (width: number) => (width < 640 ? 40 : 80);

/**
 * GLSL shared by every solar material: `readingFactor()` returns how much of a fragment stays
 * visible under reading text. Each material chooses its own `readingStrength`, so the bright Sun
 * recedes almost fully behind a paragraph while faint stars barely change.
 */
export const readingChunk = /* glsl */ `
uniform sampler2D readingMask;
uniform vec2 readingViewport;
uniform float readingEnabled;
uniform float readingCover;
uniform float readingBoost;
uniform float readingStrength;
float readingFactor() {
  float mask = max(texture2D(readingMask, gl_FragCoord.xy / readingViewport).r, readingCover);
  float strength = 1.0 - (1.0 - readingStrength) * (1.0 - readingBoost);
  return 1.0 - mask * strength * readingEnabled;
}`;

export type ReadingUniforms = {
  readingMask: { value: Texture };
  readingViewport: { value: Vector2 };
  readingEnabled: { value: number };
  /** Uniform coverage for whole-screen text that cannot be cached, such as the hero toolkit. */
  readingCover: { value: number };
  /** Raises every material's strength toward full, for themes with less contrast headroom. */
  readingBoost: { value: number };
};

/**
 * A feathered mask behind blocks of reading text. Rectangles are cached in document coordinates
 * and offset by the scroll position, so scrolling needs no layout reads or buffer uploads; the
 * MAX blend keeps overlapping blocks from compounding into a solid band.
 */
export function createReadingShade() {
  const target = new WebGLRenderTarget(1, 1, { depthBuffer: false });
  const quad = new PlaneGeometry(1, 1).translate(0.5, 0.5, 0);
  const geometry = new InstancedBufferGeometry();
  geometry.index = quad.index;
  geometry.setAttribute("position", quad.getAttribute("position"));
  const rects = new InstancedBufferAttribute(new Float32Array(capacity * 4), 4);
  geometry.setAttribute("rect", rects);
  geometry.instanceCount = 0;
  const material = new ShaderMaterial({
    blending: CustomBlending,
    blendEquation: MaxEquation,
    blendSrc: OneFactor,
    blendDst: OneFactor,
    depthTest: false,
    depthWrite: false,
    // Flipping Y into CSS coordinates reverses the winding.
    side: DoubleSide,
    uniforms: {
      viewport: { value: new Vector2(1, 1) },
      scroll: { value: 0 },
      feather: { value: 48 },
    },
    vertexShader: /* glsl */ `
      attribute vec4 rect;
      uniform vec2 viewport;
      uniform float scroll;
      uniform float feather;
      varying vec2 vPoint;
      varying vec4 vRect;
      void main() {
        vRect = vec4(rect.xy - vec2(0.0, scroll), rect.zw);
        vPoint = vRect.xy - feather + position.xy * (vRect.zw + feather * 2.0);
        vec2 ndc = vPoint / viewport * 2.0 - 1.0;
        gl_Position = vec4(ndc.x, -ndc.y, 0.0, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform float feather;
      varying vec2 vPoint;
      varying vec4 vRect;
      void main() {
        vec2 outside = abs(vPoint - vRect.xy - vRect.zw * 0.5) - vRect.zw * 0.5;
        float edge = length(max(outside, 0.0)) + min(max(outside.x, outside.y), 0.0);
        float falloff = clamp(edge / feather, 0.0, 1.0);
        gl_FragColor = vec4(1.0 - falloff * falloff * (3.0 - 2.0 * falloff));
      }`,
  });
  const mesh = new Mesh(geometry, material);
  mesh.frustumCulled = false;
  const maskScene = new Scene();
  maskScene.add(mesh);
  const maskCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const bufferSize = new Vector2();
  const uniforms: ReadingUniforms = {
    readingMask: { value: target.texture },
    readingViewport: { value: new Vector2(1, 1) },
    readingEnabled: { value: 0 },
    readingCover: { value: 0 },
    readingBoost: { value: 0 },
  };

  let measured = false;
  let measuredAt = Number.NEGATIVE_INFINITY;
  let rendered = { scroll: Number.NaN, width: 0, height: 0, count: -1 };
  /**
   * Text that does not move with the document scroll: inside fixed or sticky elements, or inside
   * its own scroll container. Its cached rectangle would drift, so it relies on the veil alone.
   */
  let detachedCache = new WeakMap<Element, boolean>();
  const invalidate = () => {
    measured = false;
    detachedCache = new WeakMap();
  };
  const isDetached = (element: Element): boolean => {
    const parent = element.parentElement;
    if (element === document.body || !parent) return false;
    const cached = detachedCache.get(element);
    if (cached !== undefined) return cached;
    const style = getComputedStyle(element);
    const detached =
      style.position === "fixed" ||
      style.position === "sticky" ||
      (/auto|scroll/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 1) ||
      isDetached(parent);
    detachedCache.set(element, detached);
    return detached;
  };
  /** Reads layout after an invalidation, at most once per interval and never per frame. */
  const measure = () => {
    measured = true;
    measuredAt = performance.now();
    const values = rects.array as Float32Array;
    let count = 0;
    const range = document.createRange();
    for (const element of document.querySelectorAll(textSelector)) {
      if (count >= capacity) break;
      if (element.closest("[aria-hidden='true'], [data-scene], [role='dialog']")) continue;
      // A nested block (a paragraph inside a list item) is already covered by its ancestor.
      if (element.parentElement?.closest(blockSelector)) continue;
      if (isDetached(element)) continue;
      range.selectNodeContents(element);
      const bounds = range.getBoundingClientRect();
      if (bounds.width < 2 || bounds.height < 2) continue;
      values.set(
        [bounds.left, bounds.top + window.scrollY, bounds.width, bounds.height],
        count * 4,
      );
      count++;
    }
    geometry.instanceCount = count;
    rects.needsUpdate = true;
  };
  /**
   * The home hero is pinned and animated, so its labels are not measured. Its stage publishes a
   * scroll progress; while the technology cloud spreads over the screen the whole scene recedes,
   * and it returns once the stage leaves the viewport.
   */
  let heroStage: HTMLElement | null = null;
  let heroVisibility = 0;
  let coverUpdatedAt = performance.now();
  const heroObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) heroVisibility = entry.intersectionRatio;
    },
    { threshold: [0, 0.25, 0.5, 0.75, 1] },
  );
  const trackHero = () => {
    const stage = document.querySelector<HTMLElement>("main [data-scene]");
    if (stage === heroStage) return;
    heroObserver.disconnect();
    heroStage = stage;
    heroVisibility = 0;
    const viewport = stage?.querySelector("[data-scene-viewport]");
    if (viewport) heroObserver.observe(viewport);
  };
  const heroCover = () => {
    const progress = Number(heroStage?.dataset.sceneProgress ?? 0);
    const spread = Math.min(1, Math.max(0, (progress - 0.3) / 0.45));
    return spread * spread * (3 - 2 * spread) * heroVisibility;
  };
  const mutations = new MutationObserver(invalidate);
  const resizes = new ResizeObserver(invalidate);
  const main = document.querySelector("main");
  if (main) {
    mutations.observe(main, { childList: true, subtree: true, characterData: true });
    resizes.observe(main);
  }
  resizes.observe(document.body);
  void document.fonts?.ready.then(invalidate);

  return {
    uniforms,
    /** Redraws the mask only when scroll, size or the measured blocks change. */
    render(renderer: WebGLRenderer, width: number, height: number, enabled: boolean) {
      uniforms.readingEnabled.value = enabled ? 1 : 0;
      if (!enabled) return;
      // Streaming text can mutate every frame; layout is read at most every 250 ms.
      if (!measured && performance.now() - measuredAt > 250) {
        trackHero();
        measure();
        rendered.count = -1;
      }
      const now = performance.now();
      const seconds = Math.min(0.1, (now - coverUpdatedAt) / 1000);
      coverUpdatedAt = now;
      const cover = uniforms.readingCover.value;
      uniforms.readingCover.value = cover + (heroCover() - cover) * (1 - Math.exp(-seconds * 7));
      renderer.getDrawingBufferSize(bufferSize);
      uniforms.readingViewport.value.copy(bufferSize);
      const scroll = window.scrollY;
      if (
        rendered.scroll === scroll &&
        rendered.width === width &&
        rendered.height === height &&
        rendered.count === geometry.instanceCount
      )
        return;
      rendered = { scroll, width, height, count: geometry.instanceCount };
      target.setSize(
        Math.max(1, Math.ceil(width * maskScale)),
        Math.max(1, Math.ceil(height * maskScale)),
      );
      material.uniforms.viewport.value.set(width, height);
      material.uniforms.feather.value = featherCss(width);
      material.uniforms.scroll.value = scroll;
      const previousTarget = renderer.getRenderTarget();
      const previousAlpha = renderer.getClearAlpha();
      renderer.setRenderTarget(target);
      renderer.setClearAlpha(0);
      renderer.clear(true, false, false);
      renderer.render(maskScene, maskCamera);
      renderer.setRenderTarget(previousTarget);
      renderer.setClearAlpha(previousAlpha);
    },
    /** Forces a redraw, for example after the GPU context is restored. */
    reset() {
      rendered = { scroll: Number.NaN, width: 0, height: 0, count: -1 };
    },
    get count() {
      return geometry.instanceCount;
    },
    dispose() {
      mutations.disconnect();
      resizes.disconnect();
      heroObserver.disconnect();
      quad.dispose();
      geometry.dispose();
      material.dispose();
      target.dispose();
    },
  };
}
