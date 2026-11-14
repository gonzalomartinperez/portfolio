# Dependency updates

## Policy

Dependency updates are merged manually by the owner. Dependabot proposes exactly one PR per
week (Monday 09:00 America/Argentina/Buenos_Aires) joining npm (`/` and `/tools/api-contract`)
and GitHub Actions changes against `develop` through the `weekly` multi-ecosystem group. The
group sets the limit (one open PR), the `chore(deps)` commit prefix and the `dependencies`
label; cooldowns are 7/14/3 days on npm and 7 days on Actions. The Node type-major and the
generator's TypeScript-major exclusions are kept. The decision and the sandbox evidence are in
the [weekly group ADR](adr/dependabot-weekly-group.md).

The `dependencies` label is a routing signal, never a merge permission. No workflow approves,
arms auto-merge or merges a dependency PR. Frameworks, compilers, runtimes, native modules,
browser and image versions and Actions always need compatibility review. Every
`/tools/api-contract` change needs contract regeneration and review.

Security-update PRs are disabled in repository settings and alerts are on. A critical fix rides
the weekly PR (OD-22); an urgent one is a normal task-branch PR that bumps the single
dependency, never a second Dependabot PR.

## Automation

| Workflow | Purpose |
|---|---|
| `deps-weekly-guard.yml` | Monday 10:30 ART and on demand: keeps only the newest weekly group PR, records whether it is behind `develop` (the rebase comment stays off), and labels a red one `needs-fix` in the tracking issue (no mentions) |
| `vuln-daily.yml` | Daily osv scan: edits one pinned `vuln` tracking issue silently; only the Monday run posts the weekly summary (OD-75) |
| `drift.yml` | Fails when a byte-matched standard file or the Dependabot shape drifts from `standards.lock` |

All three call reusable workflows from `engineering-standards`, pinned by commit SHA with the
release tag as a comment. Dependabot bumps those pins with the weekly group. Dependabot settings
and scheduled runs take effect from the default branch (`main`), so they go live with the M7
release; until then run the workflows manually on `develop` (see the ADR).

## Local assessment

`tools/dependency-policy.mjs` is a read-only classifier that never installs or executes PR code;
no workflow runs it, so an operator runs `GITHUB_TOKEN=<read token> node tools/dependency-policy.mjs`
locally when wanted.
It flags only exact stable patch bumps of the development-only `@types/react` and
`@types/react-dom` as a narrow review candidate; everything else, including any added, removed
or transitive change, stays manual. A candidate still needs the same review and exact-head CI.
Identity checks require the official Dependabot bot, a same-repository `develop` PR from a
native or weekly group branch, one verified bot commit and exactly the two root manifests.

`node --test tests/unit/dependency-policy.test.mjs` (part of `npm run check`) covers the
classifier, identity spoofing, transport mutation rejection and the shape of
`.github/dependabot.yml`.

References: [Dependabot options](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference)
and [secure Actions use](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions).
