# Native assistant migration

## Decision and source

The owner approved a native portfolio assistant and a separate authenticated
operations application on 2026-10-04. This supersedes the dormant direct panel and
later iframe proposal. The assistant implementation is migrated from frontend
`aed8ea710c8b847ddc9066aaef5ce48d3793b494`, preserving its domain, application
controller, HTTP/SSE validation and interaction behavior. The retired implementation
must not be mounted alongside it.

The committed API reference is `c6012067c4a99db477bb6ddcf1f26dae095641ca`;
its contract artifacts correspond to handoff snapshot `15b6943f741ac80498a5fee611aa74d24250eb6b`.
The API working tree is not a dependency.

## Acceptance

- Root layout owns one lazy assistant instance after first opening.
- Compact desktop, expanded modal and mobile modal retain the same composer and runtime.
- `/assistant` and `/es/assistant` present that same runtime independently.
- Internal navigation and language switches preserve draft and conversation.
- Theme authority is the existing `data-theme`; no assistant preference storage.
- Minimize preserves an authorized response, pauses presentation and restores launcher focus.
- Explicit stop and unmount retain cancellation and reader cleanup semantics.
- Source links are reviewed HTTPS references; Markdown cannot execute HTML or load remote images.
- Runtime-validated public starter catalog provides up to three prompts, preparing a draft.
- HTTP session bootstrap, CSRF, history, feedback, rename, delete and recover do not regenerate.
- Responsive layout, keyboard/IME, focus restoration, reduced motion and failure states are tested.

## Boundaries

`src/features/assistant/domain` contains pure state and transitions;
`application` owns lifecycle and transport ports; `adapters` map HTTP/SSE and
catalog payloads; `presentation` owns React and rendering. The feature entry
composes transport and runtime. The stable portfolio host owns layout, focus,
visibility and preferences. Route files contain metadata and composition only.

## Verification

Run `npm run test:assistant`, `npm run test:assistant-contract`,
`npm run typecheck`, `npm run typecheck:assistant`, `npm run lint`,
`npm run build`, `npm run test:budget`, and
`npx playwright test tests/browser/assistant.spec.ts`.

Browser fixtures exercise the actual adapter, runtime validation and SSE mapping.
The loopback network tests exercise streaming over real HTTP but remain deterministic
fixtures. Neither proves live OpenAI quality or production cross-origin cookies.
Physical mobile keyboards and screen readers require separate testing.
