import {
  ACESFilmicToneMapping,
  Group,
  PerspectiveCamera,
  Scene,
  type ShaderMaterial,
  SRGBColorSpace,
  Texture,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { createSolarBodies, type SolarBodies } from "./solar-system-bodies";
import { createQualityController, qualitySteps } from "./solar-system-quality";
import { createReadingShade } from "./solar-system-reading";
import { createResourceTracker, createSharedUniforms } from "./solar-system-resources";
import {
  type SolarCamera,
  type SolarLayout,
  type SolarTextureName,
  type SolarTextureVersions,
  solarCameraDistance,
  solarCameras,
  solarLayout,
} from "./solar-system-scene";
import { createSolarSky, type SolarSky } from "./solar-system-sky";
import { createSolarTextures, sourceWidth, type TextureSource } from "./solar-system-textures";

export type SolarEngine = {
  setPaused(value: boolean): void;
  setLight(value: boolean): void;
  setHost(host: HTMLElement | null): void;
  setImmersive(value: boolean, interactionElement?: HTMLElement): void;
  resetView(): void;
  rotateView(delta: number): void;
  zoomView(factor: number): void;
  highlightBody(name: string | null): void;
  dispose(): void;
};
type SolarOptions = {
  textureVersions: SolarTextureVersions;
  paused: boolean;
  light: boolean;
  fixedTime: number | null;
  debug: boolean;
  onReady(): void;
  onUnavailable(reason: "context" | "texture"): void;
};
type SolarCanvas = HTMLCanvasElement & { getSolarDebugSnapshot?: () => unknown };

const compactWidth = 640;
/** Conservative GPU allowances; estimates, not measured driver allocations. */
const memoryBudgetBytes = { compact: 128 * 1024 * 1024, wide: 256 * 1024 * 1024 } as const;
const pixelBudget = { compact: 1_650_000, wide: 3_700_000 } as const;
const maxDeltaSeconds = 0.05;
/** Explorer close-ups look at the sunlit side, turned by this angle for a gibbous phase. */
const sunlitViewAngle = 0.7;
/** Largest uploaded dimension per map. Explorer close-ups decode finer detail on demand. */
const textureLimits = {
  reading: { prominent: 2048, other: 1024 },
  immersive: { featured: 4096, compactFeatured: 2048, detailed: 2048, other: 1024 },
} as const;
const featuredTextures = new Set<SolarTextureName>(["earth", "jupiter"]);
const prominentTextures = new Set<SolarTextureName>(["sun", "earth", "jupiter"]);
const detailedTextures = new Set<SolarTextureName>([
  "sun",
  "moon",
  "mars",
  "saturn",
  "earth-clouds",
]);

/**
 * Probes for a CPU rasterizer (blocklisted GPUs, virtual machines, CI) before the real context
 * exists, because MSAA can only be chosen at creation.
 */
function detectSoftwareRenderer() {
  const context = document.createElement("canvas").getContext("webgl2");
  if (!context) return false;
  const info = context.getExtension("WEBGL_debug_renderer_info");
  const name = info ? String(context.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
  context.getExtension("WEBGL_lose_context")?.loseContext();
  return /swiftshader|llvmpipe|softpipe|software/i.test(name);
}

/** Owns its GPU resources and RAF; disposal also invalidates in-flight texture work. */
export function createSolarSystemEngine(canvas: SolarCanvas, options: SolarOptions): SolarEngine {
  // A software rasterizer gets the lightest configuration: no MSAA, the lowest resolution step,
  // no full-screen galaxy pass and a sparser star field.
  const software = detectSoftwareRenderer();
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    premultipliedAlpha: true,
    // High-density screens already supersample edges; MSAA would only cost fill rate there.
    antialias: !software && (window.devicePixelRatio || 1) < 1.5,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);
  const bytesPerPixel = renderer.getContextAttributes()?.antialias ? 24 : 12;
  const scene = new Scene();
  const camera = new PerspectiveCamera(solarCameras.landscape.fieldOfView, 1, 0.1, 2400);
  scene.add(camera);
  const root = new Group();
  root.name = "solar-system";
  scene.add(root);
  const readingShade = createReadingShade();
  const tracker = createResourceTracker(readingShade.uniforms);
  const shared = createSharedUniforms();

  let width = 0;
  let height = 0;
  let pixelRatio = 1;
  let layout: SolarLayout = "landscape";
  let layoutCamera: SolarCamera = solarCameras.landscape;
  let defaultDistance = 100;
  let elapsed = options.fixedTime ?? 0;
  let lastTime = 0;
  let frame = 0;
  let framesRendered = 0;
  let paused = options.paused;
  let light = options.light;
  let disposed = false;
  let loaded = false;
  let contextAvailable = true;
  let immersive = false;
  let highlighted: string | null = null;
  let controls: OrbitControls | undefined;
  const originalHost = canvas.parentElement;
  let estimatedGpuBytes = 0;
  let drawing = false;
  let bodies: SolarBodies | undefined;
  let sky: SolarSky | undefined;
  /** Smoothed CPU milliseconds spent updating and submitting one frame. */
  let drawCost = 0;
  /** Milliseconds from engine creation to each loading milestone, for diagnostics. */
  const startup = { created: performance.now(), textures: 0, compiled: 0, firstFrame: 0 };

  const textureLimit = (name: SolarTextureName) => {
    const compact = width < compactWidth;
    // A CPU rasterizer cannot show finer detail at its reduced resolution; skip the extra decode.
    if (!immersive || software)
      return !compact && prominentTextures.has(name)
        ? textureLimits.reading.prominent
        : textureLimits.reading.other;
    const limits = textureLimits.immersive;
    if (featuredTextures.has(name)) return compact ? limits.compactFeatured : limits.featured;
    return !compact && detailedTextures.has(name) ? limits.detailed : limits.other;
  };
  const textures = createSolarTextures(renderer, options.textureVersions, textureLimit);
  const quality = createQualityController({
    initialLevel: software ? qualitySteps.length - 1 : 0,
    onChange: () => resize(true),
  });
  quality.calibrate();

  // Scroll-linked camera parallax and reading veil, eased with frame-rate independent damping.
  const rig = { azimuth: 0, elevation: 0, veil: 1, initialized: false };
  let appliedVeil = -1;
  let flyToSelection = false;
  const scratch = { goal: new Vector3(), before: new Vector3(), offset: new Vector3() };

  const placeCamera = (azimuth: number, elevationOffset: number, distance: number) => {
    const elevation = ((layoutCamera.elevation + elevationOffset) * Math.PI) / 180;
    camera.position.set(
      Math.sin(azimuth) * Math.cos(elevation) * distance,
      Math.sin(elevation) * distance,
      Math.cos(azimuth) * Math.cos(elevation) * distance,
    );
    camera.lookAt(0, 0, 0);
    camera.updateMatrixWorld();
  };
  const resetView = () => {
    if (controls) {
      const damping = controls.enableDamping;
      controls.enableDamping = false;
      controls.update();
      controls.enableDamping = damping;
    }
    flyToSelection = false;
    placeCamera(0, 0, defaultDistance);
    controls?.target.set(0, 0, 0);
  };
  /**
   * Reading mode: scrolling slowly orbits and tilts the camera around the Sun and lowers the
   * scene's opacity, saturating after a few viewports so long pages never drift far. Only the
   * first frame and paused redraws jump to the target; every other change eases.
   */
  const updateRig = (delta: number) => {
    if (immersive) return;
    const viewports = Math.max(0, window.scrollY) / (window.innerHeight || height || 1);
    const travel = 1 - Math.exp(-viewports / 2.4);
    const targetAzimuth = (travel * (layout === "portrait" ? 18 : 24) * Math.PI) / 180;
    const targetElevation = travel * (layout === "portrait" ? -8 : 7);
    const reading = Math.min(1, Math.max(0, (viewports - 0.08) / 0.75));
    const top = light ? 0.9 : 0.82;
    const floor = light ? 0.5 : 0.48;
    const targetVeil = top - reading * reading * (3 - 2 * reading) * (top - floor);
    if (!rig.initialized || (paused && delta === 0)) {
      Object.assign(rig, {
        azimuth: targetAzimuth,
        elevation: targetElevation,
        veil: targetVeil,
        initialized: true,
      });
    } else if (delta > 0) {
      const ease = 1 - Math.exp(-delta * 2.6);
      rig.azimuth += (targetAzimuth - rig.azimuth) * ease;
      rig.elevation += (targetElevation - rig.elevation) * ease;
      rig.veil += (targetVeil - rig.veil) * (1 - Math.exp(-delta * 4));
    }
    placeCamera(rig.azimuth, rig.elevation, defaultDistance);
    if (
      originalHost instanceof HTMLElement &&
      canvas.parentElement === originalHost &&
      Math.abs(appliedVeil - rig.veil) > 0.004
    ) {
      appliedVeil = rig.veil;
      originalHost.style.opacity = rig.veil.toFixed(3);
    }
  };
  /**
   * Explorer: the orbit target follows the selected body while the camera flies to a three-quarter
   * sunlit view of it, keeping the Sun behind the camera; clearing the selection flies back to the
   * full system. Once there, the visitor orbits freely.
   */
  const updateFocus = (delta: number) => {
    if (!immersive || !controls || !bodies) return;
    const selected = bodies.bodies.find((body) => body.name === highlighted && body.name !== "sun");
    const goal = scratch.goal.set(0, 0, 0);
    if (selected) selected.mesh.getWorldPosition(goal);
    const ease = delta > 0 ? 1 - Math.exp(-delta * 2.4) : 1;
    const before = scratch.before.copy(controls.target);
    controls.target.lerp(goal, ease);
    camera.position.add(before.subVectors(controls.target, before));
    if (!flyToSelection) return;
    const destination = scratch.offset;
    if (selected) {
      const framing = Math.max(selected.mesh.scale.x * 7, 5) * Math.max(1, 1 / camera.aspect);
      const sunward = Math.atan2(-goal.x, -goal.z) + sunlitViewAngle;
      destination
        .set(Math.sin(sunward), 0.45, Math.cos(sunward))
        .normalize()
        .multiplyScalar(framing)
        .add(controls.target);
    } else {
      const elevation = (layoutCamera.elevation * Math.PI) / 180;
      destination.set(0, Math.sin(elevation), Math.cos(elevation)).multiplyScalar(defaultDistance);
    }
    camera.position.lerp(destination, ease);
    if (camera.position.distanceTo(destination) < 0.05) flyToSelection = false;
  };

  const draw = (delta = 0) => {
    if (disposed || !loaded || !contextAvailable || drawing || !bodies || !sky) return;
    drawing = true;
    const started = performance.now();
    updateRig(delta);
    bodies.update(elapsed, layout);
    updateFocus(delta);
    bodies.updateMarker(immersive ? highlighted : null, delta);
    sky.update(elapsed);
    if (immersive) controls?.update();
    readingShade.render(renderer, width, height, !immersive);
    renderer.render(scene, camera);
    const cost = performance.now() - started;
    drawCost = drawCost ? drawCost * 0.9 + cost * 0.1 : cost;
    framesRendered++;
    drawing = false;
  };
  /** Outside the animation loop draws at once; inside it, the next frame picks the change up. */
  const redraw = () => {
    if (!frame) draw();
  };
  const animate = (time: number) => {
    frame = 0;
    if (disposed || paused || !contextAvailable || !loaded) return;
    // Clamped so a stalled or resumed tab never fast-forwards the scene.
    const delta = lastTime ? Math.min(maxDeltaSeconds, (time - lastTime) / 1000) : 0;
    if (options.fixedTime === null) elapsed += delta;
    if (lastTime && options.fixedTime === null) quality.sample(time, time - lastTime);
    lastTime = time;
    draw(delta);
    frame = requestAnimationFrame(animate);
  };
  const sync = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    quality.discard(400);
    if (!loaded || !contextAvailable || paused || disposed) return;
    quality.calibrate();
    frame = requestAnimationFrame(animate);
  };

  let textureClass = "";
  let bufferKey = "";
  /** Recomputes layout, resolution and texture sizes; skips work when nothing changed. */
  const resize = (force = false) => {
    const bounds = canvas.getBoundingClientRect();
    if (bounds.width < 1 || bounds.height < 1) return;
    const devicePixelRatio = window.devicePixelRatio || 1;
    width = bounds.width;
    height = bounds.height;
    layout = solarLayout(width, height);
    layoutCamera = solarCameras[layout];
    const compact = width < compactWidth;
    const nextClass = `${compact}-${immersive}`;
    if (loaded && textureClass && nextClass !== textureClass)
      void textures
        .refit(() => quality.discard(700))
        .then(() => {
          if (!disposed) resize(true);
        });
    textureClass = nextClass;
    const reserved = textures.bytes() + (sky?.bytes ?? 0);
    const budget = compact ? memoryBudgetBytes.compact : memoryBudgetBytes.wide;
    const memoryPixels = Math.max(250_000, (budget - reserved) / bytesPerPixel);
    const pixels = Math.min(compact ? pixelBudget.compact : pixelBudget.wide, memoryPixels);
    const ceiling = Math.min(devicePixelRatio, 2, Math.sqrt(pixels / (width * height)));
    // Software rasterizers stay near one fragment per CSS pixel whatever the screen density.
    pixelRatio = Math.max(0.5, Math.min(software ? 0.75 : 2, ceiling * quality.scale));
    const key = `${width}x${height}@${pixelRatio}`;
    const bufferChanged = key !== bufferKey;
    if (!bufferChanged && !force) return;
    bufferKey = key;
    // Assigning canvas dimensions clears it, even to the same values.
    if (bufferChanged) {
      renderer.setPixelRatio(pixelRatio);
      renderer.setSize(width, height, false);
    }
    shared.pixelRatio.value = pixelRatio;
    estimatedGpuBytes =
      reserved + Math.ceil(width * pixelRatio) * Math.ceil(height * pixelRatio) * bytesPerPixel;
    camera.fov = layoutCamera.fieldOfView;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    defaultDistance = solarCameraDistance(layoutCamera, camera.aspect);
    const unitPixels = (height * pixelRatio) / (2 * Math.tan((camera.fov * Math.PI) / 360));
    sky?.setPixelScale(unitPixels * 0.05);
    if (immersive && controls) {
      controls.minDistance = defaultDistance * 0.04;
      controls.maxDistance = defaultDistance * 1.9;
    }
    quality.discard(300);
    // A resized drawing buffer is cleared; repaint now so no blank frame reaches the screen.
    if (bufferChanged) draw();
    else redraw();
  };

  const applyTheme = () => {
    const ink = light && !immersive;
    shared.lightMode.value = ink ? 1 : 0;
    // Gray body text on a light page has the least headroom; the scene recedes further there.
    readingShade.uniforms.readingBoost.value = ink ? 0.5 : 0;
    bodies?.applyTheme(ink, immersive, highlighted);
    sky?.applyTheme(ink, immersive);
    redraw();
  };

  /** Compiles every program and uploads every map before the first visible frame. */
  const start = async () => {
    if (!bodies || !sky) return;
    sky.bake();
    resize(true);
    for (const texture of textures.values()) renderer.initTexture(texture);
    bodies.update(elapsed, layout);
    // three.js polls compilation forever if the context is lost meanwhile; restore restarts it.
    const listening = new AbortController();
    const lost = new Promise<"lost">((resolve) =>
      canvas.addEventListener("webglcontextlost", () => resolve("lost"), {
        signal: listening.signal,
      }),
    );
    const outcome = await Promise.race([renderer.compileAsync(scene, camera), lost]);
    listening.abort();
    if (outcome === "lost" || disposed) return;
    startup.compiled = performance.now() - startup.created;
    loaded = true;
    applyTheme();
    startup.firstFrame = performance.now() - startup.created;
    if (contextAvailable) options.onReady();
    sync();
  };

  const onContextLost = (event: Event) => {
    event.preventDefault();
    contextAvailable = false;
    sync();
    options.onUnavailable("context");
  };
  const onContextRestored = () => {
    if (disposed) return;
    contextAvailable = true;
    readingShade.reset();
    if (!loaded) {
      void start();
      return;
    }
    sky?.bake();
    resize(true);
    options.onReady();
    sync();
  };
  canvas.addEventListener("webglcontextlost", onContextLost);
  canvas.addEventListener("webglcontextrestored", onContextRestored);
  const onResize = () => resize();
  const observer = new ResizeObserver(onResize);
  observer.observe(canvas);
  // Browser zoom and moving between displays change the pixel ratio without resizing the canvas.
  window.addEventListener("resize", onResize);
  // A paused scene still follows the scroll position, without animating.
  const onScroll = () => {
    if (paused && loaded && !immersive) draw();
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  resize();

  const debugSnapshot = () => {
    scene.updateMatrixWorld(true);
    const right = new Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    const bodySnapshot = (bodies?.bodies ?? []).map((body) => {
      const world = body.mesh.getWorldPosition(new Vector3());
      const point = world.clone().project(camera);
      const edge = world.clone().addScaledVector(right, body.mesh.scale.x).project(camera);
      const material = body.mesh.material as ShaderMaterial;
      const candidate = material.uniforms.dayMap?.value ?? material.uniforms.sunMap?.value;
      const texture = candidate instanceof Texture ? candidate : null;
      const image = texture?.image as TextureSource | undefined;
      return {
        name: body.name,
        geometry: body.mesh.geometry.type,
        material: material.type,
        world: world.toArray(),
        parent: body.orbit.parent?.name ?? "",
        rotation: body.mesh.rotation.toArray(),
        screen: {
          x: ((point.x + 1) * width) / 2,
          y: ((1 - point.y) * height) / 2,
          radius: (Math.abs(edge.x - point.x) * width) / 2,
        },
        axialTilt: body.tilt.rotation.toArray(),
        texture: texture?.userData.sourceUrl ?? null,
        textureColorSpace: texture?.colorSpace ?? null,
        textureWidth: image ? sourceWidth(image) : null,
      };
    });
    const context = renderer.getContext();
    const ringMaterial = bodies?.rings?.material as ShaderMaterial | undefined;
    return {
      elapsed,
      immersive,
      highlighted,
      layout,
      camera: {
        type: camera.type,
        target: controls?.target.toArray() ?? [0, 0, 0],
        position: camera.position.toArray(),
      },
      refreshInterval: quality.refreshMs,
      quality: quality.level,
      qualityScale: quality.scale,
      software,
      estimatedGpuBytes,
      textureBytes: textures.bytes(),
      framesRendered,
      drawCost,
      startup,
      paused,
      contextAvailable,
      glError: contextAvailable ? context.getError() : null,
      pixelRatio,
      veil: rig.veil,
      readingShadeBlocks: readingShade.count,
      earthOceanGlint: Boolean(bodies?.earthMaterial?.uniforms.hasSpecular.value),
      textureCount: textures.size,
      gpuTextures: renderer.info.memory.textures,
      calls: renderer.info.render.calls,
      bodies: bodySnapshot,
      rings: {
        saturn: bodies?.rings?.geometry.type,
        depthTest: ringMaterial?.depthTest,
        depthWrite: ringMaterial?.depthWrite,
        side: ringMaterial?.side,
      },
      meteorVisible: sky?.meteorVisible ?? false,
    };
  };
  if (options.debug) canvas.getSolarDebugSnapshot = debugSnapshot;

  void textures
    .load()
    .then(() => {
      if (disposed) return;
      startup.textures = performance.now() - startup.created;
      sky = createSolarSky({
        renderer,
        scene,
        root,
        camera,
        shared,
        tracker,
        compact: width < compactWidth,
        lite: software,
        twinkle: options.fixedTime === null,
      });
      bodies = createSolarBodies({ root, shared, tracker, textures, lite: software });
      return start();
    })
    .catch((error: unknown) => {
      if (options.debug) console.error("Solar renderer unavailable", error);
      if (!disposed) options.onUnavailable("texture");
    });

  return {
    setPaused(value) {
      paused = value;
      sync();
    },
    setLight(value) {
      light = value;
      applyTheme();
    },
    setHost(host) {
      const desiredHost = host ?? originalHost;
      if (!desiredHost || canvas.parentElement === desiredHost) return;
      desiredHost.appendChild(canvas);
      resize(true);
    },
    setImmersive(value, interactionElement) {
      if (
        value === immersive &&
        (!value || controls?.domElement === (interactionElement ?? canvas))
      )
        return;
      immersive = value;
      controls?.dispose();
      controls = undefined;
      rig.initialized = false;
      resetView();
      if (value) {
        controls = new OrbitControls(camera, interactionElement ?? canvas);
        controls.enablePan = false;
        controls.enableDamping = true;
        controls.dampingFactor = 0.07;
        controls.rotateSpeed = 0.6;
        controls.zoomSpeed = 0.8;
        controls.minPolarAngle = (Math.PI * 12) / 180;
        controls.maxPolarAngle = (Math.PI * 88) / 180;
        controls.minDistance = defaultDistance * 0.04;
        controls.maxDistance = defaultDistance * 1.9;
        controls.target.set(0, 0, 0);
        controls.addEventListener("change", () => {
          if (paused) draw();
        });
      }
      applyTheme();
      resize(true);
    },
    resetView() {
      highlighted = null;
      resetView();
      applyTheme();
    },
    rotateView(delta) {
      if (!immersive) return;
      const target = controls?.target ?? new Vector3();
      const offset = camera.position.clone().sub(target);
      offset.applyAxisAngle(new Vector3(0, 1, 0), delta);
      camera.position.copy(target).add(offset);
      camera.lookAt(target);
      redraw();
    },
    zoomView(factor) {
      if (!Number.isFinite(factor) || factor <= 0 || !immersive) return;
      const target = controls?.target ?? new Vector3();
      const offset = camera.position.clone().sub(target);
      const distance = offset.length();
      const next = Math.max(
        controls?.minDistance ?? defaultDistance * 0.04,
        Math.min(controls?.maxDistance ?? defaultDistance * 1.9, distance * factor),
      );
      camera.position.copy(target).add(offset.multiplyScalar(next / distance));
      redraw();
    },
    highlightBody(name) {
      highlighted = name;
      flyToSelection = immersive;
      applyTheme();
    },
    dispose() {
      if (disposed) return;
      originalHost?.appendChild(canvas);
      if (originalHost instanceof HTMLElement) originalHost.style.opacity = "";
      disposed = true;
      cancelAnimationFrame(frame);
      quality.dispose();
      controls?.dispose();
      observer.disconnect();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("webglcontextrestored", onContextRestored);
      delete canvas.getSolarDebugSnapshot;
      textures.dispose();
      readingShade.dispose();
      sky?.dispose();
      tracker.dispose();
      renderer.renderLists.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}
