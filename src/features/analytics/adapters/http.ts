import { type EventIntent, eventIntent } from "../domain/events.ts";
import { type InteractionIntent, interactionIntent } from "../domain/interactions.ts";

const maxInFlight = 4;
const maxInteractionInFlight = 2;
const maxBodyBytes = 1_024;

export function analyticsEndpoint(value: string | undefined): string {
  if (!value) throw new Error("Enabled analytics requires ANALYTICS_INGEST_URL");
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new Error("Invalid analytics endpoint");
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/api/v1/analytics/events"
  )
    throw new Error("Invalid analytics endpoint");
  return url.href;
}

type Options = { fetch: typeof fetch; id: () => string; signal: () => AbortSignal };

/** Lossy, bounded delivery: no retries, persistent queue or response-body logging. */
export function createAnalyticsTransport(endpoint: string, options: Options) {
  const url = analyticsEndpoint(endpoint);
  let inFlight = 0;
  let interactionsInFlight = 0;
  return {
    record(intent: EventIntent | InteractionIntent) {
      const reviewed = eventIntent(intent) ?? interactionIntent(intent);
      if (!reviewed || inFlight >= maxInFlight) return;
      const interaction = "region_id" in reviewed;
      if (interaction && interactionsInFlight >= maxInteractionInFlight) return;
      try {
        const id = options.id();
        if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(id))
          return;
        const body = JSON.stringify({
          schema_version: interaction ? 2 : 1,
          project: "portfolio",
          source: "site",
          event_id: id,
          ...reviewed,
        });
        if (new TextEncoder().encode(body).byteLength > maxBodyBytes) return;
        const signal = options.signal();
        inFlight += 1;
        if (interaction) interactionsInFlight += 1;
        void Promise.resolve()
          .then(() =>
            options.fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body,
              credentials: "omit",
              referrerPolicy: "no-referrer",
              cache: "no-store",
              redirect: "error",
              keepalive: true,
              signal,
            }),
          )
          .then((response) => response.body?.cancel())
          .catch(() => {})
          .finally(() => {
            inFlight -= 1;
            if (interaction) interactionsInFlight -= 1;
          });
      } catch {
        // Delivery must not interfere with the interaction when browser facilities fail.
      }
    },
  };
}
