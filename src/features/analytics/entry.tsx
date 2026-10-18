"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { listenForExposures } from "./adapters/exposure";
import { createAnalyticsTransport } from "./adapters/http";
import { listenForInteractions } from "./adapters/interactions";
import { listenForPublicClicks } from "./adapters/public-clicks";
import { createExposureSession } from "./application/exposure-session";
import { createMeasurementBudget } from "./application/measurement-budget";
import { createPageVisits } from "./application/page-visits";
import type { InteractionIntent } from "./domain/interactions";

function createRuntime(endpoint: string) {
  const transport = createAnalyticsTransport(endpoint, {
    fetch: (...args) => fetch(...args),
    id: () => crypto.randomUUID(),
    signal: () => AbortSignal.timeout(5_000),
  });
  const budget = createMeasurementBudget();
  const recordMeasurement = (intent: InteractionIntent) => {
    if (budget.take(performance.now())) transport.record(intent);
  };
  return {
    pathname: null as string | null,
    transport,
    recordMeasurement,
    exposures: createExposureSession({
      schedule: (callback, delay) => window.setTimeout(callback, delay),
      cancel: (timer) => window.clearTimeout(timer),
      record: recordMeasurement,
    }),
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
    runtime.exposures.commit(pathname);
    runtime.visits.commit(pathname);
    const stopInteractions = listenForInteractions(
      document,
      () => runtime.pathname,
      runtime.transport.record,
    );
    const stopClicks = listenForPublicClicks(
      document,
      () => runtime.pathname,
      runtime.recordMeasurement,
    );
    const stopExposures = listenForExposures(document, () => runtime.pathname, runtime.exposures);
    return () => {
      stopExposures();
      stopClicks();
      stopInteractions();
    };
  }, [pathname, endpoint]);
  return null;
}
