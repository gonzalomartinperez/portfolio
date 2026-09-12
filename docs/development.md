# Development workflow

## Spec-driven, proportionate to the change

Use a short specification for each substantive feature under
`docs/specs/<short-kebab-case-name>.md`. Start from [the template](specs/template.md).
Keep the intended behavior and acceptance criteria stable while updating the plan
as implementation teaches us more. Record meaningful deviations and their reasons.
An issue or explicit task is sufficient for a small fix; do not create paperwork
that duplicates an existing source of truth.

Statuses are `draft`, `ready`, `in-progress`, and `done`. A spec becomes `ready`
when scope and consequential choices are resolved, not merely because an agent
wrote it. Mark it `done` only after acceptance criteria have verification evidence.
Keep unfinished checks explicit. Specifications describe requirements; they do not
grant permission to publish, spend money, access accounts, or change infrastructure.

## Design and implementation

- Keep routes in `src/app/`. Colocate feature code first; extract shared components
  or utilities when actual reuse or a meaningful boundary justifies it.
- Prefer focused functions, explicit inputs, descriptive names, composition, and
  small modules. Avoid generic repositories, service layers, or dependency injection
  frameworks for a static portfolio.
- Default to Server Components. Add a narrow client boundary only for browser state
  or interaction. Keep secrets and privileged logic server-side.
- Use semantic HTML, visible keyboard focus, accessible names, readable contrast,
  responsive layouts, and reduced-motion support when adding animation.
- Validate untrusted input at system boundaries. Do not use unsafe HTML rendering
  for content that can be represented as ordinary React elements.
- Use Next.js image and metadata capabilities when relevant. Measure performance
  before adding caching or memoization; record the measurement conditions.
- Keep TypeScript strict. Prefer narrowing and real types to `any`, assertions,
  ignored errors, or duplicated state. Comments explain constraints and reasons.

## Verification

Run `npm ci` after dependency changes, then `npm run check` and `git diff --check`.
`check` covers lint, formatting of Biome-supported files, type checking, and build;
it does not provide behavioral tests, a security audit, or visual accessibility QA.
For user-facing changes, check production behavior, keyboard access, mobile and
desktop layouts, and relevant error/empty/loading states. Add regression tests for
bugs and focused behavioral tests as functionality appears. Select a maintained,
compatible test tool for the actual layer; do not install a suite just to count tests.

Review the exact staged diff for private information, unexpected artifacts, and
scope creep. Dependency auditing is an additional signal, not proof of security.
Never put private career documents, account details, or personal work histories in
specs, examples, commits, or prompts stored in this public repository.

## Agent entrypoints and skills

Codex loads root `AGENTS.md` and discovers `.agents/skills/`. Claude Code loads
`CLAUDE.md`, which imports the same contract, and discovers `.claude/skills/`.
The Claude skill files are thin adapters; edit procedures only in `.agents/skills/`.
Keep each adapter's name and description aligned with its canonical skill.
This avoids symlink requirements on Windows and keeps procedures in one place.

| Skill | Use |
| --- | --- |
| `specify-feature` | Scope, acceptance criteria, design decisions, and a delivery plan |
| `implement-feature` | A tested vertical slice with clean, accessible Next.js code |
| `debug-issue` | Reproduction, root cause, and an authorized regression fix |
| `review-change` | Read-only correctness, security, accessibility, and maintainability review |
| `update-dependencies` | Compatible stable upgrades with lockfile and regression checks |
| `prepare-delivery` | Final verification and an authorized commit or push |

Invoke a skill as `$specify-feature` in Codex or `/specify-feature` in Claude Code.
Restart or refresh discovery in the host after adding skills. Verify discovery there;
file validation alone cannot demonstrate that an installed host loaded a skill.
These are instruction workflows, not sandbox controls. No permissions are relaxed,
no MCP servers are installed, and no publish hooks run automatically.

If parallel agents are explicitly requested later, assign disjoint file ownership
and separate registered worktrees. The integrator owns shared configuration and the
lockfile. Each handoff includes objective, base commit, allowed files, checks,
result, and remaining risks. Preserve other contributors' edits and remove only
integrated, clean worktrees. A single coordinator is sufficient for this initial app.

## Commit convention

Use `type(scope): imperative summary`, with a meaningful scope when useful.
Keep the subject concise, then explain why the change is needed and any tradeoffs.
Record validation and limitations in the body. Use `BREAKING CHANGE:` and issue
references only when they actually apply. Do not invent issue IDs or claim tests ran.
Prefer one coherent change per commit, with no credentials or local absolute paths.
Pushing is a separate external action and requires user authorization.

## Sources

Checked on 2026-09-12. SDD here is a repository convention, not a claim that either
agent vendor mandates a universal development process.

- [Codex instructions](https://learn.chatgpt.com/docs/agent-configuration/agents-md)
- [Codex skills](https://learn.chatgpt.com/docs/build-skills)
- [Claude Code memory and imports](https://code.claude.com/docs/en/memory)
- [Claude Code skills](https://code.claude.com/docs/en/skills)
- [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/)
