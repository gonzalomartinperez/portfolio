# Immersive solar scene verification

Recorded on 2026-10-12 for [the specification](../specs/immersive-solar-scene.md).
Measurements compare production builds of this branch and of `develop` before the change
(merge `676b8aa`), served locally and driven by Playwright Chromium on the same machine.

## Conditions

| Condition | Value |
| --- | --- |
| Hardware GPU | NVIDIA GeForce GTX 1050 through WSL2 D3D12 (ANGLE, OpenGL ES 3.1), headless |
| Software rasterizer | SwiftShader (ANGLE Vulkan), the renderer used by CI |
| Desktop emulation | 1440 × 900 CSS px, device pixel ratio 1 |
| Mobile emulation | Playwright Pixel 7 (412 × 915 CSS px, DPR 2.625) |
| Refresh | Headless RAF runs at 60 Hz; 120 Hz panels were not available |

Headless Chromium composites through a readback path, so absolute frame rates understate a
visible browser. No physical phone or high-refresh display was measured; the engine follows
the display's RAF cadence and its adaptive controller was exercised only at 60 Hz.

## Frame pacing (hardware GPU, dark theme, 8 s after a 4 s settle)

| Route | Device | Before fps (p95 ms) | After fps (p95 ms) | After resolution scale |
| --- | --- | --- | --- | --- |
| `/about` | desktop | 43.1 (50.0) | 45.8–55.0 (50.0) | 0.86–1.0 |
| `/` | desktop | 30.4 (66.7) | 31.5 (66.7) | 0.62 (hero scene shares the GPU) |
| `/about` | mobile | 6.9 (183.4) | 51.9 (33.3) | DPR 1.72 |
| `/` | mobile | 34.5 (66.7) | 58.8 (16.8) | DPR 1.72 |

The same `/about` page without any canvas ran at 59.5 fps in this environment, so the
desktop result is close to the headless ceiling. Before the change, adaptive quality latched
the canvas at 0.6 pixel ratio after initial upload stalls and never recovered; the new
controller ignores startup and upload stalls and steps back up after nine stable seconds.
Main-thread draw submission measured 0.7–2.4 ms per frame.

Software rendering (SwiftShader, `/about`, 1440 × 1000): before 3.3 fps, after 3.9 fps,
with the WebGL scene ready after 11.1 s versus 17.9 s.

## Resources

| Measure | Before | After |
| --- | --- | --- |
| Estimated GPU memory, desktop reading | 196 MiB | 97 MiB |
| Estimated GPU memory, mobile reading | 74–76 MiB | 63 MiB |
| Draw calls, desktop | 29 | 35 (one pass, no post-processing) |
| Deferred hero and solar JavaScript (gzip) | 203.1 KiB | 206.3 KiB (budget 250) |
| Image assets | 16 maps, 7,187,952 bytes | unchanged |
| Dependencies | — | unchanged |

Memory figures are the engine's conservative estimates, not driver measurements. On the
hardware GPU the explorer re-decoded Earth and Jupiter at 4096 texels (184 MiB estimated,
budget 256), closing it returned to 96 MiB, and narrowing the window below 640 px refitted
every map to 1024 texels (51 MiB, budget 128), with `gl.getError()` reporting no error at
each step.

## Readability

Text contrast was measured against the real rendered scene: text is hidden, the page is
captured, and the brightest (light text) or darkest (dark text) 5 % of background pixels
behind each line are compared with the text color. On `/about` at time zero, before the
reading mask, 17 of 202 text runs failed with a minimum of 1.04:1 where paragraphs crossed
the Sun. With the mask, 0 failures at scroll 0 and 2 viewports, and one 4.43:1 run at 0.9
viewport on desktop (minimum elsewhere 4.99:1). A browser regression now enforces 4.5:1
(3:1 for large text) on `/about` in both themes.

## Visual review

Every route was reviewed on a hardware GPU in both themes at desktop and Pixel 7 sizes,
including the hero at rest and with the toolkit settled, reading positions, the Filomena
diagrams and gallery, and the explorer close-ups. Review found and fixed: labels over the Sun
in the settled toolkit, an opaque receded Sun hiding stars, a hard mask edge across the
corona, explorer close-ups facing the night side, and NaN-producing shader expressions
(`pow` with negative bases, inverted `smoothstep` edges) that showed as a lighter square on
D3D12. The [README gallery](../gallery/README.md) records the reviewed frames.

## Remaining limits

- Physical mobile devices, Safari/WebKit and Firefox rendering of the scene were not tested
  locally; CI covers Chromium only for the scene.
- Additive glows rely on browsers compositing premultiplied color brighter than its alpha,
  which current engines do but WebGL leaves implementation-defined.
- Hero text is not measured into the reading mask because its container is pinned and
  animated. Initial orbital phases keep bodies clear of it at time zero, and while the
  technology cloud spreads over the screen the whole scene recedes using the progress the hero
  already publishes, so labels such as the one over the Sun stay legible.
