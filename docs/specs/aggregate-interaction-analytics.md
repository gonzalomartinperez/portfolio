# Aggregate public interactions and local verification

Status: in-progress; public API contract candidate pinned, integrated local verification pending.

## Outcome

Extend the existing six-event product analytics slice with useful, coarse click
maps and explicit section exposure. Verify the complete local path from synthetic
browser interactions through the owned API to authenticated backoffice aggregates.
Keep public assistant and analytics collection disabled. This work does not grant
production activation, hosting changes or permission to call a model provider.

The existing [product analytics specification](product-analytics.md) remains the
baseline for semantic events, independent rollout flags, privacy and transport.
The API owner owns wire schemas, ingestion, persistence, reporting and the
backoffice; the portfolio owns reviewed public markup and bounded browser events.
The public v2 schema and examples are pinned to API commit
`284bc0474f66326ffa79082fd9fa53523e0ba27c` in
`contracts/assistant-api/product-interaction-source.json`. This reviewed candidate permits
client development; protected API promotion and the real local demonstration
remain separate acceptance steps. Existing v1 and chat snapshots are unchanged.

## Observable acceptance criteria

| ID | Requirement |
| --- | --- |
| AC-1 | An ordinary disabled build includes no analytics host, observer, event delivery or analytics identity/storage. Analytics and assistant flags remain independent. |
| AC-2 | Click maps use only reviewed public route/region pairs, a closed layout revision, coarse viewport cohorts and bounded integer grid cells. No raw coordinates, DOM snapshots, selectors, text, URLs, form values, user agent or persistent identity leaves the browser. |
| AC-3 | Trusted primary pointer activations qualify once. Keyboard activations retain their existing semantic meaning without invented pointer coordinates. Inputs, forms, editable content, authentication/private controls, assistant content and moving canvases are excluded, including nested descendants. |
| AC-4 | Section exposure uses reviewed IDs and bounded geometry with IntersectionObserver. Hidden documents, route changes, effect restarts and cleanup cannot create false or duplicate exposures. Tall sections remain measurable through bounded heading/sentinel geometry. Exposure is not labeled reading or engagement. |
| AC-5 | The client retains bounded bodies, concurrency and timeouts, no credentials/referrer, no persistent queue or retry, and explicit burst/volume limits for the expanded event stream. Delivery failure does not interrupt public interactions. |
| AC-6 | Local synthetic events traverse the actual API and appear in authorized, product-isolated backoffice aggregates. Browser route interception alone is insufficient evidence for this requirement. No production data, provider call or paid key is used. |
| AC-7 | Country comes only from verified trusted ingress or is unknown. Browser fields, locale and the hosting server location are not country evidence. Trusted-edge and origin-bypass acceptance belong to API/operations owners. |
| AC-8 | Daily, ISO-week and calendar-month page-view reports declare timezone and half-open intervals, source freshness, partial periods and suppression. Retention must support the displayed period. Views are not unique visitors and daily unique counts are never summed into monthly uniques. |
| AC-9 | Public notice remains bilingual and accurate to build flags. The owner prefers no banner; measures requiring consent stay disabled rather than treating the footer as consent. No legal exemption is claimed. |
| AC-10 | Existing architecture, privacy, source/history, browser and transfer budgets remain enforced. Independent review and exact-head protected CI precede the final release tag. |

## Reviewed public catalogue

The following closed identifiers apply to both English and Spanish. They are
reviewed content identifiers, never selectors inferred from a visitor's DOM.

| Page dimension | Region/exposure IDs |
| --- | --- |
| Every reviewed public page | `site-header`, `site-footer` |
| home | `home-featured`, `home-experience`, `home-about`, `home-education`, `home-contact` |
| about | `about-story`, `about-focus`, `about-principles`, `about-opportunities` |
| work | `work-rampy`, `work-teamcubation`, `work-cooperativa`, `work-independent`, `work-projects` |
| filomena | `filomena-problem`, `filomena-approach`, `filomena-outcomes`, `filomena-evidence` |
| stack | `stack-catalogue`, `stack-scope` |
| education | `education-degree`, `education-curriculum`, `education-credentials`, `education-evidence` |
| cv | `cv-downloads`, `cv-summary` |
| contact | `contact-channels`, `contact-resume` |

Validate page/region pairs rather than accepting any region on any page. The
pinned layout revision is `portfolio-v1`. Viewport cohorts align with the site's
52rem/64rem layout breakpoints: mobile below 832 CSS pixels, tablet from 832 through
1023, desktop from 1024. They do not transmit actual screen dimensions.

Use stable editorial bounds; never include a gallery, animated constellation,
solar scene, interactive architecture canvas or conversation surface merely because
its ancestor is public. Tall content uses a bounded heading/sentinel for exposure.
Filtered catalogues and expandable curriculum content need explicit layout handling
or exposure-only measurement instead of mixing incompatible coordinate grids.
A coarse map is not a pixel-perfect reconstruction of the page.

Exposure qualifies after at least 50% of a bounded heading, paragraph or approved
section-start sentinel has
intersected continuously for 500 ms while the document is visible. Route changes,
hiding and cleanup cancel pending qualification. Document-local deduplication
survives effect/theme restarts within a committed route visit; a later committed
visit may qualify again. This is geometric exposure, not proof that content was
unoccluded, read or understood. The observer uses a bounded descendant, not half of
an entire tall page section.

## Bounded browser work

The new optional measurements allow at most 40 attempts in any sliding minute
and 120 per document, with an injected monotonic clock and no persistent state.
They share the existing transport limit of four in-flight requests but may occupy
at most two, retaining capacity for the original semantic events. There is no
retry, queue or delayed replay of dropped measurements. The API keeps its combined
60 events/minute and 10,000/day limits; client limits do not replace those guards
or guarantee complete traffic counts. Reports describe accepted recorded events.

## Small delivery sequence

1. Agree the API-owned closed extension and exact public region catalogue. Pin the
   reviewed schema bytes and document backward compatibility before browser code.
2. Add one bounded click adapter and one shared exposure observer through the
   existing analytics composition point. Keep domain validation pure and inward.
3. Add public markup only to stable reviewed content. Keep dynamic diagrams,
   animation surfaces, conversation UI and editable content outside click regions.
4. Verify rejecting and accepting fixtures, cleanup, deduplication and failure
   behavior; then run the real synthetic local API/backoffice demonstration in an
   explicitly coordinated service and CPU window.
5. Review disclosures and limitations, run unchanged quality gates, integrate
   protected changes and publish the final source/tag receipt. Public collection
   remains a separate operational decision.

## Decisions and alternatives

A coarse aggregate click map does not require session replay. PostHog's documented
click maps depend on autocapture and its scroll maps on page-leave events; its
broader capture model is not adopted by adding these two bounded event types.
Matomo documents explicit data masking and exclusion for heatmaps/session
recordings, which does not make captured content inherently anonymous. Neither
service, SDK nor recording pipeline is introduced by this specification.

Use the browser's asynchronous IntersectionObserver rather than polling scroll
position for exposure. A small owned adapter can preserve the existing reviewed
transport and disclosure boundaries. The accepted baseline extends existing owned PostgreSQL aggregates and renders
charts with SVG or Canvas in the backoffice, without an additional analytics
database, broker, SaaS or replay service. The backoffice owner provides accessible
labels and table alternatives; this site adds no chart runtime or collector.
Umami remains an evaluated alternative, not an adopted dependency. Its operational,
retention and privacy implications would require a separate decision.

Core reporting semantics can be shared with Pequeverso, but public region/goal
catalogues, data stores and credentials remain product-owned. Advertising and
campaign extensions belong to Pequeverso and its separate consent flow; they are
not part of this portfolio slice.
Coarse regions and cells reduce detail but do not establish anonymity of hosting
logs or a lawful basis for public collection.

## Primary references

- [Cloudflare HTTP request headers](https://developers.cloudflare.com/fundamentals/reference/http-headers/)
- [Document visibility state](https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilityState)
- [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [PostHog heatmaps](https://posthog.com/docs/toolbar/heatmaps)
- [PostHog autocapture actions](https://posthog.com/docs/data/actions)
- [Matomo masking and exclusion](https://matomo.org/faq/heatmap-session-recording/data-masking-in-heatmaps-and-session-recordings/)

This specification does not establish integrated acceptance. Exact source SHAs,
executed fixture results and remaining operational prerequisites belong to delivery
evidence. Browser route interception cannot establish API persistence or
authenticated backoffice reporting.


## Local client verification — 2026-10-18

The enabled loopback production build passed `npm run check`, including the
unchanged transfer budgets. A first CSS-budget failure exceeded the existing
24 KiB limit by eight bytes; the nonvisual sentinel now uses local inline geometry
instead of adding stylesheet rules. The limit was not raised.

- All 39 analytics unit tests passed, including frozen contract bytes, negative
  dimensions, dwell cancellation, stale observers, budgets and reserved transport
  capacity. Strict TypeScript and lint passed after the final fixture corrections.
- All 36 new browser cases passed across desktop/mobile Chromium, Firefox and
  WebKit: four native cookie-isolation cases, then 32 public-interaction cases.
- The existing semantic/privacy regression passed 22 browser cases, plus all 22
  production-rendered checks over the bilingual public routes. Its scoped audits
  retain keyboard, both-theme and enlarged-text coverage.
- The native cookie regression checks an actual loopback response, not a fulfilled
  mock: an existing cookie is omitted, a valid response cookie is ignored, and a
  separate credentialed positive control proves the challenge works. Intercepted
  Firefox/WebKit cookie discrepancies remain preserved in local evidence; they are
  not described as a universal browser defect.

Initial fixture failures were retained. Synthetic DOM controls now wait for the
committed page-view event before insertion; navigation assertions wait for the
committed destination and asynchronous event arrival. Deadlines, retries and
production delivery bounds were not relaxed. These are client/fixture results,
not API persistence or backoffice acceptance. AC-6 and trusted-ingress operational
acceptance remain pending. Final-head protected CI and the real local API/backoffice
receipt still gate the release; neither public collection nor the assistant is
activated by these checks.
