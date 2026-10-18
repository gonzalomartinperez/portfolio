# Public-launch labeling and historical source anchors

[Repository overview](../README.md#delivery-and-quality) · [Delivery workflow](development.md) · [Deployment ownership](deployment.md)

## Release policy

The current release line is `1.2.0`, recorded in the application manifest and root lock metadata. Existing annotated tags `v1.0.0` and `v1.1.0` retain their exact published objects and targets. The new minor version captures the reviewed portfolio, architecture, assistant interface and delivery improvements without replacing historical references.

The original launch request used `1.0.0`; that name was already occupied. The non-destructive version increment follows the existing published sequence. It does not imply authorization to overwrite or delete either historical label, weaken protections, rewrite source history or relabel verification performed on an earlier commit.

The repository does not publish an npm package. Its development tool versions and
dependency versions remain governed by their existing manifests and lock entries;
changing the root application version does not upgrade or downgrade dependencies.

## Historical source anchors

These are the existing remote associations, verified on 2026-10-18. The commit
links remain the references for historical screenshots and verification evidence.

| Existing label | Original source commit | Original annotated tag object |
| --- | --- | --- |
| `v1.0.0` | [`ccd4dd3b0a7d222b2fed384578cc847b7dddd93b`](https://github.com/gonzalomartinperez/portfolio/commit/ccd4dd3b0a7d222b2fed384578cc847b7dddd93b) | `ade20ab75a3cf1df9f115333c3409688a2746a8a` |
| `v1.1.0` | [`ee4e8b514baae59e301c64ce650d97b4319de0de`](https://github.com/gonzalomartinperez/portfolio/commit/ee4e8b514baae59e301c64ce650d97b4319de0de) | `3ab0f360453cfeb3806e8d62ffa254ff3ff41a66` |

The exact raw annotated objects were archived with their verified object IDs. Both source commits remain available. Archiving records is not execution of a label transition; no rollback artifact, backup, release asset or source commit was removed.

## Publishing the new release

1. Recheck releases/assets, tag-triggered automation, tag protection and exact remote objects. Confirm `v1.2.0` does not exist and both historical refs still match the table. Stop on a collision; never force-push or remove an existing tag to make space.
2. Finish normal task/release pull requests and required CI on the final main commit. Match the checked head to the current main SHA. Preserve older test and smoke results with their actual SHAs; a tag does not rerun them.
3. Create the new annotated `v1.2.0` on that validated commit and push only its explicit tag ref. Its annotation records the actual source and successful verification, not a claim of production activation.
4. Verify the remote tag object and peeled commit, confirm both historical refs are unchanged, and preserve the execution receipt. The annotation identifies the final source; this document describes the publication policy without claiming that CI proves deployment.

Repository CI runs for branch pushes and pull requests, not tag pushes. Hosting
continues to follow the configured `main` integration described in the deployment
guide; label operations do not configure hosting or publish an image. Assistant
and analytics activation remain independent and disabled until explicitly approved.
The actual public activation is a separate operational event, not inferred from
package metadata, a tag or successful source checks.
