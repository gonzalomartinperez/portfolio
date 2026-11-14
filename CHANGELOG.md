# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). Releases are created by
`.github/workflows/release.yml` from `VERSION` and the matching section below; see
[the release automation ADR](docs/adr/release-automation.md).

## [Unreleased]

## [1.0.0] - 2026-10-18

### Changed

- The public-launch label is a single final `v1.0.0`, with application version `1.0.0` in the
  manifest and root lock metadata. On 2026-10-18 the owner requested one final `v1.0.0` tag across
  the repositories and removal of the other tags, superseding the earlier policy of preserving
  occupied tag names and publishing `v1.2.0`. Source commits and historical verification are not
  rewritten.
- Earlier labels `v1.0.0`, `v1.1.0` and `v1.2.0` are recorded as historical source anchors in
  [the release history](https://github.com/gonzalomartinperez/portfolio/blob/develop/docs/release-history.md).
- The `v1.0.0` tag already exists (tagged 2026-10-19 UTC), so the next release must bump `VERSION`.
