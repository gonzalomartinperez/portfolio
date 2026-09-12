import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { createFieldEngine } from "./field-engine";

export type SceneRuntime = { sync(paused: boolean): void; dispose(): void };

export function mountScene(stage: HTMLElement, canvas: HTMLCanvasElement): SceneRuntime {
  const engine = createFieldEngine(canvas);
  gsap.registerPlugin(ScrollTrigger);
  let paused = false;
  let onScreen = true;
  const parameters = new URLSearchParams(location.search);
  const requestedProgress = Number(parameters.get("sceneProgress"));
  const deterministic = parameters.has("sceneProgress") && Number.isFinite(requestedProgress);
  const fixedProgress = Math.min(1, Math.max(0, requestedProgress));
  const requestedTime = Number(parameters.get("sceneTime"));
  if (deterministic) engine.setTime(Number.isFinite(requestedTime) ? requestedTime : 0);
  const progress = { value: 0 };
  const cloud = stage.querySelector<HTMLElement>("[data-logo-cloud]");
  const sourceMarks = stage.querySelectorAll<HTMLElement>("[data-tech-icon]");
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
  const update = () => {
    if (paused) return;
    const value = deterministic ? fixedProgress : progress.value;
    stage.style.setProperty("--stage-progress", String(value));
    stage.dataset.sceneProgress = value.toFixed(4);
    engine.setExpansion(value);
  };
  const timeline = gsap
    .timeline({
      scrollTrigger: {
        trigger: stage,
        start: "top top",
        end: () => `+=${innerHeight * (innerWidth < 768 ? 1.25 : 2)}`,
        scrub: true,
      },
      onUpdate: update,
    })
    .to(progress, { value: 1, duration: 1, ease: "none" });
  const sync = () => {
    if (!paused && onScreen && !document.hidden && !deterministic) engine.start();
    else engine.stop();
    if (!paused) update();
  };
  const applyTheme = () => {
    const selected = document.documentElement.dataset.theme;
    engine.setLight(selected === "light");
  };
  const pointerMove = (event: PointerEvent) => {
    if (paused || event.pointerType === "touch") return;
    const bounds = canvas.getBoundingClientRect();
    engine.setPointer({
      x: ((event.clientX - bounds.left) / bounds.width) * 2 - 1,
      y: 1 - ((event.clientY - bounds.top) / bounds.height) * 2,
    });
  };
  const pointerLeave = () => engine.setPointer(null);
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
  document.addEventListener("visibilitychange", sync);
  applyTheme();
  update();
  sync();
  const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
  return {
    sync(value) {
      paused = value;
      sync();
    },
    dispose() {
      stage.removeAttribute("data-scene-visible");
      cancelAnimationFrame(refreshFrame);
      observer.disconnect();
      themeObserver.disconnect();
      timeline.scrollTrigger?.kill();
      timeline.kill();
      stage.removeEventListener("pointermove", pointerMove);
      stage.removeEventListener("pointerleave", pointerLeave);
      document.removeEventListener("visibilitychange", sync);
      cloud?.replaceChildren();
      engine.dispose();
    },
  };
}
