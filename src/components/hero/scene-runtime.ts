import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createFieldEngine } from "./field-engine";

export type SceneRuntime = { sync(paused: boolean): void; activateAvatar(): void; dispose(): void };

type VisualNode = { element: HTMLElement | null; opacity: number; transform: string };
const visualNode = (element: HTMLElement | null): VisualNode => ({
  element,
  opacity: -1,
  transform: "",
});
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const rounded = (value: number) => Math.round(value * 1000) / 1000;

function paint(node: VisualNode, opacity: number, transform = "") {
  if (!node.element) return;
  const alpha = rounded(opacity);
  if (node.opacity !== alpha) {
    node.element.style.opacity = String(alpha);
    node.opacity = alpha;
  }
  if (node.transform !== transform) {
    node.element.style.transform = transform;
    node.transform = transform;
  }
}

export function mountScene(stage: HTMLElement, canvas: HTMLCanvasElement): SceneRuntime {
  const engine = createFieldEngine(canvas);
  gsap.registerPlugin(ScrollTrigger);
  let paused = false;
  let onScreen = true;
  let frame = 0;
  let lastTime = 0;
  let elapsed = 0;
  let quality = 0;
  let sampleTime = 0;
  let sampleFrames = 0;
  let slowWindows = 0;
  let fastWindows = 0;
  let targetProgress = 0;
  let visualProgress = 0;
  let appliedProgress = -1;
  let touch: {
    x: number;
    y: number;
    scroll: number;
    time: number;
    id: number;
    avatar: boolean;
  } | null = null;
  let impulseUntil = 0;
  let pulse: { age: number; avatar: boolean; origin: { x: number; y: number } } | null = null;
  const compact = matchMedia("(max-width: 767px)");
  const viewport = stage.querySelector<HTMLElement>("[data-scene-viewport]");
  const journey = stage.querySelector<HTMLElement>("[data-scene-journey]");
  const hero = visualNode(stage.querySelector<HTMLElement>("[data-scene-hero]"));
  let heroFocused = hero.element?.contains(document.activeElement) ?? false;
  const core = visualNode(stage.querySelector<HTMLElement>("[data-scene-core]"));
  const avatar = visualNode(stage.querySelector<HTMLElement>("[data-scene-avatar-art]"));
  const avatarButton = stage.querySelector<HTMLButtonElement>("[data-scene-avatar]");
  let copyView = visualNode(null);
  const logos: {
    view: VisualNode;
    x: number;
    y: number;
    gridX: number;
    gridY: number;
    orbitX: number;
    orbitY: number;
    settledX: number;
    settledY: number;
    revealAt: number;
  }[] = [];
  const parameters = new URLSearchParams(location.search);
  const requestedProgress = Number(parameters.get("sceneProgress"));
  const deterministic = parameters.has("sceneProgress") && Number.isFinite(requestedProgress);
  const fixedProgress = Math.min(1, Math.max(0, requestedProgress));
  const requestedTime = Number(parameters.get("sceneTime"));
  if (deterministic) engine.setTime(Number.isFinite(requestedTime) ? requestedTime : 0);
  const cloud = stage.querySelector<HTMLElement>("[data-logo-cloud]");
  const seenBrands = new Set<string>();
  const sourceMarks = [...stage.querySelectorAll<HTMLElement>("[data-tech-icon]")].filter(
    (mark) => {
      const brand = mark.dataset.sceneBrand ?? mark.dataset.techIcon;
      if (!brand || seenBrands.has(brand)) return false;
      seenBrands.add(brand);
      return true;
    },
  );
  sourceMarks.forEach((source, index) => {
    if (!cloud) return;
    const item = document.createElement("div");
    item.className = "scene-logo";
    const angle = index * 2.399963;
    const radius = 0.5 + 0.48 * Math.sqrt((index + 1) / sourceMarks.length);
    logos.push({
      view: visualNode(item),
      x: Math.cos(angle) * radius,
      y: Math.sin(angle) * radius,
      gridX: ((index % 7) / 6) * 2 - 1,
      gridY: (Math.floor(index / 7) / Math.max(1, Math.ceil(sourceMarks.length / 7) - 1)) * 2 - 1,
      orbitX: 0,
      orbitY: 0,
      settledX: 0,
      settledY: 0,
      revealAt: 0.55 + (index / sourceMarks.length) * 0.12,
    });
    item.append(source.cloneNode(true));
    cloud.append(item);
  });
  const sourceCopy = stage.querySelector<HTMLElement>("[data-scene-copy]");
  if (cloud && sourceCopy) {
    const copy = sourceCopy.cloneNode(true) as HTMLElement;
    copy.className = "scene-cloud-copy";
    copy.removeAttribute("id");
    copy.querySelectorAll("[id]").forEach((element) => {
      element.removeAttribute("id");
    });
    cloud.append(copy);
    copyView = visualNode(copy);
  }
  const update = (value: number) => {
    if (appliedProgress === value) return;
    appliedProgress = value;
    stage.dataset.sceneProgress = value.toFixed(4);
    engine.setExpansion(value);
    paint(
      hero,
      heroFocused ? 1 : 1 - clamp(value / 0.2),
      heroFocused ? "none" : `translate3d(0,${rounded(value * -60)}px,0)`,
    );
    paint(core, 1 - clamp((value - 0.2) / 0.2));
    if (avatarButton) {
      avatarButton.disabled = value >= 0.38;
      avatarButton.style.visibility = value >= 0.4 ? "hidden" : "visible";
    }
    if (viewport) viewport.style.cursor = "";
    paint(copyView, clamp((value - 0.55) / 0.15) * (1 - clamp((value - 0.8) / 0.1)));
    const settle = clamp((value - 0.8) / 0.2);
    for (const logo of logos) {
      const reveal = clamp((value - logo.revealAt) / 0.13);
      const x = rounded(logo.orbitX * (1 - settle) + logo.settledX * settle);
      const y = rounded(logo.orbitY * (1 - settle) + logo.settledY * settle + (1 - reveal) * 80);
      paint(
        logo.view,
        reveal,
        `translate(-50%,-50%) translate3d(${x}px,${y}px,0) scale(${rounded(0.5 + reveal * 0.5)})`,
      );
    }
  };
  const trigger = ScrollTrigger.create({
    trigger: journey ?? stage,
    start: "top top",
    end: () =>
      `+=${Math.max(1, (journey?.offsetHeight ?? innerHeight * 3) - (viewport?.offsetHeight ?? innerHeight))}`,
    onUpdate: (self) => {
      targetProgress = self.progress;
    },
    onRefresh: (self) => {
      targetProgress = self.progress;
    },
  });
  const measureQuality = (delta: number) => {
    sampleTime += delta;
    sampleFrames += 1;
    if (sampleTime < 3) return;
    const averageMs = (sampleTime * 1000) / sampleFrames;
    slowWindows = averageMs > (compact.matches ? 37 : 23) ? slowWindows + 1 : 0;
    fastWindows = averageMs < (compact.matches ? 22 : 18) ? fastWindows + 1 : 0;
    const next =
      slowWindows >= 2
        ? Math.min(2, quality + 1)
        : fastWindows >= 5
          ? Math.max(0, quality - 1)
          : quality;
    if (next !== quality) {
      quality = next;
      engine.setQuality(quality);
      stage.dataset.sceneQuality = String(quality);
      slowWindows = 0;
      fastWindows = 0;
    }
    sampleTime = 0;
    sampleFrames = 0;
  };
  const tick = (now: number) => {
    const rawDelta = lastTime ? (now - lastTime) / 1000 : 0;
    const delta = Math.min(rawDelta, 0.05);
    lastTime = now;
    elapsed += delta;
    visualProgress += (targetProgress - visualProgress) * (1 - Math.exp(-delta * 12));
    update(Math.round(Math.min(1, Math.max(0, visualProgress)) * 100000) / 100000);
    if (now > impulseUntil) {
      if (compact.matches) {
        engine.setPointer({
          x: Math.sin(elapsed * 0.31) * 0.65,
          y: Math.cos(elapsed * 0.23) * 0.5,
        });
      } else if (impulseUntil > 0) {
        engine.setPointer(null);
      }
      impulseUntil = 0;
    }
    if (pulse) {
      pulse.age += delta;
      const phase = clamp(pulse.age / (pulse.avatar ? 1.2 : 0.75));
      engine.setPulse(phase, pulse.avatar, pulse.origin);
      if (pulse.avatar) {
        const lift = Math.sin(phase * Math.PI) ** 2;
        const tilt = Math.sin(phase * Math.PI * 2) * lift;
        paint(
          avatar,
          1,
          `perspective(500px) translate3d(0,${rounded(-12 * lift)}px,${rounded(48 * lift)}px) rotateX(${rounded(-14 * lift)}deg) rotateY(${rounded(28 * tilt)}deg) scale(${rounded(1 + 0.12 * lift)})`,
        );
      }
      if (phase === 1) {
        pulse = null;
        paint(avatar, 1);
        stage.dataset.scenePulse = "idle";
      }
    }
    engine.render(delta);
    if (rawDelta > 0) measureQuality(Math.min(rawDelta, 0.25));
    frame = requestAnimationFrame(tick);
  };
  const sync = () => {
    const active = !paused && onScreen && !document.hidden && !deterministic;
    if (active && !frame) frame = requestAnimationFrame(tick);
    if (!active) {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      sampleTime = 0;
      sampleFrames = 0;
    }
    if (deterministic && !paused) {
      update(fixedProgress);
      engine.render(0);
    }
  };
  const applyTheme = () => {
    const selected = document.documentElement.dataset.theme;
    engine.setLight(selected === "light");
  };
  const coordinates = (x: number, y: number) => {
    const bounds = canvas.getBoundingClientRect();
    return {
      x: ((x - bounds.left) / bounds.width) * 2 - 1,
      y: 1 - ((y - bounds.top) / bounds.height) * 2,
    };
  };
  const startPulse = (isAvatar: boolean, origin: { x: number; y: number }) => {
    if (paused || !onScreen || document.hidden || deterministic || pulse) return;
    pulse = { age: 0, avatar: isAvatar, origin };
    stage.dataset.scenePulse = isAvatar ? "avatar" : "sphere";
    stage.dataset.scenePulseCount = String(Number(stage.dataset.scenePulseCount ?? 0) + 1);
  };
  const activateAvatar = () => {
    if (!avatarButton || avatarButton.disabled) return;
    const bounds = avatarButton.getBoundingClientRect();
    startPulse(true, coordinates(bounds.x + bounds.width / 2, bounds.y + bounds.height / 2));
  };
  const pointerMove = (event: PointerEvent) => {
    if (touch && Math.hypot(event.clientX - touch.x, event.clientY - touch.y) > 10) touch = null;
    if (paused || event.pointerType === "touch") return;
    const point = coordinates(event.clientX, event.clientY);
    const control =
      event.target instanceof Element && event.target.closest("a,button,input,select,summary");
    const inside = engine.containsPoint(point.x, point.y);
    if (viewport) viewport.style.cursor = inside && !control ? "pointer" : "";
    engine.setPointer(inside ? point : null);
  };
  const pointerLeave = () => {
    engine.setPointer(null);
    if (viewport) viewport.style.cursor = "";
    touch = null;
  };
  const pointerDown = (event: PointerEvent) => {
    if (paused || (event.pointerType !== "touch" && event.button !== 0)) return;
    if (!event.isPrimary) {
      touch = null;
      return;
    }
    const isAvatar =
      event.target instanceof Element && !!event.target.closest("[data-scene-avatar]");
    if (
      !isAvatar &&
      event.target instanceof Element &&
      event.target.closest("a,button,input,select,summary")
    )
      return;
    const point = coordinates(event.clientX, event.clientY);
    if (!isAvatar && !engine.containsPoint(point.x, point.y)) return;
    touch = {
      x: event.clientX,
      y: event.clientY,
      scroll: scrollY,
      time: performance.now(),
      id: event.pointerId,
      avatar: isAvatar,
    };
  };
  const pointerUp = (event: PointerEvent) => {
    const start = touch;
    touch = null;
    if (!start || start.id !== event.pointerId || paused) return;
    if (
      Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10 ||
      Math.abs(scrollY - start.scroll) > 5 ||
      performance.now() - start.time > 350
    )
      return;
    const isAvatar =
      event.target instanceof Element && !!event.target.closest("[data-scene-avatar]");
    if (start.avatar !== isAvatar) return;
    if (
      !isAvatar &&
      event.target instanceof Element &&
      event.target.closest("a,button,input,select,summary")
    )
      return;
    const point = coordinates(event.clientX, event.clientY);
    if (!isAvatar && !engine.containsPoint(point.x, point.y)) return;
    engine.setPointer(point);
    impulseUntil = performance.now() + 650;
    if (event.pointerType === "touch")
      stage.dataset.sceneTap = String(Number(stage.dataset.sceneTap ?? 0) + 1);
    if (isAvatar) activateAvatar();
    else startPulse(false, point);
  };
  const pointerCancel = () => {
    touch = null;
  };
  const focusIn = () => {
    heroFocused = true;
    paint(hero, 1, "none");
  };
  const focusOut = (event: FocusEvent) => {
    if (event.relatedTarget instanceof Node && hero.element?.contains(event.relatedTarget)) return;
    heroFocused = false;
    paint(
      hero,
      1 - clamp(appliedProgress / 0.2),
      `translate3d(0,${rounded(appliedProgress * -60)}px,0)`,
    );
  };
  const resize = () => {
    engine.resize();
    const bounds = canvas.getBoundingClientRect();
    const readingBottom = hero.element?.getBoundingClientRect().bottom ?? bounds.top;
    engine.setReadingBoundary(1 - ((readingBottom + 20 - bounds.top) / bounds.height) * 2);
    const width = viewport?.clientWidth ?? innerWidth;
    const height = viewport?.clientHeight ?? innerHeight;
    for (const logo of logos) {
      const { x, y } = logo;
      // Keep the readable centre clear until its copy fades before grid settlement.
      const safeX = Math.abs(x) < 0.55 && Math.abs(y) < 0.4 ? Math.sign(x || 1) * 0.65 : x;
      logo.orbitX = safeX * width * 0.44;
      logo.orbitY = y * height * 0.4;
      logo.settledX = logo.gridX * width * 0.44;
      logo.settledY = logo.gridY * height * 0.4;
    }
    appliedProgress = -1;
    update(deterministic ? fixedProgress : visualProgress);
    ScrollTrigger.refresh();
  };
  const resizeObserver = new ResizeObserver(resize);
  if (viewport) resizeObserver.observe(viewport);
  if (journey) resizeObserver.observe(journey);
  const observer = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    stage.dataset.sceneVisible = String(onScreen);
    sync();
  });
  observer.observe(canvas);
  const themeObserver = new MutationObserver(applyTheme);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  stage.addEventListener("pointermove", pointerMove);
  stage.addEventListener("pointerleave", pointerLeave);
  stage.addEventListener("pointerdown", pointerDown, { passive: true });
  stage.addEventListener("pointerup", pointerUp, { passive: true });
  stage.addEventListener("pointercancel", pointerCancel, { passive: true });
  hero.element?.addEventListener("focusin", focusIn);
  hero.element?.addEventListener("focusout", focusOut);
  document.addEventListener("visibilitychange", sync);
  applyTheme();
  update(deterministic ? fixedProgress : targetProgress);
  resize();
  sync();
  return {
    activateAvatar,
    sync(value) {
      paused = value;
      touch = null;
      if (paused && viewport) viewport.style.cursor = "";
      sync();
    },
    dispose() {
      stage.removeAttribute("data-scene-visible");
      stage.removeAttribute("data-scene-quality");
      stage.removeAttribute("data-scene-tap");
      stage.removeAttribute("data-scene-pulse");
      stage.removeAttribute("data-scene-pulse-count");
      if (viewport) viewport.style.removeProperty("cursor");
      if (avatarButton) {
        avatarButton.disabled = false;
        avatarButton.style.removeProperty("visibility");
      }
      for (const node of [hero, core, avatar]) {
        node.element?.style.removeProperty("opacity");
        node.element?.style.removeProperty("transform");
      }
      cancelAnimationFrame(frame);
      observer.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      trigger.kill();
      stage.removeEventListener("pointermove", pointerMove);
      stage.removeEventListener("pointerleave", pointerLeave);
      stage.removeEventListener("pointerdown", pointerDown);
      stage.removeEventListener("pointerup", pointerUp);
      stage.removeEventListener("pointercancel", pointerCancel);
      hero.element?.removeEventListener("focusin", focusIn);
      hero.element?.removeEventListener("focusout", focusOut);
      document.removeEventListener("visibilitychange", sync);
      cloud?.replaceChildren();
      engine.dispose();
    },
  };
}
