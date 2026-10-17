"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { createAnalyticsTransport } from "./adapters/http";
import { listenForInteractions } from "./adapters/interactions";
import { createPageVisits } from "./application/page-visits";

function createRuntime(endpoint: string) {
  const transport = createAnalyticsTransport(endpoint, {
    fetch: (...args) => fetch(...args),
    id: () => crypto.randomUUID(),
    signal: () => AbortSignal.timeout(5_000),
  });
  return {
    pathname: null as string | null,
    transport,
    visits: createPageVisits({
      recordPageView: (context) => transport.record({ event_name: "page_view", ...context }),
    }),
  };
}

const runtimes = new WeakMap<Document, ReturnType<typeof createRuntime>>();

export function AnalyticsHost({ endpoint }: { endpoint: string }) {
  const pathname = usePathname();
  useEffect(() => {
    let runtime = runtimes.get(document);
    if (!runtime) {
      runtime = createRuntime(endpoint);
      runtimes.set(document, runtime);
    }
    runtime.pathname = pathname;
    runtime.visits.commit(pathname);
    return listenForInteractions(document, () => runtime.pathname, runtime.transport.record);
  }, [pathname, endpoint]);
  return null;
}
