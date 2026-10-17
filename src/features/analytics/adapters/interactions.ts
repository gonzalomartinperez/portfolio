import { type EventIntent, eventIntent, pageContext } from "../domain/events.ts";

/** Read only reviewed semantic attributes, never link URLs, labels or page text. */
export function listenForInteractions(
  document: Document,
  pathname: () => string | null,
  record: (intent: EventIntent) => void,
) {
  const click = (event: MouseEvent) => {
    if (!event.isTrusted || (event.type === "click" ? event.button !== 0 : event.button !== 1))
      return;
    const element =
      event.target instanceof Element
        ? event.target.closest<HTMLElement>("[data-analytics-event]")
        : null;
    if (!element || (!element.matches("a[href]") && !element.matches("summary"))) return;
    if (
      element.matches("summary") &&
      (event.type !== "click" || !element.parentElement?.matches("details"))
    )
      return;
    if (element.matches("summary") && element.parentElement?.hasAttribute("open")) return;
    const context = pageContext(pathname());
    if (!context) return;
    const eventName = element.dataset.analyticsEvent;
    const navigation = eventName === "navigation_click";
    if (event.defaultPrevented && !navigation) return;
    const destination = navigation
      ? pageContext(element.dataset.analyticsDestination ?? null)
      : null;
    if (navigation && !destination) return;
    const candidate = {
      ...(destination ?? context),
      event_name: eventName,
      ...(element.dataset.analyticsTarget ? { target: element.dataset.analyticsTarget } : {}),
    };
    const intent = eventIntent(candidate);
    if (intent && intent.event_name !== "page_view") record(intent);
  };
  document.addEventListener("click", click);
  document.addEventListener("auxclick", click);
  return () => {
    document.removeEventListener("click", click);
    document.removeEventListener("auxclick", click);
  };
}
