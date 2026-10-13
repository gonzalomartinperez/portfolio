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
- With classic (non-overlay) scrollbars, the root's stable scrollbar gutter stays visible as
  a narrow strip beside the full-screen explorer. It comes from the global scroll layout,
  not the scene, and is left for a layout change.
- Additive glows rely on browsers compositing premultiplied color brighter than its alpha,
  which current engines do but WebGL leaves implementation-defined.
- Hero text is not measured into the reading mask because its container is pinned and
  animated. Initial orbital phases keep bodies clear of it at time zero, and while the
  technology cloud spreads over the screen the whole scene recedes using the progress the hero
  already publishes, so labels such as the one over the Sun stay legible.

## Texture delivery (2026-10-13)

Before this change every route downloaded the full-resolution maps: the static fallback
requested eleven originals (5.27 MB) right after first paint, and the engine then requested
all sixteen originals (revalidated with `max-age=0`) to decode reading mode down to 2048 and
1024 texels. Reading mode now downloads reading-size variants, the fallback uses thumbnails
sized from measured body diameters, and the explorer fetches originals only when it uploads
more than the reading size. Variant provenance and sizing are in the
[texture asset record](../assets/solar-system.md#delivery-variants).

Measured on the local production server (`next start`) with Playwright Chromium, fresh
context, CDP `encodedDataLength` until the scene was ready plus 6 s; desktop is 1440 × 1000,
mobile is the Pixel 7 profile. "Static" disables `getContext("webgl*")` in an init script.

| Route, profile, renderer | Total before | Total after | Textures before | Textures after |
| --- | ---: | ---: | ---: | ---: |
| `/`, desktop, WebGL | 8,265,963 | 3,438,612 | 7,206,649 | 2,376,380 |
| `/about`, desktop, WebGL | 7,990,672 | 3,164,127 | 7,206,649 | 2,376,380 |
| `/`, Pixel 7, WebGL | 8,181,075 | 2,501,044 | 7,206,649 | 1,523,693 |
| `/about`, Pixel 7, WebGL | 7,984,744 | 2,305,512 | 7,206,649 | 1,523,693 |
| `/`, desktop, static | 6,327,546 | 1,360,709 | 5,268,909 | 299,146 |
| `/about`, desktop, static | 6,052,932 | 1,086,893 | 5,268,909 | 299,146 |
| `/`, Pixel 7, static | 6,214,962 | 1,248,125 | 5,268,909 | 299,146 |
| `/about`, Pixel 7, static | 6,047,004 | 1,080,965 | 5,268,909 | 299,146 |

Bytes include response headers. Repeat visits now reuse every map without revalidation:
`?v=` carries a 64-bit SHA-256 prefix and the server answers `public, max-age=31536000,
immutable` only for the exact version of the bytes it serves (rendered test). Hostinger must
pass this header through; it was verified on the local server only.

The explorer was exercised with the renderer name spoofed as a hardware GPU, so SwiftShader
took the hardware path. Uploaded widths matched the previous build at every step: desktop
Earth and Jupiter 4096, Sun, Moon, Mars, Saturn and clouds 2048; Pixel 7 Earth and Jupiter
2048. Opening it fetched the originals on demand (desktop: Earth, Jupiter, Mars, Saturn, Moon
and clouds, 4.38 MB; Pixel 7: the 2048 Earth and Jupiter variants, 0.50 MB). The
browser regression asserts that reading mode never requests the Earth or Jupiter originals,
that software renderers keep reading sizes in the explorer, and, on hardware GPUs, that the
explorer's Earth samples the original.

Visual equivalence, before against after, at identical scene time (PSNR over the full
capture; maximum channel difference in parentheses):

| Capture | Desktop | Pixel 7 |
| --- | --- | --- |
| Static fallback, dark | 67.4 dB (14) | 68.7 dB (8) |
| Static fallback, light | 69.1 dB (10) | 70.2 dB (6) |
| Reading mode, WebGL | 80.1 dB (2) | 82.6 dB (1) |
| Explorer, Earth close-up | 62.6 dB | 56.0 dB |
| Explorer, Saturn close-up | 49.1 dB | 56.9 dB |

Explorer differences are confined to under 0.2 % of pixels along ring and limb edges, where
the camera flight settles on slightly different sub-pixel positions between runs; the
Saturn close-up samples the same original before and after. Every capture was also
inspected side by side. The homepage HTML stays at 68,643 bytes gzip: shortening the
version from 64 to 16 hexadecimal characters offsets the 26 added variant entries.
