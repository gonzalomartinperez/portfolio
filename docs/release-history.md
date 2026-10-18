# Public-launch label and historical source anchors

[Repository overview](../README.md#delivery-and-quality) · [Delivery workflow](development.md) · [Deployment ownership](deployment.md)

## Release policy

The final launch label is `v1.0.0`, with application version `1.0.0` in the manifest
and root lock metadata. On 2026-10-18 the owner explicitly requested a single final
`v1.0.0` tag across the repositories and removal of the other tags. This one-time
normalization supersedes the earlier policy of preserving occupied tag names and
publishing `v1.2.0`; it does not rewrite source commits or historical verification.

Before changing any reference, retain the exact old tag objects and targets in a
private backup, restore them into an isolated repository and verify connectivity.
The final tag must point to the exact final `main` commit after protected integration
and successful required CI. Do not describe the transition as completed before its
remote object and peeled target have been verified.

This instruction does not authorize future tag replacement, branch history rewrites,
protection bypasses, image publication or assistant activation. A new relabeling
requires a new explicit owner decision. Dependency and development tool versions are
unchanged; the repository does not publish an npm package.

## Historical source anchors

These are the associations observed before normalization on 2026-10-18. The commit
links, original annotated objects and dated receipts remain historical evidence;
the table does not claim that the corresponding remote labels remain present.

| Previous label | Original source commit | Original annotated tag object |
| --- | --- | --- |
| `v1.0.0` | [`ccd4dd3b0a7d222b2fed384578cc847b7dddd93b`](https://github.com/gonzalomartinperez/portfolio/commit/ccd4dd3b0a7d222b2fed384578cc847b7dddd93b) | `ade20ab75a3cf1df9f115333c3409688a2746a8a` |
| `v1.1.0` | [`ee4e8b514baae59e301c64ce650d97b4319de0de`](https://github.com/gonzalomartinperez/portfolio/commit/ee4e8b514baae59e301c64ce650d97b4319de0de) | `3ab0f360453cfeb3806e8d62ffa254ff3ff41a66` |
| `v1.2.0` | [`be8da9cb4e0c99bee50215b71ae73828372062fa`](https://github.com/gonzalomartinperez/portfolio/commit/be8da9cb4e0c99bee50215b71ae73828372062fa) | `fca1e19d48b1b679affa5a22557457ad85d56048` |

## Final label transition

1. Inventory exact local and remote tag objects, releases/assets, tag-triggered
   automation and protection rules. Stop the affected mutation if it would trigger
   an external publication or deployment that the owner has not authorized.
2. Archive all affected references and reachable objects outside Git. Verify bundle
   integrity, isolated restoration and object connectivity before removing any tag.
3. Complete normal task and release pull requests. Verify required CI on the final
   `main` SHA; preserve previous test results under the SHAs they actually checked.
4. Create the annotated `v1.0.0` on that validated commit. Push only the explicit tag
   changes, atomically and with expected-object leases for every occupied reference.
   Abort if any remote object differs from the frozen inventory; never use a blanket force.
5. Verify that the sole remote tag is `v1.0.0`, with the expected annotated object and
   peeled commit. Confirm branches are unchanged, then align the local tag references
   and retain the execution receipt and restore instructions outside the repository.

Repository CI runs for branch pushes and pull requests, not tag pushes. Hosting
continues to follow the configured `main` integration described in the deployment
guide. A tag operation does not configure hosting or prove an actual deployment.
Assistant and analytics activation remain separate decisions and disabled until
explicitly approved. Source checks, metadata and labels do not establish production readiness.
