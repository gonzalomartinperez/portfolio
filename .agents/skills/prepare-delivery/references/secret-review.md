# Redacted secret review for the public portfolio

Use for requested leakage audits, suspicious findings or final checks involving
public source or client artifacts. This is a public Next.js site; the assistant's
provider credentials belong to its separately owned backend. The portfolio has no
application Docker image to scan or rebuild as part of this procedure.

## Review and evidence

Use the repository's configured secret-scanning command and its pinned tool. Do
not invent a new scanner version, install a competing scanner or substitute a
search that prints token-shaped matches. If the scanner has not been configured,
report that verification gap and prepare the scoped plan; do not claim a clean scan.

Distinguish these surfaces in the result:

- Tracked/current candidate files, including the staged diff and public assets.
- Git history across the refs actually available to the scanner. Record shallow
  status, source commit and ref/range coverage; a shallow PR checkout or current
  tree scan does not prove complete historical coverage. Fetch more history only
  within the authorized repository and workflow.
- Generated frontend output and static downloads that may publish values absent
  from the tracked source. Respect server/client boundaries, serialized props,
  bundled code, source maps and `NEXT_PUBLIC_*` usage. A `.gitignore` entry does
  not prevent build-time interpolation into a browser artifact.

Require redaction for console, JSON/SARIF reports, uploaded artifacts and debugging
output. Record only the rule/category, repository-relative file, line or commit
identifier and disposition. Do not copy matched values, context excerpts,
authorization headers or URL query strings into issues, session messages or docs.
Do not open `.env`/`.env.local`, credential stores or provider accounts to verify a
match; do not dump environment variables or raw logs. Scanning selected Git objects
with redacted output is not permission to inspect or reproduce secret contents.
Never test a suspected key against a live or paid service.

A positive finding is not automatically a confirmed credential. Check its ownership
and context without recovering the value. Any allowlist entry must be narrow,
reviewed and explain why a specific fixture/public identifier is safe; do not
exclude whole source directories, history or generated assets to obtain green CI.
If a tool unexpectedly prints a value, stop that output path and report the
exposure without reproducing it in the handoff.

## Remediation plan and execution

Keep review, proposed remediation and execution distinct. Within an authorized
code fix, remove the source of future exposure and add the relevant regression
check. Deleting a value in the latest commit does not revoke it or erase history.
Describe remaining affected surfaces without copying the value.

Live key revocation/rotation, replacement creation, provider or deployment changes,
and Git history rewriting need authority for those specific actions. Existing
explicit authority remains valid; do not invent an additional approval ceremony.
A general portfolio review or CI maintenance task provides none of these powers.
Hand off backend-owned findings to its owner using sanitized metadata. Do not read
or change another repository's secrets to complete this site's checks.

After an authorized remediation, repeat the affected redacted scans and frontend
checks on the actual resulting source/build. Report fixed, unresolved and unverified
surfaces separately. Do not weaken checks or activate the disabled assistant merely
to validate secret handling, and do not claim that a negative scan certifies security.
