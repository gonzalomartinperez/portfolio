# Named shared capabilities and complete module placement

Status: in-progress

## Outcome and scope

Keep the portfolio's routes, content, motion, documents and disabled public assistant
unchanged while making module ownership explicit and enforceable. This is the public
site's slice of the coordinated seven-repository architecture plan accepted on
2026-10-18. Other repositories retain their own implementation and release ownership.
Career authoring and the GitHub profile are outside this physical migration.

## Acceptance criteria

- **AC-1:** Shared primitives and reused presentation live under named `src/shared`
  capabilities. Existing CSS, media bytes, public URLs and accessible semantics remain
  unchanged; there is one motion store and no compatibility barrel or duplicate copy.
- **AC-2:** Gallery, catalogue and carousel UI and assistant display copy live in their
  feature's `presentation`. All source, generator, script, test, documentation and
  skill consumers resolve the new paths. Existing explicit feature entries remain
  narrow; server composition stays server-only.
- **AC-3:** Every supported owned code module, including importless and alternative
  suffix modules, is classified. Unknown roots, features, shared capabilities,
  feature layers and undeclared root facades fail the architecture check. Exact
  temporary exceptions have owners, reasons, consumers and removal conditions.
- **AC-4:** Domain and application code reject ambient clock reads, while injected
  clocks, deterministic date conversion and legitimate outer timing pass. Existing
  import, cycle, type-only and transitive client/server checks remain enforced.
- **AC-5:** Existing routes in both languages and themes, document downloads, native
  scrolling, diagrams, lazy scenes, carousel and assistant fixture interactions
  retain their behavior. Public assistant and analytics activation remain separate
  decisions. No dependency, runtime pin, timeout or retry changes. Retain existing transfer gates, with the explicitly accepted portfolio CSS limit adjustment from 24 to 25 KiB described below.
- **AC-6:** The task passes the existing protected checks and independent review before
  integration. A subsequent protected release and post-main checks precede the final
  version-tag transition. Synthetic client tests do not substitute for the separately
  pending real API-to-database-to-authorized-backoffice analytics acceptance.

## Design and decisions

Framework adapters remain in `src/app`, page composition in `src/views` and persistent
presentation in `src/shell`. Features keep only layers they actually need. Shared
capabilities are `ui`, `styles`, `motion`, `identity`, `technology`, `navigation`,
`contact` and `editorial`; none may depend on feature or page composition. Generic
primitives and motion/styles remain independent of reviewed product content. Shared
editorial and identity renderers may consume their existing neutral content types.

Keep the current 39 content files, nine imported contract files and three source
images as exact transitional exceptions. Moving their authoring, generation and
image consumers is a separate cutover; blanket root exemptions would conceal new
unowned modules. Public contract bytes and provenance must remain unchanged. The
public wire contract is not private configuration merely because it is generated.

The existing Babel parser is sufficient. Paired failing and passing fixtures precede
the source move. Scope-aware clock checks must not confuse an injected `performance`
parameter with an ambient global. The guard remains a bounded source policy, not a
sandbox or proof of arbitrary program purity. This site's existing CI transfer
profile intentionally rejects Server Actions; it does not impose that restriction
on the separately owned backoffice.

## Delivery plan

1. Freeze the analytics task separately and map consumers from its reviewed candidate.
   This task started from protected `develop`. While service acceptance was pending,
   it fast-forwarded locally to the already reviewed analytics candidate `193e1e6`
   and restored the migration through a three-way application of its saved changes.
   This allows combined source verification without integrating the draft analytics
   PR prematurely. After analytics acceptance, adopt the protected `develop` merge
   before opening this task's PR; neither protected branch is rewritten. Analytics PR #163 was accepted through protected merge `190d276` on 2026-10-18, and this task adopted that merge with no source conflicts.
2. Record baseline failing placement/effect fixtures and positive controls. Implement
   placement and dependency rules in a separate owned worktree, then integrate them.
3. Move shared and feature presentation files together with all active consumers.
   Preserve historical secret-scanner fingerprints and evidence source identities.
4. Restore locked dependencies in this worktree during a coordinated resource window.
   Run architecture and repository checks, the existing production quality pipeline,
   affected browser checks, artifact/source scans and independent exact-source review.
5. Use protected task and release PRs. Reconcile final documentation, evidence and tag
   only after all required checks and the separately owned service handoff complete.

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
