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

Use [Readable code and useful documentation](code-quality.md) for design,
comments, JSDoc and the final clarity review. It is shared by both agent hosts.
For public text and visual evidence, read [editorial guidelines](editorial-guidelines.md)
and the relevant section of the [public-content contract](public-content.md).

- Keep routes in `src/app/`, page composition in `src/views/`, and persistent
  navigation in `src/shell/`. Colocate feature code under `src/features/`; extract
  shared capabilities under `src/shared/` only for real reuse. Every owned module,
  including importless code, must have a registered role. Follow the enforced
  [module contract](architecture.md#source-module-contract) and
  [engineering standards](engineering-standards.md).
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
`check` starts with `test:architecture`: negative fixtures and a complete parsed
source dependency audit. It also covers repository invariants, lint, formatting of Biome-supported files,
and one build with mandatory TypeScript validation;
it does not provide a security audit or visual accessibility QA. After building,
`npm run test:smoke` checks the production server, HTML landmarks, and 404 handling;
The Hostinger compatibility job runs it too. It uses port 3100 by default; set
`SMOKE_TEST_PORT` for parallel runs. Locally, `npm run test:site` reuses one build
with sequential owned HTTP rendered assertions and HTTPS browser fixtures. In CI,
source quality, workflow validation and secret scans start independently. The build
and hosting jobs follow source quality; browser and performance jobs consume one
verified enabled build. Eight duration-balanced browser groups retain one worker
per runner, all six actual projects, unchanged test deadlines and fail-on-flaky
behavior. New tests enter discovery automatically; the planner verifies each list
and their exact disjoint union rather than enforcing a fixed count.

`Required checks` requires all seven Core responsibilities to succeed, including
the whole browser matrix. It is the protected aggregate; `Quality checks` is the
source-quality prerequisite. The aggregate was added alongside the old full gate
on both branches after phase A passed. Phase B removes the forwarding job; the
old required context is retired only after this phase passes with the new full
aggregate still enforced. See the [paired CI specification](specs/paired-ci-profiles.md).
Skipped, failed or cancelled constituents fail the aggregate.

Nightly freezes an exact existing commit reachable from main or develop before
execution. An empty manual SHA uses the workflow event SHA; the selected ref
validates ancestry, not a moving tip. Its separately named browser and visual jobs
partition the complete inventory. Visual here means existing layout, accessibility
and interaction assertions; it does not claim pixel-baseline coverage. Snapshot
updates are disabled. Internal rendered-link checks and bundle budgets reuse the
same build. No external merchant crawling, provider calls or deployment is added.

Build consumers validate archive size/checksum, repository/source/tree/configuration,
workflow/run/attempt and enabled fixture flags before extraction. The expected hash
comes from the producing job output, independently of the downloaded receipt.
This is context and integrity binding, not a signed build attestation. Downloads
stay within the same run; ephemeral runtime keys are restored locally afterward.
The actual disabled Node 24.6 / GLIBC 2.28 / SWC WASM hosting build remains separate.

Native image-tab tests use the full Chromium channel instead of headless shell
to exercise browser document navigation. Install Chromium without `--only-shell`;
the CI installation already provides both binaries. Other tests retain their runtime.
Use `SITE_TEST_PORT` to choose the combined run’s rendered/TLS listener and the
following port for its browser upstream; explicit rendered/browser overrides remain
available. The rendered server stops before the HTTPS fixture starts. Browser CLI
arguments after `--` can select targeted coverage without rebuilding. Document hashes and signature checks run before the build.
Use `npm run typecheck` for a quick standalone type check during development;
`check:quality` also runs it before dependent build and hosting jobs. Reuse successful verification
for an unchanged source state, dependencies and runtime; rerun affected checks
after changes rather than repeating the full suite at each agent handoff.
`test:repository` checks tracked/unignored source text, simple inline Markdown file links,
skill adapter metadata/targets, and exact Next.js/SWC lockfile alignment. It does
not validate external URLs, Markdown anchors, or the behavior of an agent host.

Resolve warning causes through supported settings. Do not filter stderr, patch
dependencies, set internal test flags, or disable validation to obtain a quiet log.
Document expected platform fallback messages and their exit criteria in the
[deployment guide](deployment.md#build-messages).
For user-facing changes, check production behavior, keyboard access, mobile and
desktop layouts, and relevant error/empty/loading states. Add regression tests for
bugs and focused behavioral tests as functionality appears. Select a maintained,
compatible test tool for the actual layer; do not install a suite just to count tests.

Review the exact staged diff for private information, unexpected artifacts, and
scope creep. Dependency auditing is an additional signal, not proof of security.
Never put private career documents, account details, or personal work histories in
specs, examples, commits, or prompts stored in this public repository.

### Task-specific QA

Select checks for the changed behavior; the release still runs the required CI.
Do not repeat successful checks on unchanged inputs just to inflate a handoff.

| Change | Verification focus |
| --- | --- |
| Shared layout, navigation or copy | All eight routes in both languages (16 paths), both themes, narrow mobile and desktop, keyboard, 200% zoom and horizontal overflow. Check localized wrapping rather than assuming English proves Spanish. |
| Education or CV layout | Grade chips remain inside their rows with readable labels; CV heading, sections and downloads share the intended content width. Review long course names and both locales. |
| Hero or interaction | Forward/reverse deterministic scroll states, rapid reversals, all rows of the expanded toolkit reachable by native scroll, no overlap with following content; avatar pulses return to rest without obscuring essential controls. |
| Motion changes | Reduced motion, no WebGL, context loss, hidden tab, navigation cleanup and touch versus scroll gestures. Use actual measured conditions; emulation is not evidence of physical-device FPS. |
| Assets, documents or CV | Local files, provenance, proportions, accessible context, document hashes and actual served downloads; source and generated outputs agree. |

Existing browser coverage lives in [tests/browser](../tests/browser/), including
route, education, document, scene-toolkit, scene-stability and sphere-pulse tests.
Extend the relevant suite when fixing a regression; screenshots supplement
behavioral assertions rather than replacing them. Record untested devices or
states explicitly. A documentation-only handoff may report repository/link and
skill checks without claiming that application or hosting QA was repeated.

The source-quality job owns lint, content and unit checks. The build job owns the
type-checked enabled build; performance owns budgets and rendered checks. The
browser matrix consumes that build and owns interaction and accessibility checks. Build artifacts include that workflow's verified browser
selection plan, are scoped to their workflow run, omit build caches and expire after
one day; browser diagnostics expire after seven
days. The separate Hostinger job owns the GLIBC 2.28
baseline, observed runtime, SWC WASM fallback, build and smoke check. Do not add
Biome to the hosting build or duplicate the full browser suite there. Preserve
the full aggregate and protected branch checks; deployment evidence
remains separate from CI, as described in [deployment](deployment.md).

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

Select relevant skills automatically by the task and description; explicit commands
are optional. For parent-started sessions, use the local discovery fallback in
[AGENTS.md](../AGENTS.md) and [skill discovery](skill-discovery.md). Verify native
host discovery separately; file validation alone cannot demonstrate host loading.
These are instruction workflows, not sandbox controls. No permissions are relaxed,
no MCP servers are installed, and no publish hooks run automatically.

## Parallel agents and worktrees

Prefer parallel execution when at least two substantial tasks can proceed
independently. Do not split trivial fixes or tightly coupled changes just to use
more agents. Stay within host limits and use one coordinator with a small number
of bounded lanes; if delegation is unavailable, follow the same plan serially.

1. Inspect Git status, current remotes, and registered worktrees. Fetch develop
   before assigning work. Define shared interfaces and dependencies first.
2. Assign each writing agent a dedicated registered worktree and a standard task
   branch based on develop. Keep worktrees outside the canonical checkout and
   validate their resolved paths and common Git directory. Do not make independent
   clones, reuse active paths, or check out one branch in multiple worktrees.
3. Give each lane an objective, base commit, allowed files, acceptance criteria,
   commands, and known dependencies. State that other agents are working and their
   changes must be preserved. One owner per file; the coordinator owns shared
   interfaces, manifests, lockfiles, workflow files, and cross-cutting configuration.
4. Install dependencies per worktree using its pinned Node version. Do not share
   node_modules, generated types, or build output between worktrees. Assign distinct
   local ports to concurrent servers and stop only processes started by that lane.
5. Serialize integration through task PRs into develop in dependency order. Rebase or merge the
   latest develop into an unpublished task branch as appropriate; prefer merging
   once a branch is shared to avoid force-pushes. Rerun affected checks after
   integration changes. Only develop may open the release PR into main.
6. Handoffs record objective, worktree, branch, base and result commits, changed
   files, dependencies, checks and results, spec coverage, and remaining risks. Detached registered worktrees may
   be used for read-only reviews without creating a writing branch.
7. After integration, verify the remote PR is merged and the local worktree is
   clean, including untracked files, and its agent is no longer active. Remove the worktree through Git, not recursive filesystem deletion;
   prune stale remote refs and delete the integrated local task branch without
   force. Preserve unmerged commits, dependencies needed by active work, and QA
   artifacts until reviewed. Keep main, develop, and the canonical checkout.

Do not nest delegation without an independent task and available capacity. A lane
blocked on another lane should report its dependency rather than edit the other's
files. The coordinator alone handles protected-branch PR promotion and confirms
the complete integrated release, not just individual lane results.

## Commit convention

Browser retries retain diagnostic evidence in CI, but a test that passes only on
retry still fails the quality gate. Fix synchronization or reproduce the actual
regression instead of treating intermittent results as release approval. Avoid
running independent browser suites concurrently on the same local machine when
measuring scene stability; preserve traces and rerun a timeout in isolation.

### Protected integration flow

`task branch -> PR -> develop -> PR -> main`

Start task branches from updated `develop`; use `feat/`, `fix/`, `chore/`, `docs/`,
`refactor/`, `perf/`, `test/`, `ci/`, `build/`, or `revert/` followed by a lowercase
kebab-case description, for example `feat/project-gallery`. The policy checks this
pattern for task PRs. Only same-repository Dependabot-authored PRs may use the bot's
native `dependabot/npm_and_yarn/` or `dependabot/github_actions/` naming format.
`develop` is the integration branch, while `main` is the production
branch connected to Hostinger. Only same-repository `develop` is a valid PR source
for `main`. Dependabot targets `develop` as well.

Both branches require PRs, up-to-date quality checks, the `Branch policy` check,
and resolved review conversations. Direct pushes, force-pushes, and branch deletion
are blocked, including for administrators. Do not push locally created merge commits
to either branch. Use GitHub PR merge commits; squash and rebase merging are disabled
to preserve the ancestry of repeated develop-to-main releases. Retain both branches.
Merge the latest target into the task branch to resolve conflicts; never reset a
shared branch. If develop needs main's latest merge commit, integrate it through a
sync task branch and PR into develop.

GitHub automatically deletes task branches after merging. Protected `main` and
`develop` are retained. Locally, fetch with pruning, verify the task branch is
integrated and its worktree is clean, then use non-forced branch deletion. Never
delete another contributor's unmerged work or remove an active worktree.

The branch-policy workflow runs from the trusted base via `pull_request_target`,
reads PR metadata only, and has no checkout, dependency installation, or secrets.
Do not add PR code execution to it. An invalid PR can still be opened, but its check
fails and blocks merging. CI separately tests PR code with read-only permissions.

No second-person approval is required for this solo repository, but the PR and
required checks remain mandatory. Hosting configuration and branch protection are
account-side controls, not established merely by these files. A repository owner
can change those settings; agents must never relax them to finish a task.

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

## Native assistant

The approved native assistant is mounted once in the root layout, loaded on first
use and kept mounted when minimized. Read [the runtime/integration guide](native-assistant.md)
and [acceptance specification](specs/native-assistant.md) for transport, session,
focus, security and verification responsibilities. The old dormant launcher is
retired; do not mount a second conversation implementation.

### Lean release CI transfers

All eight browser shards keep their existing engine coverage and one worker for stable
scene/focus tests. The pinned Playwright CLI installs full Chromium, its Headless Shell, Firefox and
WebKit. Full Chromium remains necessary: gallery-native-navigation tests explicitly select
`channel: "chromium"` to verify foreground/background image tabs. They remain headless
but require the full browser executable rather than Headless Shell. An executed trial of
`--only-shell` failed those tests and was rejected without weakening their coverage. The verified
build is archived once with gzip level1 and uploaded with artifact compression level0,
avoiding repeated compression. Explicit bash defaults enforce pipefail so failed archive
creation cannot upload a partial successful gzip stream. Frozen installs skip implicit npm audit/funding requests;
required explicit audits still cover both lockfiles. Modern jobs share both lockfiles
in their cache key so producer jobs warm the
browser runners' package cache. Frozen installs prefer local package data; explicit
audits still check current advisories. JSON timing reports retain per-test measurements.
See [Playwright installation](https://playwright.dev/docs/browsers#chromium). Verify current-head
Actions results and record installation/upload timings; do not infer a speedup from one run.

## Redacted secret checks

Install the official Gitleaks **8.30.1** Linux x64 archive from its
[release](https://github.com/gitleaks/gitleaks/releases/tag/v8.30.1), verify SHA-256
`551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb`, then place
its binary on PATH or set `GITLEAKS_BIN` to that verified executable. CI repeats
this verification before executing it; no authenticated scanner service is used.
Twenty-four reviewed historical fingerprints are public provenance hashes. Their exact
commit/path/rule/line fingerprints are documented in the scanner and excluded
only from history. Two current references to the same public Git provenance use
exact value-and-path exceptions; changing the value still triggers detection.
Build artifacts retain the default detector without these source exceptions.
Gitleaks is feature-complete and upstream currently maintains security patches;
this pin is reviewed tooling, not a universal or permanent latest-version claim.

Run `npm run test:secrets` before delivery. It tests enforcement with synthetic
markers, scans an isolated snapshot of Git-tracked files (including tracked files
that now match `.gitignore`) and scans all available Git refs. It rejects shallow
history: fetch complete history first. It never reads untracked `.env.local`.
The snapshot uses working-tree bytes,
not separate index blobs: an overwritten staged-only value needs staged-diff
review or a committed candidate scan; CI checks the actual committed checkout.
For a CI transfer, run `node scripts/ci-build-artifact.mjs prepare` after the build,
then `npm run test:secrets:artifacts` to scan `.next`
excluding its cache, plus `.artifacts/ci` when present: the same generated trees
packaged by CI. This includes browser JS and prerendered HTML/RSC/server output.
Run `node scripts/ci-build-artifact.mjs restore` before starting that sanitized
local build again. The scanner commands suppress output, redact findings,
and do not upload reports. A failure is evidence to investigate privately, not
permission to print a matched value, weaken detection or rotate a live credential.

The scan does not prove that encoded values, unknown secret formats, remote-only
refs, released artifacts or provider-side state are safe. Review the actual public
configuration and data flow too. `NEXT_PUBLIC_*`, client props, HTML and static
assets are public. Session cookies, CSRF tokens and conversations do not belong
in screenshots, error messages, logs or retained CI artifacts. Browser fixtures
use synthetic local data and do not call paid providers.

This application has no Dockerfile or image build context. If containerization is
separately requested, exclude environment files, keys and local artifacts with a
reviewed `.dockerignore`; never carry secrets via build ARG/ENV or image layers.
Use BuildKit secret mounts only if an authorized build actually needs a credential.
Do not introduce a secret manager, create keys, dump resolved configuration or
inspect live containers as part of an ordinary source check. Follow
[SECURITY.md](../SECURITY.md) for suspected exposure and private escalation.


### Ephemeral Next runtime material in CI transfers

Next generates preview signing/encryption keys and a Server Actions encryption key
in every build, even though this portfolio has no Server Actions. These are actual
runtime cryptographic values, not provider keys or detector false positives. CI
runs `node scripts/ci-build-artifact.mjs prepare` after rendered verification and
browser planning, before the artifact scan and upload. It replaces only the three
verified fields in their known JSON manifests with inert transfer markers. It
preserves the public preview identifier, rejects unexpected embeddings and symlinks,
and fails if Server Actions appear. This is deliberately version-specific.

Each isolated browser runner calls `node scripts/ci-build-artifact.mjs restore`
after unpacking to generate fresh, runner-local ephemeral values. They are never
printed or re-uploaded. The transferred build remains covered by the strict scanner,
including all HTML/RSC/server files and CI planner output. This is not an exception
that lets a detected runtime key travel in an artifact. Unit tests cover roundtrips,
unexpected embeddings, invalid manifests, future actions and symlink refusal.
The normal Hostinger `npm run build`/`npm start` commands never invoke this CI-only
transfer helper. No persistent credentials or provider accounts are created or rotated.

## Isolated analytics verification

`npm run test:analytics` checks the closed vocabulary, exact upstream schema bytes,
route-view deduplication, optional measurement budgets, dwell/observer cleanup
and bounded delivery failures. Both public v1 and v2 schema snapshots have exact
hash/provenance assertions; private reporting schemas are never vendored. It is
part of `npm run check`.
The public default remains off. Enabled browser QA uses only the existing loopback
TLS fixture, which discards analytics request bodies instead of proxying or storing
those events. For owned local ports, build and run consistently:

```bash
ASSISTANT_ENABLED=true ANALYTICS_ENABLED=true \
  ANALYTICS_INGEST_URL=https://127.0.0.1:3381/api/v1/analytics/events npm run check
BROWSER_TEST_PORT=3381 BROWSER_TEST_UPSTREAM_PORT=3382 \
  npm run test:browser -- tests/browser/analytics.spec.ts tests/browser/analytics-interactions.spec.ts tests/browser/privacy.spec.ts
```

The flags must match the built candidate when running rendered checks. To combine
rendered checks and selected browser cases against that enabled build:

```bash
ASSISTANT_ENABLED=true ANALYTICS_ENABLED=true SITE_TEST_PORT=3381 \
  npm run test:site -- tests/browser/analytics.spec.ts tests/browser/analytics-interactions.spec.ts tests/browser/privacy.spec.ts
```

Reserve ports/resources before running this alongside another session. These tests
mock external destinations and assistant replies; no provider key or model call is
needed. Existing CI reuses its enabled candidate build across eight browser groups;
the separate Hostinger build explicitly keeps both feature flags false. Disabled
rollout browser tests must use a separately built disabled candidate, not a runtime
flag applied to previously enabled static output. No browser install may garbage-
collect another session's shared cache.

The interaction suite covers EN/ES, private descendants, keyboard activation,
coarse cells, route revisits, viewport boundaries and ordinary scrolling. It runs
in desktop/mobile Chromium and dedicated Firefox/WebKit projects through the same
eight-group CI planner. A synthetic route sink proves browser behavior only. The
actual API persistence and authenticated backoffice demo require separately owned
services, exact local CORS, synthetic data and explicit resource leases; retain
that receipt separately and never describe interception as an end-to-end result.

Cookie isolation also has a native-network regression in all four interaction
projects. The loopback sink challenges POST responses with a synthetic cookie;
ordinary app delivery must omit a seeded cookie and ignore the response cookie.
A separate explicit credentialed positive control proves the challenge is valid.
Intercepted responses are not the evidence for this guarantee: Firefox and WebKit
stored a cookie injected through `route.fulfill` in the initial fixture, while the
native response tests passed. Preserve those original failures when reporting the
fixture correction. The credentialed control is test-only and never reaches the
actual analytics API.
