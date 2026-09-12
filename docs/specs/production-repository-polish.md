# Production repository polish

Status: done

## Outcome and scope

Reflect the confirmed live deployment, make repository maintenance less repetitive,
and preserve the working Hostinger build. No UI redesign, career-content import,
dependency upgrade, DNS change or branch-protection exception is included.

## Acceptance criteria

- AC-1: Public documentation identifies the live site, Hostinger runtime and
  Cloudflare domain role without implying a Cloudflare application deployment.
- AC-2: Required PR quality and hosting-compatibility jobs remain; `develop` pushes
  no longer duplicate the release-PR run. Main retains post-merge verification.
- AC-3: One full local/CI check validates repository invariants, lint and a single
  typed build. Standalone type checks remain available during development.
- AC-4: Skill guidance captures hosting diagnosis, coupled compiler versions and
  source-specific test reuse; adapters remain aligned with canonical skills.
- AC-5: Warning handling preserves supported configuration and complete error
  output. Record limitations when a quiet build cannot safely be achieved.

## Decisions

Keep two build environments because native and WASM execution cover different
constraints. Add four dependency-free Node test cases for maintained repository
invariants instead of another toolchain. Keep the installed Next.js version and
configuration unchanged: no stable warning-free route was verified on this host.

## Verification and handoff

Local `npm run check`, production smoke, all six skill validations, YAML parsing
and independent diff review passed. The existing live URL returned HTTP 200 with
Hostinger and Cloudflare headers; that does not establish deployment of this change.
All required jobs passed on implementation commit `7fde671` in
[CI run 34675997664](https://github.com/gonzalomartinperez/portfolio/actions/runs/34675997664),
including the four repository tests and the GLIBC 2.28 build and smoke test.
AC-1 through AC-5 are covered by the documented live check, workflow review,
repository tests, skill validation and inspected loader behavior. Expected fallback
warnings remain visible by design; removing them safely is an upstream/host follow-up.
Protected checks must also pass for this verification record before promotion.
