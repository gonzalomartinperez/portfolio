# Engineering standards and session ownership

Reviewed 2026-10-17. This repository owns the public portfolio. Shared engineering
principles do not authorize one session to change another repository or deploy it.

## Concurrent responsibility agreement

| Session | Exclusive scope | Coordination boundary |
| --- | --- | --- |
| Portfolio | Public `portfolio`, task `refactor/clean-architecture` | Site architecture, client integration, quality rules and public documentation. No API, infrastructure or private career edits in this task. |
| Portfolio assistant | `portfolio-assistant-api`, `portfolio-assistant-backoffice` | API, security and backoffice use cases. Existing public API contracts stay stable; changes require a reviewed contract handoff. |
| Pequeverso | `pequeverso`, `pequeverso-assistant-api`, `pequeverso-assistant-backoffice` | Product storefront, assistant API and backoffice. No portfolio, career or infrastructure writes and no implicit assistant activation. |
| VPS operations | Private `vps-ops`, task `refactor/clean-architecture` | Inventory, runtime baseline, Coolify/reverse proxies, operations CLI, Ansible and recovery procedures. No application writes or implicit deployment. |

The other owners were contacted directly through the session messaging interface.
Confirmations from the assistant and VPS owners agree on these boundaries. The
Pequeverso scope was confirmed through the coordinating assistant session handoff. The ops
owner maintains its cross-repository record at
`vps-ops/docs/handoffs/engineering-coordination.md` and its runtime ledger at
`vps-ops/inventory/baseline.json`; these are private operator references, not public
build dependencies. The operations handoff is
[vps-ops PR #31](https://github.com/gonzalomartinperez/vps-ops/pull/31), reported
by its owner at source `6a99d0657b6deddf1e0cbb395b5cccc45997fab6`; its CI and
validation belong to that session. No session adopts another repository's reported
checks as its own verification.

Each writer uses a separate registered worktree and a task branch. One coordinator
owns manifests, lockfiles, source integration and protected PR promotion for this
repository. Communicate contract, port and ownership changes before touching shared
surfaces. Never exchange secrets in session messages or documentation.

## Architecture contract

Use the [module map](architecture.md#source-module-contract) and run
`npm run test:architecture` during development. It is the first part of
`npm run check`, which is mandatory in the existing protected quality gate.

- Routes, views and shell compose features; lower layers cannot import composition.
- Reviewed content does not import components, features or framework presentation.
- Shared UI and utilities do not depend on product content or features.
- Feature internals are private outside the feature; add a deliberate named entry
  and its rationale when a new integration is needed.
- Domain dependencies point inward, without direct environment I/O. Renderers and
  transport adapters cannot import presentation. Assistant application code owns its ports;
  API-generated contracts belong to concrete adapters.
- Runtime and type-only cycles are errors. Client runtime paths cannot reach
  `server-only` modules or Node builtins.
- Keep lazy boundaries explicit; do not add cross-feature export barrels.

The guard is a source dependency policy, not a security certification. See the
[research record](research/clean-architecture.md#scope-of-enforcement) for limits.

## Toolchain and upgrades

The executable authorities are `.nvmrc`, `package.json`, both committed lockfiles,
`playwright.config.ts`, and the pinned browser image in `.github/workflows/ci.yml`.
Restore with `nvm use` and `npm ci`; never share `node_modules` across worktrees.
Runtime and development compatibility are distinct: current application hosting
also verifies Node 24.6 on GLIBC 2.28, while development uses Node 24.21.

At this review the portfolio locks Next 16.4.0, React 19.3.0, TypeScript 7.0.2,
Biome 2.5.15 and Playwright 1.63.0. The coordinated backoffice baseline uses
Playwright 1.64.0; the portfolio retains its tested CLI/browser/image combination.
Upgrade them together through a separate compatibility-verified task, rather than
silently changing this architecture refactor's browser runtime. Babel Parser
7.29.9 is dev-only and compatible with both retained Node baselines.

Direct dependencies use exact versions and lockfiles; CI tests that contract.
Keep Next/SWC aligned. Pin third-party Actions and container images by digest.
No canaries, experimental compiler APIs, global tool upgrades, or dependency patches
just to silence warnings. Inspect supported releases and advisories for upgrades.
Do not infer that identical stacks are necessary across Python APIs, ops and web.

## Code and review

The [code-quality standard](code-quality.md) adapts Google's engineering practices
and Microsoft's engineering playbook to this repository. Prefer explicit inputs,
cohesive functions, strict types, early validation, useful comments and behavior
checks. Preserve Next.js conventions and Biome-owned formatting. Do not introduce
unnecessary classes, adapters or abstractions around static data.

Review outcomes, failure paths, concurrency, accessibility, performance, data
exposure and maintenance cost. Distinguish defects from preferences. A private
contract or unsupported claim is not acceptable public content. Never weaken
checks, hide warnings, or bypass branch protections to finish a task.

## Required verification and release

The development job runs the full source guard, repository/content/assistant checks,
frozen contract generation, both dependency audits, lint, strict build, budgets and
rendered route checks. Eight duration-balanced browser groups reuse that build;
a separate GLIBC 2.28 job verifies the hosting baseline with the assistant disabled.
The aggregate gate requires every group and compatibility job to succeed.

Keep timeouts, retries, fail-on-flaky behavior and exact test selection intact.
Negative architecture fixtures must fail on representative invalid code, while
legitimate type imports, resources and lazy composition remain accepted. This adds
no redundant build or matrix job. Required CI does not prove deployment: verify
actual served routes separately when an authorized release is deployed.

Task PRs target `develop`; only `develop` releases to `main`. Assistant activation,
VPS deployment, account changes and secret management remain separate decisions.
