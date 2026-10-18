# Public-launch labeling and historical source anchors

[Repository overview](../README.md#delivery-and-quality) · [Delivery workflow](development.md) · [Deployment ownership](deployment.md)

## Accepted launch policy

The owner selected `1.0.0` for the public-launch cohort and explicitly authorized
consolidating this repository's previous tags into one `v1.0.0` on the final reviewed
`main` cut. The package and root lock metadata identify that same release line.
This is a one-time labeling transition, not a change to source history, prior
verification dates or when the website first served traffic. Future version changes
must describe the subsequent reviewed releases rather than repeat this reset.

The repository does not publish an npm package. Its development tool versions and
dependency versions remain governed by their existing manifests and lock entries;
changing the root application version does not upgrade or downgrade dependencies.

## Historical source anchors

These associations describe the tags before the authorized transition. The commit
links remain the references for historical screenshots and verification evidence.

| Former label | Original source commit | Original annotated tag object |
| --- | --- | --- |
| `v1.0.0` | [`ccd4dd3b0a7d222b2fed384578cc847b7dddd93b`](https://github.com/gonzalomartinperez/portfolio/commit/ccd4dd3b0a7d222b2fed384578cc847b7dddd93b) | `ade20ab75a3cf1df9f115333c3409688a2746a8a` |
| `v1.1.0` | [`ee4e8b514baae59e301c64ce650d97b4319de0de`](https://github.com/gonzalomartinperez/portfolio/commit/ee4e8b514baae59e301c64ce650d97b4319de0de) | `3ab0f360453cfeb3806e8d62ffa254ff3ff41a66` |

The release coordinator archives the exact raw annotated tag objects and verifies
their Git object IDs before changing refs. The original source commits remain
ancestors of the final release; removing an old label does not remove that code.
No image, rollback artifact, backup or release asset is deleted as part of relabeling.

## Controlled transition and evidence

1. Review consumers, existing releases/assets, tag-triggered automation and the exact
   remote refs. Do not overwrite a ref whose expected object has changed.
2. Finish source review and required CI on the final `main` commit. Preserve each
   older test or smoke result with its actual source SHA; a new tag does not rerun it.
3. Create the launch annotation on that validated commit. Update the existing
   `v1.0.0` only with an exact expected-object lease, verify its remote target, then
   retire the superseded label with the same comparison discipline. Do not bypass
   repository protection or weaken checks.
4. Verify the final remote inventory and record its object ID, target and execution
   evidence in the release receipt. The annotation identifies the actual final
   source; this document records policy and history rather than claiming execution.

Repository CI runs for branch pushes and pull requests, not tag pushes. Hosting
continues to follow the configured `main` integration described in the deployment
guide; label operations do not configure hosting or publish an image. Assistant
and analytics activation remain independent and disabled until explicitly approved.
The actual public activation is a separate operational event, not inferred from
package metadata, a tag or successful source checks.
