# Supported toolchain review — 2026-10-17

This bounded maintenance increment follows the clean-architecture release. It
changes public portfolio tooling only; assistant activation, API contracts,
hosting settings and other repositories remain outside scope.

## Selected versions

| Tool | Before | Selected | Reason |
| --- | --- | --- | --- |
| Development Node | 24.21.0 | 24.22.0 | Current patch on the supported Node 24 LTS line at review |
| Next / SWC WASM | 16.4.0 | 16.4.2 | Stable supported-line patches, aligned compiler packages |
| Playwright | 1.63.0 | 1.64.1 | Stable browser tooling, package and official Noble image updated together |
| Node types | 24.19.1 | 24.19.2 | Runtime-major-aligned type definitions |
| PostCSS | 8.5.29 | 8.5.30 | Compatible source-map escaping fix |
| React / DOM | 19.3.0 | 19.3.1 | Separately verified stable transport-protocol patch at the finite review cut |
| TypeScript | 7.0.2 | 7.0.2 | Retain supported tested compiler |
| Biome | 2.5.15 | 2.5.15 | Retain supported tested formatter |

The initial toolchain increment retained React 19.3.0 and kept runtime-library
updates separate. The finite 17:35 UTC follow-up reviewed React/DOM 19.3.1, Radix
Dialog 1.3.1, Radix Slot 1.5.0 and Lucide 1.57.0 through Dependabot PR #144.
That PR passed every required gate before merging; it changes only the application
manifest and lockfile. This is a dated tested selection, not an open-ended promise
to chase every later release.
The isolated contract generator retains its own compiler-compatible lockfile.
Babel Parser 7.29.9 stays dev-only and supports the older hosting runtime; the
architecture guard does not require every repository to use the same parser.

## Evidence and runtime boundaries

- [Node release index](https://nodejs.org/dist/index.json): version, release date,
  bundled npm and LTS status. Node 26 is not selected merely because it is newer.
- [Next support policy](https://nextjs.org/support-policy) and
  [Next 16 upgrade guidance](https://nextjs.org/docs/app/guides/upgrading/version-16).
- [Next 16.4.2 release](https://github.com/vercel/next.js/releases/tag/v16.4.2).
- npm registry metadata for exact selected package versions and engine ranges.
- [Playwright release notes](https://playwright.dev/docs/release-notes) and
  [Docker guidance](https://playwright.dev/docs/docker): package/image matching.
- [Official image manifest](https://mcr.microsoft.com/v2/playwright/manifests/v1.64.1-noble):
  OCI index digest `sha256:7852dc5a7d72f5fe458a597d690f6c42fbc8e9e26ddfa95f8e6ef552558d9bbf`,
  including Linux amd64 and arm64. CI consumes the immutable index digest.
- [PostCSS release](https://github.com/postcss/postcss/releases/tag/8.5.30).

This site has no application Docker builder/runtime image. Its browser image and
Rocky Linux compatibility image are CI infrastructure; do not invent an application
image or change Hostinger deployment to match another repository.

Hostinger's observed Node 24.6.0/npm 11.5.1 and GLIBC 2.28 remain a separately
verified compatibility floor, not a security recommendation to keep old patches.
The development `.nvmrc` changes without altering machine-wide defaults or hPanel.
Next/SWC WASM must still build and serve on that floor. npm's packageManager field
continues to document the observed hosting baseline; npm 11.x is supported locally.

## Acceptance

Require clean installs, complete dependency trees, both dependency audits, frozen
contract generation without drift, architecture negative fixtures, the full check,
rendered routes and all existing native browser groups. Preserve timeouts, retries,
conditional skips and strict flaky-test failure. Verify the separate Hostinger lane
and default-disabled assistant before release. CI status belongs to exact commits;
actual deployment evidence is reported separately.


## Additional owner requirements

The same bounded increment adds a checksum-pinned Gitleaks 8.30.1 gate, synthetic
regression probes and separate build-artifact scan. See
[redacted secret checks](../development.md#redacted-secret-checks) for coverage,
known immutable historical provenance exceptions and limits. The scanner found
24 historical public Git/lockfile hash fingerprints plus two current provenance references,
not confirmed credentials. Exact historical fingerprints and current value/path
pairs avoid excluding their rule or directory from future detection.
No provider was contacted and no credential value/report was published.

README, contribution/security policies and the PR template now distinguish
maintainer ownership, feedback, authorized development, CI acceptance and observed
publication. GitHub private reporting was observed disabled; the existing private
email channel is documented without changing settings, license or visibility.
The repository description now matches the reviewed three-role positioning.


The [React 19.3.1 release](https://github.com/react/react/releases/tag/v19.3.1)
documents a Server Components transport-protocol improvement; React DOM requires
the matching React line. Review of the
[Radix release notes](https://www.radix-ui.com/primitives/docs/overview/releases)
and the precise bot diff preserves owned component adaptations and accessibility
checks. No new framework, provider SDK or generated visual asset was introduced.
The initial PR #142/#143 receipts remain historical evidence; the follow-up's
head is `433234bfc9072f5f8932d0d0641d50e86e2ab446` in PR #144.
