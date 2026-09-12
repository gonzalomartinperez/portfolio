# Deployment · Hostinger

[Back to overview](../README.md)

In a Hostinger plan that supports Node.js web apps, import this GitHub repository
and review the detected settings:

| Setting | Value |
| --- | --- |
| Branch | `main` |
| Framework | Next.js |
| Root directory | Repository root (`./`) |
| Node.js | 24.x LTS |
| Package manager | npm (bundled with Node; tested baseline 11.5.1) |
| Install command, if requested | `npm ci` |
| Build command | `npm run build` |
| Build output, if requested | `.next` |
| Start command, if requested | `npm run start` |

Keep the normal Next.js server deployment; this project does not use static export
or a custom server. Next.js reads the hosting platform's `PORT` environment variable
(3000 locally). Connect this repository and enable automatic deployment from `main`.

GitHub Actions provides CI; Hostinger's native integration provides CD. They can
start independently on a push. Hostinger runs `npm run build` (Next.js compilation)
without invoking Biome. GitHub Actions runs `npm run check` (lint, explicit type
checking, and build), followed by the production smoke test. Protected PRs require
these checks before code reaches `main`; do not bypass that release gate. Keep
development dependencies installed during compilation because Next.js needs TypeScript.
If hPanel asks for a package script name rather than a shell command, choose `build`.
No API token or VPS deployment action is needed for this managed-hosting workflow.

### Native library compatibility

The hosting log reported missing `GLIBC_2.29` and `GLIBC_2.30` when starting Biome.
Linting now runs in the development/CI environment, not in the hosting build.
Biome remains a required quality tool; no lint errors or TypeScript errors are
ignored. Next.js retains its built-in type validation during `next build`.

A subsequent hosting build also rejected native SWC with `GLIBC_2.29` missing,
then failed while loading `next.config.ts`. Do not create the random generated
`*.next.config` file mentioned in that error. The repository uses:

- `next.config.mjs`: a native Node.js module, with JSDoc and TypeScript checking,
  so loading configuration does not require SWC to transpile TypeScript.
- `next build --webpack`: the documented production alternative to Turbopack,
  whose native bindings cannot use the WebAssembly fallback.
- An exact `@next/swc-wasm-nodejs` development dependency matching Next.js,
  available for automatic fallback without an unpinned build-time download.

Keep selecting **npm run build** in hPanel; the Webpack flag lives in the script.
Do not omit development or optional dependencies during installation. Do not enable
experimental flags, disable type checking, or install system libraries through npm.
Development still uses Turbopack on supported local machines.

The required CI gate also builds and starts the application in Rocky Linux 8 with
GLIBC 2.28 and Node 24.6.0. It asserts that SWC actually selects WebAssembly.
This reproduces the native-library constraint, not Hostinger's full infrastructure,
resource limits, configuration rewriting, or routing. A successful hPanel build
and live preview remain the final deployment confirmation.

References: [Next.js Webpack opt-out](https://nextjs.org/docs/app/guides/upgrading/version-16#opting-out-of-turbopack)
and [upstream GLIBC compatibility report](https://github.com/vercel/next.js/issues/96960).

Check the installation log for npm and Node versions satisfying `engines`.
Node 24.6.0 ships npm 11.5.1, the compatibility baseline tested in CI; the actual
hosting npm version must still be confirmed from its log. Do not install npm
through Corepack or add a package-manager bootstrap command.

### Switching the existing hPanel application to npm

The earlier deployment selected pnpm through Corepack and failed before installing
the application. Repository changes alone do not reset saved hPanel settings.
Open Settings & Redeploy, explicitly select **npm**, change the build command to
**npm run build**, retain `.next` and `main`, and save and redeploy the latest code.
The pnpm lockfile and workspace configuration are removed from this repository.
If the new log still invokes pnpm or Corepack, verify the saved package-manager
selection and source commit, then ask Hostinger support to reset the builder's
stored selection. Clearing a CDN cache does not fix package installation.

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

See the [development guide](development.md) for branch conventions and the
[technology guide](technology.md) for compiler compatibility and native packages.
