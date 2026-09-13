import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createFieldEngine } from "./field-engine";

export type SceneRuntime = { sync(paused: boolean): void; dispose(): void };

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
  let touch: { x: number; y: number; scroll: number; time: number; id: number } | null = null;
  let impulseUntil = 0;
  const compact = matchMedia("(max-width: 767px)");
  const viewport = stage.querySelector<HTMLElement>("[data-scene-viewport]");
  const journey = stage.querySelector<HTMLElement>("[data-scene-journey]");
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
    item.style.setProperty("--logo-index", String(index));
    item.style.setProperty("--logo-count", String(sourceMarks.length));
    const angle = index * 2.399963;
    const radius = 0.5 + 0.48 * Math.sqrt((index + 1) / sourceMarks.length);
    item.style.setProperty("--logo-x", String(Math.cos(angle) * radius));
    item.style.setProperty("--logo-y", String(Math.sin(angle) * radius));
    item.style.setProperty("--grid-x", String(((index % 7) / 6) * 2 - 1));
    item.style.setProperty(
      "--grid-y",
      String((Math.floor(index / 7) / Math.max(1, Math.ceil(sourceMarks.length / 7) - 1)) * 2 - 1),
    );
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
  }
  const update = (value: number) => {
    if (appliedProgress === value) return;
    appliedProgress = value;
    (viewport ?? stage).style.setProperty("--stage-progress", String(value));
    stage.dataset.sceneProgress = value.toFixed(4);
    engine.setExpansion(value);
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
    if (compact.matches && now > impulseUntil) {
      engine.setPointer({ x: Math.sin(elapsed * 0.31) * 0.65, y: Math.cos(elapsed * 0.23) * 0.5 });
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
  const pointerMove = (event: PointerEvent) => {
    if (touch && Math.hypot(event.clientX - touch.x, event.clientY - touch.y) > 10) touch = null;
    if (paused || event.pointerType === "touch") return;
    const bounds = canvas.getBoundingClientRect();
    engine.setPointer({
      x: ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      y: 1 - ((event.clientY - bounds.top) / bounds.height) * 2,
    });
  };
  const pointerLeave = () => engine.setPointer(null);
  const pointerDown = (event: PointerEvent) => {
    if (event.pointerType !== "touch" || paused) return;
    const bounds = canvas.getBoundingClientRect();
    if (event.clientY < bounds.top || event.clientY > bounds.bottom) return;
    touch = {
      x: event.clientX,
      y: event.clientY,
      scroll: scrollY,
      time: performance.now(),
      id: event.pointerId,
    };
  };
  const pointerUp = (event: PointerEvent) => {
    const start = touch;
    touch = null;
    if (
      !start ||
      start.id !== event.pointerId ||
      paused ||
      (event.target instanceof Element && event.target.closest("a,button"))
    )
      return;
    if (
      Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10 ||
      Math.abs(scrollY - start.scroll) > 5 ||
      performance.now() - start.time > 350
    )
      return;
    const bounds = canvas.getBoundingClientRect();
    engine.setPointer({
      x: ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      y: 1 - ((event.clientY - bounds.top) / bounds.height) * 2,
    });
    impulseUntil = performance.now() + 650;
    stage.dataset.sceneTap = String(Number(stage.dataset.sceneTap ?? 0) + 1);
  };
  const pointerCancel = () => {
    touch = null;
  };
  const resize = () => {
    engine.resize();
    const width = viewport?.clientWidth ?? innerWidth;
    const height = viewport?.clientHeight ?? innerHeight;
    cloud?.querySelectorAll<HTMLElement>(".scene-logo").forEach((item) => {
      const x = Number(item.style.getPropertyValue("--logo-x"));
      const y = Number(item.style.getPropertyValue("--logo-y"));
      // Keep the readable centre clear until its copy fades before grid settlement.
      const safeX = Math.abs(x) < 0.55 && Math.abs(y) < 0.4 ? Math.sign(x || 1) * 0.65 : x;
      item.style.setProperty("--orbit-x", `${safeX * width * 0.44}px`);
      item.style.setProperty("--orbit-y", `${y * height * 0.4}px`);
      item.style.setProperty(
        "--settled-x",
        `${Number(item.style.getPropertyValue("--grid-x")) * width * 0.44}px`,
      );
      item.style.setProperty(
        "--settled-y",
        `${Number(item.style.getPropertyValue("--grid-y")) * height * 0.4}px`,
      );
    });
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
  document.addEventListener("visibilitychange", sync);
  applyTheme();
  update(deterministic ? fixedProgress : targetProgress);
  resize();
  sync();
  return {
    sync(value) {
      paused = value;
      sync();
    },
    dispose() {
      stage.removeAttribute("data-scene-visible");
      stage.removeAttribute("data-scene-quality");
      stage.removeAttribute("data-scene-tap");
      viewport?.style.removeProperty("--stage-progress");
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
      document.removeEventListener("visibilitychange", sync);
      cloud?.replaceChildren();
      engine.dispose();
    },
  };
}
