# Ecosystem: portfolio, assistant API and backoffice

Status: planning summary, not executed. Part of the [master plan](README.md). This repository
owns the public website and the assistant client only; changes in the other two repositories
require a handoff to their owner, as stated in [CONTRIBUTING](../../CONTRIBUTING.md).

| Repository | Role | Baseline (weighted) | Target | Plan |
| --- | --- | --- | --- | --- |
| `gonzalomartinperez/portfolio` (this one) | Public bilingual site and default-off assistant client | UX 70/100, message 72/100 (see [scorecard](scorecard.md)) | 95+ every axis | [roadmap](roadmap.md) |
| [`gonzalomartinperez/portfolio-assistant-api`](https://github.com/gonzalomartinperez/portfolio-assistant-api) | Assistant backend: retrieval, GraphRAG, streaming, sessions, cost limits | **72/100** | 95+ | `reports/portfolio-ux/assistant-api-plan.md` (owner workspace, Spanish) |
| [`gonzalomartinperez/portfolio-backoffice`](https://github.com/gonzalomartinperez/portfolio-backoffice) | Private operations dashboard: health, budget, interactions, access | **76/100** | ≥ 95 every axis | `reports/portfolio-ux/backoffice-plan.md` (owner workspace, Spanish) |

The sister plans were audited read-only on 2026-10-24: the assistant API at `origin/develop`
`44ae6c7`, the backoffice at `origin/develop` `c86816c`. They use the same three lenses
(senior developer, senior designer, senior recruiter) and reuse this plan's decisions on DTCG
tokens, StrykerJS, axe 2.2, Lighthouse and Google TypeScript style so the three repositories read
as one system.

## Assistant API in brief

- Strengths: six layers with an AST guard, 866 tests, real services in CI, versioned contracts,
  atomic cost reservations, a threat model and dated evidence.
- Gaps to 95+: retrieval quality is not measured (9 retrieval cases, no qrels or Recall@k); an
  English weakness from a `'simple'` full-text configuration without stemming; `PublicRetrieval.search`
  with cyclomatic complexity 48; no LLM-as-judge or human labels; GitHub secret scanning and push
  protection disabled, no CodeQL, SBOM or image attestation; an overloaded showcase.
- Axis baselines: code quality 72, architecture 80, tests 74, eval quality 58, security 76,
  performance/latency/cost 70, observability 72, CI reliability 82, docs/showcase 66, DX 74
  (weights: AI quality and architecture ×1.5, the rest ×1).
- Roadmap: P0 security and hygiene (1–2 days) → P1 eval foundation (1–2 weeks) → P2 architecture
  refactor (2–3 weeks) → P3 testing depth (1–2 weeks) → P4 CI/CD and supply chain (1 week) → P5
  showcase and docs (1 week) → P6 live evaluation and the Neo4j decision (requires authorization
  and budget). Without P6, eval quality tops out around 90.

## Backoffice in brief

- Strengths: Better Auth with Google/GitHub and no open signup, hashed single-use invitations,
  revocation that deletes sessions, CSRF/origin checks, a runtime IAM role without DDL, bounded
  HTTP adapters, the "unavailable, never zero" rule end to end, an AST layer guard and a
  distroless non-root image tested read-only.
- Gaps to 95+: a correct but generic dashboard (a 3-bar chart that duplicates its table, no
  trends, no shared app shell, raw ISO times); an anemic application layer and scattered
  composition; 0 component, visual, mutation or mobile tests; image publication disabled, no
  attestation or SBOM, unversioned migrations, no observability.
- Lowest axes: observability 38, release/deploy readiness 58, dashboard UX and data-viz 66,
  tests 70.
- Roadmap: F0 guardrails and measurement (about 1 week) → F1 architecture and contracts (about 2)
  → F2 design system, app shell and data-viz (about 2–3) → F3 experience and security testing
  (about 2) → F4 delivery, observability and showcase (about 1–2). Publication requires the
  owner's explicit authorization.

## Contracts

| Contract | Producer | Consumer | Rule |
| --- | --- | --- | --- |
| Public REST and SSE (`openapi.json`, `sse.schema.json`, examples) | assistant API | portfolio (`contracts/assistant-api/`) | Imported snapshot with revision and SHA-256 hashes in `source.json`; regenerate types with `npm run contract:generate` and verify with `npm run test:assistant-contract` |
| Product interaction events (`product-interaction.schema.json`, `product-event.schema.json`) | portfolio emits, assistant API ingests | backoffice reports | Closed event set, default-off analytics; the planned `web-vital` event (Phase B7) needs a contract handoff before it exists |
| Private operations, analytics and feedback reads | assistant API | backoffice | Today a byte comparison; the API plan moves to `oasdiff breaking` plus JSON Schema diff, a cross job that compiles the consumers' generated types, and a `contract-major` label plus ADR for breaking changes |
| Request correlation | backoffice | assistant API | `x-request-id` generated in the backoffice proxy and propagated on reads |

Invariants kept across all phases: the backoffice is not a public chat frontend and receives no
visitor transcript; sessions remain API-owned host-scoped cookies; the portfolio never holds
provider keys; no runtime import crosses repositories.

## Shared design tokens

- Source of truth: DTCG tokens in this repository (Phase B1), with mandatory dark and light
  modes and build-time contrast checks.
- The backoffice commits a generated copy under `src/shared/tokens/` and verifies it with a hash
  check against a pinned portfolio commit, so there is no cross-repository runtime dependency.
- Shared identity: Inter, Inter Tight and JetBrains Mono, the cyan accent and the portfolio's
  real monogram and favicon in place of the backoffice's generic "G" mark.
- Missing scales to add in the backoffice: type (12/13/14/16/20/24/32 + display), 4-point spacing,
  z-index, per-theme elevation, durations and easing, and a `comfortable|compact` density.
- The generator choice (own generator vs. Style Dictionary) is decision D13 in the
  [decision log](README.md#decision-log).

## Coordinated releases

- All three repositories use Conventional Commits and the task branch → `develop` → `main`
  promotion with merge commits; the plans add release-please for changelogs and tags.
- Order for a contract change: the producer releases a backward-compatible version first; the
  consumers refresh their snapshots and release; removals happen only after every consumer has
  moved (expand/contract).
- The assistant API and backoffice attach SBOM and provenance attestations to release images;
  VPS operations choose the image digest to deploy, outside these repositories.
- The portfolio's release evidence stays as described in [deployment](../deployment.md): a merged
  PR and green CI do not prove deployment.

## Deployment

| Component | Target | State |
| --- | --- | --- |
| Portfolio | Hostinger managed Node.js, deployed from `main` | live; assistant and analytics disabled by default |
| Portfolio staging | second Hostinger app tracking `develop` (decision D5) | proposed |
| Assistant API | VPS with Coolify | pending: **VPS not purchased** |
| Backoffice | VPS with Coolify; rolling updates need a health check, no host port mapping and no custom container name | pending: **VPS not purchased** |

Everything that depends on the VPS belongs to Phase V of the [roadmap](roadmap.md#phase-v-vps-gated-activation)
and starts only after the owner buys the VPS and authorizes activation, spending and deployment.
