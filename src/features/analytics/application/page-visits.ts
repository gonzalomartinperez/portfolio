import { type PageContext, pageContext } from "../domain/events.ts";

export type PageVisitPort = { recordPageView(context: PageContext): void };

/** Keep one instance per document, including React's effect cleanup/restart cycle. */
export function createPageVisits(port: PageVisitPort) {
  let previousPath: string | null = null;

  return {
    commit(pathname: string | null) {
      if (pathname === previousPath) return;
      previousPath = pathname;
      const context = pageContext(pathname);
      if (context) port.recordPageView(context);
    },
  };
}
