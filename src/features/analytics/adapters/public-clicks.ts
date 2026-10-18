import { clickCell } from "../domain/click-grid.ts";
import { pageContext } from "../domain/events.ts";
import {
  type InteractionIntent,
  interactionIntent,
  layoutRevision,
  regionAllowed,
  viewportCohort,
} from "../domain/interactions.ts";
import { excludedClick, excludedRegion } from "./public-regions.ts";

export function listenForPublicClicks(
  document: Document,
  pathname: () => string | null,
  record: (intent: InteractionIntent) => void,
) {
  const click = (event: MouseEvent) => {
    const view = document.defaultView;
    if (!view || !event.isTrusted || event.button !== 0 || event.detail < 1 || excludedClick(event))
      return;
    const context = pageContext(pathname());
    const viewport = viewportCohort(view.innerWidth);
    const region =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-analytics-region]")
        : null;
    if (!context || !viewport || !(region instanceof HTMLElement) || excludedRegion(region)) return;
    const regionId = region.dataset.analyticsRegion;
    if (!regionAllowed(context.section, regionId)) return;
    const cell = clickCell({ x: event.clientX, y: event.clientY }, region.getBoundingClientRect());
    if (!cell) return;
    const intent = interactionIntent({
      ...context,
      event_name: "public_click",
      region_id: regionId,
      layout_revision: layoutRevision,
      viewport,
      cell_x: cell.x,
      cell_y: cell.y,
    });
    if (intent) record(intent);
  };
  // Observe the source page before React handles a navigation; never prevent the click.
  document.addEventListener("click", click, { capture: true, passive: true });
  return () => document.removeEventListener("click", click, true);
}
