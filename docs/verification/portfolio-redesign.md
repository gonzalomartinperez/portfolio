# Portfolio redesign verification

Date: 2026-09-12. Scope: [redesign specification](../specs/portfolio-redesign.md).

## Delivered changes

- Original Three.js/GSAP particle journey with reversible native scrolling, pause and static
  fallbacks. This replaces the earlier manual WebGL implementation, not the whole application.
- Owner-selected transparent caricature for the identity and favicons; approved black-sweater
  illustration for the portrait. Public derivatives have no embedded personal metadata. The
  owner's later asset selection supersedes the original vector-avatar requirement.
- One inventory of 104 technologies and concepts, with 50 assigned local brand marks and
  descriptive original SVG illustrations for remaining entries. Nine groups share stable IDs,
  context links and applied/developing distinctions. No proficiency percentages or invented logos.
- Updated bilingual copy and seven routes, grouped Filomena gallery, keyboard enlargement,
  responsive navigation and both themes. Existing public CV documents are unchanged.

## Local verification

Node 24.19.0, npm 11.19.0, Windows; locked dependencies, production Webpack build.

| Check | Result |
| --- | --- |
| `npm run check` | Passed: 5 repository tests, 15 content tests, 8 identity outputs, lint, TypeScript/build, 7 budgets |
| `npm run test:rendered` | 16 passed, including locale routes, landmarks, metadata, privacy checks and asset endpoints |
| `npm run test:smoke` | Passed: standalone production HTML and 404 |
| `npm run test:browser` | 68 passed in 2.2 minutes; desktop and mobile Chromium |
| `npm audit --audit-level=low` | No reported vulnerabilities |
| `git diff --check` | Passed |

Browser coverage includes both themes on all 14 locale/routes, axe, keyboard navigation,
no JavaScript, reduced motion, actual WebGL context loss/recovery, repeated client navigation,
catalogue search/reset, gallery keys/focus, visible pause and short-viewport fallback.
Checkpoint screenshots use fixed progress 0, .25, .5, .75 and 1 with deterministic time.
An independent review identified hidden mobile glyphs and an offscreen pause control; both
were corrected with focused regression assertions before release.

## Measurement boundaries

The deferred scene closure is approximately 179 KiB gzip, including its transitive chunks,
under the 250 KiB limit. It is not initial-route JavaScript; a direct education-page navigation
does not request scene dependencies. The public portrait is 42,478 bytes, below 80 KiB.

One local unthrottled Chromium 153 observation with two concurrent test workers:

| Emulated viewport | LCP | CLS | RAF cadence |
| --- | --- | --- | --- |
| Desktop 1440 × 1000, DPR 1 | 412 ms | 0.0124 | 42.4 Hz |
| Pixel 7 412 × 839, DPR 2.625 | 748 ms | 0.0336 | 60.0 Hz |

The renderer was ANGLE/Vulkan SwiftShader, not a physical GPU. RAF cadence is not GPU
throughput. These observations do not certify 60 fps on a desktop GPU, 30 fps on a physical
phone, production Core Web Vitals or field INP. Real-device profiling remains a follow-up.
The automated 200% check enlarges text; native browser-zoom verification remains separate.

## Release boundaries

GitHub must pass modern-browser CI, branch policy and the independent Rocky Linux 8 / GLIBC
2.28 build and smoke check before PR integration. Only develop may promote into main.
Hostinger deploys main through its existing native integration; no hosting or DNS changes
are included. CI success alone is not proof of deployment; confirm the public avatar asset
and updated catalogue after promotion and record the release PR results in the handoff.

Inherited sprite revision provenance is incomplete and explicitly recorded in
[the brand notice](../../public/brands/NOTICE.md). Automated checks do not constitute brand
licensing clearance, accessibility certification or a security audit. Expected Hostinger SWC
fallback messages remain documented; they are not suppressed to produce a quiet log.
