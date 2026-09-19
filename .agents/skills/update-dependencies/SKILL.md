---
name: update-dependencies
description: Evaluate or apply requested dependency upgrades using supported stable versions and verified compatibility; not an instruction to update all packages during ordinary work.
---

# Update Dependencies

1. Read AGENTS.md, package.json, the lockfile, and .nvmrc. Distinguish evaluation from authorized upgrades.
2. Check official support policies, release notes, security advisories, engines, and peer dependency ranges for the proposed versions.
3. Prefer Node and Next supported LTS lines. Read README.md for the validated TypeScript baseline and integration caveats; recommend major migrations separately with evidence. Check compiler-API consumers and native optional packages when evaluating TypeScript changes.
   Consult docs/technology.md and docs/deployment.md for the tested host contract.
   Keep Next.js and SWC WASM versions aligned; preserve existing lockfile platform
   selectors. Compiler/runtime changes must pass both quality and Hostinger/GLIBC
   CI jobs. Distinguish installed package availability from the loader actually
   using it; check fallback/download logs when upgrading Next.js.
   Tailwind's native build dependencies must also pass the hosting lane. Review
   upstream changes before refreshing owned shadcn source; do not overwrite local
   theme, semantics or accessibility adaptations with registry defaults.
4. Other libraries may have no LTS policy. Select compatible stable releases, not prereleases or a latest tag blindly.
5. For authorized changes, pin direct versions, update the lockfile with npm, and keep changes scoped. Never use force, legacy-peer-deps, or ignored errors to hide incompatibility.
6. Verify npm ci, npm ls --all, npm audit, npm run check, and relevant production behavior. Explain advisories that remain; do not apply forced audit fixes.
7. Document why a major is adopted or deferred, checks performed, and maintenance implications. Do not modify the machine-wide Node default or merge automated update PRs without authority.
