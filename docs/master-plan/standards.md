# Standards

Part of the [master plan](README.md). Applies [ecosystem.md](ecosystem.md) section 10 (code standards) and section 13 (design) to this repository. Sources: research [10](research/10-standards-dependencies.md), [01](research/01-nextjs-architecture.md), [06](research/06-ui-ux-design.md).

## 1. Choice

| Topic | Standard | Deviation here and why |
|---|---|---|
| Style semantics | Google TypeScript Style Guide | none beyond the table below |
| Layout and lint | Biome 2.x pinned exactly (today 2.6.2): formatter 2-space, 100 columns, double quotes, semicolons; domains `next`, `react`, `test`, `project`; class sorting for Tailwind | Current `biome.json` ignores `public`, `contracts/assistant-api`, `**/*.md`; kept |
| Compiler | TypeScript 7 as `tsc` hard gate; `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes` (per-file opt-out with a comment), `verbatimModuleSyntax`, `erasableSyntaxOnly`, `noImplicitOverride`; `allowJs` off at M4 | `tools/api-contract` keeps its own pinned TypeScript 5 (compiler API consumer) |
| Naming and files | kebab-case files and folders; PascalCase only for exported components, types, classes; framework names as is (`page.tsx`, `route.ts`); tests `*.test.ts(x)` beside the unit or under `tests/`; no barrel files | Feature `entry.tsx` facades are registered public entries, not barrels |
| Language rules | No `enum`, `namespace`, parameter properties, decorators or `import =`; default exports only for framework entry files and `*.config.ts`; `undefined` internally, `null` only at I/O boundaries; `type` for unions and mapped types, `interface` for extendable shapes; `#private` allowed in new code | none |
| Scripts and configs | `.ts` run by Node type stripping (Node >= 24.12; repo 24.22.0); `.js/.mjs/.cjs` only where the tool cannot load TS | `next.config.mjs` (Hostinger glibc 2.28 cannot load `next.config.ts` through SWC) and `postcss.config.mjs` |
| Complexity | Biome `noExcessiveCognitiveComplexity` <= 15 now, ratcheting to 10 | Cognitive instead of cyclomatic (Biome has no cyclomatic rule); worst offenders are `scene-runtime.ts` and `solar-system-engine.ts` |
| Docs in code | TSDoc on exported symbols; comments explain why | existing comments are good and stay |
| Styling | Tailwind 4 plus owned CVA primitives and the full token system (OD-41); page-level CSS Modules migrate in M5; scene-geometry modules (hero, solar, architecture canvas) stay tokens-only (PF-D18); no colour, spacing, z-index, duration or breakpoint literals outside `src/design` | Transitional: 33 modules today; scene modules remain by design |
| Commits and PR titles | Conventional Commits in English, checked in `classify` (semantic PR title) | existing branch naming `feat/ fix/ chore/ docs/ refactor/ perf/ test/ ci/ build/ revert/` kept |
| Language policy | English for code, docs, commits; public copy EN (US) and ES (neutral Latin American) per `docs/editorial-guidelines.md` | none |

## 2. Enforcement

| Rule family | Enforced by | Where |
|---|---|---|
| Format, lint, imports, cycles, class order | Biome | pre-commit, `npm run check`, CI static |
| Types | `tsc` (TS 7) | same |
| Dead code and unused dependencies | knip | same |
| Architecture G1-G12 | `tools/architecture.ts` plus negative fixtures | same |
| Literals, `transition: all`, layout animation | `tools/css-policy.ts` | same |
| Docs commands equal CI commands | a test greps backticked commands in `AGENTS.md` against `package.json` | CI |
| Ratchet counts | `ratchets/static.json` | CI and nightly |

One command, `npm run check`, equals the CI static job and the pre-commit hook; `AGENTS.md` lists the same command. Rule changes need an ADR and bump the ecosystem version; ratchets may only tighten.
