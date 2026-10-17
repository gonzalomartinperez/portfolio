# Native portfolio assistant

[Portfolio architecture](architecture.md) documents the application and publication boundaries.

The native assistant is **disabled by default**. Unset or `false`
`ASSISTANT_ENABLED` removes the launcher and returns 404 for `/assistant` and
`/es/assistant`. Activation is not part of this delivery. For isolated development
or fixture verification only, run `ASSISTANT_ENABLED=true npm run dev` or
`ASSISTANT_ENABLED=true npm run build`. Static production output captures this
setting during the build; changing it on an existing build is not a rollout.
CI verifies the enabled conversation suite and a separate disabled Hostinger build.
After `ASSISTANT_ENABLED=false npm run build`, run `npm run test:smoke` and
`npm run test:assistant-disabled` for HTTP and desktop/mobile browser acceptance.


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

Compact desktop is a named non-modal region. Its expand/restore controls also
work in wide landscape viewports. Narrow panels already fill the usable viewport,
so they keep the minimize control without a redundant expand action. Mobile and expanded panels are
modals with background inertness, focus containment, Escape and restoration.
The page presentation remains a named region below the existing site header.
An open conversation menu consumes Escape before the host minimizes.
The composer accepts Enter to send, Shift+Enter for a newline and ignores IME Enter.
No generation is retried automatically. Reconnect/recovery reads existing state.
Partial answers remain labeled incomplete until durable completion is confirmed.

The floating launcher is an icon-only Sparkles button with a localized accessible
name. The rounded panel uses the portfolio palette; opening motion respects reduced
motion. Waiting shows Thinking… / Pensando… until the first text arrives, then a
polite status announces writing without reading every token. Connecting and history
loading remain separate; there are no invented retrieval percentages or tool stages.

The toolbar measures its layout height so the conversation-menu button stays
aligned with expand/minimize controls when translated labels wrap or text grows
to 200%. Fixed 44 px action targets retain their input space without consuming
extra text width as the font size increases. Recovery notices wrap their message
and action into separate rows when needed inside the scrollable transcript.
They follow the existing bottom-follow policy without displacing the composer
or forcing visitors away from older messages. Short viewports omit the redundant
header subtitle; the complete keyboard hint stays linked to the input for assistive
technology while its visual footprint is removed to preserve reading and action space.

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
closing releases only that hold and restores the remaining motion policy.
The hero, page background, and solar explorer have no visitor-facing pause buttons;
reduced-motion preferences and hidden-document suspension still apply.
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
verification steps. VPS API deployment and activation remain owned by vps-ops; this frontend delivery does neither.

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
This change does not configure CORS remotely or enable the assistant. The normal
portfolio release pipeline remains unchanged.

## Browser test transport

Playwright starts one managed Next.js/HTTPS proxy lifecycle through
`scripts/browser-test-server.ts`. OpenSSL creates a one-day self-signed certificate
in an isolated temporary directory; shutdown removes it and stops only the owned
child process. The fixture does not alter production CSP: WebKit correctly applies
`upgrade-insecure-requests`, so testing the production build over plain HTTP is
insufficient. Only Playwright accepts the temporary certificate. The default
listeners are loopback HTTPS 3160 and private HTTP 3161; environment overrides
`BROWSER_TEST_PORT` and `BROWSER_TEST_UPSTREAM_PORT` must be distinct.

## Optional visitor interface context

Native requests send top-level `locale` plus optional `context` with `theme`,
`opened_path`, `current_path` and `presentation` (`compact`, `expanded`, `page`).
Opening captures the public route; sending reads current route, theme and locale.
Paths are allowlisted; unknown paths omit optional context. Query strings,
fragments, referrers, page HTML and visitor attributes are excluded. Context must
remain an untrusted interface hint, separate from question and authoritative evidence.

The imported API implementation `61da393520014ed2c8b1f8a0635b3b4e615f9e53`
defines optional validated context. OpenAPI and regenerated types match that
immutable source; SSE schemas/examples remain unchanged. The backend passes the
metadata separately as untrusted user data. Missing context preserves legacy
requests; unknown frontend paths omit it to avoid the API's safe 422 rejection.
See [the polish spec](specs/polished-ai-assistant.md).

Before activation, reconcile API deployment handoff with native portfolio ownership:
credentialed CORS must allow the exact portfolio HTTPS origin, and the assistant
origin routes `/api/v1/*` to FastAPI while leaving private backoffice `/api/auth/*`
and operations/health routes with their owner. These are deployment requirements,
not configuration changes performed by this frontend delivery.

## Privacy and reviewed improvement

The assistant and product analytics remain independently disabled in public
builds. In an enabled fixture, conversation messages and relevant interface
context go to the assistant service, which uses OpenAI. The visible disclosure
states that processing, session cookies and the API-provided history period in
natural language. Visitors may provide useful context; the UI does not silently
remove or reject their question because it contains identifying information.
Removing a conversation from history is not a promise of immediate physical erasure
from providers or backups. No automatic model training or learning is represented.

Website analytics accepts only its closed event dimensions. Messages, prompts,
feedback text and conversation IDs never become website-event properties. A
voluntary rating uses the existing conversation feedback operation, not an analytics
payload or another generation request. Backend minimization of unnecessary repeats,
third-party/sensitive information and logging belongs to the API owner; frontend
mock coverage does not establish that model behavior.

The owner-requested improvement loop has these distinct boundaries:

1. Review available bounded aggregates in the private project backoffice. Explicit
   ratings are retained by the assistant service; an aggregate feedback view is a
   separate backend/backoffice increment, not a shipped raw-transcript review.
2. A human chooses a concrete content, prompt or engineering issue to investigate.
3. Reproduce it with synthetic or reviewed de-identified fixtures, without copying
   raw conversation content into analytics, public issues, CI logs or test artifacts.
4. Propose a focused source/content change through its owner's protected PR process,
   run appropriate offline checks/evaluations and review the resulting release.

This describes the authorized review process, not an autonomous training pipeline.
API/backoffice delivery determines which aggregate views are actually available;
conversation-level analysis requires separately defined access, purpose, retention,
deletion and transparency. Real provider-backed evaluations need their own spending
and execution authority. Website collection and the assistant remain off in public
builds; no consent-dependent measure is activated through this process.

Response bodies already occupy their message's full width, with the avatar in a
metadata row rather than a persistent side column. Wide reading layouts retain a
readable line-length cap. Browser coverage checks compact/expanded continuity,
320-CSS-pixel reflow, 200% text, composer access, polite streaming states, real stop,
explicit recovery, source links and reading-position preservation. These are bounded
fixture checks, not physical-device or screen-reader certification. Design review
uses [Microsoft's Human-AI Interaction guidance](https://www.microsoft.com/en-us/research/project/guidelines-for-human-ai-interaction/)
and [WAI status-message guidance](https://www.w3.org/WAI/WCAG22/Understanding/status-messages.html)
without replacing the portfolio's own design system or claiming conformance.
