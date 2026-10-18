---
name: implement-feature
description: Implement a requested portfolio feature or refactor with focused Next.js code and proportionate tests; not for planning-only or review-only requests.
---

# Implement Feature

1. Read AGENTS.md, docs/development.md, and the applicable spec or task. Check Git status and preserve concurrent changes. Work on a task branch based on develop, never directly on develop or main.
2. Resolve material scope gaps before editing. Implement the smallest vertical slice satisfying the acceptance criteria.
   For copy, catalog or asset work, apply [editorial guidelines](../../../docs/editorial-guidelines.md)
   and [public-content boundaries](../../../docs/public-content.md); generated CV
   outputs must come from reviewed source, not independent edits.
3. Use App Router and Server Components by default. Keep client boundaries narrow, validate external input, and never expose secrets through props or public environment variables.
4. Before adding imports, use the [module contract](../../../docs/architecture.md#source-module-contract)
   to choose ownership. Keep pure policy in the feature's domain, environment I/O in
   adapters and React state in presentation. Compose through existing named entry
   files; adding a generic barrel or weakening the guard is not a boundary fix.
   Run `npm run test:architecture` after dependency changes, including type-only ones.
   Do not import the complete bilingual content registry into client components;
   pass the smallest serializable display data from server composition.
   Colocate code, use clear types and composition, and extract reusable components only for actual shared behavior or a useful boundary. Avoid speculative generalization and unrelated refactors.
   Apply [the shared code-quality standard](../../../docs/code-quality.md), then
   inspect the diff for narration comments and unnecessary doc blocks. Preserve
   comments that carry real constraints; simplify unclear code before explaining it.
5. Build semantic, keyboard-accessible, responsive UI. Include relevant loading, empty, and error states; avoid inventing profile content.
   Reuse the owned shadcn primitives in `src/shared/ui/` and the theme bridge
   in globals.css. Preserve links, native no-JS disclosures and custom 3D boundaries;
   a registry update must not overwrite local accessibility or visual contracts.
   Loading skeletons require an actual pending resource, not an artificial delay.
6. Add targeted tests when behavior is introduced. Run npm run check and git diff --check, plus relevant production and visual checks. Record what could not be verified.
   For analytics/privacy changes, use the committed [event contract](../../../docs/specs/product-analytics.md)
   and [isolated verification commands](../../../docs/development.md#isolated-analytics-verification).
   Keep independent build gates off in production. Use synthetic loopback sinks
   for ordinary enabled QA. An explicitly authorized end-to-end acceptance may use
   the disposable native API/PostgreSQL/backoffice fixture described in
   [real-flow verification](../../../docs/verification/analytics-real-flow.md); it
   requires owned ports, a fresh database, isolated viewer credentials, no provider
   keys and read-only receipt comparison. Do not treat intercepted replies as that proof. Notices must follow actual flags, storage and known processors,
   without treating a cookieless configuration as a consent exemption.
   Select responsive, document and motion cases from the
   [task-specific QA matrix](../../../docs/development.md#task-specific-qa), including
   both locales when layout or shared copy changes.
7. Update affected documentation and spec verification. Finish with changed behavior, evidence, and remaining risks; commits and pushes require authorization in the task.

For assistant changes, read [the native assistant guide](../../../docs/native-assistant.md)
and its acceptance specification. Preserve the root-layout runtime; do not recreate
controllers when resizing, minimizing or switching locale. Verify affected native
browser cases alongside the scoped strict assistant check.
