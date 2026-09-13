# Portfolio autonomy verification

Date: 2026-09-13. Baseline: `a305b60`.

## Delivered scope

- Eight routes per language, including an accessible local CV, with no public
  Notion or Reactive Resume navigation dependency.
- A single catalogue of 109 evidenced technologies and concepts: 100 applied and
  nine developing, ordered for applied AI and software engineering opportunities.
- A shared academic catalogue: 34 curriculum entries and two English requirements,
  official Spanish names, editorial translations and documented outcomes.
- Six allowlisted documents with byte, MIME and SHA-256 checks. The original
  transcript is explicitly authorized, unredacted and identified as historical.
- Reviewed three-page CVs in both languages; web content is a generated public
  projection of the same reviewed source, not a second editorial authority.
- The 43 previously reviewed Filomena images remain unchanged.
- Larger small-size favicon framing, native page/section entrances and reversible
  scene choreography with mobile tap behavior and static fallbacks.

See [content decisions](content-migration.md), [academic reconciliation](academic-evidence.md)
and the [public export contract](../public-content.md).

## Scene measurements

Same local machine: Intel i5-7300HQ, four cores, Node 24.19 / npm 11.19,
Chromium 153 with SwiftShader. Desktop viewport 1440 × 1000 at DPR 1; mobile
Pixel 7 emulation at 412 × 839 and DPR 2.625. Three samples per group, one worker.
These are unthrottled laboratory observations, not physical-device or visitor data.
The measured direct-write candidate is `f6f97b9`; subsequent bounded fixes avoid
redundant buffer resizing, expire wide-screen touches and preserve pre-existing
focus. Their correctness is covered by regression tests, not a new FPS claim.

| Metric | Baseline desktop | Direct-write desktop | Baseline mobile emulation | Direct-write mobile emulation |
| --- | ---: | ---: | ---: | ---: |
| Layouts during measured scroll | 20 | 0 | 21 | 0 |
| Style recalculation, ms | 283.4 | 14.0 | 223.2 | 14.0 |
| Main-thread task time, ms | 1666.1 | 1476.5 | 1149.1 | 1126.7 |
| LCP, ms | 360 | 348 | 308 | 356 |
| CLS | 0.01246 | 0.01204 | 0.00234 | 0.00234 |
| RAF cadence, frames/s | 42.38 | 38.15 | 60.01 | 60.01 |

The first transform-only candidate removed layout but increased style work through
inherited per-frame CSS variables. It was not accepted as a performance improvement.
Cached direct transform/opacity writes reduced that invalidation. Earlier timing
samples shared concurrent browser load, so durations should be treated cautiously;
the final candidate and regression checks ran in an isolated window.

There is **no demonstrated overall FPS improvement**: desktop RAF cadence worsened,
and emulated-mobile LCP increased by 48 ms. RAF cadence is not GPU throughput. The
observed structural improvement is zero scroll layouts and much less style work;
real-device 60/30 fps targets and field INP remain unverified. LCP/CLS figures here
must not be represented as production Web Vitals.

The deferred scene remains below the existing 250 KiB gzip ceiling (179.85 KiB in
the isolated candidate). No dependency, budget or timeout was relaxed.

## Review and tests

- All six regenerated CV PDF pages were visually reviewed before manifest-bound
  promotion; the web/PDF export records source and reviewed PDF hashes.
- All four original academic PDF pages were reviewed; curriculum placement and
  grades were reconciled rather than inferred from subject names.
- Independent review found and resolved a Notion-domain export gap, signal-based
  test-server shutdown handling and preservation of interleaved CV block order.
- Isolated final scene suite: 37 passed, one intentional desktop-only touch skip.
  Includes 20 rapid reversals per viewport, focus recovery, passive mobile taps,
  pause, reduced motion and WebGL loss/recovery, with unchanged timeouts.
- Earlier integrated two-worker runs had three, then one, scene timeout under
  software-renderer contention (the latter: 98 passed, one skipped, one failed).
  They are not evidence of acceptance. Browser verification now defaults to one
  worker following [the research findings](../research/motion-performance.md).
  Assertions and timeouts remain unchanged.

Integrated local checks passed: five repository tests, 23 content/catalogue/export
tests, eight identity outputs, six document manifests, lint, production build with
TypeScript and seven bundle budgets. Eighteen rendered assertions cover all 16
localized routes, anchors, metadata, headers and local evidence.

The single-worker browser run completed with 103 passed, one intentional desktop
touch skip and two new touch-test failures. Traces identified invalid test timing:
protocol round trips separated a supposed tap by 1.6 seconds, and polling could
miss the 650 ms impulse entirely. Synthetic gesture steps now run together, while
the transient-expiry assertion uses Playwright's clock to check actual shader state
at controlled times. No application duration or assertion threshold was relaxed.
The affected scene suites passed after correction: 11 passed, one intentional skip
in 1.1 minutes. The release PR must also pass the complete CI suite before integration.

Visual review covered the five deterministic desktop scene states, CV and academic
layouts, zoomed views, portraits in both themes and small favicon outputs. Full-size
screenshots and traces remain local diagnostic artifacts rather than public assets.
GitHub checks and post-deploy HTTP/hash verification are recorded in the release PR;
local tests alone do not establish Hostinger deployment.

## Delivery boundary and rollback

Modern CI uses one production build and one owned test-server lifecycle. The
separate GLIBC 2.28 job verifies the observed Hostinger runtime, SWC WASM, build
and smoke behavior without Biome. Required checks and branch protections remain.

Only task PRs enter develop, followed by a develop-to-main release PR. Native
Hostinger deployment is separate from GitHub CI; verify live route responses and
document/favicon hashes. No hosting or Cloudflare account settings are changed.

Rollback uses a new revert task branch and PR into develop, then a release PR to
main. Preserve the previously approved documents and export as one coherent unit;
never rewrite protected history or independently roll back only one CV format.
