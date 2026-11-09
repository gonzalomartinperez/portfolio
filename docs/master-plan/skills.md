# Skills

Part of the [master plan](README.md). Applies [ecosystem.md](ecosystem.md) sections 15.1, 15.5 and 15.6. Source: research [08](research/08-docs-readme-skills.md), [14](research/14-codex-harness.md), [15](research/15-claude-code-harness.md).

## 1. Audit of the six existing skills (`.agents/skills/`, 25-48 lines each)

| Skill | Today | Verdict | Change |
|---|---|---|---|
| `implement-feature` | Branch from `develop`, focused Next.js code, proportionate tests | Rename and rewrite as **`implement-task`** | Per-PR pipeline: worktree and branch `<type>/<milestone>-<slug>`, local verification by test-runner, PR template evidence, review chain, exact commands, feedback loop |
| `prepare-delivery` | Verify handoff and prepare a Conventional Commit | Merge into `implement-task` (per-PR) and **`verify-release`** (release profile, changelog, tags, `build-info.json` check) | `references/secret-review.md` moves with it |
| `review-change` | Review a diff for correctness, security, accessibility, maintainability | Rewrite | Independent, read-only, reproduce every finding, rubric lenses, designer evidence for UI, chain recording |
| `debug-issue` | Reproduce and diagnose; fix only when requested | Rewrite (kept, repo-specific) | Diagnose loop with a regression test, hydration and build-failure playbooks |
| `specify-feature` | Scope and plan only | Rewrite (kept, repo-specific) | Measurable acceptance, CI profile and affected files from `file-index.csv` |
| `update-dependencies` | Evaluate or apply requested upgrades | Rewrite | Around the single weekly Dependabot PR: read changelogs, fix breakages on the same branch, keep CI green, never open a second PR |

`.claude/skills/<name>` are 533-byte adapter files today; each becomes a relative symlink to `../../.agents/skills/<name>` and `check-skills` verifies every link. Nothing is removed before its content lands in the catalog.

## 2. New skills (catalog for a public site)

| Skill | Purpose | Allowed tools |
|---|---|---|
| `resume-refactor` | Read `RESUME.md`, `progress.md`, tracker; continue the next milestone item | Read, git, gh read |
| `score-repo` | Run the scorecard, compare with ratchets, produce the three-lens evidence pack | Bash (npm scripts), Read |
| `write-adr` | MADR 4 from a decision, linked from docs | Read, Edit |
| `audit-visual` | Screenshots 320-1920, both themes, engines, locales; refresh `docs/gallery` after M5 | Playwright |
| `audit-accessibility` | axe plus keyboard, zoom, target size, reduced motion | Playwright |
| `audit-performance` | Lighthouse gate and frame-time lanes; per-chunk attribution | Bash, Playwright, chrome-devtools |
| `evolve-design-system` | Change tokens and primitives with contrast checks and baselines | Edit, npm scripts |
| `change-content` | Copy and facts from the source only (career-ops snapshot), EN and ES parity, editorial guide, no invented claims | Edit, npm scripts |
| `animate-scene` | Hero and solar work within budgets, reduced motion, per-figure snapshots, QA clock | Edit, Playwright |
| `refresh-contract` | Refresh the assistant contract snapshot with revision and SHA-256, regenerate types, run the consumer compile | Bash |
| `refresh-copy` (M6) | Run the full copy refresh against the facts source with the positioning v3 rules and the facts-to-site test | Edit, npm scripts |

Existing `specify-feature` and `debug-issue` stay as repo-specific skills. Each skill: description starting "Use when ..." with "Not for ...", body <= 120 lines, checklist, step-by-step with exact commands, output template, verify-fix-reverify loop, references one level deep, `metadata: {owner, last-reviewed, version}`, no secrets or network calls.

## 3. Activation evals

Each skill ships `evals/triggers.json` (about 20 queries, 8-10 positive, 8-10 near-miss negatives, fixed 60/40 train/validation split) and `evals/evals.json` (2-3 output evals with assertions, with and without the skill). Protocol: 3 runs per query on a clean context; pass if positives >= 0.5 and negatives < 0.5; precision and recall reported on validation only. Gate (harness profile): a skill change is not merged if validation trigger accuracy drops by more than 10 points or the output delta turns negative. Seed negatives for near-miss pairs: `implement-task` vs `specify-feature` (build vs scope), `review-change` vs `audit-accessibility` (diff vs route audit), `change-content` vs `refresh-copy` (one edit vs full refresh), `animate-scene` vs `evolve-design-system`.

## 4. Harness files

Per ecosystem 15.6: `AGENTS.md`, `CLAUDE.md`, `.claude/settings.json` (allow lint, types, tests, build, read-only gh and git; ask push and merge; deny force push, `rm -rf`, reading `.env*`), `.claude/hooks/` (format, guard-files, guard-bash including `pkill -f`, fast-check on Stop with loop guard), `.claude/agents/` (`test-runner`, `reviewer`, `architecture-reviewer`, `designer-evaluator` scoring P1-P6 per theme from screenshots), `.codex/config.toml`, `.mcp.json` (Playwright and next-devtools only; the isolated Chromium, never the owner's browser profiles), `.worktreeinclude`, `agent-review.yml`. Rot control: monthly staleness check (180 days opens an issue); hard rules go to hooks or `permissions.deny`, not prose.
