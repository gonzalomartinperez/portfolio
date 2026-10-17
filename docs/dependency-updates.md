# Manual dependency updates

## Policy

Dependency updates remain manual by owner decision. Dependabot proposes weekly npm
and GitHub Actions changes against `develop`, rebasing its own proposals when
needed. The `dependencies:manual` label is a deny-only routing signal, never a merge
permission. No workflow creates approvals, changes labels or repository settings,
creates check runs, arms native auto-merge, or merges PRs. There is no PAT or admin
bypass. Existing strict checks and human review remain authoritative.

The root npm configuration separates patch proposals for `@types/react` and
`@types/react-dom` from the wider minor/patch review group. Major updates remain
separate. The Node type-major exclusion is retained. The additional
`/tooling/api-contract` entry covers its separate manifest and frozen lock; all of
its proposals require manual regeneration and contract review. Frameworks, auth,
databases, compilers, runtimes, native modules, browser/image versions and Actions
always need compatibility review. Group names and labels are not trusted evidence.

GitHub security updates can target the default branch independently of routine
version-update settings. They still follow the reviewed `develop` route and normal
release promotion; never bypass protections to merge them directly into `main`.
Dependabot branches and open proposals may remain while awaiting review. A tidy
branch list is not a reason to delete unmerged work.

## Read-only assessment

The metadata workflow checks out only trusted default-branch policy scripts with
credentials disabled, never a PR checkout. It installs no dependencies and executes
no PR scripts. Permissions are limited to contents and pull-requests **read only**. The trusted
`.nvmrc` selects the same Node.js baseline as ordinary CI; no package installation
or cache is needed.
Its optional GitHub GraphQL POST is a fixed read query; mutations are not exposed
by the transport. Untrusted titles, bodies, names and payloads are not interpolated
into shell commands. API errors produce fixed messages without response bodies.

The classifier identifies only a narrow review candidate: exact stable patch
changes to existing development-only `@types/react` and `@types/react-dom`, alone or
together, with unchanged major/minor and dependency metadata. Added/removed direct
or transitive dependencies, install scripts, changes elsewhere in the lock, ranges,
prereleases, 0.x and other packages stay in the manual category. A candidate still
requires the same human review and exact-head CI; declaration patches can break
compilation. No classifier result is an approval or CI-success claim.

Identity checks require the official Dependabot bot, same repository/base/head,
`develop`, one complete verified bot commit, and precisely two modified root files.
Manifests are read by base/head SHA as JSON data. Ordinary-file tree modes, complete
file/commit counts, byte length and Git blob hashes are verified. Scope is checked
again against current head/base metadata; changes, truncation or ambiguity fall
back to manual review. The tool does not trust a version label or PR title.

A new workflow cannot evaluate with unpublished code: the trusted scripts must first
reach the default branch through the normal protected release. Missing trusted files
fail closed. The assessment job is advisory and does not replace existing gates.

## Operator inspection

After publication, run **Dependency review policy** with mode `inspect` in GitHub
Actions to check effective workflow-token visibility of repository/protection metadata.
It reports manual mode, whether the native auto-merge setting is enabled, and the
actual approval count only when strict/admin-enforced protections and the known
GitHub Actions check identities are confirmed. An inaccessible or partial response
reports blocked; never add a PAT or broaden permissions to hide that condition.
This read-only probe does not activate anything or require an existing Dependabot PR.

For a specific proposal, choose mode `review` and supply its PR number. Review the
manifest/lock diff, release notes, runtime/hosting compatibility and relevant tests.
Then inspect required CI and reviews at that exact current head. Merge normally into
`develop`; only a reviewed `develop` release promotes to `main`.

If native auto-merge is unexpectedly enabled or a proposal already has automatic
state, report it to the coordinator for explicit reconciliation. This read-only
workflow neither enables nor revokes it. Existing settings are not silently changed.
Manual processing remains the default until a separate owner decision changes it.

## Verification

`node --test scripts/dependency-policy.test.mjs` checks single/grouped patches,
version classes, new/removed/unknown packages, framework/browser exclusions,
transitive/script/registry/integrity changes, lock inconsistency, spoofed identity,
forks, extra or unverified commits, wrong files, unsafe modes/hashes, changing
head/base snapshots, denied metadata and mutation rejection by the transport.
The coordinator integrates these fixtures into ordinary source verification.
No app build, dependency installation, browser download or live mutation is needed.

The configured manual label must exist in the repository for Dependabot to apply it;
if absent, the coordinator may create it explicitly. Label absence never authorizes
merge and does not change the source classifier's behavior.

References: [Dependabot options](https://docs.github.com/en/code-security/reference/supply-chain-security/dependabot-options-reference)
and [secure Actions use](https://docs.github.com/en/actions/security-for-github-actions/security-guides/security-hardening-for-github-actions).

The [implementation specification](specs/manual-dependency-review.md) records scope
and local verification; the delivery PR records protected CI and publication.
