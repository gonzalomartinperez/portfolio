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

## Rollout limits

`ASSISTANT_ENABLED` remains unset/false for production. The normal CI also verifies
an independently built disabled Hostinger target. VPS API deployment, real model
quality, exact production TLS/CORS/cookie/proxy behavior and physical on-screen
keyboards remain separately owned acceptance work before activation. No external
admin interface, secret, transcript store or production infrastructure was changed.
Local screenshots and fixture traces remain ignored verification artifacts.
