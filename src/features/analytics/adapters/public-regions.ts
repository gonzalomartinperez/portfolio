const excluded = [
  "form",
  "input",
  "textarea",
  "select",
  "option",
  "label",
  "canvas",
  ".react-flow",
  "dialog",
  '[contenteditable]:not([contenteditable="false"])',
  '[role="textbox"]',
  '[role="dialog"]',
  '[role="alertdialog"]',
  "[data-assistant-host]",
  "[data-analytics-private]",
  "[data-analytics-exclude]",
  "[data-privacy-disclosure]",
  "[inert]",
  "[hidden]",
].join(",");

export function excludedRegion(element: Element): boolean {
  return Boolean(element.closest(excluded));
}

export function excludedClick(event: MouseEvent): boolean {
  return event
    .composedPath()
    .some(
      (node) => node instanceof Element && (node.matches(excluded) || node.tagName.includes("-")),
    );
}

/** Prefer explicit stable sentinels; filtered result headings are not a fallback. */
export function exposureTarget(region: HTMLElement, height: number): HTMLElement | null {
  const explicit = region.querySelector<HTMLElement>("[data-analytics-exposure-target]");
  const candidates = explicit
    ? [explicit]
    : [...region.querySelectorAll<HTMLElement>("h2,h3,p,a[href]"), region];
  for (const target of candidates) {
    if (excludedRegion(target)) continue;
    const bounds = target.getBoundingClientRect();
    if (
      Number.isFinite(bounds.width) &&
      Number.isFinite(bounds.height) &&
      bounds.width > 0 &&
      bounds.height > 0 &&
      bounds.height <= height * 2
    )
      return target;
  }
  return null;
}

export function geometricallyVisible(target: HTMLElement, view: Window): boolean {
  if (!target.isConnected || excludedRegion(target)) return false;
  const style = view.getComputedStyle(target);
  if (style.visibility === "hidden" || style.visibility === "collapse") return false;
  const bounds = target.getBoundingClientRect();
  if (bounds.width <= 0 || bounds.height <= 0) return false;
  const width = Math.max(0, Math.min(bounds.right, view.innerWidth) - Math.max(bounds.left, 0));
  const height = Math.max(0, Math.min(bounds.bottom, view.innerHeight) - Math.max(bounds.top, 0));
  return (width * height) / (bounds.width * bounds.height) >= 0.5;
}
