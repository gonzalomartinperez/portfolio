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
4. Colocate code, use clear types and composition, and extract reusable components only for actual shared behavior or a useful boundary. Avoid speculative generalization and unrelated refactors.
   Apply [the shared code-quality standard](../../../docs/code-quality.md), then
   inspect the diff for narration comments and unnecessary doc blocks. Preserve
   comments that carry real constraints; simplify unclear code before explaining it.
5. Build semantic, keyboard-accessible, responsive UI. Include relevant loading, empty, and error states; avoid inventing profile content.
   Reuse the owned shadcn primitives in `src/components/ui/` and the theme bridge
   in globals.css. Preserve links, native no-JS disclosures and custom 3D boundaries;
   a registry update must not overwrite local accessibility or visual contracts.
   Loading skeletons require an actual pending resource, not an artificial delay.
6. Add targeted tests when behavior is introduced. Run npm run check and git diff --check, plus relevant production and visual checks. Record what could not be verified.
   Select responsive, document and motion cases from the
   [task-specific QA matrix](../../../docs/development.md#task-specific-qa), including
   both locales when layout or shared copy changes.
7. Update affected documentation and spec verification. Finish with changed behavior, evidence, and remaining risks; commits and pushes require authorization in the task.
