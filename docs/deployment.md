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
| Package manager | pnpm (10.34.5, pinned in `package.json`) |
| Install command, if requested | `pnpm install --frozen-lockfile` |
| Build command | `pnpm run build` |
| Build output, if requested | `.next` |
| Start command, if requested | `pnpm run start` |

Keep the normal Next.js server deployment; this project does not use static export
or a custom server. Next.js reads the hosting platform's `PORT` environment variable
(3000 locally). Connect this repository and enable automatic deployment from `main`.

GitHub Actions provides CI; Hostinger's native integration provides CD. They can
start independently on a push. The standard `pnpm run build` command runs lint,
type checks, and then the production compilation in both environments. Install
development dependencies during the build because these checks require them.
If hPanel asks for a package script name rather than a shell command, choose `build`.
No API token or VPS deployment action is needed for this managed-hosting workflow.

Check the installation log for the exact pnpm version in `package.json` and a
successful locked install. Hostinger supporting pnpm does not guarantee its
bootstrap version honors that field. If it reports an incompatible lockfile,
configure the pinned version with Hostinger support; do not delete or regenerate
the lockfile on the server. Confirm the actual Node patch satisfies `engines` too.

### Corepack compatibility regression

The deployment log on 2026-09-12 reported Node 24.6.0 and a missing
`pnpm/12.4.1/bin/pnpm.cjs`. That failed before application installation: the
hosting Corepack expected pnpm's older JavaScript entrypoint, not its v12 native
layout. The repository now pins pnpm 10.34.5 and its compatible single-document
lockfile. CI runs Corepack bootstrap, frozen installation, build, and production
smoke checks on both the local Node baseline and the observed hosting runtime.

After this fix reaches `main`, redeploy the latest commit with the settings above.
Verify the log selects pnpm 10.34.5. If it still mentions 12.4.1, confirm the source
commit and use hPanel's clean rebuild/cache reset if available, or contact support.
Do not change `build`, `.next`, or disable signature/quality checks to mask an
installation failure. A successful CI run still does not prove deployment success.

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
