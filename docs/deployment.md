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

See the [development guide](development.md) for branch conventions and the
[technology guide](technology.md) for compiler compatibility and native packages.
