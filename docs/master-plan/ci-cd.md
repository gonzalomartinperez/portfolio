# CI/CD

Part of the [master plan](README.md). Applies [ecosystem.md](ecosystem.md) sections 3, 5, 6, 7 and 8 to this repository. Draft path map: [ci-profile.json](../../.github/ci-profile.json). Sources: research [05](research/05-cicd-supply-chain.md), [11](research/11-containers-dynamic-ci.md), [04](research/04-testing.md).

## 1. Today

`ci.yml` (jobs: workflows, secrets, quality, build, hosting, browser x8 shards, performance, `Required checks`; push and PR to `main` and `develop`), `nightly.yml` (prepare, quality, browser x8, visual, links, bundle, required checks; cron `35 3 * * *`), `branch-policy.yml` (`pull_request_target`), `dependency-policy.yml`, `dependabot.yml` (three slots per ecosystem). Strengths to keep: SHA-pinned actions with version comments, checksum-verified actionlint and gitleaks binaries, build once with a hash-verified, secret-scanned artifact reused by browser and performance jobs, duration-balanced shards (`tools/browser-ci-planner`), Rocky 8 glibc 2.28 hosting job, `failOnFlakyTests`. Gaps: no `classify`/profiles (every PR pays the full cost), required check named `Required checks` (standard: `ci-gate`), Dependabot not single-PR, no CodeQL, zizmor, Scorecard, dependency-review, release automation, `build-info.json`.

## 2. Target graph

```
classify (<= 30 s: changed files, branch, labels -> profile) -> ci-gate (always, fail-closed)
  static (Biome, tsc, guard, knip, css-policy) | unit+integration shards (Vitest, coverage, diff coverage)
  security (zizmor, osv, gitleaks, CodeQL default setup, dependency-review)
  build ONCE (webpack, hash-verified artifact) -> bundle-budget | e2e (Chromium + iPhone WebKit tagged journeys)
     | axe-affected | visual-affected | lighthouse-one-route (scene/design) | fluidity + hero snapshots (scene)
  hosting-rocky8 (hosting group) | contract-compile (contract group) | content-tests (content group)
  mutation-incremental (changed files, parallel, <= 8 min, PF-D30)
```

Profiles (ecosystem 6.0) map to [ci-profile.json](../../.github/ci-profile.json): `docs` (markdownlint, lychee, Vale EN, skills validator, README heading check, secret scan; p50 <= 2 min), `deps-weekly`, `code` (default; p50 <= 5 min, p95 <= 10 min), `contract`, `workflow`, `release` (p50 <= 30 min), `hotfix`. `assistant-quality` does not exist in this repo (no prompts, retrieval or graders). Rules: job-level `if:` driven by `classify` outputs, never workflow-level `paths:` on workflows that supply required checks; the plan script is the 15-line `engineering-standards` script (no third-party action), outputs ALL on any error or on a file outside every group; `ci-gate` is `if: always()`, `needs` every job, passes only on `success` or `skipped` where the profile says not applicable. A unit test (`tests/unit/ci-profile.test.ts`) asserts every tracked path matches a group and every job maps to a profile.

PR checks that today run in full become conditional: browser shards drop from 8 full to the tagged PR set (Chromium + iPhone WebKit; sharded by measured time only if over budget); Firefox, WebKit desktop, Pixel, visual-all, Lighthouse-all, full mutation, flake detection and ZAP move to nightly and release. The branch-route and PR-title checks move into `classify` on the `pull_request` event (PF-D20), removing the `pull_request_target` workflow.

## 3. Caching and speed

| Item | Rule | Why |
|---|---|---|
| Package store | Keyed on `package-lock.json` and `tools/api-contract/package-lock.json`; cold `npm ci` is 3 m 43 s, warm 37 s | Audit timings; the 5-minute budget depends on hits |
| `.next/cache` | Keyed on lockfile plus source hash; only `develop` writes broad caches | Build 91 s |
| Playwright | Pinned container image digest (already in nightly), browsers cached per version | Determinism |
| Concurrency | `ci-${{ github.workflow }}-${{ github.ref }}`, cancel in progress for PRs only | Existing |
| Timeouts | Every job (lint and unit 10-15, e2e 25, gate 2) | Ecosystem 6.1 |
| Artifacts | One build artifact, SHA-256 verified before extraction (existing `ci-build-provenance`) | Build once |
| Over budget order | Fix cache hit rate, then split jobs, then shard, last paid runners | Ecosystem 6.2 |

Duration budgets (public site): PR p50 5 min and p95 10 min (lint and types <= 2 min, build warm <= 4 min); nightly <= 45 min; release <= 30 min; a weekly workflow prints p50 and p95 of the last 30 runs (`gh run list --json`) and alerts when p95 drifts 25% above the four-week baseline. v1 proposed p50 7 min; the ecosystem number is adopted.

## 4. Security hardening (ecosystem 6.4, 7)

| Control | Target | Status today |
|---|---|---|
| Token | `permissions: {}` at workflow top, grants per job; `id-token` and `attestations` only where needed | Top-level `contents: read` |
| Actions | Full-SHA pinning with version comment; repository policy "require full SHA pinning"; Dependabot bumps hash and comment | Pinned |
| Checkout | `persist-credentials: false` unless pushing | Done |
| Triggers | No `pull_request_target` that checks out PR head; no `${{ }}` of untrusted context in `run:` | `branch-policy.yml` uses `pull_request_target` without checkout; removed (PF-D20) |
| Scanners | zizmor (regular persona, online audits) and actionlint on `.github/**`; gitleaks; secret scanning and push protection on | actionlint and gitleaks only |
| CodeQL | Default setup, JS/TS and `actions`, free on public repos | absent |
| Dependency review | `dependency-review-action` on PRs; osv-scanner daily (updates one tracking issue labelled `vuln` silently; the Monday summary notifies, OD-75; no PR) | `npm audit` only |
| Scorecard | Weekly with SARIF and badge; fail on a drop > 1 point | absent |
| SBOM | CycloneDX (Syft) as a CI artifact of the site build (no image) | absent |
| Provenance | Cannot cover Hostinger's own build; compensate with `main` ruleset, `v*` tag ruleset, post-deploy `build-info.json` check against the merge SHA, long cooldown, post-build scan of `.next` for forbidden strings (G7) | Partial |
| Egress | `step-security/harden-runner` audit then block with allow-list on publish jobs only | absent |
| Install-time code | `npm ci --ignore-scripts` with an allow-list | to add (PF-M1-4) |
| Environments | `production` environment for the post-deploy check (read-only token) | n/a (Hostinger builds on its side) |
| Headers | CSP (non-script directives today), HSTS two years without preload, nosniff, frame DENY, referrer, permissions, COOP; strict `script-src` spike (PF-D25); `security.txt` (RFC 9116) | Headers present; no `script-src`, no `security.txt` |

## 5. Containers (ecosystem section 8)

This repository builds **no image**: the site is built by Hostinger from `main` (`npm run build`, Node 24.x). The canonical Dockerfile, SBOM-on-image, provenance, Grype, dockle and container-structure tests are not applicable. What does apply: (a) the Rocky 8 hosting-contract job (glibc 2.28, Node 24.6.0 observed on the host, WASM SWC) stays and gains a non-blocking Node 26 sibling (PF-D19); (b) the Playwright container for visual and hero baselines is digest-pinned; (c) a devcontainer (`.devcontainer/devcontainer.json`, Node from `.nvmrc`, Playwright browsers) mirrors CI for one-command setup; (d) base images in workflows are referenced by tag and digest and checked by `deps-weekly-guard` (older than 30 days fails).

LTS matrix applied here: Node 24 LTS (Maintenance since 2026-10-20, support to 2028-04-30) pinned by `.nvmrc` (24.22.0); the fleet standard is 26 LTS, which this repo adopts only when Hostinger offers it and the glibc-2.28 job passes (E10 deviation, PF-D19). Next.js pinned to the current supported line with monthly security-release subscription (out-of-band releases occurred 2026-09-22 and 2026-10-14, research 01 section 8).

## 6. Dependabot: one weekly PR (ecosystem 5)

Target `.github/dependabot.yml` (applied after the sandbox proof PF-M1-3; E2):

```yaml
version: 2
multi-ecosystem-groups:
  weekly:
    schedule: { interval: weekly, day: monday, time: "09:00", timezone: America/Argentina/Buenos_Aires }
    target-branch: develop
updates:
  - package-ecosystem: npm
    directory: /
    multi-ecosystem-group: weekly
    patterns: ["*"]
    open-pull-requests-limit: 1
    cooldown: { default-days: 7, semver-major-days: 14, semver-patch-days: 3 }
  - package-ecosystem: npm
    directory: /tools/api-contract
    multi-ecosystem-group: weekly
    patterns: ["*"]
    open-pull-requests-limit: 1
  - package-ecosystem: github-actions
    directory: /
    multi-ecosystem-group: weekly
    patterns: ["*"]
    open-pull-requests-limit: 1
```

Repo specifics: the `@types/node` major ignore and the `typescript` major ignore for the isolated generator (TS 5 compiler API) stay as `ignore` entries; cooldown stays at the long values because a bad dependency ships straight to production on Hostinger; labels `dependencies:manual` are dropped in favour of the `deps-weekly` profile; security-update PRs are switched off in repository settings with alerts on; `deps-weekly-guard` runs Monday 10:30 ART and on Dependabot events (at most one open PR, up to date with `develop`, red CI opens a tracking issue and labels `needs-fix`); the `dependency-policy` tool keeps checking exact pins and is updated for the new config. The owner merges the PR manually; promotion to `main` is on demand.

## 7. Release and deploy

| Step | Standard here |
|---|---|
| Versioning | Conventional Commits, SemVer, `VERSION` plus `CHANGELOG.md` (Keep a Changelog); a version-bump PR on `develop` and `release.yml` on `main` that tags `vX.Y.Z` and creates the GitHub Release (OD-78, no release-please; [ADR](../adr/release-automation.md)); `docs/release-history.md` seeded into the changelog once (PF-M1-6) |
| Promotion | `develop` to `main` PR only at M7 (no hotfix before M7; OD-11, DR-01); `release` profile green; merge commit; tag `vX.Y.Z` and an immutable GitHub Release created by workflow on `main` (assets: SBOM) |
| Deploy | Hostinger autodeploys `main`; one deploy per release; the post-deploy workflow reads `/build-info.json` (merge SHA, build time) and fails if it does not equal the release SHA; a merged PR and green CI do not prove deployment |
| Rollback | Revert PR to `main` (hotfix rule: only with explicit owner authorization) or redeploy the previous tag in hPanel; no image digests |
| Staging | None by default (PF-D4); screenshot pack and local preview |
| Back-merge | Automatic PR `main` to `develop` after each release |
| Rulesets | Applied by `engineering-standards` script: PR required, `ci-gate` required and strict, no force-push or deletion, no bypass actors, `v*` tag ruleset; merge only with `gh pr checks --watch && gh pr merge --merge` (merge commits, never squash) |

## 8. Nightly and weekly

Nightly (`nightly.yml`): full mutation, flake detector, full cross-browser matrix, visual all routes, hero snapshots, fluidity lanes, Lighthouse all routes, ZAP baseline, osv and Grype where applicable, `scorecard.json` re-score and ratchet check, links. Weekly: `deps-weekly-guard`, docs link check, standards drift (`standards.lock`), CI duration report, GPU lane (owner machine), skills staleness. Monthly: flaky review, skill staleness, real-device iPhone checklist before releases. Quarterly: standards review, independent re-audit.

## 9. Standard files to adopt (from `engineering-standards`)

Reusable workflows called at job level pinned by SHA (`ci-node.yml`, `security.yml`, `release.yml`, `deps-weekly-guard.yml`, `scorecard.yml`, `drift.yml`), composite actions (setup-node, plan), `dependabot.yml`, `release-please-config.json`, `.gitleaks.toml`, PR and issue templates, `SECURITY.md`, Biome preset, tsconfig base, token package; `standards.lock` records the ecosystem version, the SHA-256 of `ecosystem.md` and `rubrics.md`, and the workflow SHAs. Until `engineering-standards` exists (E1) the existing in-repo tools (`workflow-policy`, `dependency-policy`, `ci-build-provenance`) keep their role and are converted to TypeScript.
