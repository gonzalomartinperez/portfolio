# Portfolio

A minimal personal portfolio built with Next.js, TypeScript, and the App Router.
The initial page is a placeholder, ready to evolve into a complete portfolio.

Intended domain: **gonzalomartinperez.com**. Deployment and DNS are configured separately.

## Stack and support policy

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

## Local development

Use the Node.js version in `.nvmrc` and npm 11.

```sh
npm ci
npm run dev
```

Open `http://localhost:3000`. On Windows PowerShell, use `npm.cmd` if script execution policy blocks `npm`.

## Checks and production

```sh
npm run check
npm start
```

`check` runs Biome formatting and lint validation, TypeScript checks, and the production build. `npm start` serves
that build. There is no database, authentication, external font download, or required secret.

Use `npm run format` to format source files. GitHub Actions runs the same checks on
pushes and pull requests to `main` and `develop`, with read-only permissions and actions pinned
to commit hashes. Dependabot proposes dependency updates weekly; it never merges
them automatically. Review major updates against the support policy before merging.

There is no application logic requiring a unit-test framework yet. Add targeted
tests when introducing behavior; lint and build checks are not a replacement for them.

## Hostinger deployment

In a Hostinger plan that supports Node.js web apps, import this GitHub repository
and review the detected settings:

| Setting | Value |
| --- | --- |
| Branch | `main` |
| Framework | Next.js |
| Root directory | Repository root (`./`) |
| Node.js | 24.x LTS |
| Install command, if requested | `npm ci` |
| Build command | `npm run check` |
| Build output, if requested | `.next` |
| Start command, if requested | `npm start` |

Keep the normal Next.js server deployment; this project does not use static export
or a custom server. Next.js reads the hosting platform's `PORT` environment variable
(3000 locally). Connect this repository and enable automatic deployment from `main`.

GitHub Actions provides CI; Hostinger's native integration provides CD. They can
start independently on a push, so Hostinger must use `npm run check`, not just
`npm run build`, to run lint, type checks, and the build before deployment. Install
development dependencies during the build because these checks require them.
If hPanel asks for a package script name rather than a shell command, choose `check`.
No API token or VPS deployment action is needed for this managed-hosting workflow.

The repository contains CI configuration, but hPanel connection, auto-deployment,
build settings, and the domain must be activated in your account. A green GitHub
check does not prove a successful Hostinger deployment: verify its deployment log
and preview URL. For later feature work, require the `Quality checks` status on PRs
before merging into `main`; this repository does not bypass those protections.
The required flow is task branch -> PR into `develop` -> release PR into `main`.
Direct pushes and merges outside PRs are prohibited on both long-lived branches.
Only same-repository `develop` may target `main`; see the development workflow
for the branch-policy check and protection settings.

See [Hostinger's deployment guide](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger/).
After the app works on its preview URL, connect the custom domain using the DNS
records provided by Hostinger. Keep domain management in Cloudflare; never guess
an IP address or commit account credentials. This repository does not configure DNS.

## Project structure

```text
src/app/
  layout.tsx   # HTML shell and page metadata
  page.tsx     # Portfolio homepage
  globals.css  # Global styles
```

## Contribution conventions

Read [the development workflow](docs/development.md) for spec-driven development,
clean-code conventions, verification, and the six reusable agent skills.
`AGENTS.md` is the shared contract; `CLAUDE.md` imports it. Canonical skills live
in `.agents/skills/`, with discovery adapters in `.claude/skills/`.
No private professional context is included in the agent setup.

- Keep code, documentation, and commit messages in English.
- Use Conventional Commits, for example `feat: add a projects section` or `fix: improve mobile spacing`.
- Keep changes small and run `npm run check` before pushing.
- Never commit secrets, private career documents, employer material, or generated builds.

## Rights

All rights reserved. No reuse license is granted at this time. Third-party packages
retain their own licenses. The repository is public; `"private": true` in
`package.json` only prevents accidental publication to the npm registry.
