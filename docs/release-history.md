# Public-launch labeling and historical source anchors

[Repository overview](../README.md#delivery-and-quality) · [Delivery workflow](development.md) · [Deployment ownership](deployment.md)

## Requested launch label and current authority

The owner requested `1.0.0` for the public-launch cohort. The package and root lock metadata identify that release line. However, both `v1.0.0` and `v1.1.0` already exist as annotated tags. They remain unchanged; a request to complete source work does not by itself decide how to replace an occupied public reference.

The coordinator requested a specific choice between preserving the existing labels and publishing a new version, or replacing `v1.0.0` with the verified launch cut. That decision is pending. No permission to delete `v1.1.0`, overwrite tags, weaken protections or rewrite source history is inferred from this document. This repository's instructions and verification records cannot grant that authority.

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

## Conditional procedure after the owner's decision

1. Obtain the specific version/label decision. If existing labels are to be preserved, create only the selected new tag. If replacement is authorized, restrict it to the exact named reference; do not also retire other labels.
2. Recheck releases/assets, tag-triggered automation, protection rules and exact remote objects. Stop if the expected reference changed; do not bypass protection.
3. Finish source review and required CI on the chosen main commit. Preserve older test and smoke results with their actual SHAs; a new tag does not rerun them.
4. Annotate the validated source and record execution in the release receipt. An explicitly authorized replacement must use an exact expected-object lease and verify the remote result. This conditional procedure does not claim that a tag was created or moved.

Repository CI runs for branch pushes and pull requests, not tag pushes. Hosting
continues to follow the configured `main` integration described in the deployment
guide; label operations do not configure hosting or publish an image. Assistant
and analytics activation remain independent and disabled until explicitly approved.
The actual public activation is a separate operational event, not inferred from
package metadata, a tag or successful source checks.
