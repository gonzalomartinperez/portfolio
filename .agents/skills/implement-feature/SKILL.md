---
name: implement-feature
description: Implement a requested portfolio feature or refactor with focused Next.js code and proportionate tests; not for planning-only or review-only requests.
---

# Implement Feature

1. Read AGENTS.md, docs/development.md, and the applicable spec or task. Check Git status and preserve concurrent changes.
2. Resolve material scope gaps before editing. Implement the smallest vertical slice satisfying the acceptance criteria.
3. Use App Router and Server Components by default. Keep client boundaries narrow, validate external input, and never expose secrets through props or public environment variables.
4. Colocate code, use clear types and composition, and extract reusable components only for actual shared behavior or a useful boundary. Avoid speculative generalization and unrelated refactors.
5. Build semantic, keyboard-accessible, responsive UI. Include relevant loading, empty, and error states; avoid inventing profile content.
6. Add targeted tests when behavior is introduced. Run npm run check and git diff --check, plus relevant production and visual checks. Record what could not be verified.
7. Update affected documentation and spec verification. Finish with changed behavior, evidence, and remaining risks; commits and pushes require authorization in the task.
