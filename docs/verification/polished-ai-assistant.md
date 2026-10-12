# Polished native assistant verification

Verified on 2026-10-10 in an isolated Linux worktree with Node 24.21.0 and the
repository lockfile. API source: `61da393520014ed2c8b1f8a0635b3b4e615f9e53`.
No API provider credentials were read, and no real model generation was requested.

## Interface and behavior

- Icon-only Sparkles launcher retains localized names, tooltip and expanded state.
- Rounded panel, blue accents, welcome halo and integrated icon composer reviewed in
  English/Spanish, light/dark, at 1440, 390 and 320 CSS pixels. Question chips,
  pending responses and completed answers fit within the panel. The short-height
  composer retains a 56px minimum to contain its 44px send control and spacing.
- Thirteen isolated visual checks passed, including twelve empty-state Axe audits
  for WCAG 2 A/AA and 2.1 AA, and narrow expanded/dedicated-page bounds.
  Existing conversation coverage also audits the mobile response surface.
- The existing full assistant suite exercised desktop/mobile Chromium, Firefox and
  WebKit. The final focused twelve-case run passed on all four projects for saved
  history, rename/delete focus, actual theme/language switching, request context
  privacy and unknown-route requests. Label assertions follow the updated welcome
  heading; theme changes use the real toggle rather than a hydration-racing DOM write.
- Four final short-viewport tests passed across the same engines at 320×520,
  including 200% text resizing and containment of the send button within its field.
- Four bilingual desktop/mobile editorial checks passed after updating the biography
  expectation to five paragraphs and explicitly verifying the new Coolify/reverse-proxy
  paragraph. Introduction, personal facts and biography remain separate.
- Added deterministic bilingual pending/stop/error checks and cold-chunk mobile
  keyboard containment. A pending response has one polite status announcement;
  visual dots are decorative and stop animating under reduced motion.
- Partial stream, safe Markdown, citations, explicit stop/recovery, clipboard,
  history, IME input and single-generation behavior remain covered. No automatic
  generation retry or fabricated tool progress was added.

## API context and privacy

OpenAPI and generated TypeScript match the API owner's immutable context contract.
The SSE schema/examples retain their original hashes. The request uses its generated
`SendMessage` type, with top-level locale and optional four-field presentation context.
All eighteen published routes match the API allowlist. Unknown routes omit the
optional context; they do not expose private paths or send an invalid fallback route.
The backend treats these hints as untrusted user data, separate from instructions,
source evidence and authorization.

Transport tests preserve credentialed session/CSRF behavior and legacy payloads.
A real loopback cancellation test now waits for the observed connection-close event
instead of assuming cleanup completes within 20 ms, with a bounded failure timeout.

## Build and security checks

`ASSISTANT_ENABLED=true npm run check` passed: repository/content/document checks,
35 assistant tests, contract hashes, strict assistant types, lint, production build
and all nine bundle/asset budgets. This is a fixture verification build, not an
activation configuration change.

The module graph reports `initial: false`: the conversation feature remains deferred.
Its stylesheet measured **3,169 gzip bytes**, within the existing separate 4 KiB
assistant allowance. Other portfolio budgets remain unchanged.
A bounded scan of source and emitted client assets found zero standalone OpenAI-key-shaped
literals; it did not open real environment files or print suspected credential values.
This is static evidence, not a substitute for production configuration review.

## Final interface audit — 2026-10-12

The regular welcome, compact conversation, expanded panel, launcher, waiting, and
failure views retained the approved blue palette and owned design system. The audit
found two concrete small-screen defects: a fixed 72 px menu offset stopped matching
a wrapped toolbar at 200% text, and a recovery action overflowed a 320 px panel.
An enlarged recovery notice could also push the composer below the clipped surface.

The host now measures toolbar layout height without following opening transforms.
The input reserves fixed action space. Recovery notices use the existing callback
inside the native scrollable transcript, with wrapping labels and a 44 px minimum
height. Error updates follow the existing conditional bottom-follow behavior;
reading older messages does not trigger a forced jump. Short viewports preserve the
full assistant title and expose the complete input hint to assistive technology
without allowing secondary chrome to displace the controls.

`ASSISTANT_ENABLED=true npm run check` passed after the final changes, including
strict types, lint, the production build, document checks, and all nine budgets.
The final focused browser run passed **16 cases** across desktop/mobile Chromium,
Firefox, and WebKit: interrupted/provider/session failures, 320 px recovery, combined
320 × 520 / 200% text, long answers, and failure while reading older content.

```sh
BROWSER_TEST_PORT=3294 BROWSER_TEST_UPSTREAM_PORT=3295 node scripts/browser-test-server.ts
# In another terminal, using the same owned local server:
SITE_TEST_ORIGIN=https://127.0.0.1:3294 npm run test:browser -- tests/browser/assistant.spec.ts --grep 'is honest, preserves safe recovery|long output'
```

The preceding broader selection passed 39 cases covering compact/expanded/minimized
continuity, bilingual accessibility, IME, cancellation, waiting, and cold focus.
One new size assertion failed because Firefox represented a 44 px CSS target as
43.999992 px in its rectangle. Target sizes now use computed CSS dimensions; the
original 1 px center-alignment tolerance and test deadlines remain unchanged.
The final four-engine text-resize cases all passed. Initial traces remain retained
as ignored local evidence rather than replacing that result with a retry claim.

The portrait expansion audit measured identical before/after rectangles at 390 px
and 320 px widths; only the icon changed. Desktop expansion changed 440 × 700
to 1393 × 968 in the observed 1440 × 1000 viewport. The redundant narrow expand
action is removed; wide landscape and desktop retain real expand/restore behavior.
Draft, focus, sources, and one-runtime assertions remain in the existing continuity
case, which now waits for the responsive mode before measuring actual geometry
and checks landscape/portrait transitions.

In the follow-up local batch, desktop continuity and text resizing passed, as did
mobile text resizing. An initial mobile geometry assertion sampled the old
portrait rectangle immediately after rotation; the test now waits for the compact
responsive layout before measuring. Firefox exceeded the unchanged global
deadline before reaching the new expansion assertions while other independent
build/browser jobs were active. These initial traces are retained as ignored
local evidence. The coordinated required CI remains the acceptance gate for the
integrated commit; those local timeouts are not recorded as passing cases.
The corrected mobile continuity case then passed in isolation, including real
landscape expansion, portrait return, minimization, source/draft preservation,
focus return, and a single generation request. The enabled full `npm run check`
also passed after the presentation change.

Nine final Desktop screenshots cover English/Spanish, light/dark, desktop/mobile,
compact/expanded/minimized, waiting, failure, and the combined narrow text-resize
case. The latter shows a native scroll to the recovery action with the composer
remaining visible. API replies, citations, waiting, failures, and suggestion fallback
are simulated; no provider calls or production activation were performed. Reduced
motion produced stable captures. Real mobile keyboards and the deployed VPS remain
outside this local evidence.

## Rollout limits

`ASSISTANT_ENABLED` remains unset/false for production. The normal CI also verifies
an independently built disabled Hostinger target. VPS API deployment, real model
quality, exact production TLS/CORS/cookie/proxy behavior and physical on-screen
keyboards remain separately owned acceptance work before activation. No external
admin interface, secret, transcript store or production infrastructure was changed.
Local screenshots and fixture traces remain ignored verification artifacts.
