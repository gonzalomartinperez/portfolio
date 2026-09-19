---
name: specify-feature
description: Define a portfolio feature specification and delivery plan when the user asks to scope or plan behavior; do not implement or publish from a planning-only request.
---

# Specify Feature

1. Read AGENTS.md and docs/development.md, then inspect only the relevant routes and existing specifications.
2. Find the user outcome, constraints, non-goals, and consequential missing decisions. Ask concise questions only when answers would change the result.
3. For substantive features, use docs/specs/template.md; for a small fix, use the task or issue as the specification. Do not invent professional content or product requirements.
   For content or identity changes, identify the approved source and affected
   outputs using [editorial guidelines](../../../docs/editorial-guidelines.md) and
   [public content](../../../docs/public-content.md), including CV exports when applicable.
4. Write observable acceptance criteria with stable IDs, including relevant keyboard, responsive, loading, and failure behavior.
5. Compare the simplest viable design with alternatives only where the tradeoff matters. Identify server/client boundaries and justify any new dependency.
6. Plan small vertical slices, map criteria to verification, and identify public-data and deployment risks.
   Use the [task-specific QA matrix](../../../docs/development.md#task-specific-qa)
   to cover affected locale, viewport, motion and document states without inventing
   a second CI pipeline or promising device performance before measuring it.
7. Finish with the proposed scope, decisions needed, and next action. A planning-only request stops here; do not implement, commit, or publish implicitly.
