# Gonzalo Martin Perez · Portfolio

[![CI](https://github.com/gonzalomartinperez/portfolio/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/gonzalomartinperez/portfolio/actions/workflows/ci.yml)

The foundation for a personal portfolio focused on software engineering and applied AI.

**Current stage:** initial setup. The website has a starter landing page;
project case studies and professional content will be added separately.
Intended domain: **gonzalomartinperez.com** — hosting and domain activation are pending.

[Explore the source](src/app/) · [Technology decisions](docs/technology.md) · [Development workflow](docs/development.md)

## Engineering at a glance

| Area | Approach |
| --- | --- |
| Application | Next.js App Router, React, and Server Components by default |
| Type safety | TypeScript 7.0.2 with strict checking |
| Runtime | Node.js 24 LTS and Next.js 16 Active LTS |
| Code quality | Biome linting and formatting, reproducible dependency installation |
| Delivery | Required CI checks and protected pull-request integration |
| AI-assisted development | Shared Claude Code and Codex guidance, specifications, isolated worktrees |

TypeScript 7 is stable, not LTS. Next.js still labels its default TypeScript CLI
integration experimental. The [technology guide](docs/technology.md) explains
the compatibility decision and fallback.

## What this repository demonstrates

- **Deliberate scope:** a small foundation without unused services or speculative layers.
- **Traceable changes:** task branches integrate into `develop`; only `develop` can promote to `main`.
- **Verifiable quality:** [CI runs](https://github.com/gonzalomartinperez/portfolio/actions/workflows/ci.yml)
  expose lint, type-check, and production-build results.
- **Structured AI collaboration:** six focused skills share one source of instructions,
  with clear ownership, review, and integration boundaries.

These are repository practices, not claims about completed client projects or
application AI features. Behavioral tests will accompany future functionality;
the current checks do not establish security, accessibility, or deployment success.

## Run locally

Use the Node.js version in [.nvmrc](.nvmrc) and its bundled npm 11.
The hosting compatibility baseline is Node 24.6.0 with npm 11.5.1; CI also tests
the newer local baseline. No Corepack setup or separate package-manager download
is required. See [technology decisions](docs/technology.md) for the version policy.

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. No database, credentials, or external services are required.
On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm`.

| Command | Purpose |
| --- | --- |
| `npm run build` | Compile Next.js for production, including on Hostinger; no Biome invocation |
| `npm run check` | Validate formatting, lint, types, and the production build |
| `npm run test:smoke` | After `build`, check the production server responds correctly |
| `npm run format` | Apply formatting and safe Biome fixes |
| `npm run start` | Serve the previously built production app |

## Find your way around

| Location | Contents |
| --- | --- |
| [src/app](src/app/) | Homepage, layout, metadata, and styles |
| [Development guide](docs/development.md) | Code conventions, SDD, branches, agents, and review |
| [Technology guide](docs/technology.md) | Version policy, compatibility, and maintenance |
| [Deployment guide](docs/deployment.md) | Hostinger setup and the CI/CD boundary |
| [Specification template](docs/specs/template.md) | Scope, acceptance criteria, decisions, and verification |
| [AGENTS.md](AGENTS.md) / [CLAUDE.md](CLAUDE.md) | Shared agent contract and Claude entrypoint |

Code, documentation, interface text, and commits use English. Task branches follow
`type/kebab-case-description` naming and are deleted after integration; `main`
and `develop` remain protected. See the development guide before contributing.

## Rights

All rights reserved; no reuse license is granted. Dependencies retain their own
licenses. This GitHub repository is public; `"private": true` in `package.json`
only prevents accidental publication to npm.
