# ADR: shared physical site architecture

Date: 2026-10-18
Status: accepted design; implementation verification recorded separately

## Context

Portfolio and Pequeverso use the same site-level ownership vocabulary while
retaining separate product models, locks, delivery constraints and owners. The
portfolio previously kept reviewed data, API snapshots and source images beneath
`src`, and mixed command-line tools and unit tests in `scripts`. Root exemptions
made these roles less clear and complicated paired-repository review.

## Decision

| Root | Ownership |
| --- | --- |
| `src/app` | Thin Next.js framework composition |
| `src/views` | Server page composition |
| `src/shell` | Persistent navigation and presentation |
| `src/features/<name>` | Used domain, application, adapters and presentation layers; named public entries |
| `src/shared/<name>` | Named reusable capabilities with no feature dependencies |
| `content` | Reviewed public editorial inputs and neutral types |
| `config` | Explicit site/build configuration independent of rendering |
| `contracts/assistant-api` | Frozen upstream contracts and provenance, adapter-only consumption |
| `media/identity` | Original source image inputs |
| `tools` | CLI, generators and build/CI adapters |
| `tests/unit` | Isolated source/policy/fixture tests |
| `tests/browser` | Browser product acceptance |
| `tests/helpers` | Browser fixtures and shared test support |
| `tests/integration` | Real build/HTTP checks and opt-in disposable native-service acceptance |
| `tests/rollout` | Disabled-build acceptance |

Do not add empty layers, generic barrels, compatibility forwarding modules or
production imports of repository tooling. Existing local styles and conventions
remain in force. No dependency versions, retry policies or protected contexts
change merely to match another repository.

The canonical shared workflow skills are `specify-feature`, `implement-feature`
and `prepare-delivery`. Additional genuine repository skills remain. `.agents`
is canonical here, with relative `.claude` adapters, as agreed for both sites.

The portfolio has no deployed app Dockerfile: Hostinger's managed Node runtime
is the actual delivery target. CI's pinned hosting compatibility container is a
verification tool. API/backoffice container conventions belong to those owners;
a site must not invent a container deployment solely for visual symmetry.

## Enforcement and consequences

The architecture guard inventories all six production roots, recognizes the
actual TypeScript aliases (including bare `@content`), and retains dependency
direction, cycles, erased-type checks and transitive client/server closure. Every
frozen input is registered exactly; an unclassified new file fails. Negative and
positive fixtures cover removed namespaces and tool/test traversal.

The cutover maps 119 existing files one-to-one. Active consumers move together;
contract snapshots, original image bytes and published data remain unchanged.
Historical `commit:path` fingerprints and provenance commands retain their
historical identity. The current contract generation command is
`npm run contract:generate`, using `tools/api-contract`.

This decision does not claim runtime acceptance. The migration specification
records source, build, browser and protected-CI evidence for the actual candidate.
Analytics acceptance against a disposable native API/database/backoffice is a
separate opt-in fixture, never production activation or a model-provider test.
