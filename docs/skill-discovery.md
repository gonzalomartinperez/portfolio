# Repository skill discovery

[Agent contract](../AGENTS.md#working-agreement) · [Development workflow](development.md)

The six existing skills support ordinary task wording. Their canonical `name` and
`description` frontmatter lives in `.agents/skills/`; `.claude/skills/` contains
adapters that refer to those procedures. No skill is explicit-only. Codex's
implicit invocation policy is enabled by default; there is no local override that
turns it off. The descriptions already distinguish the workflows and remain
unchanged by this discovery clarification.

| Example request without a skill command | Relevant procedure | Scope preserved |
| --- | --- | --- |
| “Plan a keyboard-accessible comparison section; do not implement it yet.” | [specify-feature](../.agents/skills/specify-feature/SKILL.md) | Specification and plan only. |
| “Implement the approved comparison section.” | [implement-feature](../.agents/skills/implement-feature/SKILL.md) | Requested implementation and proportionate checks. |
| “Find why the Spanish homepage flashes on locale changes; diagnosis only.” | [debug-issue](../.agents/skills/debug-issue/SKILL.md) | Reproduce and explain; no unsolicited fix. |
| “Review this diff for accessibility regressions.” | [review-change](../.agents/skills/review-change/SKILL.md) | Read-only review. |
| “Evaluate the proposed dependency update; do not apply it.” | [update-dependencies](../.agents/skills/update-dependencies/SKILL.md) | Compatibility evaluation, not an upgrade or merge. |
| “Check this change and prepare a delivery summary; do not commit.” | [prepare-delivery](../.agents/skills/prepare-delivery/SKILL.md) | Verification and handoff, without commit or push. |

Select the procedure that matches the requested work. A narrow text correction
does not automatically require planning, a full security audit or dependency
maintenance. A combined assignment may use multiple procedures at the relevant
stages without loading every skill in advance.

## Sessions launched from the workspace parent

The host's native catalog depends on its discovery roots and session lifecycle.
Reading a checkout does not prove that the host indexed its skills or refreshed
an already-running session. The local fallback in `AGENTS.md` therefore applies
after the agent identifies this repository: inspect the six frontmatter summaries,
select the matching procedure, and read that procedure before acting. Claude's
entrypoint imports the same agent contract and its adapters resolve canonical
paths relative to their own files.

This fallback needs no global installation, copied skill, parent-workspace edit,
restart, environment change or manual `$` invocation. It supplies repository
instructions when native discovery is unavailable; it does not change host code
or guarantee that a skill appears in the host UI.

## Validation boundaries

Validate canonical frontmatter with the installed skill-creator validator, check
that all six adapter descriptions and relative canonical links agree, and ensure
no explicit-only invocation flag was introduced. Review the examples above for
routing and authority boundaries. Those checks validate repository configuration
and local instructions. They are not an independent live-host selection test or
proof of a native catalog refresh.
