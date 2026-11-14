# ADR: release automation without release-please

Date: 2026-11-14
Status: accepted (PF-M1-6, owner decision OD-78)

## Context

The master plan first proposed release-please on `develop`. It needs an owner-provided GitHub App
token (or the Actions setting that lets workflows open pull requests) plus a sandbox validation.
OD-78 replaces it for every repository with the pattern recorded in
[engineering-standards ADR 0003](https://github.com/gonzalomartinperez/engineering-standards/blob/main/docs/decisions/0003-release-automation-without-release-please.md):
no App and no PAT.

## Decision

- `VERSION` holds the release version (`X.Y.Z`); `package.json` `version` must equal it. The unit
  test `tests/unit/release.test.ts` enforces that and a non-empty `CHANGELOG.md` section for it.
- `CHANGELOG.md` follows Keep a Changelog. Notable changes accumulate under `## [Unreleased]`.
  The 1.0.0 section was seeded once from `docs/release-history.md`.
- A release is a normal version-bump PR on `develop`: it updates `VERSION`, `package.json` and the
  lock metadata, and moves the Unreleased entries under `## [X.Y.Z] - YYYY-MM-DD`.
- `.github/workflows/release.yml` runs on push to `main` only. It reads `VERSION`, and when no
  release `vX.Y.Z` exists it creates the tag on the pushed commit and a GitHub Release whose notes
  are the CHANGELOG section. It fails when `VERSION` has no section and no release. It uses
  `permissions: {}` with `contents: write` on its single job, SHA-pinned actions, harden-runner,
  no credential persistence and a timeout.
- Releases are immutable and `v*` tags are protected by the engineering-standards rulesets. Immutable
  releases is a repository setting that the coordinator verifies; it is not changed from code.
- release-please stays optional: it may be adopted later if the owner provides a GitHub App.

## Consequences

- `main` changes only at the M7 release (OD-11), so the workflow is inert until then. The first
  tag created by the workflow will come from the version-bump PR that precedes the M7 release.
- The `v1.0.0` label transition described in [release history](../release-history.md) remains
  governed by that document; this workflow skips a release that already exists and fails when the tag exists on a different commit, so the M7 release must bump `VERSION` past `1.0.0` (the `v1.0.0` tag already exists on `954b78d`).
- `docs/release-history.md` stays as the historical record of tag anchors; new entries go to
  `CHANGELOG.md`.
