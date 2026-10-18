# Disposable native analytics verification

This opt-in scenario checks native public-site delivery through the actual API and
the authenticated backoffice UI. It is separate from the discarded loopback sink
and intercepted browser suites. Source implementation alone is not a passing
AC-6 result: retain the executed browser receipt and the API owner's independent
database assertions at the same source revisions.

The public assistant and analytics defaults remain disabled. This local procedure
uses only synthetic fixture data, with no provider key, model request, live OAuth,
production database or production activation.

## Service and source agreement

Reserve API HTTPS8317, backoffice HTTP3317, site HTTPS3381 and site upstream
HTTP3382 before starting. Do not stop another listener. Record exact public-site,
API and backoffice commits and dirty status. Frozen dependencies, the PostgreSQL
fixture image and browsers must already be installed by their respective owners.
Coordinate build/browser CPU and process leases separately from source edits.

The API owner owns the committed `scripts.analytics_demo` harness, fixture lifetime,
database and IAM migrations/grants, private session creation, BO standalone build
and startup, independent SQL assertions, and final fixture teardown. Its setup is
documented in `portfolio-assistant-api/docs/local-analytics-demo.md` at API commit
`33c544dead74e0d30283516b6653b0e0aea84bca`. The UI/session contract inspected here is
backoffice commit `a124139e1cfa1d0d496fcf76c518830491fc1679`.

The fixture starts without seeded events. Country attribution stays off. No other
producer may ingest during this scenario. Existing API limits remain60 accepted
new IDs/minute and10,000/day. The scenario makes fewer than40 POST attempts with
zero retry/replay; an emergency guard stops the public context at32 observed
attempts. Normal actions are eight reviewed pointer clicks, three committed page
views, one keyboard navigation and incidental bounded section exposures.
Every analytics POST counts toward that guard before destination or payload
validation. The receipt distinguishes attempted POSTs, validated events and
observed204 responses; a successful run requires those counts to agree.

## Commands after the owners grant runtime leases

The API owner runs, with no provider variables in its process:

```sh
uv run python -m scripts.analytics_demo --authorize-fixture \
  --postgres-image portfolio-assistant-postgres:project-proof \
  --site-origin https://127.0.0.1:3381
```

The owner follows that repository's documented BO migration, session and standalone
startup commands. `NODE_EXTRA_CA_CERTS` belongs in the BO parent process environment;
never disable Node TLS verification. Only generated disposable viewer credentials
are used. Keep `sessions.json`0600 in its0700 fixture directory. Never print, commit
or upload that directory, cookie, environment files or keys.

In the isolated public-site worktree, build the exact fixture endpoint:

```sh
ASSISTANT_ENABLED=false ANALYTICS_ENABLED=true \
  ANALYTICS_INGEST_URL=https://127.0.0.1:8317/api/v1/analytics/events \
  npm run build
```

Start the owned site listeners in a separate process:

```sh
BROWSER_TEST_PORT=3381 BROWSER_TEST_UPSTREAM_PORT=3382 \
  node tools/browser-test-server.ts
```

The existing site server serves TLS pages. Its same-origin synthetic analytics
sink is unused: the built client must POST directly to API8317. The new scenario
rejects a request sent to that site sink. Its browser context permits the disposable
loopback certificate; it does not change system or Node TLS trust.

Set a task-specific absolute path to the owner-provided fixture directory, without
printing its files:

```sh
ANALYTICS_LIVE_AUTHORIZED=disposable-fixture \
  ANALYTICS_DEMO_DIR=/absolute/owner-provided/fixture-directory \
  npx --no-install playwright test --config=playwright.analytics-live.config.ts
```

The sole live spec lives at `tests/integration/analytics-live/real-flow.spec.ts`.
This is a separate config, with one Chromium worker, no retries, no web-server
startup and no authenticated trace, screenshot or video recording. It is excluded
from ordinary browser discovery. Do not run the existing synthetic analytics suites
against this API: their fulfilled requests and cookie positive controls are
different fixtures.

## Evidence and interpretation

The scenario first requires an empty authenticated calendar report. A fresh
unauthenticated BO context must redirect `/analytics` to `/sign-in` and its
`/api/operations` read must return401. Direct private API denial is checked by the
API owner. BO credentials enter only a separate
authenticated context through the privately validated viewer cookie.

EN and ES CV pages generate v1 page views and v2 public clicks/exposures through
native client fetch. Three clicks per locale target grid cell(3,5), and one per
locale targets(5,5). A keyboard navigation produces the existing v1 semantic
navigation event without a fabricated pointer cell. The combined report must show
six published clicks in its one-based column4,row6 cell and two withheld clicks.
Recorded page-view, click and exposure totals must match the authenticated UI.
The report must declare the current partial UTC period and disabled country
collection. Crossing a UTC-day boundary fails this bounded scenario.

Native requests are observed, never intercepted or replayed. Their exact API URL,
204 status, reviewed v1/v2 payload vocabulary, distinct event IDs, body size and
absence of Cookie/Authorization/Referer are checked. Unexpected public browser
origins terminate the context. The accepted counts are observations of received
events, not unique visitors or proof of reading.

The sanitized `native-browser-and-backoffice.json` attachment records bounded
counts, reviewed aggregate dimension groups and verification scope. It contains no cookie, session, private token or
raw body. The API owner must independently verify persisted receipt, semantic, interaction
and page-view totals, unknown-country attribution, and zero conversations, messages
and provider spend using its fixed read-only SQL and owned fixture identity.
The browser separately checks region, grid, locale and navigation presentation in
the authenticated UI; the totals-only SQL receipt does not prove those dimensions. Join that receipt with the browser result before marking
AC-6 satisfied. API-owner duplicate, failure and teardown checks remain separately
attributed evidence; this browser runner does not replay an event.

## Teardown and verification status

Close browser contexts, stop only the owned site process (which terminates its
upstream), then have the API owner stop BO and gracefully terminate the demo.
Its guarded cleanup removes only labelled fixture resources and private material.
Confirm all four owned listeners are released. Do not use blanket Docker pruning,
kill unrelated listeners or delete another session's worktree/build/cache.

This document specifies the executable scenario. It records no executed PASS.
Full quality, protected CI, independent review and source promotion remain the
coordinator's delivery responsibilities.
