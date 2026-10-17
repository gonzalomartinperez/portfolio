# Contributing

Developed and maintained exclusively by Gonzalo Martín Pérez, this repository is
a public professional portfolio. Suggestions, bug reports and constructive feedback
are welcome through the existing [contact channels](https://gonzalomartinperez.com/contact).
Priorities, implementation, review and releases remain the maintainer's responsibility;
this document does not promise acceptance of external pull requests or a response
deadline. It records the workflow used for authorized maintenance and agent collaboration.

Changes should make the product experience, reviewed professional evidence or
engineering easier to understand and maintain. Public source visibility does not
grant a reuse license; see [rights](README.md#rights).

## Start with a reproducible checkout

Read [AGENTS.md](AGENTS.md), the [development workflow](docs/development.md) and
[engineering standards](docs/engineering-standards.md). Use the exact Node.js version
in `.nvmrc`, npm within `package.json`'s supported range, and the committed lockfile:

```sh
nvm install
nvm use
npm ci
npm run dev
```

The default site runs at `http://localhost:3000` without credentials, a database or
a model provider. Keep the assistant and analytics disabled for normal work. Optional integration
configuration and contract ownership are explained in the
[native assistant guide](docs/native-assistant.md); do not add provider keys to this
frontend. Local `.env.local` is ignored, but ignoring a file does not remove it if
it has already been tracked.

## Make a focused change

1. Fetch the remote and create a task branch from `origin/develop` using
   `type/kebab-case-description`. Supported types and the protected integration
   workflow are defined in [AGENTS.md](AGENTS.md#branch-workflow).
2. State the problem, intended behavior and observable acceptance criteria. Use a
   specification for substantial changes; a clear issue or task is enough for a
   small fix. Preserve approved claims, metrics and employer materials.
3. Follow the [source module contract](docs/architecture.md#source-module-contract)
   and [code-quality standard](docs/code-quality.md). Keep domain logic independent
   from rendering and infrastructure; default to Server Components and use narrow
   client boundaries. Avoid speculative frameworks or layers.
4. Keep code, documentation and commit messages in English. Apply the
   [editorial guide](docs/editorial-guidelines.md) to US English and neutral Spanish
   interface copy. Update both locales and relevant documentation together.

Coordinate concurrent work before editing shared files. Give writing agents
registered worktrees and disjoint ownership; the coordinator owns contracts,
lockfiles and integration. This repository owns the public website and assistant
client, not the separately maintained assistant API, backoffice, career sources or
VPS operations. A cross-repository change requires a handoff to its owner.

## Verify and review

For an application change, run:

```sh
npm run check
git diff --check
```

`check` includes architecture fixtures and source analysis, repository/content
invariants, assistant contract checks, lint, a type-checked production build and
budgets, including the default-off analytics policy and transport checks. Enabled
full-browser QA requires the [synthetic analytics configuration](docs/development.md#isolated-analytics-verification),
not a live API or provider key. Select production, browser and visual checks from the
[task-specific QA matrix](docs/development.md#task-specific-qa). Install the matching
Playwright browsers with
`PLAYWRIGHT_SKIP_BROWSER_GC=1 npx playwright install --with-deps chromium firefox webkit`
when full browser verification is needed. Use the documented owned-port settings for concurrent runs.

For documentation-only changes, repository/link checks and diff review can be
reported without claiming that application or hosting QA was repeated. Do not add
tests that merely restate a low-impact edit. The protected CI gates still apply to
integration; local checks do not replace them.

Review correctness, failure handling, testability, security and accessibility.
Distinguish blocking defects with reproducible evidence from suggestions. Follow
local formatter rules rather than adding manual formatting conventions. Review
staged changes for secrets, private documents, generated output and unrelated work.
Use synthetic examples in fixtures and redact sensitive diagnostics. Run the
[redacted secret checks](docs/development.md#redacted-secret-checks) for tracked
files/history and, after building, uploaded build artifacts; a gitignored tracked file
is still in scope.

## Submit and integrate

Use Conventional Commits in English and open task PRs against `develop`. Describe
the final problem and behavior, changed boundaries, verification and remaining
limits in the [PR template](.github/pull_request_template.md). Review the exact
source revision whose checks pass; preserve concurrent work and fix conflicts on
a task branch.

Only this repository's `develop` may open a release PR to `main`. Use merge commits,
required checks and normal review; never force-push protected branches or use an
administrative bypass. Keep `main` and `develop`; remove task branches only after
verified integration and a clean worktree.

A merged PR and green CI do not prove deployment. Follow the
[deployment guide](docs/deployment.md) for observed release evidence and a focused
fix or revert PR if recovery is needed. Assistant activation, hosting, DNS,
credentials, paid services and production operations require explicit authority;
contributing instructions do not grant it.

For a suspected vulnerability or exposure, follow [SECURITY.md](SECURITY.md)
rather than opening a public issue with sensitive material.
