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
  const view = document.defaultView;
  if (!view?.IntersectionObserver) return () => {};
  const route = pathname();
  const parsed = pageContext(route);
  if (!parsed) return () => {};
  const { section, locale } = parsed;
  let observer: IntersectionObserver | undefined;
  let generation = 0;
  const queries = [view.matchMedia("(min-width: 832px)"), view.matchMedia("(min-width: 1024px)")];

  function connect() {
    const current = ++generation;
    observer?.disconnect();
    session.pause();
    if (!view || document.visibilityState !== "visible" || pathname() !== route) return;
    const viewport = viewportCohort(view.innerWidth);
    if (!viewport) return;
    const targets = new Map<Element, { key: string; intersecting: boolean }>();
    const ids = new Set<string>();
    observer = new IntersectionObserver(
      (entries) => {
        if (current !== generation) return;
        for (const entry of entries) {
          const observation = targets.get(entry.target);
          if (!observation) continue;
          observation.intersecting = entry.isIntersecting && entry.intersectionRatio >= 0.5;
          session.observe(
            observation.key,
            observation.intersecting && document.visibilityState === "visible",
          );
        }
      },
      { threshold: [0, 0.5, 1] },
    );
    for (const region of document.querySelectorAll<HTMLElement>("[data-analytics-exposure]")) {
      const id = region.dataset.analyticsExposure;
      if (
        !regionAllowed(section, id) ||
        ids.has(id) ||
        excludedRegion(region) ||
        region.closest('[aria-hidden="true"]')
      )
        continue;
      const target = exposureTarget(region, view.innerHeight);
      const intent = interactionIntent({
        section,
        locale,
        event_name: "section_exposure",
        region_id: id,
        layout_revision: layoutRevision,
        viewport,
      });
      if (!target || intent?.event_name !== "section_exposure") continue;
      const observation = { key: "", intersecting: false };
      const key = session.register(
        intent,
        () =>
          observation.intersecting &&
          pathname() === route &&
          document.visibilityState === "visible" &&
          viewportCohort(view.innerWidth) === viewport &&
          region.dataset.analyticsExposure === id &&
          region.isConnected &&
          !excludedRegion(region) &&
          !region.closest('[aria-hidden="true"]') &&
          region.contains(target) &&
          geometricallyVisible(target, view),
      );
      if (!key) continue;
      observation.key = key;
      ids.add(id);
      targets.set(target, observation);
      observer.observe(target);
    }
  }

  connect();
  document.addEventListener("visibilitychange", connect);
  for (const query of queries) query.addEventListener("change", connect);
  return () => {
    generation += 1;
    observer?.disconnect();
    session.pause();
    document.removeEventListener("visibilitychange", connect);
    for (const query of queries) query.removeEventListener("change", connect);
  };
}
