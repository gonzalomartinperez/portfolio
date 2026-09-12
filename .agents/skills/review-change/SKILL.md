---
name: review-change
description: Review a portfolio diff for concrete correctness, security, accessibility, and maintainability issues; read-only unless fixes are explicitly requested.
---

# Review Change

1. Read AGENTS.md, the relevant spec, and the actual diff against the requested base. Inspect callers and tests before concluding a behavior is wrong.
2. Prioritize broken acceptance criteria, server/client data leaks, unsafe input handling, inaccessible interactions, and observable regressions.
3. Check whether new abstractions and dependencies solve an existing need. Do not demand complexity as a style preference or restate automated formatting findings.
   Use [the shared code-quality standard](../../../docs/code-quality.md) to review
   readability and comments. Distinguish missing rationale or misleading contracts
   from optional wording preferences; do not request blanket comment removal.
4. Run safe checks where useful without editing tracked files. Separate verified findings from hypotheses and testing gaps.
5. Report each actionable finding with severity, file and line, a concrete trigger, impact, and a focused suggested correction.
6. When no defects are found, say so and state review coverage and remaining risks. Do not implement, stage, commit, approve a release, or publish as part of a review-only request.
