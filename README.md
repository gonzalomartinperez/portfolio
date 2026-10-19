<div align="center">

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/gallery/home-hero-dark.webp">
  <img src="docs/gallery/home-hero-light.webp" alt="Portfolio home: name, positioning, calls to action and the technology sphere over a realistic solar system" width="100%">
</picture>

# Gonzalo Martin Perez · Portfolio

**Software Engineer · AI Engineer · Product Engineer**

A bilingual portfolio with production experience, interactive architecture diagrams,
reviewed CVs, a focused technology catalog and a realistic, readable 3D solar scene.

[![CI](https://github.com/gonzalomartinperez/portfolio/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/gonzalomartinperez/portfolio/actions/workflows/ci.yml)
[![Nightly](https://github.com/gonzalomartinperez/portfolio/actions/workflows/nightly.yml/badge.svg?branch=main)](https://github.com/gonzalomartinperez/portfolio/actions/workflows/nightly.yml)
![Next.js 16 LTS](https://img.shields.io/badge/Next.js-16%20LTS-000000?style=flat-square&logo=nextdotjs)
![TypeScript strict](https://img.shields.io/badge/TypeScript-7%20strict-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Node.js 24 LTS](https://img.shields.io/badge/Node.js-24%20LTS-5FA04E?style=flat-square&logo=nodedotjs&logoColor=white)
![Languages](https://img.shields.io/badge/languages-EN%20%C2%B7%20ES-0EA5E9?style=flat-square)
![Themes](https://img.shields.io/badge/themes-dark%20%C2%B7%20light-64748B?style=flat-square)

**[gonzalomartinperez.com](https://gonzalomartinperez.com)** ·
[Gallery](#gallery) · [Architecture](docs/architecture.md) · [Design system](docs/design.md) ·
[Engineering standards](docs/engineering-standards.md) ·
[Contributing](CONTRIBUTING.md) · [Security](SECURITY.md) ·
[Development workflow](docs/development.md) · [Automatic skills](docs/skill-discovery.md) · [Technology decisions](docs/technology.md)

</div>

## Highlights

| | |
| --- | --- |
| **Production evidence** | Eight routes in English and Spanish: experience, the Filomena case study, education, a typed technology catalog and a self-contained CV with reviewed PDF downloads. |
| **Interactive architecture** | React Flow diagrams with keyboard-accessible detail panels explain the systems behind each role. |
| **Hero identity** | A lazy Three.js particle sphere with perspective depth and rim light; the camera flies through it and the logos settle into the toolkit as a staggered wave. |
| **Solar scene** | A single-pass Three.js renderer with physically motivated shaders, a baked Milky Way and a reading mask that keeps text contrast on every page. |
| **Explicit architecture** | Shared paired-site roots, named feature boundaries and AST checks for ownership, cycles and client/server closure. See the [placement decision](docs/adr/site-architecture-parity.md). |
| **Engineered quality** | Strict TypeScript, Biome, budgets, rendered checks and eight duration-balanced Playwright groups gate every pull request. |
| **Reviewed delivery** | Task branch → `develop` → `main` through protected pull requests; native Hostinger deployment from `main`. |

## Delivery status and ownership

Developed and maintained exclusively by Gonzalo Martin Perez, this public portfolio
is live on managed Hostinger Node.js hosting. Suggestions, bug reports and constructive
feedback are welcome through the existing [contact channels](https://gonzalomartinperez.com/contact);
priorities, implementation, review and releases remain the maintainer's responsibility.

This repository
owns its website, reviewed public content and optional assistant client. The assistant
API, private backoffice and VPS operations have separate owners and release gates;
this application does not provision or operate them.

The assistant remains **disabled** in the public delivery. Its implemented client
and fixture-tested flows are not evidence of an activated production service.
Specifications record intended behavior; [verification records](docs/verification/)
record tested conditions. Required CI checks and an observed deployment are separate
pieces of evidence, as described in [deployment](docs/deployment.md).

## Gallery

Captured from the production build at 2× density (desktop 1440 × 900 CSS px, Pixel 7 for
mobile) on a hardware GPU. The scene animates continuously; these are single frames.

<table>
  <tr>
    <td colspan="2"><img src="docs/gallery/home-flythrough-dark.webp" alt="The camera flying through the particle sphere toward the Sun, with near points growing into soft sprites over the solar system"><br><sub><b>Home · fly-through.</b> Scrolling carries the camera through the sphere; near points gain real parallax before the toolkit settles.</sub></td>
  </tr>
  <tr>
    <td width="50%"><img src="docs/gallery/home-toolkit-dark.webp" alt="Home technology toolkit settled into a labeled grid over the receding solar scene"><br><sub><b>Home · technology toolkit.</b> Logos settle into a labeled grid as a wave; the scene recedes behind it.</sub></td>
    <td width="50%"><img src="docs/gallery/home-featured-project-dark.webp" alt="Featured Filomena project card with product screenshots, technologies and production metrics"><br><sub><b>Home · featured project.</b> Product screenshots, stack and production outcomes.</sub></td>
  </tr>
  <tr>
    <td><img src="docs/gallery/work-architecture-dark.webp" alt="Work page with an interactive product architecture diagram and an open component detail panel"><br><sub><b>Work · architecture.</b> Interactive diagrams with component details.</sub></td>
    <td><img src="docs/gallery/filomena-architecture-dark.webp" alt="Filomena case study architecture diagram from web frontend to REST API, data, cache and observability"><br><sub><b>Filomena · architecture.</b> The rebuilt exam platform, from browser to data.</sub></td>
  </tr>
  <tr>
    <td><img src="docs/gallery/filomena-gallery-light.webp" alt="Filomena case study gallery with workflow filters and reviewed application screens"><br><sub><b>Filomena · application gallery.</b> 43 reviewed screens with workflow filters.</sub></td>
    <td><img src="docs/gallery/about-light.webp" alt="About page in the light theme with headline, narrative and portrait"><br><sub><b>About · light theme.</b> The scene becomes an ink-and-paper atlas.</sub></td>
  </tr>
  <tr>
    <td><img src="docs/gallery/stack-light.webp" alt="Searchable technology catalog with category filters and linked experience"><br><sub><b>Stack.</b> Searchable catalog linked to the experience behind each entry.</sub></td>
    <td><img src="docs/gallery/education-dark.webp" alt="Education curriculum with course names in both languages and grade badges"><br><sub><b>Education.</b> Curriculum with original names, dates and grades.</sub></td>
  </tr>
  <tr>
    <td><img src="docs/gallery/contact-dark.webp" alt="Contact page with email, LinkedIn, GitHub and CV downloads"><br><sub><b>Contact.</b> Direct channels and bilingual CV downloads.</sub></td>
    <td><img src="docs/gallery/home-hero-es-light.webp" alt="Spanish home page in the light theme"><br><sub><b>Español · light theme.</b> Every route mirrors under <code>/es</code>.</sub></td>
  </tr>
</table>

### Solar explorer

A glass dock steps through every body, zooms, rotates and resets; the caption names and
classifies the current selection.

<table>
  <tr>
    <td width="33%"><img src="docs/gallery/explorer-system.webp" alt="Immersive explorer showing the Sun, nine orbits, the asteroid belt and the Milky Way"><br><sub><b>The full system.</b> Sun, nine orbits and the Moon.</sub></td>
    <td width="33%"><img src="docs/gallery/explorer-saturn.webp" alt="Saturn close-up with ring shadows cast on the planet and the planet's shadow on the rings"><br><sub><b>Saturn.</b> Shadows cast both ways between planet and rings.</sub></td>
    <td width="33%"><img src="docs/gallery/explorer-earth.webp" alt="Earth close-up with oceans, clouds, city lights on the night side and the Moon"><br><sub><b>Earth.</b> Ocean glint, clouds, night lights and the Moon.</sub></td>
  </tr>
</table>

### Mobile

<table>
  <tr>
    <td width="25%"><img src="docs/gallery/mobile-home-dark.webp" alt="Mobile home hero with the technology sphere"></td>
    <td width="25%"><img src="docs/gallery/mobile-about-light.webp" alt="Mobile About page in the light theme"></td>
    <td width="25%"><img src="docs/gallery/mobile-work-dark.webp" alt="Mobile architecture diagram on the Work page"></td>
    <td width="25%"><img src="docs/gallery/mobile-explorer-jupiter.webp" alt="Mobile solar explorer focused on Jupiter"></td>
  </tr>
</table>

## Built with

**Application & interface**

![Next.js](https://img.shields.io/badge/Next.js-F4F5F7?style=flat-square&logo=nextdotjs&logoColor=000000) ![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react) ![TypeScript](https://img.shields.io/badge/TypeScript-F4F5F7?style=flat-square&logo=typescript) ![Node.js](https://img.shields.io/badge/Node.js-F4F5F7?style=flat-square&logo=nodedotjs) ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-20232A?style=flat-square&logo=tailwindcss) ![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-F4F5F7?style=flat-square&logo=shadcnui&logoColor=000000) ![Radix UI](https://img.shields.io/badge/Radix%20UI-F4F5F7?style=flat-square&logo=radixui&logoColor=000000)

**Motion, 3D & diagrams**

![Three.js](https://img.shields.io/badge/Three.js-F4F5F7?style=flat-square&logo=threedotjs&logoColor=000000) ![GLSL](https://img.shields.io/badge/GLSL-5586A4?style=flat-square&logo=opengl&logoColor=white) ![GSAP](https://img.shields.io/badge/GSAP-20232A?style=flat-square&logo=gsap&logoColor=88CE02) ![React Flow](https://img.shields.io/badge/React%20Flow-2563EB?style=flat-square)

**Quality & delivery**

![Biome](https://img.shields.io/badge/Biome-F4F5F7?style=flat-square&logo=biome) ![Playwright](https://img.shields.io/badge/Playwright-2EAD33?style=flat-square) ![axe](https://img.shields.io/badge/axe--core-663399?style=flat-square) ![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-F4F5F7?style=flat-square&logo=githubactions)

These badges describe this repository's implementation. The [professional technology catalog](https://gonzalomartinperez.com/stack) separately documents tools used across my work, with experience evidence. Badge artwork is served by Shields.io; technology names and marks belong to their respective owners and do not imply endorsement.

## Architecture at a glance

<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/diagrams/architecture-overview-dark.svg">
  <img src="docs/diagrams/architecture-overview-light.svg" alt="Portfolio architecture: reviewed content feeds server-rendered pages and a persistent shell, with separate deployment and optional assistant boundaries." width="640">
</picture>
</p>

[Full-size light](docs/diagrams/architecture-overview-light.svg) · [Full-size dark](docs/diagrams/architecture-overview-dark.svg) ·
[Editable Mermaid source](docs/diagrams/architecture-overview.mmd) · [Diagram guide](docs/diagrams/README.md)

### Architecture status and enforcement

Implemented as feature-owned modules with inward dependencies: routes and views
compose the interface; pure policies stay separate from rendering and transport.
The assistant owns its application ports and receives concrete adapters at its entry.
The [module contract](docs/architecture.md#source-module-contract) is the source of truth.

- **Enforced in CI:** `npm run test:architecture` audits parsed imports, aliases,
  re-exports, dynamic imports and type-only edges. Every source module has a declared
  placement, including importless code. It rejects reversed dependencies, private
  feature imports, cycles, ambient inner-layer clock reads and client paths to server-only code. The
  [negative fixtures](tests/unit/architecture.test.mjs) must reject representative
  violations while valid composition passes; this runs inside `npm run check`.
- **Deliberate adaptations:** small features do not need empty layers. Named public
  entries and the narrow server-only analytics configuration facade are documented
  in the module contract. Shared capabilities have named owners; exact transitional
  content, contract and media paths have recorded cutover conditions. Static content
  needs no generic repository or DI framework.
- **Pending operational acceptance:** the assistant and analytics remain disabled.
  Effective TLS, CORS, cookies, CSRF, proxy streaming and VPS readiness require their
  owners' verification. Passing source checks does not establish production readiness.

The [decision record and primary bibliography](docs/research/clean-architecture.md)
explain how the dependency rule and Microsoft architecture guidance apply here.
Google's engineering practices inform review and quality, not an architecture
certification. The guard's [scope and limits](docs/research/clean-architecture.md#scope-of-enforcement)
remain explicit; no universal folder layout or complete security audit is claimed.

The portfolio has no application database or model-provider key. Reviewed content and documents are committed inputs; the optional assistant talks directly to a separately deployed API. [Explore the application, CV publication, and assistant boundaries](docs/architecture.md).

### Solar scene

<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/diagrams/solar-rendering-dark.svg">
  <img src="docs/diagrams/solar-rendering-light.svg" alt="Solar rendering pipeline: a complete static scene remains available while a deferred engine prepares a single render pass, with reading protection and adaptive quality." width="640">
</picture>
</p>

[Full-size light](docs/diagrams/solar-rendering-light.svg) · [Full-size dark](docs/diagrams/solar-rendering-dark.svg) ·
[Editable Mermaid source](docs/diagrams/solar-rendering.mmd) · [Diagram guide](docs/diagrams/README.md)

Custom shaders give airless bodies Lommel–Seeliger photometry, gas giants limb darkening,
Earth its oceans, clouds and night lights, and Saturn's rings shadows in both directions.
Bright bodies recede behind reading text so it keeps WCAG contrast, enforced by a browser
test. Reduced motion, missing WebGL, texture failure and context loss keep the complete
static scene; hidden tabs suspend rendering. Each view downloads the smallest map variant
that covers it, full-resolution maps load only when the explorer opens, and content-hashed
maps are cached immutably: about 2.4 MB of textures on desktop and 1.5 MB on phones, down
from 7.2 MB. See the
[specification](docs/specs/immersive-solar-scene.md) and its
[verification record](docs/verification/immersive-solar-scene.md).

### Assistant availability

The native assistant is **disabled by default**. Unset or `false`
`ASSISTANT_ENABLED` removes the launcher and returns 404 for `/assistant` and
`/es/assistant`. Activation is not part of this delivery. For isolated development
or fixture verification only, run `ASSISTANT_ENABLED=true npm run dev` or
`ASSISTANT_ENABLED=true npm run build`. Static production output captures this
setting during the build; changing it on an existing build is not a rollout.
CI verifies the enabled conversation suite and a separate disabled Hostinger build.

### Product metrics and privacy

Product analytics has its own **default-off** build gate, `ANALYTICS_ENABLED`.
The optional client sends only reviewed event names, coarse page sections, language,
allowlisted interaction targets and a fresh per-event duplicate-detection ID to the
owned API. The reviewed v2 extension adds closed public regions, 8×8 click cells,
coarse viewport cohorts and geometric section exposure. It excludes forms,
conversations, dynamic canvases and private controls; exposure does not mean reading. It uses no visitor identity, tracking cookie, persistent retry queue or
credentialed assistant transport. Off means the analytics host is absent and no
analytics requests or storage operations occur.

The footer provides a native EN/ES privacy disclosure with actual feature states,
local theme storage, external links and public contact. It is not a consent banner
or a claim of legal compliance. Optional measurements needing consent stay off.
Activation, retention approval and effective hosting/proxy log policies remain
separate readiness decisions. See the [analytics contract and limits](docs/specs/product-analytics.md).
CI's enabled analytics build uses only a loopback synthetic sink; it does not
activate collection on the public site or call a model provider. The
[aggregate interaction specification](docs/specs/aggregate-interaction-analytics.md)
records the pinned public contract, client bounds and separate real API/backoffice
acceptance requirements.

## Delivery and quality

[Release history](docs/release-history.md) records the owner-requested `v1.0.0`
launch label and preserves the original source anchors and verification history.

<p align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/diagrams/delivery-flow-dark.svg">
  <img src="docs/diagrams/delivery-flow-light.svg" alt="Protected delivery: task pull requests enter develop, release pull requests promote to main, and Hostinger deploys. Each pull request requires quality, browser and hosting compatibility checks." width="640">
</picture>
</p>

[Full-size light](docs/diagrams/delivery-flow-light.svg) · [Full-size dark](docs/diagrams/delivery-flow-dark.svg) · [Editable Mermaid source](docs/diagrams/delivery-flow.mmd)

- **Deliberate scope:** no CMS, application database or third-party tracking SDK — static routes,
  typed content, and client boundaries only where interaction actually requires them.
- **Decisions written down:** the [design system](docs/design.md), specifications in
  [docs/specs](docs/specs/) and the [research note](docs/research/portfolio-2026-09-12.md)
  record what was chosen, what was rejected, and where the evidence is weak.
- **Traceable changes:** task branches integrate into `develop`; only `develop` can promote to `main`.
- **Verifiable quality:** [CI runs](https://github.com/gonzalomartinperez/portfolio/actions/workflows/ci.yml)
  expose lint, type-check, build, budget and browser results; flaky tests fail the gate.
- **Measured performance:** transfer budgets for scene JavaScript, styles, HTML and images,
  plus recorded frame-pacing and GPU-memory measurements with their conditions.
- **Structured AI collaboration:** six focused skills share one source of instructions,
  with clear ownership, review, and integration boundaries.

These are repository practices, not claims about completed client projects or application AI
features. Playwright and axe check production routes, both themes, keyboard journeys and failure
fallbacks. Automated tests complement visual review; they do not certify accessibility, security
or deployment success. Verification records in [docs/verification](docs/verification/) keep the
conditions and remaining limits of each release; the
[current release ledger](docs/specs/release-2026-10-03.md) reconciles combined requests.

## What the site contains

| Route | Contents |
| --- | --- |
| `/` | Positioning, the hero identity, portrait, selected evidence |
| `/about` | Professional narrative, how he works, languages, availability |
| `/work` | Experience and selected projects in one chronology |
| `/work/filomena` | The flagship product-engineering case study |
| `/stack` | Applied technology experience, AI-first categories and alphabetical entries |
| `/education` | Degree, academic results, and approved public evidence |
| `/contact` | Contact routes and what he is open to |
| `/cv` | Self-contained CV with reviewed PDF downloads |

English is served unprefixed and Spanish under `/es`, with the same path segments in
both, so switching language adds or removes the prefix and nothing else. Dark is the
default and needs no JavaScript; light is an explicit choice from the header toggle.
[The autonomy specification](docs/specs/portfolio-autonomy.md) holds the current scope
and acceptance criteria; the [redesign](docs/specs/portfolio-redesign.md) retains the
visual foundation. The [interaction specification](docs/specs/interactive-sphere.md)
covers sphere pulses, the keyboard-accessible avatar and restrained depth on interface controls.

## Engineering at a glance

| Area | Approach |
| --- | --- |
| Application | Next.js App Router, React, and Server Components by default |
| Type safety | TypeScript 7.0.2 with strict checking |
| Runtime | Node.js 24 LTS and Next.js 16 Active LTS |
| Interface | Owned shadcn/ui primitives, Tailwind utilities and CSS Modules; existing design tokens and focused client boundaries |
| Languages | American English and neutral Latin American Spanish, backed by a shared typed copy contract |
| Hero identity | Owner-selected caricature, lazy Three.js particle scene with perspective depth and GSAP native-scroll choreography |
| Solar scene | Single-pass Three.js with custom GLSL, reading mask, adaptive resolution and complete static fallbacks |
| Technology catalog | Shared typed inventory, original-color local marks and linked experience context |
| Code quality | Biome linting and formatting, locked dependency installation |
| Delivery | Protected pull requests, GitHub Actions CI, native Hostinger CD from `main` |
| AI-assisted development | Shared Claude Code and Codex guidance, specifications, isolated worktrees |

TypeScript 7 is stable, not LTS. Next.js still labels its default TypeScript CLI
integration experimental. The [technology guide](docs/technology.md) explains
the compatibility decision and fallback.

## Run locally

Use the exact Node.js version in [.nvmrc](.nvmrc), with an npm version satisfying
[package.json](package.json). The committed [lockfile](package-lock.json) is the
installation source of truth. Local tool versions and the separate managed-hosting
compatibility baseline are documented in [technology decisions](docs/technology.md);
a local upgrade does not change the hosting environment.

```sh
nvm install
nvm use
npm ci
npm run dev
```

Open `http://localhost:3000`. No database, credentials, or external services are required
for the default assistant- and analytics-disabled site. Keep local configuration out of version control;
see [configuration and assistant activation](docs/native-assistant.md)
and the [deployment guide](docs/deployment.md) before changing deployment settings.
On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm`.

<details>
<summary><b>All commands</b></summary>

| Command | Purpose |
| --- | --- |
| `npm run build` | Compile Next.js with Webpack for hosting compatibility; no Biome invocation |
| `npm run check` | Repository checks, formatting, lint, and one production build with type validation |
| `npm run typecheck` | Fast standalone type validation without a production build |
| `npm run test:secrets` | Scan tracked files/history with verified Gitleaks and synthetic regression probes |
| `npm run test:secrets:artifacts` | Scan the sanitized CI transfer; see the development guide |
| `npm run test:dependency-policy` | Verify read-only dependency assessment and negative update fixtures |
| `npm run test:analytics` | Check the frozen ingest schema, closed dimensions and bounded delivery failures |
| `npm run test:architecture` | Check negative fixtures, module boundaries, cycles and client/server separation |
| `npm run test:repository` | Check UTF-8, local links, skill adapters, and compiler version alignment |
| `npm run test:smoke` | After `build`, check the production server responds correctly |
| `npm run test:browser` | After `build`, exercise desktop/mobile routes, axe and scene fallbacks |
| `npm run test:site` | Reuse one build with sequential rendered HTTP and browser HTTPS fixtures |
| `npm run test:documents` | Verify approved local document signatures, sizes and hashes |
| `npm run test:identity` | Verify favicon and PNG outputs match the approved avatar source |
| `npm run identity:build` | Regenerate compatibility icons after an approved avatar change |
| `npm run format` | Apply formatting and safe Biome fixes |
| `npm run start` | Serve the previously built production app |

</details>

The [autonomy specification](docs/specs/portfolio-autonomy.md) covers the local CV,
academic evidence, prioritized technology catalogue and reversible scene. The
[public-content contract](docs/public-content.md) explains how approved exports are
updated without giving the public build access to private sources.

## Find your way around

<details open>
<summary><b>Source and documentation map</b></summary>

| Location | Contents |
| --- | --- |
| [src/app](src/app/) | Routes, layouts, metadata, and global styles |
| [src/views](src/views/) | Server page composition |
| [src/shell](src/shell/) | Persistent layout, navigation, locale and theme controls |
| [src/features](src/features/) | Feature-owned models, adapters and interactive presentation |
| [src/shared](src/shared/) | Reusable presentation, identity marks and owned UI primitives |
| [content](content/) | Typed per-locale content and the shared interface-copy contract |
| [tests](tests/) / [tools](tools/) | Unit, browser, integration and rollout cases; build and verification tools |
| [.github](.github/) | Trusted workflows and repository maintenance configuration |
| [.agents/skills](.agents/skills/) | Canonical procedures; Claude adapters link to these |
| [Architecture](docs/architecture.md) | Application boundaries, reviewed CV publication, and the disabled assistant integration |
| [Design system](docs/design.md) | Direction, tokens for both themes, typography, motion, the hero field |
| [Solar scene spec](docs/specs/immersive-solar-scene.md) | Acceptance criteria, rendering decisions and measured verification |
| [Solar assets](docs/assets/solar-system.md) | Texture provenance, licenses and runtime sizes |
| [Initial release spec](docs/specs/portfolio-initial-release.md) | Scope, acceptance criteria, and decisions |
| [Research note](docs/research/portfolio-2026-09-12.md) | Sources behind those decisions, including the weak ones |
| [Contributing](CONTRIBUTING.md) | Reproducible setup, focused checks, review and coordination |
| [Security policy](SECURITY.md) | Private vulnerability reporting and safe evidence handling |
| [Development guide](docs/development.md) | Code conventions, SDD, branches, agents, and review |
| [Code-quality standard](docs/code-quality.md) | Readable code, necessary comments, useful API documentation |
| [Editorial guidelines](docs/editorial-guidelines.md) | Natural bilingual copy, evidence-aware claims, technology and brand presentation |
| [Public-content contract](docs/public-content.md) | Approved data projection, generated CV and reviewed document releases |
| [Dependency updates](docs/dependency-updates.md) | Manual Dependabot review, trusted metadata assessment and operator inspection |
| [Technology guide](docs/technology.md) | Version policy, compatibility, and maintenance |
| [LinkedIn branding](docs/linkedin-branding.md) | Reviewed Featured thumbnail, provenance and manual-upload assets |
| [CI efficiency](docs/research/ci-efficiency.md) | Measured timing, complete balanced coverage and package-cache strategy |
| [Deployment guide](docs/deployment.md) | Hostinger setup and the CI/CD boundary |
| [Native assistant guide](docs/native-assistant.md) | Lazy panel, imported API contract, session ownership and activation checks |
| [AGENTS.md](AGENTS.md) / [CLAUDE.md](CLAUDE.md) | Shared agent contract and Claude entrypoint |

</details>

Place route conventions in `src/app`, server composition in views/shell and
cohesive behavior in its owned feature. Tests and build tooling stay separate from
application code; documentation records decisions and bounded evidence. Names
follow existing TypeScript/React conventions and Next.js reserved filenames; small
features do not need empty layers. See the [enforced module map](docs/architecture.md#source-module-contract).

Code, documentation, and commit messages are English; the published interface ships in
English and Spanish. Task branches follow `type/kebab-case-description` naming and are
deleted after integration; `main` and `develop` remain protected. See the development
guide and [contribution guide](CONTRIBUTING.md) before contributing.

## Software license

The original application code, build/test tooling and technical documentation are
licensed under the [MIT License](LICENSE), copyright 2026 Gonzalo Martin Perez.
The separate [content scope and third-party notices](NOTICE.md) identify personal
content, media and third-party materials that are not relicensed by that grant.

`"private": true` in both package manifests continues to prevent accidental npm
publication; this repository is public and its software license is MIT. The
existing repository checks enforce the license text, package metadata and notice links.

References: [official MIT text](https://opensource.org/license/mit) ·
[GitHub repository licensing guidance](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository).
