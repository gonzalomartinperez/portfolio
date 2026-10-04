# Native portfolio assistant

The portfolio owns the visitor conversation. A root-layout host lazily loads the
feature on first use and preserves it across minimizing, expanding, locale changes
and internal navigation. `/assistant` and `/es/assistant` use the same instance.
The separate backoffice is not a public chat frontend and receives no visitor transcript.

## Configuration and API compatibility

`NEXT_PUBLIC_ASSISTANT_API_URL` is a build-time browser origin, defaulting to
`https://assistant.gonzalomartinperez.com`. It must contain only the API origin,
never `/api`, credentials or a provider key. Existing `/api/v1` paths are preserved.
For local backend integration, build with the HTTPS loopback origin supplied by
the API fixture; start that fixture using its committed development documentation.
The API must explicitly allow the exact HTTPS portfolio test origin and credentials.
Production CSP upgrades insecure requests, so an HTTP API is insufficient for a
production-build browser test. Keep self-signed certificate acceptance test-only.

Requests include credentials; initial GET session falls back to an explicit JSON
bootstrap POST with `X-Session-Bootstrap: 1` only after 401. Mutations carry the
session CSRF header. Provider/session credentials never enter URLs or localStorage.
Sessions remain API-owned host-scoped cookies; the portfolio and API are different
origins. HTTPS sibling subdomains are same-site, which does not replace CORS or CSRF.

`src/contracts/source.json` records the imported revision and SHA-256 hashes.
Run `npm run test:assistant-contract` after refreshing committed artifacts.
Generated types are produced using `openapi-typescript@7.13.0` with its supported
TypeScript 5.9.3 peer in the isolated, lockfile-pinned `tooling/api-contract` package:

```sh
npm run contract:generate
```

This tool's programmatic compiler dependency does not replace the project's
TypeScript 7.0.2 checker. Additional indexed/optional checks apply to the assistant
through `npm run typecheck:assistant`, without broad unrelated portfolio changes.

## Interaction and design

Compact desktop is a named non-modal region. Mobile and expanded panels are
modals with background inertness, focus containment, Escape and restoration.
The page presentation remains a named region below the existing site header.
An open conversation menu consumes Escape before the host minimizes.
The composer accepts Enter to send, Shift+Enter for a newline and ignores IME Enter.
No generation is retried automatically. Reconnect/recovery reads existing state.
Partial answers remain labeled incomplete until durable completion is confirmed.

The theme and language follow the portfolio. Changing language does not rewrite
previous messages. Safe editorial starter prompts remain available if the public
catalog cannot be loaded; they do not claim live model-generated relevance.

Sources use an accessible native disclosure and citation labels; paths remain in
reviewed destination URLs. Feedback is the existing API operation. Copy reports
actual clipboard success/failure. Generic repeated follow-up chips are retired
until a committed contextual payload exists.

Design baseline: portfolio `b8298620305150d74e7cab3a17eecf5ad1653196`.
Owned shadcn buttons, portfolio tokens/fonts and CSS Modules define composition.
Covered background motion pauses in expanded/page views through a scoped hold;
closing releases it without changing the visitor’s explicit pause preference.
Cold WebGL initialization waits until that hold is released. Avatar depth and halo
are decorative, bounded and disabled for reduced motion;
no new animation library is introduced. The VisualViewport host handles viewport
resize/offset, with safe-area-aware composer spacing and natural touch scrolling.

## Migration evidence and limitations

The migration transfers lifecycle/SSE/transport tests from the assistant frontend,
then adapts browser cases to native panels: no postMessage or framing tests remain
applicable. The replacement suite covers continuity, locale, modal keyboard focus,
recovery, history mutations, clipboard, IME, unsafe rendering, long output and motion.
Public model calls, production TLS/CORS/cookies and physical keyboards are separate
verification steps. Production deployment remains owned by vps-ops and unauthorized.

See [acceptance specification](specs/native-assistant.md) and
[measured verification and screenshots](verification/native-assistant.md).

## Reviewed stylesheet allocation

The initial migration measured **25.32 KiB gzip across all stylesheets**, including
**2.72 KiB (2,789 bytes) deferred assistant CSS**. The measured non-assistant styles are **22.59 KiB (23,137 bytes)**.
The existing portfolio allocation remains
**24 KiB**; the new lazy feature has a separately reviewed **4 KiB** allowance.
The webpack module graph report `.next/assistant-budget.json` identifies the
feature CSS and rejects an initial assistant chunk. Budget tests enforce both
allocations independently; this does not conceal the larger total transfer when
a visitor opens the assistant. Browser tests also assert no API request before opening.
Measurements are WSL build artifacts, not field performance.

## API and operations handoff

The committed API's local configuration allows localhost ports 3000/3001.
Production must set `ALLOWED_ORIGINS` to the exact approved portfolio HTTPS origin
(`https://gonzalomartinperez.com`) and retain credentials/CSRF enforcement. Add any
other served origin only after verification; never use wildcard credentialed CORS.
The API route prefix remains `/api/v1`, with no Next.js proxy or iframe framing rule.
Provider-unavailable and knowledge-updating errors have safe localized notices;
unknown backend payloads never become public error text.

vps-ops must verify effective routing, exposed `X-Run-ID`, SSE flushing/timeouts,
forwarded-header trust and the sibling-origin cookie flow before production approval.
This change does not deploy the portfolio, configure CORS remotely or activate CD.

## Browser test transport

Playwright starts one managed Next.js/HTTPS proxy lifecycle through
`scripts/browser-test-server.ts`. OpenSSL creates a one-day self-signed certificate
in an isolated temporary directory; shutdown removes it and stops only the owned
child process. The fixture does not alter production CSP: WebKit correctly applies
`upgrade-insecure-requests`, so testing the production build over plain HTTP is
insufficient. Only Playwright accepts the temporary certificate. The default
listeners are loopback HTTPS 3160 and private HTTP 3161; environment overrides
`BROWSER_TEST_PORT` and `BROWSER_TEST_UPSTREAM_PORT` must be distinct.
