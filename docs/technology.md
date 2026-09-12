# Technology and support

[Back to overview](../README.md)

- Node.js **24 LTS**; the local baseline is pinned in `.nvmrc`.
- Next.js **16 Active LTS** and React 19, using stable releases only.
- TypeScript **7.0.2** in strict mode, Biome for linting and formatting, and plain CSS.
- Exact direct dependency versions and a committed `package-lock.json`.

npm **11.5.1**, bundled with the observed Node 24.6.0 runtime, is the hosting
compatibility baseline recorded in `packageManager`. `engines` accepts npm 11.5.1
through npm 11.x, including the newer version bundled with the local Node baseline.
Use npm directly, not Corepack; the metadata does not install or switch npm.
CI verifies both bundled toolchains rather than assuming hPanel honors a pin.
The preferred local runtime remains `.nvmrc`; `engines` also accepts the observed
Hostinger Node 24.6.0 baseline. CI tests both. This compatibility floor is not a
recommendation to downgrade local Node or a claim that an older patch has all
current security fixes. Request current Node 24 patches from the hosting provider.

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

`package-lock.json` is the only dependency lockfile. The original npm snapshot
was restored with updated root engine metadata, preserving application versions.
`.npmrc` enforces exact saves, strict peers and runtime engines. Install
lifecycle scripts remain disabled; native optional packages remain enabled.
Review script requirements explicitly when adding dependencies. Strict peers
reject incompatible combinations, and running commands never silently reinstalls
dependencies. Restore them explicitly with `npm ci`.

The pnpm-specific release cooldown and its exceptions no longer apply. npm 11.5.1
does not provide that same policy. Review release dates and advisories in dependency
PRs, run `npm audit`, and do not force audit fixes. Exact versions and integrity
hashes improve repeatability; they do not establish that a dependency is safe.

CI uses SHA-pinned actions, read-only permissions, a two-runtime matrix,
the npm bundled with each Node version, and an npm download cache keyed by the lockfile.
The development lane reads `.nvmrc`; the hosting lane pins the observed Node 24.6.0.
Corepack is not invoked. The required `Quality checks`
gate fails if either runtime or the GLIBC compatibility job fails or is skipped/cancelled. CI never caches
`node_modules` or shares build output across operating systems. Obsolete runs are
cancelled and each run has a timeout. `check` runs lint, explicit type checking,
and one production build; it is the CI quality gate. `build` invokes only Next.js,
so Hostinger does not need to execute Biome's incompatible native binary. Next.js
type validation remains enabled. Production uses the supported Webpack build option;
development retains Turbopack. The JavaScript module `next.config.mjs` retains
JSDoc type checking without requiring SWC configuration transpilation.

The pinned `@next/swc-wasm-nodejs` package must match the exact Next.js version.
Review and update both together. It supplies the automatic fallback when native
SWC cannot load; Webpack supports this fallback, unlike Turbopack. A separate,
required Rocky Linux 8 container job checks GLIBC 2.28, asserts the WASM fallback,
then builds and starts the app using Node 24.6.0. Biome remains in the modern Linux
jobs, not this hosting compatibility lane. The container is digest-pinned and
installs its basic checkout prerequisites; review its digest during maintenance.
This checks the observed library constraint, not complete Hostinger environment
parity or actual deployment success. A production smoke test checks
HTTP responses, HTML landmarks, and 404 handling. A final diff check detects
changes to tracked sources. Dependabot monitors the npm ecosystem.

References: [npm clean installation](https://docs.npmjs.com/cli/v11/commands/npm-ci),
[npm configuration](https://docs.npmjs.com/cli/v11/using-npm/config).

Dependencies are pinned and reviewed through Dependabot PRs into `develop`.
Updates never merge automatically. Node type definitions stay on the runtime's
major version; reevaluate that constraint when intentionally upgrading Node.
