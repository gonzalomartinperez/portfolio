# Polished native assistant

Status: complete (interface; production activation remains gated)

## Scope and acceptance

The visitor opens an icon-only Sparkles launcher fixed at the bottom right. Its
accessible name remains localized. A restrained, rounded conversation panel follows
the portfolio's light/dark palette. Compact desktop remains non-modal; mobile and
expanded modes retain keyboard focus, background inertness and VisualViewport support.
No unsolicited opening, initial API call or new animation dependency is introduced.

Thinking… / Pensando… appears while an authorized response has no text. It clears
on answer text, completion, failure or stop. One polite status announces lifecycle
changes; decorative dots are hidden from assistive technologies and stationary with
reduced motion. Connecting and saved-history loading remain distinct states.

The same runtime and draft survive minimizing, resizing, internal navigation and
language changes. Existing SSE cancellation, citations and sanitized Markdown remain.

Requests retain top-level locale and add optional context: theme, opened_path,
current_path and presentation (compact, expanded or page). Paths are restricted to
public portfolio routes, including localized counterparts; unknown routes omit
optional context. No query strings, fragments, referrer, DOM, credentials or personal
visitor attributes are collected. Context is an untrusted hint, never instruction
or evidence. The opening route is captured on explicit opening and the current
route/theme/locale are refreshed at send time.

## API coordination

The API owner published optional context in reviewed implementation
61da393520014ed2c8b1f8a0635b3b4e615f9e53. Imported OpenAPI and generated types
match that immutable revision; SSE schemas/examples are unchanged. All four context
fields are required when present, and paths must match the public API allowlist.
Unknown host routes therefore omit optional context instead of sending a made-up
route or preventing the question. Language stays top-level. The backend treats
metadata separately as untrusted user data, never instructions or authoritative evidence.
No changes to the separately owned API source were made in this frontend delivery.

ASSISTANT_ENABLED remains unset/false in production. Provider credentials remain
exclusively API-owned; the public build contains only the API origin. VPS deployment,
real model calls and production activation are outside this change.

## iOS-inspired visual decisions

Apple's current Materials guidance keeps translucent treatments in controls, with
content remaining legible. The launcher uses a bounded frosted surface with an
opaque fallback; reduced transparency or increased contrast removes its blur.
The conversation itself remains opaque. Rounded chrome, readable message surfaces,
consistent outline icons and restrained opening motion adopt that hierarchy without
claiming to reproduce native Liquid Glass on the web. No rendering dependency is
added. Waiting, explicit stopping, citations and feedback follow the existing API's
capabilities rather than simulated model progress.

The owner supplied Dribbble references and downloaded mockups on 2026-10-10.
Their soft blue halos and layered surfaces inform the welcome glow and launcher;
public content remains the existing portfolio identity, real starter questions and
API-backed controls. The input expands within a bounded height, with icon-only send
and stop actions inside its field to retain usable width on narrow screens.

## Verification plan

Run repository check with fixture-only enabled build, assistant strict typing and
existing assistant tests. Add deterministic bilingual waiting, stop/failure,
route/context privacy and icon-launcher tests. Review both locales/themes at desktop,
mobile and narrow widths; inspect source/build for key-shaped literals without printing
secret values. Preserve disabled-rollout coverage and required CI gates.

See [verification evidence](../verification/polished-ai-assistant.md).

## Sources

- [Owner reference: blue AI Assistant](https://dribbble.com/shots/27119295-AI-Assistant-Mobile-App)
- [Owner reference: Personal Assistant](https://dribbble.com/shots/27151684-Personal-AI-Assistant-Mobile-App-Design)
- [Apple materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- [Apple generative AI](https://developer.apple.com/design/human-interface-guidelines/generative-ai)
- [WAI dialog focus and Escape](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
- [WAI status announcements](https://www.w3.org/WAI/WCAG22/Techniques/aria/ARIA22.html)
- Installed Next.js lazy-loading guide; preserve conditional client dynamic loading.
