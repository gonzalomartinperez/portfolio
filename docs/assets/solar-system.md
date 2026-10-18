# Solar system texture assets

Reviewed on 2026-10-04. Runtime assets are local WebP files under `/images/solar-system/`; rendering needs no external image request. Original downloads and conversion helpers remain only in ignored `.artifacts/solar-system/`.

## Sources and reuse

Fifteen maps come directly from [Solar System Scope / INOVE](https://www.solarsystemscope.com/textures/) under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/). Adaptation and commercial reuse require attribution, a license link, and disclosure of changes. These are adapted maps based on NASA imagery, not a claim that the finished artwork is public domain. Its source describes color adjustments and estimated terrain in unmapped areas.

Pluto uses NASA’s [Pluto Global Color Map](https://science.nasa.gov/resource/pluto-global-color-map/), credited **NASA/JHUAPL/SwRI**, based on New Horizons observations. The source shows no copyright restriction notice. Reuse follows [NASA image and media guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/), with the published credit and no implied endorsement. It is not relicensed as CC BY. No NASA/JPL insignia is included.

## Visible credit for integration

The integrator must expose ordinary HTML credits with clickable source and license links. Short copy:

- EN: “Planet textures adapted from Solar System Scope (CC BY 4.0); Pluto: NASA/JHUAPL/SwRI.”
- ES: “Texturas planetarias adaptadas de Solar System Scope (CC BY 4.0); Plutón: NASA/JHUAPL/SwRI.”

Link Solar System Scope to its texture page, CC BY 4.0 to the license, and Pluto’s credit to the NASA source above. “Adapted” covers resizing, format conversion, and cloud alpha transformation. Documentation alone does not replace visible attribution.

## Rendering contract

Sphere maps use equirectangular coordinates. Sun, Earth day and Jupiter are 4096 × 2048; the other sphere and Earth auxiliary maps are 2048 × 1024. Each output uses genuine source resolution or a downsample, never an upscale. Despite the official `8k_` filenames, the current Sun and Jupiter downloads decode to 4096 × 2048; the manifest records actual source dimensions separately from names.

Color maps use WebP quality 92 and sRGB in the renderer. Venus uses its cloud-covered atmosphere rather than radar surface imagery. Earth day, night, clouds, normal and specular maps preserve aligned coordinates. The night map should illuminate only the dark side, not replace solar lighting.

`earth-normal.webp` and `earth-specular.webp` are lossless RGB WebP conversions of the official TIFF maps. Treat both as linear material data (`NoColorSpace` in Three.js), not sRGB color. The normal map encodes tangent-space normals; keep its contribution restrained. The specular map is an ocean/surface reflection mask: white indicates more specular water, dark indicates land. It is not a ready-to-use roughness map; if consumed as roughness, invert and remap its values in the material shader rather than assigning it directly.

`earth-clouds.webp` is RGBA: white RGB and original cloud luminance as alpha, including fully transparent pixels. There is no black background. Its geometry can rotate independently above Earth; no new cloud pattern was generated. WebP stores the alpha channel losslessly while compressing the RGB channels.

`saturn-rings.webp` retains original RGBA transparency and radial banding at 2048 × 125, downsampled from the official 8192 × 500 source using lossless WebP encoding. It is a horizontal radial profile, **left = inner, right = outer**, rather than a square disk or equirectangular map. Map RingGeometry UV.u from normalized radial distance and sample UV.v = 0.5; use a transparent material and disable ring depthWrite. Alpha is preserved, not replaced with an opaque gradient.

The reduced-motion and no-JavaScript Saturn fallback uses a concentric CSS radial gradient sampled from seventeen points of the original ring profile. This preserves its inner gap, band colors and alpha without stretching the horizontal image over a square. The animated Three.js renderer uses the full map.

Since the immersive scene revision (2026-10-12) the runtime decodes these files off the main thread and uploads them at the size each view needs: reading mode uses 2048 texels for the Sun, Earth and Jupiter on wide screens and 1024 elsewhere; the explorer re-decodes Earth and Jupiter at 4096 (2048 on narrow screens) and a few other maps at 2048, then returns to the reading sizes on close. The Milky Way, stars, belts, corona and granulation are procedural shaders, not image assets, so they add no files, credits or licenses.

## Delivery variants

Since 2026-10-13 smaller copies sit beside the reviewed originals as `<name>-<width>.webp`, so a view downloads only the detail it uploads. The loader fetches the smallest variant that covers the current upload size and requests a larger one only when the explorer or a wider layout needs it; originals are fetched only when the explorer uploads more than the reading size (Earth and Jupiter at 4096; Mars, Saturn, the Moon and the clouds at 2048 on wide screens). The 4096 Sun original is kept as the reviewed master but no current view requests it. Software renderers keep the reading sizes and never request the originals. Each variant is recorded in the manifest beside its original with dimensions, bytes, SHA-256 and encoding; the attribution and licenses above apply unchanged.

Variants were produced by an ignored helper in `.artifacts/solar-system/` with sharp 0.35 (libvips 8.18) Lanczos-3 resampling, shrink-on-load disabled, from the official downloads (source SHA-256 verified against the manifest), using the same encoding as their original: WebP quality 92 (effort 6) for color maps, lossless for the normal and specular data maps. The cloud variant is resampled from `earth-clouds.webp`, whose alpha is lossless and keeps white RGB; the normal and specular variants from their lossless originals. `saturn-rings.webp` (8.5 KB) has no variant.

- Reading sizes: 2048 for the Sun, Earth and Jupiter, 1024 for every 2048 map.
- Static-scene thumbnails: the CSS fallback shows half a map across each body (`background-size: 200%`), so a thumbnail needs twice the body's diameter in device pixels. The largest measured diameters (CSS px, 1280–3840 px wide desktops, 768/1024 px tablets and 360–412 px phones) were Sun 270 at 3840 × 2160 and 180 at 2560 × 1440, Jupiter 122, Saturn 121, Uranus 88, Neptune 73, Earth 69, Venus 62, Mars 54, Mercury 36, Moon 19 and Pluto 17. Widths were chosen to cover the 1920 × 1080 sizes at 3× density (and the larger desktops at their real density): Sun, Jupiter and Saturn use their 1024 reading maps; Uranus and Neptune 512; Earth, Venus and Mars 256; Mercury, Pluto and the Moon 128.

Map URLs carry `?v=` with the first 16 hexadecimal characters (64 bits) of the file's SHA-256; every page embeds one per published map, so the full digest would add markup to each route. They are served with `Cache-Control: public, max-age=31536000, immutable` only when the query equals the version of the file that build serves (`config/solar-textures.ts`); any other query, an unversioned path or the manifest keeps the default revalidating response. The production host must pass this header through unchanged.

| Variant | Dimensions | Bytes |
| --- | --- | ---: |
| `mercury-128.webp` | 128 × 64 | 2,352 |
| `mercury-1024.webp` | 1024 × 512 | 167,160 |
| `venus-256.webp` | 256 × 128 | 3,910 |
| `venus-1024.webp` | 1024 × 512 | 26,416 |
| `earth-256.webp` | 256 × 128 | 8,232 |
| `earth-1024.webp` | 1024 × 512 | 75,660 |
| `earth-2048.webp` | 2048 × 1024 | 241,236 |
| `earth-night-1024.webp` | 1024 × 512 | 32,390 |
| `earth-clouds-1024.webp` | 1024 × 512 | 352,986 |
| `mars-256.webp` | 256 × 128 | 9,920 |
| `mars-1024.webp` | 1024 × 512 | 121,494 |
| `jupiter-1024.webp` | 1024 × 512 | 85,944 |
| `jupiter-2048.webp` | 2048 × 1024 | 259,952 |
| `saturn-1024.webp` | 1024 × 512 | 22,952 |
| `uranus-512.webp` | 512 × 256 | 1,316 |
| `uranus-1024.webp` | 1024 × 512 | 4,304 |
| `neptune-512.webp` | 512 × 256 | 3,770 |
| `neptune-1024.webp` | 1024 × 512 | 10,964 |
| `pluto-128.webp` | 128 × 64 | 2,082 |
| `pluto-1024.webp` | 1024 × 512 | 87,086 |
| `sun-1024.webp` | 1024 × 512 | 147,732 |
| `sun-2048.webp` | 2048 × 1024 | 425,704 |
| `moon-128.webp` | 128 × 64 | 2,972 |
| `moon-1024.webp` | 1024 × 512 | 196,010 |
| `earth-normal-1024.webp` | 1024 × 512 | 65,736 |
| `earth-specular-1024.webp` | 1024 × 512 | 66,376 |

Variants add **2,424,656 bytes** to the repository; none is requested together with its original in reading mode.

Pluto is a dwarf planet, included as the ninth orbiting body in the requested composition. Decorative scales, speeds, spacing and orbital paths are not an astronomical simulation. Original map coverage and colors are preserved; no missing terrain was synthesized.

## Verification

The [manifest](../../public/images/solar-system/manifest.json) records official download URLs, source and output SHA-256, actual source and output dimensions, bytes, credits, licenses, color-space semantics, encoding and alpha ranges. All sixteen originals and twenty-six variants decode successfully; none exceeds its source resolution. Cloud and ring alpha spans zero to at least 200. No JPEG/PNG/TIFF originals are committed. Integration owns runtime loading, memory-aware texture sizing, browser rendering and the final site checks.

The full-resolution originals total **7,187,952 bytes (6.85 MiB)**, excluding the small manifest; below the 8 MiB high-quality asset budget. Browsers download only part of this set; the budget tests also cap the static-scene thumbnails (320 KiB) and the wide reading set (2.5 MiB). Runtime GPU memory depends on decoded texture dimensions, mipmaps and renderer sizing, not these compressed transfer sizes.

| Asset | Dimensions | Bytes | Alpha |
| --- | --- | ---: | --- |
| `mercury.webp` | 2048 × 1024 | 707,126 | No |
| `venus.webp` | 2048 × 1024 | 84,734 | No |
| `earth.webp` | 4096 × 2048 | 840,354 | No |
| `earth-night.webp` | 2048 × 1024 | 125,862 | No |
| `earth-clouds.webp` | 2048 × 1024 | 1,377,840 | Yes |
| `mars.webp` | 2048 × 1024 | 416,856 | No |
| `jupiter.webp` | 4096 × 2048 | 803,904 | No |
| `saturn.webp` | 2048 × 1024 | 73,286 | No |
| `saturn-rings.webp` | 2048 × 125 | 8,530 | Yes |
| `uranus.webp` | 2048 × 1024 | 13,292 | No |
| `neptune.webp` | 2048 × 1024 | 35,420 | No |
| `pluto.webp` | 2048 × 1024 | 304,436 | No |
| `sun.webp` | 4096 × 2048 | 1,118,534 | No |
| `moon.webp` | 2048 × 1024 | 863,172 | No |
| `earth-normal.webp` | 2048 × 1024 | 306,280 | No |
| `earth-specular.webp` | 2048 × 1024 | 108,326 | No |
