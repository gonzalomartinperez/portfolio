# Portfolio

A minimal personal portfolio built with Next.js, TypeScript, and the App Router.
The initial page is a placeholder, ready to evolve into a complete portfolio.

Intended domain: **gonzalomartinperez.com**. Deployment and DNS are configured separately.

## Stack and support policy

- Node.js **24 LTS**; the local baseline is pinned in `.nvmrc`.
- Next.js **16 Active LTS** and React 19, using stable releases only.
- TypeScript **6.0.3** in strict mode, Biome for linting and formatting, and plain CSS.
- Exact direct dependency versions and a committed `package-lock.json`.

React, TypeScript, and Biome do not share Node.js's LTS labels. Their versions are
selected for compatibility, not described as LTS. Recheck support and security
updates regularly: pinning dependencies does not replace maintenance.

Prefer supported, compatible stable releases over automatically adopting every
new major. TypeScript 6 is an intentional compatibility baseline, not an LTS claim.
Major upgrades require a clean dependency installation and all project checks.

Sources: [Node.js releases](https://nodejs.org/en/about/previous-releases),
[Next.js support policy](https://nextjs.org/support-policy).

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
pushes and pull requests to `main`, with read-only permissions and actions pinned
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
