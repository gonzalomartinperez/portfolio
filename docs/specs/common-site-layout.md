# Shared physical site architecture

Status: local and native acceptance recorded; final protected promotion pending

## Outcome and scope

Complete the paired-site physical layout while preserving public content, all
routes, responsive presentation, motion, documents and independently disabled
assistant/analytics defaults. This extends the earlier named-capability migration;
that historical checkpoint is retained below with its original limits. Other
repositories retain their own source, runtime and release ownership.

## Acceptance criteria

- **AC-1:** Execute the mapped 119 moves exactly once. Every old path has one new
  destination; all active imports, generators, commands, tests, CI, skills and links
  resolve. No compatibility duplicates, empty layers or unrelated source changes.
- **AC-2:** Use root `config`, `content`, `contracts`, `media` and `tools`, with
  `src/app`, `views`, `shell`, named `features` and `shared` capabilities. Tests
  belong to actual `unit`, `browser`, `helpers`, `integration` and `rollout` roles.
  Enforce the [placement decision](../adr/site-architecture-parity.md).
- **AC-3:** Inventory every production module and exact frozen input. Reject
  unregistered and legacy roots, forbidden layer dependencies, cycles and
  transitive client/server leaks through relative, dynamic, re-export and type
  imports. Alias support must match TypeScript, including bare `@content`.
  Preserve clock/effect checks and paired failing/passing fixtures.
- **AC-4:** Preserve all imported contract/provenance bytes, public JSON, image
  source bytes, PDFs, dependency versions/locks, protected contexts, test cases,
  budgets, retries and deadlines. Historical `commit:path` references stay historical.
- **AC-5:** Run source checks, production build and browser acceptance for the new
  candidate. Compare browser discovery by config/project/full title/mapped file,
  not an opaque ID that can change with test-helper relocation. Retain original
  failures and describe unresolved evidence accurately.
- **AC-6:** Verify native browser delivery through the disposable real API, fresh
  PostgreSQL and authorized backoffice, using the
  [separate real-flow procedure](../verification/analytics-real-flow.md). Join the
  browser receipt to API-owned fixed read-only counts. No provider calls, production
  credentials, deployment or feature activation.
- **AC-7:** Independent exact-source review and protected task/develop/release/main
  checks precede the final annotated `v1.0.0` transition and delivery closeout.

## Current implementation and evidence

The external consumer map records all 119 original paths, destinations and original
SHA-256 hashes against `b06c81e302f007fa1f353ad306f4a5ea3331b534`.
33 content files, four config files, nine contract files and three identity inputs
are registered explicitly. Two former content modules belong to the solar feature:
its pure texture contract and server-only texture-version adapter. The new entry
exposes that adapter only to server composition.

The canonical skills remain `specify-feature`, `implement-feature` and
`prepare-delivery`, with real task-specific additions and relative Claude adapters.
No site Docker runtime is invented: Hostinger managed Node remains the actual
portfolio host, with its existing CI compatibility container. Google engineering
review practices and the Microsoft Engineering Playbook inform the local standards;
they do not override repository formatting, product ownership or runtime contracts.

At cutover source `12e68c662b855422411ffdfd1d5334f6b4b0e086`, independent review
verified the 119-move bijection and unchanged frozen inputs. Four representative
negative fixtures failed against the old guard; all 38 current architecture
fixtures and the real-source audit passed. The full production check generated
27 pages and passed all 12 budgets. Secret enforcement passed 15 fixtures, 709
tracked files and fetched history. Browser discovery remained exactly 498 cases
by project, mapped file and full title. Normalized comparison of 167 application
modules found only intended import/path changes and the explicit solar server
facade; it is not a general proof about arbitrary import side effects.

Protected task CI run 39163226470 passed all 15 jobs, including the eight browser
groups, hosting compatibility and aggregate. The additional branch-policy and
dependency reviews also passed. These results belong to the named cutover source;
new verification-tool/configuration/documentation changes require their own checks.

The second disposable native run passed without retry and retained a closed
18-event browser ledger. Independent API-owned SQL matched four semantic and 14
interaction events, three page views, and zero country attribution, conversations,
messages or provider-spend rows. Authenticated backoffice assertions covered the
reviewed filters, grid and presentation. See the [executed native acceptance](../verification/analytics-real-flow.md#executed-acceptance-on-2026-10-18)
for exact source revisions, the preserved first-run evidence gap and teardown.

The external API RAG reader must accept both legacy `src/content/{en,es}` and new
`content/{en,es}` projection paths before public main promotion. This compatibility
handoff, the final verification-tool checks, protected task/develop/release/main
checks and the final annotated tag remain delivery gates. No earlier release or
fixture run substitutes for those gates.

## Historical named-capability checkpoint

The following record predates the physical-root cutover. Its pending items describe
that checkpoint, not current acceptance, and its native-service receipt belongs to
the older explicitly named source revisions.

## Accepted transfer-budget adjustment

The first complete production check built all 27 pages and passed types, lint and
unit checks, then failed the existing 24 KiB CSS gate at 24.5 KiB. Independent
artifact review found identical public CSS source volume (118,910 uncompressed
bytes) and unchanged module-family counts. Next redistributed those styles across
four rather than three public CSS chunks, reducing aggregate gzip efficiency;
the deferred assistant stylesheet remained byte-identical. The original failure
is retained in the external verification log.

On 2026-10-18 the coordinator relayed the owner's explicit acceptance of this
small transfer difference. The portfolio CSS ceiling becomes 25 KiB; all other
budgets remain unchanged. No rendering styles, bundler settings, experimental
flags or dependency code are changed to manipulate chunk grouping. The same
build is rechecked rather than rebuilt solely for this test-threshold change.

## Verification and handoff

Planning inventory: 34 moves, 15 explicit feature entries and exact temporary
exceptions mapped against analytics candidate `193e1e6`. Eight representative
importless placement/ambient-clock gaps were reproduced by a read-only audit;
that baseline finding is not a passing candidate check.

| Criterion | Current evidence and limits |
| --- | --- |
| AC-1 / AC-2 | Read-only peer normalized imports and compared all 168 source ASTs against reviewed analytics candidate `193e1e6`: equivalent after the 34 intended moves and import normalization, with no unresolved owned imports. Analytics runtime, contracts and privacy module bytes remain identical; region attributes and geometry sentinels are preserved. All nine moved CSS files are byte-identical. Media, public artwork, contracts and dependency files are unchanged. |
| AC-2 | Eleven repository-link, metadata and policy tests passed. Thirty focused motion-store, catalogue, technology-model and architecture-domain tests passed with this worktree's own locked dependencies and Node 24.22.0. Formatting checked 53 changed code/config files. These are source checks, not browser acceptance. |
| AC-3 / AC-4 | Baseline rejecting fixtures failed against the old guard as expected. Independent review found two additional default-clock/resource-placement gaps; regression fixtures failed before their repair and were preserved. All 28 integrated architecture fixtures and the full real-source audit now pass with this worktree's own dependencies. The independent re-review verified both fixes and their positive controls with no remaining concrete blocker. |
| AC-5 / AC-6 | Independent review of the integrated relocation and guard passed. The enabled production build generated all 27 pages and passed strict types, contract/content checks and lint (323 files). The initial budget failure and accepted same-build recheck are recorded above; all 12 budget checks now pass. Affected browser checks and this task's protected integration remain pending. The separate native analytics API → PostgreSQL → authorized-backoffice demonstration passed against public client `193e1e6`, API `596c5f3` and backoffice `300b1e2`; this does not establish production deployment or trusted-ingress readiness. |

The combined analytics/migration source passes all 39 analytics unit tests and the
28 architecture fixtures plus the source audit, 11 dependency-policy checks, 63
repository tests, 34 assistant unit tests and 35 content checks. The production
check also verified the public contract, identity and generated documents. The
original full check exited at its CSS budget, not at the build; the accepted limit
was rechecked against that unchanged build rather than repeating it.

All 15 secret-scanner enforcement fixtures passed. A separate current/history scan
then identified two reviewed public-provenance references duplicated in this task's
own temporary Git stash. Current tracked files had no findings. The restored stash
was archived in a verified, recoverable external bundle and patch before removing
only its transient ref; no scanner exceptions changed. Revalidation passed for
694 tracked files and all fetched history, plus 393 normalized build files. The
build's temporary transfer normalization was restored before browser use.

Local heavy work remains serialized with the other service owners. All 22
server-rendered production checks passed. The initial selected browser run remains
in progress at this checkpoint, with five preserved 45-second timeouts in the
Spanish home accessibility check and English/Spanish carousel checks. Independent
trace review found successful CSS delivery and exhausted aggregate test deadlines;
it did not establish the cause of slow operations or classify the failures as
flakes. No assertion, deadline or retry setting was changed. Remaining browser
coverage, isolated diagnosis, protected task/release integration and final tag
acceptance are still pending; the draft task PR retains those gates explicitly.
