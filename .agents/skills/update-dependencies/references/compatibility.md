# Portfolio compatibility upgrades

Use this procedure when changing Node, Next/SWC, TypeScript, native build packages,
Playwright or CI runtime images. For an ordinary library patch, use only the
applicable checks; do not upgrade unrelated tools to make their numbers match.

## Establish the baseline

Read `.nvmrc`, `package.json`, both lockfiles, `playwright.config.ts`, the CI workflow
and [the hosting contract](../../../../docs/deployment.md). Record the source SHA,
resolved versions, proposed versions and the date of official-source verification.
Consult upstream release/support documentation and actual package engines/peers.
A release existing in the registry does not establish support or host compatibility.
Node and Next have support lines; Playwright, TypeScript and Biome do not share a
universal LTS policy. Never label every tool “LTS” or use a stale review's version
as a permanent latest-version assertion.

The coordinator owns manifests, lockfiles and CI images. A parallel skill or feature
lane reports required changes to that owner rather than editing these shared files.
Read the repository's current coordination record before proposing cross-repo pins;
another owner's test report remains attributed evidence, not local verification.

## Coupled changes

| Change | Files and evidence that must stay coherent |
| --- | --- |
| Node development version | `.nvmrc`, declared engines, CI-selected version and documentation. Preserve the separately verified hosting floor unless its change is explicitly authorized and tested. Do not alter global nvm defaults. |
| Next or SWC | Exact Next/SWC WASM versions and root lock entries, local `node_modules/next/dist/docs/` API guidance, full strict build and GLIBC compatibility lane. Native compiler loading and successful WASM fallback are different observations. |
| TypeScript | Existing compiler API consumers, tooling workspace, strict application and assistant builds. A successful CLI type check does not establish compatibility with a removed JavaScript compiler API. |
| Playwright | Exact CLI package/root lock and browser image version plus verified registry digest. Install the browsers for that CLI; do not invent a digest or reuse an old image with a new version label. Keep full Chromium, Headless Shell, Firefox and WebKit coverage. In this shared WSL workspace, set `PLAYWRIGHT_SKIP_BROWSER_GC=1` or use an isolated `PLAYWRIGHT_BROWSERS_PATH` when installing; default garbage collection can remove another active session's older browser revision. Do not clean the shared cache while peers are testing. |
| Contract tooling | Its own `tooling/api-contract` manifest and lock, frozen generation and audit. Regeneration must not introduce unexplained tracked schema drift. |
| Other build tools | Relevant native binaries, exact package/lock versions, platform selectors and hosting build. Parser choices need to satisfy local Node baselines; no shared parser framework is required across repos. |

Do not modify application runtime services, production configuration or feature
activation merely to finish an upgrade. `ASSISTANT_ENABLED` remains unset/false in
the public hosting build; API credentials never belong in public environment names.

## Verify the actual candidate

1. Use the candidate's `.nvmrc` in its registered worktree and restore with `npm ci`.
   Do not share `node_modules` or build artifacts across worktrees.
2. Check the dependency tree and both audits. Run `npm run contract:generate` when
   verifying the frozen API-tooling baseline, then inspect generated-file drift.
3. Run `npm run check`, including the architecture fixtures and parsed audit; keep
   exact-version, Next/SWC and adapter metadata invariants enabled.
4. For runtime/compiler/browser changes, verify production rendered and relevant
   browser behavior and both protected quality/hosting lanes. Use the existing
   browser planner and artifact flow; do not add duplicate builds or relax retries,
   deadlines, coverage or fail-on-flaky enforcement to accommodate a new version.
5. Record each command with its source SHA and observed runtime. If a browser case
   times out, retain diagnostics and reproduce in isolation before diagnosing
   overload. A local isolated pass does not replace a required clean CI result.

Report candidate support, compatibility evidence, any retained exception and its
reason. If a baseline fails, preserve the failure and isolate the incompatible
change; do not force peer installation or mute errors. Source, container resolution,
CI and actual deployment are separate facts. No deployment is implied by this skill.
