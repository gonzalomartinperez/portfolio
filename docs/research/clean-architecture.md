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

### Coordinated layout refinement

The 2026-10-18 review mapped the public site's consumers before proposing physical
moves. The cross-repository research ledger contains 62 deduplicated primary pages
reviewed across owners; this site's contribution reviewed 15, five already present
above. That combined count is not an independent review of every page by this owner
and does not establish runtime compatibility. The resulting site slice is defined
in the [common-layout specification](../specs/common-site-layout.md).

| Additional primary evidence | Consequence for this migration |
| --- | --- |
| [Next.js public assets](https://nextjs.org/docs/app/api-reference/file-conventions/public-folder) | Root `public` files are URL contracts; keep PDF, texture and artwork URLs stable. |
| [React client module evaluation](https://react.dev/reference/rsc/use-client) | Follow transitive module imports rather than assuming rendered ancestry determines client reachability. |
| [Next.js client entry props](https://nextjs.org/docs/app/api-reference/directives/use-client) | Preserve narrow, serializable server-to-client display inputs while relocating presentation. |
| [React state structure](https://react.dev/learn/choosing-the-state-structure) | Retain one motion store and conversation controller; avoid duplicate state during migration. |
| [TypeScript module reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html) | TypeScript path aliases do not rewrite native Node imports. Move script consumers with their real relative imports. |
| [TypeScript project references](https://www.typescriptlang.org/docs/handbook/project-references.html) | Do not add compiler projects without an independent build responsibility. |
| [Node module packages](https://nodejs.org/download/release/v24.19.0/docs/api/packages.html) | Package scope and explicit native ESM paths remain executable contracts; this versioned reference is not a toolchain upgrade instruction. |
| [npm package scripts](https://docs.npmjs.com/cli/v11/configuring-npm/package-json/) | npm targets, generation scripts and manifest aliases are migration consumers. |
| [GitHub workflow syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax) | Preserve workflow discovery, required check names and command paths. |
| [shadcn configuration schema](https://ui.shadcn.com/schema.json) | Update the real component/UI/utility aliases. The hooks alias is optional; omit the unused path rather than creating an unowned hooks directory. This schema was checked separately after the coordinated ledger. |

Named shared capabilities replace generic component/utility buckets. Feature UI
lives in presentation without requiring empty layers in smaller features. Exact
temporary content, contract and media exceptions preserve existing consumers until
their own atomic cutovers. Neither the folder names nor the research count prove
architecture: paired invalid/valid fixtures and actual application checks do.

The guard audits repository source modules and their explicit dependency edges.
It audits `.ts`, `.tsx`, `.mts`, `.cts`, `.js`, `.jsx`, `.mjs` and `.cjs` modules.
It resolves the project's `@/` alias, relative imports, declaration files, JSON,
CSS and owned image resources. It follows runtime edges from every `use client`
entrypoint to detect reachable `server-only` markers and Node builtins; type-only
edges still count for layering and cycles but not client runtime reachability.
Computed module imports fail closed. A bounded AST rule also rejects direct environment
I/O calls and browser/global object accesses in domain and application code. Every
owned source path is classified before dependency traversal; exact input exceptions
are reviewed separately from ordinary framework, feature and shared placements.
Inner-layer clock checks follow statically declared aliases and destructuring with
lexical function/block bindings. Explicit date arguments and injected clocks remain
valid; outer scene timing is unaffected. Reassignment, reflection, indirect factory
returns and arbitrary dynamic code are outside that bounded effect analysis.
Dependencies inside npm packages and indirect runtime global access are not a
sandbox or a secret scanner; Next's build, strict
TypeScript, contract checks, dependency audits and review remain independent gates.
No Server Actions are currently present; the CI transfer profile deliberately
rejects them. Introducing RPC boundaries requires an explicit rule and test rather
than silently ignoring server dependencies. This site-specific restriction does not
define another application's legitimate Next.js RPC contract.

## Alternatives rejected

A framework-wide DI container, generic CRUD repositories, splitting the static
portfolio into services, and adding a second formatter do not solve a present
problem. A single feature barrel would also risk eager imports of renderers and
assistant transports. Named entry files keep those loading boundaries visible.
No plugin is required: the existing Next.js, Biome, Playwright and Actions stack
already covers the application; the parser supplies the missing syntax analysis.

## Evidence and maintenance cost

The guard and its [rejecting and accepting fixtures](../../tests/unit/architecture.test.mjs)
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
