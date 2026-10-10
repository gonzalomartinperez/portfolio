# Applied AI profile reconciliation

Status: implemented

## Outcome

Synchronize the latest approved engineering profile with the portfolio and
reviewed bilingual CVs, while preserving accurate experience context.

## Acceptance

- Add MongoDB to Teamcubation's English and Spanish stack. Preserve PostgreSQL
  and pgvector and do not infer database ownership by individual microservices.
- Publish the confirmed AI concepts through the shared catalog: AI Chains,
  AI Testing, Embeddings, Chunking, Prompt engineering, Context engineering and
  Fine-tuning and LLMOps. Keep unspecified employer evidence general.
- Preserve the user's latest fine-tuning confirmation without inventing the
  model, training provider, employer or measurements.
- Reuse existing concept illustrations, catalog ordering and automatic carousel
  behavior. Preserve the curated hero's 35 marks and avoid new dependencies.
- Import reviewed career revision 2026-10-10.3. Both CV
  headlines retain the exact LinkedIn string, with three roles and all terms.
- Preserve three pages per PDF, approved download names and valid manifest
  hashes. Keep the web CV and PDFs sourced from the same reviewed release.
- Document current primary-source research and distinguish vendor facts from
  editorial recommendations and search assumptions.
- Keep the assistant disabled and preserve the existing release tag.

## Verification

Reviewed career release 2026-10-10.3 retains three pages per language. All six
renders were inspected; the public projection and both PDFs match its approved
source, facts and PDF hashes. `npm run check` passes, including catalog context,
bilingual content, document manifests, lint, the type-checked production build
and unchanged resource budgets.

The carousel direction assertion measures displacement modulo the measured cycle
width: a recycled tile can move from the left edge to the right edge while the
row continues moving left. Direction, pause and access assertions remain intact;
no timeout or retry allowance was increased.

Required browser CI exposed a transient theme mismatch on academic document
cards: the links resolved light text while their card retained its dark surface.
The route audit now checks the actual card and action colors against the resolved
theme tokens and waits for paint frames before running the unchanged accessibility
rules. It replaces a blind delay; persistent mismatches still fail the test.

Affected-route browser checks, responsive screenshots and required integration
CI are recorded in the task and release PRs. Browser emulation does not establish
physical-device frame rates or behavior across every browser installation.

The required CI audit found newly published advisories in the existing lockfile.
Update only Sharp 0.35.4 → 0.35.5 (including its matching image binaries) and
source-map-js 1.2.1 → 1.2.2 within their existing dependency ranges. Keep both audit
gates and hosting compatibility checks intact.
[Sharp advisory](https://github.com/advisories/GHSA-wq5f-xc86-pv6w),
[source-map-js advisory](https://github.com/advisories/GHSA-68fv-2mgg-jv7q).
