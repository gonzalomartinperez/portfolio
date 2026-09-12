# Technology and support

[Back to overview](../README.md)

- Node.js **24 LTS**; the local baseline is pinned in `.nvmrc`.
- Next.js **16 Active LTS** and React 19, using stable releases only.
- TypeScript **7.0.2** in strict mode, Biome for linting and formatting, and plain CSS.
- Exact direct dependency versions and a committed `package-lock.json`.

React, TypeScript, and Biome do not share Node.js's LTS labels. Their versions are
selected for compatibility, not described as LTS. Recheck support and security
updates regularly: pinning dependencies does not replace maintenance.

Prefer supported, compatible stable releases over automatically adopting every
new major. TypeScript 7 is a stable compiler release, not an LTS claim.
Major upgrades require a clean dependency installation and all project checks.

Next.js 16.3.5 uses the project-local TypeScript CLI by default. This enables TS7
without its missing JavaScript compiler API. Next.js still labels this integration
experimental; its adoption here is an explicit, tested compatibility decision,
not a claim that every tool supports TS7. No extra experimental flags or ignored
type errors are enabled. Keep native optional dependencies installed and install
them on each target OS with `npm ci`; do not copy `node_modules` between systems.

When adding tools that consume the TypeScript compiler API, verify their TS7 support
first. If compatibility regresses, restore TypeScript 6.0.3 with its regenerated
lockfile and rerun the full checks instead of disabling type checking. Editor
language-server support is separate from command-line checks and must be verified
in the chosen editor; it is not configured by this repository.

Sources: [Node.js releases](https://nodejs.org/en/about/previous-releases),
[Next.js support policy](https://nextjs.org/support-policy),
[TypeScript 7 release](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/),
[Next.js TypeScript CLI integration](https://nextjs.org/docs/app/api-reference/config/next-config-js/useTypeScriptCli).

## Maintenance

Dependencies are pinned and reviewed through Dependabot PRs into `develop`.
Updates never merge automatically. Node type definitions stay on the runtime's
major version; reevaluate that constraint when intentionally upgrading Node.
