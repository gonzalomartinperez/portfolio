# Security policy

## Report privately

Send suspected vulnerabilities in this public portfolio to
[gonzalomartinperez2002@gmail.com](mailto:gonzalomartinperez2002@gmail.com), with
`Portfolio security report` in the subject. GitHub private vulnerability reporting
was confirmed disabled on 2026-10-17; this policy does not promise an enabled GitHub
reporting channel or a response deadline.

Include the affected URL or source revision, expected and observed behavior,
impact, and the smallest safe reproduction. Remove credentials, authorization
headers, session cookies, CSRF tokens, personal conversations and private documents.
Use synthetic markers instead of real secrets. If sensitive evidence is necessary,
first describe its nature and arrange an appropriate private transfer with the
maintainer; do not include it in the initial report.

Do not publish a vulnerability, token or private conversation in an issue, PR,
commit, screenshot, CI log or artifact. Do not probe other users' data, run load
tests against production, invoke paid providers or change credentials to prove a
finding. This policy does not authorize testing systems owned by other parties.

## Scope and maintained source

The current `main` branch is the maintained public website. Historical tags are
not separately supported release lines. The assistant client is implemented but
remains disabled in the public delivery; the API, private backoffice and VPS have
separate owners. Product analytics is also independently disabled by default; its
optional transport omits credentials and has no persistent visitor identity. These
technical choices do not establish anonymity or a privacy-law exemption. Report a
cross-boundary concern privately so it can be routed
without copying sensitive evidence across public repositories.

See the [architecture](docs/architecture.md),
[public-content contract](docs/public-content.md) and
[native assistant boundary](docs/native-assistant.md) for the intended separation.
There is no application database or model-provider key in this website. Values
exposed through client bundles, public environment variables, HTML or assets must
always be treated as public.

## Handling a suspected exposure

Stop distributing the affected material and report it privately. Deleting a file
or adding it to `.gitignore` does not remove a tracked copy, prior commit, cached
page or artifact. The responsible owner must assess exposure, contain distribution
and arrange revocation or rotation when appropriate. Do not paste the value into
scanner output or a public remediation PR; document file paths and redacted
findings instead.

Rotation, account changes, production response and history rewriting require the
appropriate owner's authority and a coordinated recovery plan. Ordinary code
changes follow protected PRs and required checks; use the
[deployment guide](docs/deployment.md) for release and revert procedures.

Dependency audits, automated checks and review reduce risk; they are not proof
that a deployment or historical repository contains no vulnerability or secret.
