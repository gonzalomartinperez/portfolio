import type { createExposureSession } from "../application/exposure-session.ts";
import { pageContext } from "../domain/events.ts";
import {
  interactionIntent,
  layoutRevision,
  regionAllowed,
  viewportCohort,
} from "../domain/interactions.ts";
import { excludedRegion, exposureTarget, geometricallyVisible } from "./public-regions.ts";

type Session = ReturnType<typeof createExposureSession>;

export function listenForExposures(
  document: Document,
  pathname: () => string | null,
  session: Session,
) {
  const browserView = document.defaultView;
  if (!browserView?.IntersectionObserver) return () => {};
  const view = browserView;
  const route = pathname();
  const parsed = pageContext(route);
  if (!parsed) return () => {};
  const { section, locale } = parsed;
  type Binding = {
    region: HTMLElement;
    target: HTMLElement;
    retire(): void;
  };
  const bindings = new Map<string, Binding>();
  let mutations: MutationObserver | undefined;
  let generation = 0;
  const queries = [view.matchMedia("(min-width: 832px)"), view.matchMedia("(min-width: 1024px)")];

  function disconnect() {
    mutations?.disconnect();
    for (const binding of bindings.values()) binding.retire();
    bindings.clear();
    session.pause();
  }

  function connect() {
    const current = ++generation;
    disconnect();
    if (!view || document.visibilityState !== "visible" || pathname() !== route) return;
    const viewport = viewportCohort(view.innerWidth);
    if (!viewport) return;

    function excludedStructure(element: HTMLElement) {
      if (excludedRegion(element)) return true;
      for (let ancestor: Element | null = element; ancestor; ancestor = ancestor.parentElement) {
        if (
          ancestor.tagName.includes("-") ||
          ["SCRIPT", "STYLE", "TEMPLATE"].includes(ancestor.tagName)
        )
          return true;
      }
      return false;
    }

    function register(region: HTMLElement) {
      const id = region.dataset.analyticsExposure;
      if (
        !region.isConnected ||
        !regionAllowed(section, id) ||
        excludedStructure(region) ||
        region.closest('[aria-hidden="true"]')
      )
        return;
      const existing = bindings.get(id);
      if (existing && existing.region !== region) return;
      const target = exposureTarget(region, view.innerHeight);
      if (existing?.target === target && target && !excludedStructure(target)) return;
      if (existing) {
        existing.retire();
        bindings.delete(id);
      }
      const intent = interactionIntent({
        section,
        locale,
        event_name: "section_exposure",
        region_id: id,
        layout_revision: layoutRevision,
        viewport,
      });
      if (!target || excludedStructure(target) || intent?.event_name !== "section_exposure") return;
      let active = true;
      let intersecting = false;
      const key = session.register(
        intent,
        () =>
          active &&
          current === generation &&
          intersecting &&
          pathname() === route &&
          document.visibilityState === "visible" &&
          viewportCohort(view.innerWidth) === viewport &&
          region.dataset.analyticsExposure === id &&
          region.isConnected &&
          !excludedStructure(region) &&
          !excludedStructure(target) &&
          !region.closest('[aria-hidden="true"]') &&
          region.contains(target) &&
          geometricallyVisible(target, view),
      );
      if (!key) return;
      // Per-target observers make queued entries from a retired DOM binding inert,
      // even when React later reuses the same element for a new binding.
      const observer = new view.IntersectionObserver(
        (entries) => {
          if (!active || current !== generation) return;
          for (const entry of entries) {
            if (entry.target !== target) continue;
            intersecting = entry.isIntersecting && entry.intersectionRatio >= 0.5;
            session.observe(key, intersecting && document.visibilityState === "visible");
          }
        },
        { threshold: [0, 0.5, 1] },
      );
      bindings.set(id, {
        region,
        target,
        retire() {
          active = false;
          observer.disconnect();
          session.observe(key, false);
        },
      });
      observer.observe(target);
    }

    for (const region of document.querySelectorAll<HTMLElement>("[data-analytics-exposure]")) {
      register(region);
    }

    if (view.MutationObserver && document.body) {
      mutations = new view.MutationObserver((records) => {
        if (current !== generation || pathname() !== route) return;
        const candidates = new Set<HTMLElement>();
        for (const [id, binding] of bindings) {
          if (
            !binding.region.isConnected ||
            !binding.target.isConnected ||
            !binding.region.contains(binding.target) ||
            excludedStructure(binding.region) ||
            excludedStructure(binding.target)
          ) {
            binding.retire();
            bindings.delete(id);
            if (binding.region.isConnected) candidates.add(binding.region);
          }
        }
        function discover(node: Node) {
          if (node.nodeType !== 1) return;
          const element = node as HTMLElement;
          if (excludedStructure(element)) return;
          if (regionAllowed(section, element.dataset.analyticsExposure)) candidates.add(element);
          if (element.dataset.analyticsExposureTarget !== undefined) {
            const region = element.closest<HTMLElement>("[data-analytics-exposure]");
            if (region) candidates.add(region);
          }
          for (const child of element.children) discover(child);
        }
        for (const record of records) {
          if (record.type !== "childList") continue;
          const parent =
            record.target.nodeType === 1
              ? (record.target as HTMLElement)
              : record.target.parentElement;
          if (!parent || excludedStructure(parent)) continue;
          const region = parent.closest<HTMLElement>("[data-analytics-exposure]");
          if (region && !bindings.has(region.dataset.analyticsExposure ?? ""))
            candidates.add(region);
          for (const node of record.addedNodes) discover(node);
        }
        for (const region of candidates) register(region);
      });
      // Structural changes only: never observe text, attributes, form values or URLs.
      mutations.observe(document.body, { childList: true, subtree: true });
    }
  }

  connect();
  document.addEventListener("visibilitychange", connect);
  for (const query of queries) query.addEventListener("change", connect);
  return () => {
    generation += 1;
    disconnect();
    document.removeEventListener("visibilitychange", connect);
    for (const query of queries) query.removeEventListener("change", connect);
  };
}
