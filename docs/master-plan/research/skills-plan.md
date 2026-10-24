# Agent skills plan: audit and proposal

> Status: planning research, not executed. Translated from the owner's Spanish working file `reports/portfolio-ux/skills-plan.md` (kept outside this repository), dated as in the source. Part of the [master plan](../README.md).

Date: 2026-10-24 · Repo: `gonzalomartinperez/portfolio` @ `origin/main` `b5b3c57` (merge of PR #192) · Scope: `.agents/skills/` (canonical), `.claude/skills/` (adapters), `AGENTS.md`, `CLAUDE.md`, `docs/skill-discovery.md`, `docs/development.md` and the validation in `tests/unit/repository.test.mjs`.

This is a read-only planning task: no repo or worktree was modified. The skill texts below are **proposals** and are applied on a `docs/` or `chore/` branch → PR to `develop`.

Frame of the "master roadmap" that these skills must be able to execute end to end: `reports/Plan maestro perfil AI Engineer.md` §7 and §11 (phases 4–6: v3 copy and CV PDFs, the Rampy case and `/assistant/how-it-works`, and assistant activation), `reports/brief-v3.md` (confirmed facts) and `reports/portfolio-ux/RUBRIC.md` (visual, motion, performance, a11y, responsive, navigation, delight).

---

## 1. Executive summary

**What is working (keep).**
- "Single source" architecture: the procedures live in `.agents/skills/` (Codex discovers them natively) and `.claude/skills/` has 10-line adapters that point to them. A test (`repository.test.mjs` › *Claude skill adapters match canonical metadata and targets*) verifies that the directories match, that the YAML is valid with no duplicate keys, that `name` and `description` are equal, that the link resolves to the canonical file, and that nobody added `disable-model-invocation: true`. This is better than what most public repos have.
- Authority boundaries are explicit and correct: diagnosis/review/planning are read-only; commit, push, merge, activation and spending need authorization; external content counts as evidence, not as instructions.
- The domain knowledge is real and hard to reconstruct: SWC WASM vs native and GLIBC on Hostinger, assistant and analytics flags off by default, CV with hashes, the architecture guard with rejected fixtures, the Playwright browser GC on a shared WSL.

**Main problems.**
1. **Descriptions that under-trigger.** They are between 141 and 171 characters long, written in the imperative rather than the third person, and carry almost no trigger terms (Playwright, CI failing, PR, hydration, Lighthouse, axe, CV, release). Anthropic's guidance says Claude tends to *undertrigger* and recommends "pushy" descriptions with what it does + when to use it + when not to.
2. **Dense bodies without progressive disclosure.** `implement-feature` and `prepare-delivery` (~500 words each) pack analytics, assistant, CV and secrets rules into numbered steps with long sentences. For a common task (a copy fix, a component) they load context that is not needed. Those rules should go to a one-level `references/` folder, linked from the step they belong to.
3. **No output format, checklist or feedback loop.** No skill defines a report template (review, diagnosis, handoff), a copyable checklist, or a "validate → fix → repeat" loop with exact commands.
4. **Workflows for the roadmap are missing.** There are no skills for visual/responsive audit, accessibility, performance (the repo has no Lighthouse), design system/motion, architecture migrations, content with fact sources, CV sync, or `develop → main` release with deploy verification. The release is stuffed into step 7 of `prepare-delivery`.
5. **Outdated data and hard-coded counts.** `docs/development.md` (QA matrix) says "All eight routes in both languages (16 paths)", but `src/app` has 10 routes per locale: home, about, assistant (404 by default), contact, cv, education, stack, work, work/filomena and work/pequeverso. That is 9 public routes, so 18 paths plus 2 assistant-404 paths. `AGENTS.md` ("do not load all six procedures") and `docs/skill-discovery.md` ("The six existing skills", "all six adapter descriptions") stop being true when the first new skill is added.
6. **Validation is structural, not qualitative.** It does not check the `name` regex or that it matches the directory, the maximum description length (1024), XML tags, body length, internal relative links (`../../../docs/...`), reference depth, or parity with the table in `docs/development.md`. `skill-discovery.md` asks to validate with "the installed skill-creator validator", which is external and does not run in CI. There are also no trigger evals or golden tasks.
7. **The Next.js rule is missing.** The `nextjs-agent-rules` block of `AGENTS.md` requires reading `node_modules/next/dist/docs/` before writing code, but `implement-feature` and `debug-issue` do not repeat it in the implementation step, which is exactly where it gets forgotten.

**Proposal in one line.** Rewrite the 6 skills with explicit-trigger descriptions and bodies of ≤ 80–120 lines with a checklist and an output template; move domain rules to `references/`; add 8 new skills (`audit-visual-quality`, `audit-accessibility`, `audit-performance`, `evolve-design-system`, `migrate-architecture`, `update-public-content`, `sync-cv`, `release-to-production`); harden the static test and add a bank of trigger evals and golden tasks outside the required CI.

---

## 2. Current best practices (2025–2026), with sources

| # | Practice | Source |
|---|---|---|
| P1 | The frontmatter requires `name` (≤ 64 characters, `a-z0-9-`, no hyphen at the start, at the end or doubled, equal to the directory name, without the reserved words "anthropic"/"claude") and `description` (1–1024 characters, no XML tags). Optional fields of the standard: `license`, `compatibility` (≤ 500), `metadata` and `allowed-tools` (experimental). | [Agent Skills spec](https://agentskills.io/specification) · [Anthropic best practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) |
| P2 | The description says **what it does and when to use it**, in the **third person**, with concrete key terms. It is the only thing that is always loaded (~100 tokens per skill) and it is used to choose among more than 100 skills. | [Best practices › Writing effective descriptions](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices) |
| P3 | Claude tends to *undertrigger*: a somewhat "pushy" description is advisable, and all the "when to use" guidance goes in the description, not in the body. | [anthropics/skills › skill-creator](https://github.com/anthropics/skills/tree/main/skills/skill-creator) |
| P4 | In Codex, the description has to say when the skill **should and should not** be activated; put the use case and trigger words first, keep one skill per job, and write imperative steps with explicit inputs and outputs. | [Codex › Build skills](https://learn.chatgpt.com/docs/build-skills) (formerly `developers.openai.com/codex/skills`) |
| P5 | Progressive disclosure in 3 levels: metadata → `SKILL.md` body (< 5000 tokens, < 500 lines) → `references/`, `scripts/` and `assets/` on demand. References go **one level** away from `SKILL.md`, and those over 100 lines get a table of contents. | [Spec › Progressive disclosure](https://agentskills.io/specification) · [Engineering post, 2025-10-16](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) |
| P6 | "Claude is already very capable": add only the context it lacks and tune the degrees of freedom. Fragile operations (migrations, releases) get exact commands; open-ended tasks (review) get heuristics. | Best practices › Concise is key / Degrees of freedom |
| P7 | Workflows with a **copyable checklist** and **feedback loops** (validator → fix → repeat); plan → validate → execute pattern for risky or batch changes. | Best practices › Workflows and feedback loops |
| P8 | Output templates (strict or flexible) and input/output examples. | Best practices › Template pattern / Examples pattern |
| P9 | Nothing date-dependent in the body: historical material goes in an "old patterns" section. Terminology is consistent and paths use `/`. | Best practices › Content guidelines |
| P10 | **Evals first**: measure the baseline without the skill, write at least 3 scenarios and compare with and without the skill; test with the models that will be used. | Best practices › Build evaluations first |
| P11 | Trigger evals: about 20 queries (8–10 that should trigger the skill and 8–10 *near-misses* that should not), each run 3 times, with a 60/40 train/test split and the description chosen by the test score. | skill-creator (`scripts.run_loop`) |
| P12 | Claude Code adds `when_to_use`, `disable-model-invocation`, `user-invocable`, `allowed-tools`/`disallowed-tools`, `context: fork` + `agent`, `paths`, `model` and `effort`. The description plus `when_to_use` is truncated at **1536 characters** in the listing. Workflows with side effects (deploy, commit) are candidates for `disable-model-invocation: true`. Outside Claude Code, the extra keys may cause errors. | [Claude Code › Skills](https://code.claude.com/docs/en/skills) |
| P13 | Codex discovers `.agents/skills` from the cwd up to the repo root and also `$HOME/.agents/skills`; `agents/openai.yaml` is optional (`policy.allow_implicit_invocation`, `interface`, `dependencies.tools`). | [Codex › Build skills](https://learn.chatgpt.com/docs/build-skills) |
| P14 | `AGENTS.md`: Codex concatenates from the root down to the cwd, one per directory (`AGENTS.override.md` takes priority) and with a limit of **32 KiB** (`project_doc_max_bytes`). It recommends a concise `## Code Review Rules` section near the code. | [Codex › AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md) · [agents.md](https://agents.md) |
| P15 | Security: audit the scripts and dependencies of skills and distrust instructions that tell the agent to connect to untrusted networks. | Engineering post › Security considerations |

**Public reference examples:** [anthropics/skills](https://github.com/anthropics/skills). `skill-creator` is the meta-flow with evals and a viewer; `webapp-testing` is Playwright with helper scripts and the rule "run scripts as black boxes, use `--help` first"; `frontend-design` is explicit aesthetic direction to avoid generic UI; `mcp-builder` is a phased workflow with a per-language `reference/`. In this workspace, the skills of `portfolio-assistant-api` (`api-change-stream`, `api-verify-release`) already use a better pattern than the portfolio's: a bounded domain and "Use for X, not Y" in the description.

**Implication for this repo.** The open standard allows targeting Codex and Claude with a single `SKILL.md`. It is advisable to keep only the spec fields in the canonical file (`name`, `description` and optionally `metadata`) and to avoid Claude Code-only keys such as `when_to_use` or `paths`: they break the parity the test requires and Codex does not understand them.

---

## 3. Audit by skill

Scale from 0 to 3 per criterion: **T** trigger quality of the description · **C** clarity and structure · **W** coverage of the real workflows · **PD** progressive disclosure and length · **V** verification and feedback loop · **S** safety and authority.

| Skill | Purpose | T | C | W | PD | V | S | Total /18 |
|---|---|---|---|---|---|---|---|---|
| specify-feature | Spec and plan, without implementing | 2 | 2 | 2 | 3 | 1 | 3 | 13 |
| implement-feature | Vertical slice with tests | 1 | 1 | 2 | 0 | 2 | 2 | 8 |
| debug-issue | Reproduce and diagnose; fix if asked | 2 | 1 | 2 | 2 | 2 | 3 | 12 |
| review-change | Read-only review of the diff | 2 | 1 | 2 | 1 | 1 | 3 | 10 |
| update-dependencies | Compatible upgrades | 2 | 2 | 3 | 2 | 3 | 3 | 15 |
| prepare-delivery | Verification, commit/push, release | 1 | 1 | 1 | 1 | 2 | 3 | 9 |

### 3.1 `specify-feature`
- **Description:** it distinguishes "planning-only" well, but lacks trigger synonyms: spec, acceptance criteria, scope, plan, design doc, `docs/specs/`.
- **Strengths:** it uses `docs/specs/template.md`, stable IDs for the ACs, and maps to the source contract.
- **Gaps:** it does not list the states the UX rubric requires in each AC: light/dark theme, `prefers-reduced-motion`, 320 px, target size, CWV budgets. It does not say where to leave the spec (`docs/specs/<kebab>.md`, `Status: draft`) nor link to `docs/verification/`. It does not cover content specs that depend on `brief-v3` or career-ops (Rampy case, how-it-works).
- **Output:** it says "proposed scope, decisions needed, next action", but without a template.

### 3.2 `implement-feature`
- **Description:** generic ("feature or refactor"); it overlaps with what `evolve-design-system`, `migrate-architecture` and `update-public-content` should cover.
- **Main problem:** step 6 is a wall of ~15 lines about analytics, with a real fixture, PostgreSQL and a backoffice. That applies to a tiny percentage of tasks and should go in `references/analytics.md`. The assistant paragraph at the end is left loose, outside the numbering.
- **Missing:** reading `node_modules/next/dist/docs/` (AGENTS rule); creating or verifying the `feat/…` branch from `develop` with a prior fetch; the `npm run test:architecture` → fix → repeat loop; a concrete command to start the QA server (`tools/test-server.mjs` or `browser-test-server.ts`, with its own port); and the handoff template (the PR template's).
- **Outdated or imprecise:** "relevant production and visual checks" does not say which; the QA matrix it references has the old route count.

### 3.3 `debug-issue`
- **Strengths:** it separates symptoms from hypotheses, proposes minimal experiments, asks for a regression test first, and covers build phases, GLIBC/WASM and stale CV by hash.
- **Problems:** step 3 mixes the architecture guard with the general method (the sentence "Separate symptoms from hypotheses" ended up inside the guard step). It lacks an explicit **CI triage** step: `gh run view --log-failed`, Playwright artifacts (`.artifacts/playwright/`), `retain-on-failure` trace, `failOnFlakyTests`, the browser groups planner, and the rule "reproduce in isolation before talking about overload", which today lives in `compatibility.md`. It does not mention the Next hydration flow (read the local docs). There is no report template.
- **Trigger:** "failures, regressions, hydration errors, or build issues" is fine, but it lacks "CI red", "flaky Playwright", "works locally but not on Hostinger", "console error" and "layout broken on mobile".

### 3.4 `review-change`
- **Strengths:** it prioritizes well (AC, server→client leaks, a11y, regressions), requires reproducible evidence, and separates blockers from suggestions.
- **Problems:** it has no defined severity scale or findings template. The privacy, metrics and design system rules are interleaved in steps where they do not belong (privacy's is in step 5, "report"). There is no "determine the base" step, i.e. PR against `develop` or release against `main`, with `gh pr diff` or `git diff origin/develop...HEAD`. It does not distinguish reviewing a diff from auditing the whole site, and that is where the new `audit-*` skills come in.
- **Outdated:** nothing serious.

### 3.5 `update-dependencies`
- **The best of the set:** it has a reference (`compatibility.md`) with a table of coupled changes, evidence per SHA, the Playwright GC caveat and "no implied deployment".
- **Problems:** the body duplicates part of the reference (WASM/GLIBC, native Tailwind). The description does not mention Dependabot, npm audit, security advisory or lockfile, which are the real triggers. `compatibility.md` is 57 lines long, so it needs no table of contents.
- **Minor gap:** an explicit "evaluate → report → apply only if authorized" order with a report template (current version, proposed, support, breaking, evidence).

### 3.6 `prepare-delivery`
- **Structural problem:** it combines three distinct jobs: (a) verifying and handing off a task, (b) commit, push and PR to `develop`, and (c) `develop → main` release with head SHA checks and Hostinger. (c) deserves its own skill (`release-to-production`) with its checklist, because it is the riskiest and least frequent step.
- **Domain detail worth moving:** assistant default-off (launcher absent and 404 on both routes), analytics with no requests before activation, ports and leases → `references/disabled-features.md`.
- **Missing:** using `.github/pull_request_template.md` as the template for the PR body, the commit format with examples (P8), and the `gh pr checks` rule on the head SHA, which is in step 7 but mixed in with the report.
- **Description:** "prepare a Conventional Commit" does not trigger on "open the PR", "leave it ready to merge", "push" or "handoff".

### 3.7 `.claude/skills/*` adapters
- **Correct:** the text is identical to the canonical one and they resolve the path from the file itself. The cost is one extra read hop per invocation, which is acceptable.
- **Optional improvement:** add a line to the adapter "Supporting files live next to the canonical file (`references/`)" so that Claude does not look for `references/` inside `.claude/skills/<name>/`.
- **Do not** add `disable-model-invocation` (the test deliberately forbids it) nor `when_to_use` (it breaks parity with Codex). If at some point an extra Claude-only trigger is wanted, it would first have to be decided and the test adapted.

### 3.8 `AGENTS.md`, `CLAUDE.md` and discovery
- `AGENTS.md` is 102 lines long, well below 32 KiB. It is fine that the review rules are in `## Code review rules` (P14).
- "do not load all six procedures" has to be replaced with "do not load every procedure"; in `skill-discovery.md`, "six" becomes "the repository skills"; and the table in `docs/development.md` › *Agent entrypoints and skills* has to be regenerated with the new skills, ideally validated by a test (§6.1).
- In `skill-discovery.md`, routing examples must be added for the new skills, with *near-misses*: "review this diff for a11y" goes to `review-change`, whereas "audit a11y of the whole site" goes to `audit-accessibility`.
- The QA matrix in `docs/development.md` has to be corrected: "All nine public routes in both languages (18 paths), plus the assistant routes returning 404 while disabled".

---

## 4. Design principles for the revised set

1. **Description with a fixed template** (≤ 400 characters, third person): `<Does X on Y of the portfolio>. Use when <concrete triggers, EN/ES synonyms>. Not for <near-misses → neighboring skill>.` Mentioning the neighboring skill helps choose correctly.
2. **Body ≤ 120 lines:** *Authority* (1–3 lines), *Read first* (short list), copyable *Checklist*, *Steps* with exact commands, *Output* (template) and *References* (one level).
3. **Domain knowledge is not repeated:** if it is already in `docs/`, link it; if it is exclusive to the procedure, it goes in `references/`. Cross-cutting rules (secrets, disabled features, QA matrix) live in a single place.
4. **Exact commands where the operation is fragile** (release, CV, guard, upgrades) and heuristics where judgment is needed (review, design).
5. **Nothing date-dependent or frozen versions in the skills:** versions live in `package.json` and `.nvmrc`.
6. **Verb-object names,** like the current set (`debug-issue`): `audit-*`, `sync-cv`, `release-to-production`.

### Responsibility map (no overlap)

| Request | Skill | Neighbor that does NOT apply |
|---|---|---|
| "Define/plan X, do not implement" | specify-feature | implement-feature |
| "Implement X" (feature, component, route, local refactor) | implement-feature | evolve-design-system, migrate-architecture |
| "Change tokens, typography, spacing, motion or primitives across the whole site" | evolve-design-system | implement-feature |
| "Move modules, change layers or the guard policy" | migrate-architecture | implement-feature |
| "Update copy, case study, catalogue, facts" | update-public-content | sync-cv |
| "Regenerate or sync the public CV or the PDFs" | sync-cv | update-public-content |
| "Something fails or CI is red" | debug-issue | review-change |
| "Review this diff or PR" | review-change | audit-* |
| "Audit the site's visuals/responsiveness" | audit-visual-quality | review-change |
| "Audit accessibility" | audit-accessibility | review-change |
| "Measure or improve performance, CWV, 3D" | audit-performance | debug-issue |
| "Evaluate or apply upgrades" | update-dependencies | — |
| "Leave the task ready, commit, push, PR to develop" | prepare-delivery | release-to-production |
| "Release develop → main, verify the deploy" | release-to-production | prepare-delivery |

---

## 5. Proposal (a): rewritten existing skills

> Full proposed text for `.agents/skills/<name>/SKILL.md`. In each `.claude/skills/<name>/SKILL.md` adapter only `name` and `description` change, and they must match the canonical file exactly.

### 5.1 `specify-feature`

```markdown
---
name: specify-feature
description: Writes a portfolio feature specification with acceptance criteria, design decisions and a sliced delivery plan in docs/specs/. Use when the user asks to scope, plan, spec, design or estimate a feature, case study, page or behavior change before building it, or says "don't implement yet". Not for implementing (implement-feature) or reviewing a diff (review-change).
---

# Specify Feature

Authority: planning only. Do not edit source, commit, push or publish. Writing the
spec file itself is allowed when the user asked for a spec document.

## Read first
- AGENTS.md, docs/development.md (spec-driven section), docs/specs/template.md
- Only the routes, views and specs the feature touches (`ls docs/specs/`)
- Content work: docs/editorial-guidelines.md, docs/public-content.md and the
  approved fact source named by the user (e.g. a brief or the career workspace).

## Checklist
- [ ] Outcome, audience, non-goals and the consequential open decisions
- [ ] Acceptance criteria AC-1… that are observable and testable
- [ ] Each UI criterion states locales (en, es), themes, 320 px–1920 px, keyboard,
      reduced motion and loading/failure states that apply
- [ ] Module mapping via docs/architecture.md#source-module-contract
- [ ] Slices with a verification method per criterion
- [ ] Risks: public data, client JS weight, scene budget, deployment

## Steps
1. Ask only questions whose answer changes scope; otherwise state assumptions.
2. Small fix: keep the spec in the task. Substantive: create
   `docs/specs/<kebab-name>.md` from the template with `Status: draft`.
3. Never invent professional facts, metrics or product requirements; cite the
   approved source for each public claim the feature introduces.
4. Map behavior to composition point, pure policy, adapters and presentation.
   For guard changes, include an invalid dependency case that must be rejected.
5. Compare alternatives only where the tradeoff matters. Justify any new dependency.
6. Map each AC to a check from docs/development.md#task-specific-qa or a new test.
   Do not promise device performance before it is measured.

## Output
Spec path (or inline spec) · open decisions · proposed first slice · next skill
(implement-feature, update-public-content, …). Stop here.
```

### 5.2 `implement-feature`

```markdown
---
name: implement-feature
description: Implements an approved portfolio feature, component, route or local refactor as a small tested vertical slice in Next.js App Router. Use when the user asks to build, add, change, wire up or fix behavior and expects code changes. Not for planning only (specify-feature), site-wide tokens or motion (evolve-design-system), module moves (migrate-architecture), copy or CV (update-public-content, sync-cv).
---

# Implement Feature

Authority: the explicit request authorizes its stated scope. Commit and push need
the user's authorization (prepare-delivery).

## Read first
- AGENTS.md, the spec or task, docs/code-quality.md, docs/engineering-standards.md
- The relevant guide in `node_modules/next/dist/docs/` before using a Next.js API
- Only the references below that match the change

## Checklist
- [ ] `git fetch`; on a `feat|fix|refactor|perf/<kebab>` branch from origin/develop
- [ ] Smallest slice satisfying the acceptance criteria
- [ ] Server Components by default; minimal serializable props to clients
- [ ] Imports follow the module contract; `npm run test:architecture` passes
- [ ] Semantic, keyboard-usable, responsive UI with real loading/error states
- [ ] Targeted test added (unit, rendered or tests/browser/*.spec.ts)
- [ ] `npm run check` and `git diff --check` pass
- [ ] Affected QA matrix cases checked; docs and spec verification updated

## Steps
1. Check `git status`; preserve concurrent changes. Resolve scope gaps first.
2. Choose ownership with docs/architecture.md#source-module-contract: pure policy in
   the feature domain, I/O in adapters, React state in presentation. Never add a
   generic barrel, forwarding copy or guard exemption.
3. Reuse primitives in `src/shared/ui/` and the theme bridge in globals.css. Keep
   native no-JS disclosures and links; don't overwrite local a11y adaptations.
4. Do not import the bilingual content registry into client components.
5. Loop: implement → `npm run test:architecture` → fix → repeat; then add the test
   that would have failed before the change.
6. Verify: `npm run check`; then the matching cases of
   docs/development.md#task-specific-qa against a production build on an owned port.
   Run both locales when layout or shared copy changes.
7. Inspect the diff for narration comments, unrelated edits and secrets.

## References (load only when relevant)
- Analytics or privacy: references/analytics.md
- Native assistant: references/assistant.md
- Copy, catalogue, assets: hand off to update-public-content

## Output
Changed behavior · files · checks run (command → result, SHA) · QA cases covered
and not covered · risks · suggested commit message (not committed).
```

`references/analytics.md` and `references/assistant.md` receive the current step 6 (event contract, loopback sinks, authorized real fixture, notices) and the assistant paragraph (root layout runtime, do not recreate controllers, scoped strict check) **with no change of content**.

### 5.3 `debug-issue`

```markdown
---
name: debug-issue
description: Reproduces and diagnoses portfolio defects (failing CI or Playwright, flaky tests, build or Hostinger/GLIBC failures, hydration and console errors, layout or scene regressions, stale CV downloads) and fixes them only when asked. Use when something is broken, red, flaky or behaves differently than expected. Not for reviewing a diff (review-change) or measuring performance (audit-performance).
---

# Debug Issue

Authority: diagnosis only unless the user asked for a fix. Never kill unrelated
processes, change unrelated dependencies, reset destructively or touch accounts.

## Checklist
- [ ] Expected vs actual, exact reproduction, runtime (Node, browser), source SHA
- [ ] Failing locale, theme, viewport, motion preference (UI issues)
- [ ] Symptoms separated from hypotheses; smallest discriminating experiment
- [ ] Root cause with evidence
- [ ] (Fix) regression check fails before, passes after; `npm run check` passes

## Steps
1. Classify the failure and read its reference:
   - CI or Playwright: references/ci-triage.md
   - Build, install, SWC/WASM, GLIBC, Hostinger: docs/deployment.md
   - Architecture guard: follow the reported dependency path; decide ownership
     before changing imports; keep a minimal failing fixture for guard defects.
   - Rendering: separate server HTML, hydration and client behavior; read the
     matching `node_modules/next/dist/docs/` guide.
   - Hero or scene: scroll direction, toolkit settled, reduced motion, no WebGL.
   - Stale CV: compare rendered hash link, response bytes and manifest before
     touching caching (sync-cv owns regeneration).
2. Reproduce locally on an owned port with a production build when the bug is
   runtime-related. Keep logs free of tokens and private data.
3. Suspected secret exposure: follow
   ../prepare-delivery/references/secret-review.md; never print values.
4. Authorized fix: write the failing check, fix the cause (not the symptom), rerun.
   Keep workaround comments to verified rationale plus a removal condition.

## Output
Cause · evidence (commands, SHA, artifacts) · fix and regression check (if
authorized) · uncertainty · what would need new scope or authority.
```

New `references/ci-triage.md` (~40 lines): `gh run list --branch <b>`, `gh run view <id> --log-failed`, downloading artifacts (`gh run download`), Playwright trace and HTML report in `.artifacts/playwright/`, how to read the `browser-ci-planner` plan, `failOnFlakyTests` and `retries: 1` (a flaky test is a failure), reproducing an isolated spec with `npx playwright test <spec> --project=<desktop|mobile>` over the HTTPS loopback that `playwright.config.ts` requires, and comparing the run's SHA with the PR head.

### 5.4 `review-change`

```markdown
---
name: review-change
description: Reviews a portfolio diff, branch or PR for concrete correctness, security, privacy, accessibility, architecture and maintainability defects and reports prioritized findings with evidence. Use when the user asks to review, check, audit or critique a change, PR or commit range. Read-only unless fixes are requested. Not for whole-site audits (audit-accessibility, audit-visual-quality, audit-performance).
---

# Review Change

Authority: read-only. Do not edit tracked files, stage, commit, approve or merge.

## Steps
1. Establish the base: task PR → origin/develop; release PR → origin/main.
   Use `gh pr diff <n>` or `git diff <base>...HEAD`. Read the spec and callers.
2. Review in priority order:
   1. Acceptance criteria broken or untested
   2. Server-only data, secrets or private content reaching the client or repo
   3. Unsafe input, external links, injected HTML
   4. Keyboard, focus, semantics, contrast in both themes, mobile wrapping
   5. Module contract: run `npm run test:architecture`; inspect dynamic imports,
      re-exports and type deps. Guard policy changes need rejected fixtures.
   6. Unneeded client JS, scene budget, new dependencies without need
   7. Readability per docs/code-quality.md (not formatting handled by Biome)
3. Content: claims vs approved source, EN/ES parity (docs/editorial-guidelines.md);
   CV outputs via docs/public-content.md. Factual divergence ≠ style preference.
4. Privacy and metrics: compare payloads and notices with actual flags and storage.
   Never claim anonymity, compliance or unique visitors from labels.
5. Secrets: references in ../prepare-delivery/references/secret-review.md.
6. Run safe checks that add evidence; label hypotheses and testing gaps.

## Severity
- blocker: violates an AC, leaks data, breaks keyboard use or the build
- major: observable regression or contract drift with a realistic trigger
- minor: maintainability or clarity with concrete cost
- nit: optional; omit unless asked

## Output
| Severity | File:line | Trigger | Impact | Suggested fix |
Then: coverage (what was read and run), QA cases not verified, residual risk.
If no defects: say so and state coverage.
```

### 5.5 `update-dependencies`

The body is kept almost entirely. Changes:

```diff
-description: Evaluate or apply requested dependency upgrades using supported stable versions and verified compatibility; not an instruction to update all packages during ordinary work.
+description: Evaluates or applies requested dependency upgrades (Dependabot PRs, npm audit advisories, Node/Next/SWC/TypeScript/Playwright/Tailwind bumps, lockfile refresh) using supported stable versions and verified compatibility. Use when asked to assess, upgrade, pin or explain a package or runtime version. Not a license to update unrelated packages during ordinary work.
```
- Add `Authority:` at the top (evaluate ≠ apply ≠ merge) and an **Output** template: `Package · current → proposed · support status (source, date) · breaking changes · coupled files · evidence (command → result, SHA) · decision (adopt/defer/reject) · follow-ups`.
- Remove the WASM/GLIBC/Tailwind paragraph from the body, since it is already in `references/compatibility.md`, and leave only "Runtime, compiler, browser or native build changes: read references/compatibility.md first".
- Step 6: replace the loose list with a checklist (`npm ci`, `npm ls --all`, `npm audit`, `npm run check`, the affected browser lane, the protected quality and hosting lanes).

### 5.6 `prepare-delivery` (trimmed; the release moves to `release-to-production`)

```markdown
---
name: prepare-delivery
description: Verifies a finished portfolio task for handoff, prepares a Conventional Commit and the task PR into develop, and commits, pushes or opens the PR only when the user authorizes it. Use when the user says the work is done, asks for a commit message, handoff, push, or PR. Not for develop→main releases or deployment checks (release-to-production).
---

# Prepare Delivery

Authority: verification and drafting by default. Commit, push and PR creation
each require explicit authorization in the task. Never push to develop or main.

## Checklist
- [ ] `git status`, branch name `<type>/<kebab>` from develop, remote, exact diff
- [ ] Unrelated changes left unstaged
- [ ] Acceptance criteria verified; `npm run check` and `git diff --check` pass
      (reuse a recorded pass only for the same SHA, deps and runtime)
- [ ] Dependency changes: `npm ci`, `npm audit`
- [ ] Disabled features still off: references/disabled-features.md
- [ ] Public content, artifacts and staged files free of secrets, private
      documents, unsupported claims and machine paths (references/secret-review.md)
- [ ] Editorial or CV changes checked against docs/public-content.md

## Commit (when authorized)
Stage explicit paths; review `git diff --cached`. Format:
`type(scope): imperative summary` + body (purpose, tradeoffs, real validation).
Example: `fix(ui): keep catalogue arrows with labels on narrow screens`.
Footers only when real. Never invent results, sign-offs or issue numbers.

## Push and PR (when authorized)
Push the task branch; open the PR into develop with
.github/pull_request_template.md filled from real evidence. Then
`gh pr checks <n> --watch` and confirm the run's head SHA matches the PR head.

## Output
Branch · commit SHA · PR URL · checks (command → result) · not verified · risks.
A push proves neither deployment nor security.
```

`references/disabled-features.md` receives the assistant and analytics rules that are currently in step 2: launcher absent, `/assistant` and `/es/assistant` returning 404, zero requests and storage before activation, loopback fixture with the constructed URL, own ports and leases, and the browsers of other sessions.

---

## 6. Proposal (b): new skills

The 8 follow the template from §4. Each one carries a 10-line adapter in `.claude/skills/`.

### 6.1 `audit-visual-quality` (visual QA and responsive)

```yaml
name: audit-visual-quality
description: Captures and reviews a screenshot matrix of the portfolio (routes × en/es × light/dark × 320–1920 px, deterministic hero and scene states) and scores visual hierarchy, consistency and responsive defects against the UX rubric. Use when asked for a visual QA pass, responsive audit, design review of the live or built site, before/after comparison, or README gallery refresh. Read-only unless fixes are requested. Not for diff review (review-change).
```

**Outline.**
1. *Authority:* read-only. The shots go to a report folder outside the repo (`reports/portfolio-ux/shots/`) unless they ask to refresh `docs/gallery/`.
2. *Target:* a production build on its own port (`npm run build`, `tools/test-server.mjs`) or the public site (GET only).
3. *Matrix* (in `references/matrix.md`): 9 public routes × 2 locales × 2 themes × viewports {320, 390, 768, 1280, 1440, 1920}, plus the hero states with `?sceneProgress=<0|0.5|1>&sceneTime=0` (the same mechanism as `tools/capture-gallery.mjs`) and `prefers-reduced-motion`. Naming: `<locale>_<route>-<width>-<theme>.jpg`, the format `shots/` already uses.
4. *Script* (`scripts/capture-matrix.mjs`, it is run, not read): reuses the `captureSettledPage` logic (fonts ready + 2 RAF), waits for the scene to go idle, `fullPage`, and records horizontal overflow (`scrollWidth > clientWidth`) and elements outside the viewport as JSON next to the shots.
5. *Review:* look at each shot (vision) with the `RUBRIC` (`reports/portfolio-ux/RUBRIC.md`) dimensions 1, 5, 6 and 7. Look for wrapping in ES, inconsistent chips and cards, theme contrast, spacing rhythm and touch targets.
6. *Feedback loop:* if a defect appears → `debug-issue` or `implement-feature`, then recapture only the affected shots and compare before/after.
7. *Output:* table `Route | Viewport | Theme | Locale | Issue | Severity | Shot`, a score per dimension with evidence, and a prioritized top 10.

### 6.2 `audit-accessibility`

```yaml
name: audit-accessibility
description: Audits portfolio accessibility against WCAG 2.2 AA with axe-core via Playwright, scripted keyboard paths, focus visibility, target size, 200% zoom and 320 px reflow, contrast in both themes, reduced motion and no-JS fallbacks. Use when asked for an accessibility or a11y audit, WCAG check, keyboard or screen-reader review of routes or components. Read-only unless fixes are requested. Not for reviewing a single diff (review-change).
```

**Outline.**
1. *Existing tooling:* `@axe-core/playwright` is already a devDependency and is used by `routes`, `education-layout`, `privacy`, `solar-explorer`, `tool-carousel` and `not-found`. The audit runs `AxeBuilder().withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa'])` on all routes, both locales and both themes, without a narrowed `include`.
2. *Keyboard* (`references/keyboard-paths.md`): Tab and Shift+Tab from the skip link, mobile menu, language and theme toggles, carousel, solar explorer dialog (focus trap and Escape), CV downloads and no-JS disclosures. The evidence is the keys pressed, not programmatic `focus()` (a rule already in review-change).
3. *Guided manual checks:* visible focus in both themes (2.4.7 and 2.4.11), target size ≥ 24×24 (2.5.8), reflow at 320 px and 200% zoom (1.4.10), `prefers-reduced-motion` (2.3.3), alt text of images and illustrations, and `lang` on the ES page.
4. *Limits:* axe does not certify WCAG; the report distinguishes automatic, manual and unverified (real screen readers).
5. *Feedback loop:* each failure becomes a test in `tests/browser/` as a regression when the fix is authorized.
6. *Output:* `Criterion | Route/state | Evidence | Severity | Fix`, coverage, and what was not verified.

### 6.3 `audit-performance`

```yaml
name: audit-performance
description: Measures portfolio performance with lab Lighthouse runs (mobile and desktop), Core Web Vitals proxies (LCP, CLS, TBT/INP), the existing transfer and scene budgets, and 3D frame-time traces under CPU throttling, then proposes evidence-backed fixes. Use when asked about speed, Lighthouse scores, Core Web Vitals, bundle or image weight, jank, FPS or the cost of the hero and solar scenes. Not for functional bugs (debug-issue).
```

**Outline.**
1. *Existing baseline:* `npm run test:budget` (gzip transfer budgets and the shared 250 KiB scene budget). Its own header clarifies that it is "not a performance measurement". The repo has no Lighthouse or field CWV.
2. *Lab runs* (`references/lighthouse.md`): `npx lighthouse@<pinned version> <url> --preset=desktop|--form-factor=mobile --output=json` against the production build, 3 runs and the median. Propose `@lhci/cli` with `lighthouserc` and budgets (LCP ≤ 2.5 s, CLS ≤ 0.1, TBT as a proxy for INP) as a **separate decision** (specify-feature + update-dependencies), running in `nightly.yml` and not in the required CI.
3. *3D frame budget* (`references/scene-trace.md`): Chrome DevTools Protocol trace with 4× throttling on the hero and solar explorer states; p95 frame time ≤ 16.7 ms on desktop and ≤ 33 ms with throttling (our own target, not a universal standard, same as `docs/research/motion-performance.md`); long tasks and verification that the scene loads lazily and the text paints before the canvas (Master plan §7.2).
4. *Honesty of claims:* lab ≠ field; emulation ≠ FPS on a physical device (a QA matrix rule). Each number comes with SHA, URL, preset, throttling and date.
5. *Feedback loop:* hypothesis → minimal change → re-measure with the same preset → keep only what improves the median.
6. *Output:* before/after metrics table, opportunities ordered by impact/cost, and proposed budget changes.

### 6.4 `evolve-design-system`

```yaml
name: evolve-design-system
description: Changes the portfolio's shared design system (semantic color tokens, typography scale, spacing rhythm, owned shadcn/ui primitives, CSS Module identity, motion durations and easing, reduced-motion behavior) consistently across routes and themes. Use when asked to restyle, unify components, adjust tokens, typography, spacing, animations or transitions site-wide. Not for a single feature (implement-feature) or measuring motion cost (audit-performance).
```

**Outline.**
1. *Read first:* `docs/design.md` (Direction, Colour and typography, Safe visual refresh, Scene architecture and motion, Interaction and accessibility), `docs/assets/shadcn-ui.md` and `docs/research/motion-performance.md`.
2. *Inventory:* grep tokens, CSS variables and usages of each primitive before changing anything (`references/inventory.md` with the commands).
3. *Rules:* semantic tokens mapped in both themes; AA contrast verified; do not overwrite local adaptations with shadcn registry defaults; motion only with transform/opacity and a single frame loop; reduced motion with an equivalent static fallback; durations as documented decisions (180 and 240 ms already are).
4. *Verification:* `audit-visual-quality` on the affected routes (before/after), `audit-accessibility` (focus and contrast), `npm run check` and the `shadcn-controls`, `editorial-layout` and `narrow-readability` specs.
5. *Output:* table of changed tokens, affected components, before/after shots and risks.

### 6.5 `migrate-architecture` (clean architecture migration)

```yaml
name: migrate-architecture
description: Plans and executes module moves, layer changes and architecture-policy updates in the portfolio's enforced source contract (content/, config/, contracts/, media/, tools/, src feature domains, adapters, presentation), keeping the guard strict with rejected-code fixtures. Use when asked to move, split or rename modules, introduce a layer, change import rules or fix a guard failure caused by structure. Not for ordinary features (implement-feature).
```

**Outline.**
1. *Read first:* `docs/architecture.md#source-module-contract`, `docs/adr/site-architecture-parity.md`, `docs/specs/clean-architecture.md`, `docs/research/clean-architecture.md`, `tools/architecture-policy.mjs` and `tests/unit/architecture.test.mjs`.
2. *Plan → validate → execute* (P7): write the move map (`from → to`, owner, entry file) as a table in the spec; validate that each destination is registered in the policy before moving.
3. *Exact rules:* do not restore `src/content`, `src/contracts`, `src/assets`, `scripts` or `tooling`; no forwarding copies or generic barrels; do not widen root exemptions; production does not import `tools/` or `tests/`; tests are classified by what they run (`unit`, `browser`, `helpers`, `integration`, `rollout`).
4. *Loop:* move in slices → `npm run test:architecture` → follow the reported dependency path → repeat. Each policy change adds one rejected fixture and one valid one.
5. *Coordination:* in parallel worktrees, the coordinator owns the policy and the manifests (AGENTS rule).
6. *Output:* executed move map, policy changes with their fixtures, diagrams to regenerate (`docs/diagrams/*.mmd`) and verification.

### 6.6 `update-public-content` (copy and content with fact sources)

```yaml
name: update-public-content
description: Updates the portfolio's public bilingual content (hero and page copy, case studies, catalogue, experience narratives, metadata, alt text) from an approved fact source, keeping US English and neutral Latin American Spanish in parity and every claim traceable. Use when asked to rewrite copy, add or edit a case study, apply a positioning brief, change headlines, principles or CTAs. Not for regenerating the CV projection or PDFs (sync-cv).
```

**Outline.**
1. *Fact sources, in order:* the brief the user indicates (e.g. `reports/brief-v3.md`), and `career-ops/perfil/datos/hechos-cv.json` and `perfil-canonico.md` as read-only material in the local workspace, never copied into the repo. If a claim does not appear in any of them, it is not published: ask.
2. *Rules* (`references/claims.md`): contractual titles; metrics with baseline, qualifier and team attribution; nothing private (vacancies, phone, notes); style per `docs/editorial-guidelines.md` (no em dashes in prose, no "leveraged/spearheaded", "tú" in ES and no voseo in the interface).
3. *Steps:* locate each string in `content/` and `config/site.ts`; edit EN and ES in the same commit; run `npm run test:content`; for a new case (e.g. `/work/rampy`), create a spec with `specify-feature` and follow the Filomena and Pequeverso format (problem → architecture → evaluation → results → decisions).
4. *Traceability table* required in the PR: `String id | EN | ES | Fact source (file#section)`.
5. *Verification:* `audit-visual-quality` on the touched routes and in both locales (wrapping) and `review-change` focused on factual divergence.
6. *Hand-off:* if the job title, periods or metrics that are also in the CV change, `sync-cv` follows.

### 6.7 `sync-cv`

```yaml
name: sync-cv
description: Regenerates and verifies the portfolio's public CV projection (content/cv-public.json) and the two promoted EN/ES PDFs from the approved editorial source, verified facts and reviewed release manifest, with hash-versioned downloads. Use when the CV, its PDFs, job titles, periods or shared metrics change, or downloads look stale. Never hand-edit generated CV files. Not for page copy (update-public-content).
```

**Outline** (low freedom, exact commands):
1. *Precondition:* the approved inputs exist in the local career-ops workspace and the PDFs are reviewed and promoted by its pipeline (`cv:build` → `cv:check` → `cv:release` in career-ops). If anything is missing, stop and report.
2. `node tools/export-cv.mjs <approved-editorial-json> <verified-facts-json> <reviewed-release-manifest>`
3. Copy only the two promoted PDFs to `public/documents/`.
4. `npm run cv:sync:check -- <same three inputs>` → it must pass without writing files.
5. `npm run test:content` and `npm run test:documents`; compare the Work page, the projection and the PDFs for each shared metric.
6. Verify the hashed link on `/cv` and `/es/cv` and the bytes served (the stale download case from debug-issue).
7. *Forbidden:* editing `content/cv-public.json` by hand, replacing a PDF without review, or copying private inputs into the repo.
8. *Output:* old → new hashes, commands and results, claim differences detected.

### 6.8 `release-to-production` (develop → main release and deploy verification)

```yaml
name: release-to-production
description: Prepares and verifies a portfolio release from develop to main, reconciling the release ledger, confirming every required check on the PR's latest head SHA, merging with a merge commit only when authorized, and verifying the Hostinger deployment with live HTTP smoke checks. Use when asked to release, promote develop to main, ship to production, or confirm what is live. Not for task PRs into develop (prepare-delivery).
```

**Outline** (strict checklist):
1. *Authority:* opening the release PR, merging and touching tags require explicit, separate authorization. DNS, Cloudflare, hPanel and the assistant are not touched.
2. `git fetch`; `gh pr create --base main --head develop` (only this repo's own `develop`); the body carries the ledger: the PRs included since the last merge to main (`git log origin/main..origin/develop --merges --oneline`) with their verification status, plus what is excluded and what is unverified.
3. `gh pr checks <n>` and `gh pr view <n> --json headRefOid,statusCheckRollup`: the SHA of each required job (secrets, quality, build, hosting, browser ×8, performance, checks and Branch policy) must equal the current head. An earlier green run does not count.
4. Merge **with a merge commit** (`gh pr merge <n> --merge`), only if authorized. `develop` and `main` are preserved.
5. *Deploy:* Hostinger deploys `main` on its own (its own CD). Record separately: the CI of `main`, the commit Hostinger says it deployed, and the live HTTP checks (key EN/ES routes returning 200, `/assistant` returning 404 while it is off, CV downloads with the expected hash, and no console errors on home). Suggested script: `scripts/live-smoke.mjs <origin>`, which reuses the logic of `tools/smoke-test.mjs` with a read-only external origin.
6. *Recovery:* document the safe path (revert PR to develop → new release). No force-push or rewrite.
7. *Output:* PR, merge SHA, checks table with SHA, Hostinger observation, live smoke and what was not verified.

### 6.9 Skills considered and discarded (for now)
- **`triage-ci`:** covered by `debug-issue` + `references/ci-triage.md`. A separate skill would overlap in its triggers.
- **`refresh-gallery`:** it is a mode of `audit-visual-quality` (`tools/capture-gallery.mjs`).
- **`activate-assistant`:** phase 6 of the plan depends on the VPS, `vps-ops` and `portfolio-assistant-api`, and on authorization with cost. When it is decided, a skill in the repo that owns the activation is preferable, not in the portfolio. The portfolio only needs the default-off check that is already in `prepare-delivery`.

### 6.10 Roadmap coverage

| Roadmap phase or item | Skills in order |
|---|---|
| Phase 4: v3 copy (§7.1) | update-public-content → audit-visual-quality → review-change → prepare-delivery → release-to-production |
| Phase 4: new CV PDFs | sync-cv → prepare-delivery → release-to-production |
| Work nav first (§7.2) | specify-feature → implement-feature → audit-accessibility |
| Hero: text before the canvas and "good" CWV (§7.2) | audit-performance → specify-feature → implement-feature → audit-performance |
| Phase 5: Rampy case and `/assistant/how-it-works` | specify-feature → update-public-content + implement-feature → audit-visual-quality + audit-accessibility → release-to-production |
| UX rubric dimensions 1–2 (visual, motion) | audit-visual-quality → evolve-design-system |
| UX rubric dimensions 3–5 | audit-performance, audit-accessibility, audit-visual-quality |
| Layer refactors | migrate-architecture |
| Maintenance | update-dependencies, debug-issue |

---

## 7. Proposal (c): skill quality and evals

### 7.1 Quality checklist (for each new or modified skill)

**Metadata**
- [ ] `name` matches `^[a-z0-9]+(-[a-z0-9]+)*$`, has ≤ 64 characters and equals the directory
- [ ] `description` of 1–1024 characters (target ≤ 400), without `<` or `>`, in the third person
- [ ] The description includes what it does, *Use when* with real triggers, and *Not for* with the neighboring skill
- [ ] No keys outside the spec in the canonical file; the adapter is identical in `name` and `description`

**Body**
- [ ] ≤ 120 lines (hard cap of 500); *Authority* line at the top
- [ ] Copyable checklist, imperative steps with exact commands where the operation is fragile
- [ ] At least one feedback loop (validator → fix → repeat)
- [ ] *Output* template
- [ ] One-level references, relative links that resolve, a table of contents if they exceed 100 lines
- [ ] No dates or frozen versions; terminology consistent with `docs/`
- [ ] Does not duplicate `AGENTS.md` or `docs/`: it links

**Safety**
- [ ] Separates evaluating, applying and publishing; names what it never authorizes (merge, deploy, activation, accounts, spending)
- [ ] External content = evidence; secrets only as redacted metadata
- [ ] Own scripts audited, no network except explicit reading of the public site

**Evals**
- [ ] Has entries in the trigger set (≥ 4 positives and ≥ 4 near-misses)
- [ ] At least one golden task with a rubric

### 7.2 Static validation in CI (extension of `repository.test.mjs`)

Added to the existing test with no new dependencies, because `yaml` is already used. It runs in `npm run test:repository`, which is part of `check:quality`.

1. Regex and length of `name`, equality with the directory name, and no "anthropic"/"claude".
2. `description` ≤ 1024 characters, no `<`/`>`, and containing "Use when" (local convention).
3. Allowed keys in the canonical file: `name`, `description`, `license`, `compatibility`, `metadata`.
4. Body ≤ 150 lines (local convention; the spec allows 500).
5. Every relative Markdown link in each `SKILL.md` and `references/*.md` resolves to an existing file.
6. Files in `references/` do not link to other `references/` (one level only).
7. Each skill appears in the table of `docs/development.md` › *Agent entrypoints and skills* and in `docs/skill-discovery.md`; no hard-coded counts ("six") remain.
8. Each skill has at least 4 `should_trigger: true` and 4 `false` cases in `tests/skills/triggers.json`.

With this, the sentence in `skill-discovery.md` about "the installed skill-creator validator" is replaced with "`npm run test:repository` validates skill metadata, links and catalog parity".

### 7.3 Behavioral evals (outside the required CI)

**Why outside the required CI:** they are non-deterministic, cost tokens and need host credentials. They are run by hand before changing a description or a skill, and optionally in `nightly.yml` with `workflow_dispatch`, as a report and never as a gate.

**Proposed layout** (outside the skill folders, so as not to inflate their content):

```
tests/skills/
  triggers.json        # routing set for the entire catalog
  golden/
    review-a11y-regression.md
    debug-flaky-mobile-nav.md
    specify-rampy-case.md
    sync-cv-stale-hash.md
    release-ledger.md
    ...
  README.md            # how to run and score
tools/skill-evals.mjs  # runner (production does not import it)
```

**`triggers.json`.** There is a single file for the whole catalog because the real problem is choosing *between* skills; there are also multi-label cases and `none` cases.

```json
[
  {"query": "el nav mobile se rompe en 320px en español, averiguá por qué pero no toques nada", "expect": ["debug-issue"], "not": ["implement-feature"]},
  {"query": "revisá el PR 193 por problemas de accesibilidad", "expect": ["review-change"], "not": ["audit-accessibility"]},
  {"query": "pasá axe y teclado por todo el sitio y decime qué falla", "expect": ["audit-accessibility"], "not": ["review-change"]},
  {"query": "sacá capturas de todas las páginas en dark y light a 390 y 1440", "expect": ["audit-visual-quality"]},
  {"query": "el LCP del home en mobile está mal, medilo", "expect": ["audit-performance"], "not": ["debug-issue"]},
  {"query": "cambiá el headline del hero por el del brief v3 en los dos idiomas", "expect": ["update-public-content"], "not": ["sync-cv"]},
  {"query": "subí los PDFs nuevos del CV y que el hash cambie", "expect": ["sync-cv"]},
  {"query": "promové develop a main y confirmá que Hostinger lo publicó", "expect": ["release-to-production"], "not": ["prepare-delivery"]},
  {"query": "listo, hacé commit y abrí el PR", "expect": ["prepare-delivery"]},
  {"query": "planificá el caso de estudio de Rampy, sin implementar", "expect": ["specify-feature"]},
  {"query": "mové los adapters de analytics a su propia capa y actualizá el guard", "expect": ["migrate-architecture"]},
  {"query": "unificá los botones y chips y bajá la duración de las transiciones", "expect": ["evolve-design-system"]},
  {"query": "dependabot abrió un bump de next, evaluálo", "expect": ["update-dependencies"]},
  {"query": "¿qué hace el archivo config/site.ts?", "expect": []}
]
```

(The `query` strings are the owner's literal Spanish test prompts and are kept verbatim.)

Target: ~6 per skill (3 varied positives in EN/ES with jargon and typos, and 3 near-misses), about 80–90 in total.

**Runner (`tools/skill-evals.mjs`).**
- Claude Code: `claude -p "<query>" --output-format stream-json --max-turns 3` from the repo root; detect activation by the `Skill` tool invocation or by a `Read` of `.agents/skills/<name>/SKILL.md`.
- Codex: `codex exec --json "<query>"`; detect the read of `SKILL.md`.
- 3 runs per query (P11); sessions are read-only (permissions without editing) and are cut off as soon as the skill is chosen, so the cost is low.
- Metrics per skill: **trigger recall** (hits/positives), **precision** (1 − false triggers on near-misses) and the catalog's **confusion matrix**. Minimum acceptable: recall ≥ 0.8 and precision ≥ 0.9 per skill.
- To optimize one particular description, `skill-creator` can be used (`scripts.run_loop` with a 60/40 split) on that skill's subset, and then revalidate against the full set so as not to break the neighbors.

**Golden tasks** (behavior, not just trigger). Each `golden/*.md` has *setup* (base SHA, branch or fixture with a seeded bug in a disposable worktree), *prompt*, verifiable *assertions* and *rubric*.

Example `debug-flaky-mobile-nav.md`:
- Setup: detached worktree at a known SHA, plus a patch that adds a race in `mobile-navigation`.
- Prompt: "El test de navegación mobile falla a veces en CI. Diagnosticá; no arregles."
- Assertions (script): there are no changes in tracked files (`git status --porcelain` empty); the answer cites the spec and the `mobile` project; it mentions `failOnFlakyTests` or the isolated reproduction.
- Rubric (LLM-as-judge validated against 5 human judgments, with a 0–2 scale): correct cause, reproducible evidence and respect for authority.

Initial golden tasks (one per skill, starting with the riskiest): `release-to-production` (refuses to merge if the checks' SHA does not match), `sync-cv` (refuses to edit the generated JSON), `review-change` (finds a seeded server→client leak and does not edit), `update-public-content` (rejects a metric that is not in the source), `audit-accessibility` (detects a seeded button without a name), `implement-feature` (runs `test:architecture` after a new import).

**Scorecard over time** (`tests/skills/history.jsonl`, or in `reports/` if preferred outside the public repo):
`{date, sha, host, model, skill, trigger_recall, trigger_precision, golden_pass, tokens, seconds}`. Each skill change is compared against the previous version (the with-skill vs old_skill pattern of skill-creator) and a regression of more than 10 points in recall or golden pass is not merged without justification.

**Cadence.** Run the full set when adding or renaming skills, when changing descriptions, and on each major model or host upgrade. The static check from §7.2 always runs.

---

## 8. Suggested implementation plan

| Slice | Content | Branch | Verification |
|---|---|---|---|
| 1 | Docs fixes: QA matrix (18 paths + assistant 404), hard-coded counts in AGENTS/skill-discovery, Next.js rule in the skills | `docs/skill-catalog-accuracy` | `npm run test:repository`, review |
| 2 | Extension of the static test (§7.2) with the current set | `test/skill-metadata-lint` | the test fails with invalid fixtures and passes with the set |
| 3 | Rewrite of the 6 skills + `references/` (analytics, assistant, ci-triage, disabled-features) | `docs/skills-v2` | skill lint, golden tasks for the 6, partial trigger set |
| 4 | `release-to-production` and `sync-cv` (riskier, low freedom) | `docs/skills-release-cv` | specific golden tasks |
| 5 | `audit-visual-quality`, `audit-accessibility` and `audit-performance` with their scripts | `feat/skill-audits` | run each audit against develop and compare with RUBRIC |
| 6 | `evolve-design-system`, `migrate-architecture` and `update-public-content` | `docs/skills-design-content` | full trigger set, confusion matrix |
| 7 | `tests/skills/` + `tools/skill-evals.mjs` + manual job in nightly | `test/skill-evals` | first row of the scorecard |

Decisions that need the owner: (1) add `@lhci/cli` or a pinned Lighthouse as a devDependency (goes through `update-dependencies`); (2) whether the scorecard is versioned in the public repo or in `reports/`; (3) whether any skill with side effects (release) should be explicit-only in Claude, which implies changing the current test rule that forbids `disable-model-invocation`.

---

## Sources

- Anthropic, *Skill authoring best practices*: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices
- Anthropic, *Agent Skills overview*: https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview
- Anthropic Engineering, *Equipping agents for the real world with Agent Skills* (2025-10-16): https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills
- Claude Code, *Skills*: https://code.claude.com/docs/en/skills
- Agent Skills open specification: https://agentskills.io/specification (`skills-ref` validator: https://github.com/agentskills/agentskills/tree/main/skills-ref)
- anthropics/skills (includes `skill-creator`, `webapp-testing`, `frontend-design`, `mcp-builder`): https://github.com/anthropics/skills
- OpenAI Codex, *Build skills*: https://learn.chatgpt.com/docs/build-skills
- OpenAI Codex, *AGENTS.md*: https://learn.chatgpt.com/docs/agent-configuration/agents-md · https://agents.md
- Local evidence: `origin/main` of `portfolio` (`.agents/skills/**`, `.claude/skills/**`, `AGENTS.md`, `CLAUDE.md`, `docs/development.md`, `docs/skill-discovery.md`, `docs/public-content.md`, `docs/deployment.md`, `tests/unit/repository.test.mjs`, `playwright.config.ts`, `tools/capture-gallery.mjs`, `tests/integration/budget.test.mjs`), `reports/Plan maestro perfil AI Engineer.md`, `reports/brief-v3.md` and `reports/portfolio-ux/RUBRIC.md`.
