# Clean architecture research and local decisions

Reviewed 2026-10-17 against the installed Next.js 16.4 documentation and the primary
sources below. This is a portfolio-specific decision record, not a claim that one
folder layout is universally best.

## Problem and decision

The site combines reviewed content, framework routes and interactive features.
Those responsibilities need independent loading and test boundaries so a feature
change does not pull rendering, transport or server-only code into inner policies
or browser bundles. Use inward dependencies, named feature entries and a bounded
source guard while retaining the existing routing and deployment model.

| Evidence | Local decision |
| --- | --- |
| [Clean Architecture dependency rule](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) | Domain models do not import views or adapters. Ports belong to the assistant application; concrete transports stay outside it. Static content does not need repository abstractions. |
| [Microsoft common web application architectures](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures) | Keep implementation details outside application-owned policy and interfaces. The examples target .NET server applications; their projects, persistence layers and deployment topology are not a frontend folder template. |
| [Next.js project organization](https://nextjs.org/docs/app/getting-started/project-structure) | Keep framework routes in `app`, compose pages in `views`, and colocate cohesive feature internals outside the router. URLs do not change. |
| [Next.js server/client boundary](https://nextjs.org/docs/app/getting-started/server-and-client-components) | Keep captions and carousel selection on the server; use narrow client entrypoints for canvas, controls and animation. Retain the persistent root layout and lazy scene imports. |
| [React custom hooks](https://react.dev/learn/reusing-logic-with-custom-hooks) | Preserve the existing controller and shared motion store. Extract pure filtering separately; do not replace every function with a hook. |
| [Google review guidance](https://google.github.io/eng-practices/review/reviewer/looking-for.html) | Review design, user behavior, complexity and meaningful tests. Avoid speculative generalization and style-only blockers. |
| [Google TypeScript guide](https://google.github.io/styleguide/tsguide.html) | Apply clear names and explicit contracts while retaining Next.js default exports, Biome formatting and modern module conventions. |
| [Microsoft engineering reviews](https://microsoft.github.io/code-with-engineering-playbook/code-reviews/) | Make changes reviewable, preserve security boundaries and record observable verification and ownership. |
| [Babel parser](https://babeljs.io/docs/babel-parser) | Parse TypeScript/JSX syntax, re-exports, import types and dynamic imports instead of matching imports with regex. Fixtures test the policy separately from real-source auditing. |
| [Dependency-cruiser TypeScript adapter](https://github.com/sverweij/dependency-cruiser/blob/main/src/extract/transpile/typescript-wrap.mjs) | Its current wrapper expects `typescript.transpileModule`. The installed TypeScript 7 exposes different programmatic APIs; avoid a second compiler/transpilation stack solely for this repository's bounded rules. |

## Scope of enforcement

The guard audits repository source modules and their explicit dependency edges.
It audits `.ts`, `.tsx`, `.mts`, `.cts`, `.js`, `.jsx`, `.mjs` and `.cjs` modules.
It resolves the project's `@/` alias, relative imports, declaration files, JSON,
CSS and owned image resources. It follows runtime edges from every `use client`
entrypoint to detect reachable `server-only` markers and Node builtins; type-only
edges still count for layering and cycles but not client runtime reachability.
Computed module imports fail closed. A bounded AST rule also rejects direct environment
I/O calls and browser/global object accesses in domain and assistant application code.
Dependencies inside npm packages, indirect runtime global access and arbitrary dynamic code are not a sandbox or a secret scanner; Next's build, strict
TypeScript, contract checks, dependency audits and review remain independent gates.
No Server Actions are currently present; introducing RPC boundaries requires an
explicit rule and test rather than silently ignoring server dependencies.

## Alternatives rejected

A framework-wide DI container, generic CRUD repositories, splitting the static
portfolio into services, and adding a second formatter do not solve a present
problem. A single feature barrel would also risk eager imports of renderers and
assistant transports. Named entry files keep those loading boundaries visible.
No plugin is required: the existing Next.js, Biome, Playwright and Actions stack
already covers the application; the parser supplies the missing syntax analysis.

## Evidence and maintenance cost

The guard and its [rejecting and accepting fixtures](../../scripts/architecture.test.mjs)
run through `npm run test:architecture`, inside the full protected quality workflow.
[CI run 39078119996](https://github.com/gonzalomartinperez/portfolio/actions/runs/39078119996)
passed all required quality, browser and hosting jobs at source
`e9a478d7a9f197a73e8d04873fc43c7e169cdd4b`. This is a dated source-level checkpoint;
new changes still require their own current-head checks. It does not establish
assistant activation, effective VPS configuration or production capacity.

Maintaining the public-entry map and representative AST fixtures is an explicit
cost of this bounded approach. A new entry, syntax form or RPC boundary needs
reviewed rules and tests. The [module contract](../architecture.md#source-module-contract)
remains the authority for allowed dependencies; this record explains their rationale.
