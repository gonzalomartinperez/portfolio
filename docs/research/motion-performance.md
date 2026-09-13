# Interactive 3D motion and scroll performance

## Recommendation

Retain Three.js Points, custom shaders and GSAP ScrollTrigger. For this portfolio,
the highest-value architecture is one bounded visual progress, inexpensive DOM
writes, controlled drawing-buffer resolution and correct lifecycle handling. More
animation libraries do not resolve an unidentified frame-time bottleneck.

This assessment combines official documentation reviewed on 2026-09-13 with the
[local verification record](../verification/portfolio-autonomy.md). Recommendations
below are application-specific judgments, not promises of a universal frame rate.

## Rendering and style work

Google's animation guide favors transform and opacity over geometric properties
and recommends tracing layout, paint and dropped frames. The relevant distinction
is the browser work performed, not simply CSS versus JavaScript.[^1]

Static logo positions with cached transforms and opacity are appropriate here.
Measure geometry on resize, not for each logo on every frame. Local measured scroll
layouts fell from 20/21 to zero for desktop/mobile emulation. This observation does
not establish that all animation work happens outside the main thread.

The first candidate still changed an inherited CSS variable through a complex
subtree. Chromium's published property benchmark explains how inherited changes can
invalidate descendant styles.[^2] Cached direct writes reduced measured style work.
Non-inherited registered properties could be another implementation, but introducing
them now would duplicate a solution. Do not generalize the benchmark into a claim
that all CSS variables are slow, or transplant its percentages into this portfolio.

MDN cautions that excessive `will-change` can consume memory, create stacking
contexts and worsen performance.[^3] Do not permanently promote every catalogue
icon or page section. Keep the animated decorative cloud bounded and the full
accessible catalogue in normal document flow.

## Scroll and time

ScrollTrigger distinguishes progress updates from geometry refreshes, and supports
optional scrub catch-up. Refresh recalculates positions and should not be a frame-loop
operation.[^4] Here ScrollTrigger owns target progress; one frame loop owns the
smoothed visual value shared by camera, shader expansion, identity and logos.

Do not add another scrub tween over the existing damping or create new tweens per
scroll event. Both would introduce additional temporal state. The time-based factor
`1 - exp(-rate * deltaSeconds)` avoids dependence on display refresh frequency;
MDN advises using frame timestamps for that reason.[^5] Exceptional delta clamping
and paused-tab resumption remain explicit application policies.

Stable targets must reproduce the same composition in either direction. Verify
0/25/50/75/100 percent, rapid inversions and extreme jumps. Travel derives from the
real sticky viewport and journey dimensions. Preserve native history and scroll
restoration; do not hide mismatches with forced end-state jumps.

CSS scroll-driven timelines can offload eligible DOM animations.[^6] They are not
selected for this scene because WebGL camera/uniform updates still need the same
progress authority. They remain an option for independent effects, not a reason to
split the current scene into competing coordinators. No artificial scroll is added.

## Drawing buffer and GPU work

Three.js distinguishes canvas CSS size from internal drawing-buffer resolution and
discusses high-DPI cost and resolution caps.[^7] A DPR limit helps but does not bound
total pixels on every large display. Retain current adaptive limits; a new absolute
pixel ceiling needs physical-device traces and a review of small particle detail.

`WebGLRenderer.setDrawingBufferSize` configures width, height and pixel ratio in one
operation.[^8] Cache these inputs and skip unchanged sizes. Repeating `setPixelRatio`
and `setSize` performs unnecessary resize work in the locked renderer. The selected
fix preserves existing resolution limits and does not change visual density.

MDN's WebGL guidance emphasizes batching and avoiding blocking GPU/CPU round trips.[^9]
Keep the single Points cloud, typed geometry and shader motion. Do not read pixels,
query expensive GPU state or regenerate buffers inside the production frame loop.
An instanced all-WebGL logo cloud is only a future experiment: the current local
SVG marks should not be replaced without measured benefit and accessible equivalents.

Adaptive density should respond to sustained overload, not individual long frames.
Use separate downgrade/recovery windows to avoid oscillation, and distribute reduced
particle selections across the sphere. Lower resolution cannot solve an unrelated
CPU invalidation problem; visual degradation is not a substitute for correctness.

## Lifecycle, mobile and accessibility

Three.js requires explicit geometry/material disposal; removing an object alone is
insufficient.[^10] Keep one active scene, release graphics resources, cancel its frame
loop and remove observers/listeners and the owned trigger during navigation. Test
repeated visits and actual WebGL context loss/recovery.

Pointer events provide identities, primary-pointer state and cancellation.[^11]
Decorative taps must remain distinct from drag, scroll, pinch or activating a link.
Use passive handlers without sensor permissions or scroll capture. Expire impulses
on wide touchscreens as well as narrow phones: width is not an input-device category.
Secondary pointers cancel a pending tap rather than creating another impulse.

W3C's interaction-animation guidance addresses nonessential motion and vestibular
effects.[^12] Preserve reduced motion, accessible pause and complete static content.
A focused hero link remains readable even when focus predates lazy scene mounting.
Opacity alone does not remove links from keyboard navigation.

Page and section entrances are optional enhancements, never prerequisites to read
server-rendered content. Keep native navigation, focus and history. The current
180 ms page and 240 ms section entrances are design choices, not universal standards.
No exit animation delays route changes.

## Measurements and CI

Use the same build, hardware, browser, viewport and resolution for comparisons.
Chrome's performance tooling separates main-thread, rendering and frame activity.[^13]
Keep cold loads, warm measurements and repeated samples distinct. Physical mobile
testing must include sustained load and thermal behavior before claiming a target.

SwiftShader tests demonstrate functional regressions and structural cost, not native
GPU throughput. Desktop RAF cadence did not improve globally despite substantially
lower style work; report both. Local unthrottled LCP/CLS are not visitor metrics and
do not establish field INP. The verification record retains exact conditions.

Playwright recommends one CI worker for reproducibility unless dedicated resources
justify concurrency.[^14] Parallel software-rendered scenes competed for resources
on this four-core workstation. Default to one browser worker without weakening
timeouts or assertions. Independent implementation work and the Hostinger
compatibility job can still run in parallel.

Time-sensitive gesture tests use a controlled browser clock for transient shader
state, following Playwright's [Clock guidance](https://playwright.dev/docs/clock).
This prevents slow automation transport from changing a tap into a long press or
missing the whole impulse. It is a correctness test, not a performance measurement.

## Decision register

| Priority | Decision | Verification |
| --- | --- | --- |
| Release | One progress; cached transforms and opacity | Reversal snapshots, layout traces, focus tests |
| Release | Skip redundant buffer resizing | Stable-size and viewport-change regression |
| Release | Viewport-independent tap expiry and secondary-pointer cancellation | Touch regression and native navigation |
| Release | Single-worker browser suite | Complete run with unchanged assertions/timeouts |
| Follow-up | Large-display pixel ceiling and density tuning | Physical GPU traces and visual comparison |
| Follow-up | Sustained mobile and high-refresh tests | Identified real hardware and frame distributions |
| Not selected | Extra engines, artificial scroll, indiscriminate layer promotion | No demonstrated benefit for the measured bottleneck |
| Not selected | WebGPU or all-WebGL logo rewrite | Requires separate compatibility and measured-cost justification |

## Sources

[^1]: Kayce Basques and Rachel Andrew, Google web.dev, [How to create high-performance CSS animations](https://web.dev/articles/animations-guide), updated 2020-10-06; applicable rendering guidance, not a new 2026 specification.
[^2]: Bramus, Google web.dev, [Benchmarking the performance of CSS @property](https://web.dev/blog/at-property-performance), 2024-10-02; source benchmark figures are not portfolio measurements.
[^3]: MDN, [will-change](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/will-change), living reference reviewed 2026-09-13.
[^4]: GSAP, [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) and [refresh](https://gsap.com/docs/v3/Plugins/ScrollTrigger/static.refresh()/), living v3 documentation reviewed 2026-09-13.
[^5]: MDN, [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame), living reference reviewed 2026-09-13.
[^6]: Chrome for Developers, [Animate elements on scroll with Scroll-driven animations](https://developer.chrome.com/docs/css-ui/scroll-driven-animations), platform overview; check target-browser support before future adoption.
[^7]: Three.js, [Responsive Design](https://threejs.org/manual/en/responsive.html), living manual reviewed 2026-09-13.
[^8]: Three.js, [WebGLRenderer](https://threejs.org/docs/pages/WebGLRenderer.html), living reference reviewed 2026-09-13; implementation also checked against the locked local version.
[^9]: MDN, [WebGL best practices](https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/WebGL_best_practices), living reference reviewed 2026-09-13.
[^10]: Three.js, [How to dispose of Objects](https://threejs.org/manual/en/how-to-dispose-of-objects.html), official indexed manual; direct retrieval was intermittent.
[^11]: MDN, [Pointer events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events), living reference reviewed 2026-09-13.
[^12]: W3C WAI, [Understanding SC 2.3.3: Animation from Interactions](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html), WCAG 2.2 supporting guidance, not certification of this site.
[^13]: Chrome for Developers, [Performance features reference](https://developer.chrome.com/docs/devtools/performance/reference), living documentation reviewed 2026-09-13.
[^14]: Playwright, [Continuous Integration: Workers](https://playwright.dev/docs/ci#workers), living documentation reviewed 2026-09-13.
