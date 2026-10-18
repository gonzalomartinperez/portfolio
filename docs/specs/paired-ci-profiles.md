# Paired validation profiles

Status: in-progress

## Outcome

Keep required PR validation complete while separating independent work and reusing one verified build. Add a separately named scheduled profile that freezes a permitted commit before testing it. Neither profile activates public features, deploys services, calls paid providers, or changes the hosting contract.

## Acceptance

- CI-01: Core has workflow, secret, source-quality, build, hosting, browser, performance and aggregate responsibilities with explicit dependencies. Every constituent must succeed; skipped/cancelled jobs fail the aggregate.
- CI-02: Preserve all discovered browser tests and six actual projects in eight duration-balanced groups, one worker each. No fixed test-count ceiling, weakened deadlines, added retries or baseline updates.
- CI-03: Build once for enabled synthetic QA. Consumers verify source, configuration, run, attempt, variant and an independently transmitted archive checksum before extraction. Secret scanning and CI-only ephemeral-key normalization remain mandatory.
- CI-04: Hosting independently proves the observed Node 24.6 / GLIBC 2.28 SWC WASM build and smoke behavior with both features disabled.
- CI-05: Nightly freezes an existing commit reachable from main or develop; every consumer uses that exact source. Its browser and visual selections form an exact disjoint union of discovery. Internal links/rendered checks and bundle budgets consume the same build. No automatic visual-baseline acceptance.
- CI-06: Preserve the existing full `Quality checks` required context during migration. Add `Required checks` only after its exact-head success; retire the old full-context bridge only after the new aggregate is enforced on both protected branches. No weaker intermediate protection.
- CI-07: YAML-aware negative fixtures reject broken DAGs, ambiguous names, unpinned actions and permissive gates. Frozen installs, trusted read-only dependency policy and full-history redacted scans remain required.
- CI-08: Relevant repository skills are selected by task without requiring a command. Host discovery and file validation remain distinct; selection grants no new execution authority.

## Design

Core IDs: workflows, secrets, quality, build, hosting, browser, performance, checks. Nightly IDs: prepare, quality, browser, visual, links, bundle, checks. Nightly human names have a unique prefix. Extra legacy-checks is a temporary full-gate bridge during phase A.

A dev-only YAML 1.2 parser validates workflow structure. A small Node helper validates build provenance against trusted producer outputs; it is integrity/context binding, not a signed attestation. The candidate helper validates Git reachability without interpolating untrusted inputs into shell commands. Existing duration scheduling owns test selection.

## Verification and limits

Implementation and exact-head hosted evidence pending. Record original failures and limits; do not infer deployment, physical-device frame rate or production capacity from CI. Initial Nightly dispatch requires publication of its workflow on the default branch. Existing assistant screenshots are refreshed separately with synthetic fixtures under an explicit local resource lease.

## Primary references

Reviewed 2026-10-18:

- [GitHub artifact transfer and validation](https://docs.github.com/en/actions/tutorials/store-and-share-data): the default digest mismatch is a warning, so this profile explicitly rejects a mismatched trusted producer checksum before extraction.
- [Protected branch checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches): keep check names distinct across workflows and preserve the enforced aggregate during renaming.
- [Workflow events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows): scheduled/manual bootstrap depends on the workflow being available on the default branch; record the actual candidate rather than assuming a moving branch tip.
- [YAML parser documentation](https://eemeli.org/yaml/): YAML 1.2 parsing, unique mapping keys and zero permitted aliases support explicit structural policy checks without regex parsing of YAML.
