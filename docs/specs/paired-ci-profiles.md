# Paired validation profiles

Status: done

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

Core IDs: workflows, secrets, quality, build, hosting, browser, performance, checks. Nightly IDs: prepare, quality, browser, visual, links, bundle, checks. Nightly human names have a unique prefix. Phase A retained an extra legacy-checks full-gate bridge until Required checks was enforced on both branches. Phase B uses the exact canonical Core IDs and restores Quality checks as the source-quality job.

A dev-only YAML 1.2 parser validates workflow structure. A small Node helper validates build provenance against trusted producer outputs; it is integrity/context binding, not a signed attestation. The candidate helper validates Git reachability without interpolating untrusted inputs into shell commands. Existing duration scheduling owns test selection.

## Verification and limits

Verified on 2026-10-18. Results refer to the exact reviewed heads below, not to a later documentation commit or a moving branch tip.

| Stage | Reviewed head | Hosted execution | Result |
| --- | --- | --- | --- |
| Phase A, PR #165 | `525588cf659e9d065b148214e3c9d41cd426fc3a` | [39097851981](https://github.com/gonzalomartinperez/portfolio/actions/runs/39097851981) | All 16 Core jobs passed, including the temporary full-gate bridge. |
| Phase B, PR #166 | `021aa4a07b2ee829f738c2302c1e86461e2a877e` | [39098456040](https://github.com/gonzalomartinperez/portfolio/actions/runs/39098456040) | All 15 canonical Core jobs passed. |
| Release, PR #167 | `06fb5e01473c18584a4f4a7d38455fabbafe1539` | [39098955262](https://github.com/gonzalomartinperez/portfolio/actions/runs/39098955262) | All 15 Core jobs passed before the normal merge to main. |
| Post-main | `b628ee298503eef4ca9d039f10a95e35a3ce49a3` | [39099466870](https://github.com/gonzalomartinperez/portfolio/actions/runs/39099466870) | All 15 Core jobs passed. |
| Real Nightly bootstrap | `b628ee298503eef4ca9d039f10a95e35a3ce49a3` | [39099486047](https://github.com/gonzalomartinperez/portfolio/actions/runs/39099486047) | All 14 jobs passed after publication on the default branch. |

The post-main Core browser inventory and the Nightly browser/visual union each contained 498 cases: 489 passed, nine existing applicability skips, no failed or flaky summaries. Nightly used a manual dispatch with the exact main SHA and main ancestry; this proves its real workflow execution, not a future scheduled trigger.

Both branch protections first added Required checks alongside the previous full gate and Branch policy. Only after phase B passed was the old required context retired. Final main/develop protections require Required checks and Branch policy, bound to GitHub Actions app 15368, with strict mode; all other protection fields were compared and preserved.

Local frozen installs, full check, both dependency audits, unchanged contract regeneration, both 498-test discovery plans, 15 scanner fixtures, 703 tracked-file/full-history and 412 artifact-file scans, and 22 rendered checks passed. The first policy test attempt exposed a shared mutable fixture; copying its prerequisite array fixed the test isolation without weakening policy. A trailing blank-line diff warning in phase B was corrected before publication. Original failures remain preserved in the coordinator's verification records.

Ten final assistant captures were reviewed across both locales, themes and compact/expanded states using synthetic fixtures and zero provider calls. Their application source matches the post-main source; this does not imply a live API test or activation. Public HTTP checks returned 200 for both home locales and 404 for both disabled assistant routes, without a launcher or enabled analytics marker. The exact deployed Hostinger SHA was not independently confirmed in hPanel. CI does not establish physical-device frame rate, production capacity, container-image acceptance or tag publication. See the [tag policy](../release-history.md) for the separate, still-pending label decision.

## Primary references

Reviewed 2026-10-18:

- [GitHub artifact transfer and validation](https://docs.github.com/en/actions/tutorials/store-and-share-data): the default digest mismatch is a warning, so this profile explicitly rejects a mismatched trusted producer checksum before extraction.
- [Protected branch checks](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches): keep check names distinct across workflows and preserve the enforced aggregate during renaming.
- [Workflow events](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows): scheduled/manual bootstrap depends on the workflow being available on the default branch; record the actual candidate rather than assuming a moving branch tip.
- [YAML parser documentation](https://eemeli.org/yaml/): YAML 1.2 parsing, unique mapping keys and zero permitted aliases support explicit structural policy checks without regex parsing of YAML.
