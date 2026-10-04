# Solar system texture assets

Reviewed on 2026-10-03. Runtime assets are local WebP files under `/images/solar-system/`; rendering needs no external image request. Original downloads and conversion helpers remain only in ignored `.artifacts/solar-system/`.

## Sources and reuse

Thirteen maps come directly from [Solar System Scope / INOVE](https://www.solarsystemscope.com/textures/) under [Creative Commons Attribution 4.0 International](https://creativecommons.org/licenses/by/4.0/). Adaptation and commercial reuse require attribution, a license link, and disclosure of changes. These are adapted maps based on NASA imagery, not a claim that the finished artwork is public domain. Its source describes color adjustments and estimated terrain in unmapped areas.

Pluto uses NASA’s [Pluto Global Color Map](https://science.nasa.gov/resource/pluto-global-color-map/), credited **NASA/JHUAPL/SwRI**, based on New Horizons observations. The source shows no copyright restriction notice. Reuse follows [NASA image and media guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/), with the published credit and no implied endorsement. It is not relicensed as CC BY. No NASA/JPL insignia is included.

## Visible credit for integration

The integrator must expose ordinary HTML credits with clickable source and license links. Short copy:

- EN: “Planet textures adapted from Solar System Scope (CC BY 4.0); Pluto: NASA/JHUAPL/SwRI.”
- ES: “Texturas planetarias adaptadas de Solar System Scope (CC BY 4.0); Plutón: NASA/JHUAPL/SwRI.”

Link Solar System Scope to its texture page, CC BY 4.0 to the license, and Pluto’s credit to the NASA source above. “Adapted” covers resizing, format conversion, and cloud alpha transformation. Documentation alone does not replace visible attribution.

## Rendering contract

Sphere maps use equirectangular coordinates, WebP quality 80, and 1024 × 512 or 512 × 256 resolution for small decorative bodies. Venus uses the cloud-covered atmosphere map rather than radar surface imagery. Earth day and night preserve aligned coordinates. Use sRGB for color maps; the optional night map should illuminate only the dark side.

`earth-clouds.webp` is RGBA: white RGB and original cloud luminance as alpha, including fully transparent pixels. There is no black background. Its geometry can rotate independently above Earth; no new cloud pattern was generated. Clouds, Mercury and Moon use 512 × 256 to bound transfer and decoding costs at their small display sizes.

`saturn-rings.webp` retains original RGBA transparency and radial banding at 1024 × 64. It is a horizontal radial profile, **left = inner, right = outer**, rather than a square disk or equirectangular map. Map RingGeometry UV.u from normalized radial distance and sample UV.v = 0.5; use a transparent material and disable ring depthWrite. Alpha is preserved, not replaced with an opaque gradient.

The reduced-motion and no-JavaScript Saturn fallback uses a concentric CSS radial gradient sampled from seventeen points of the original ring profile. This preserves its inner gap, band colors and alpha without stretching the horizontal image over a square. The animated Three.js renderer uses the full map.

Pluto is a dwarf planet, included as the ninth orbiting body in the requested composition. Decorative scales, speeds, spacing and orbital paths are not an astronomical simulation. Original map coverage and colors are preserved; no missing terrain was synthesized.

## Verification

The [manifest](../../public/images/solar-system/manifest.json) records official download URLs, source and output SHA-256, dimensions, bytes, credits, licenses and alpha ranges. All fourteen outputs decoded successfully and were reviewed together in an ignored contact sheet. Cloud and ring alpha spans zero to at least 200. No JPEG/PNG originals are committed. Integration owns runtime loading, browser rendering and the final site checks.

Total image transfer: **433,854 bytes (423.7 KiB)**, excluding the small manifest.

| Asset | Dimensions | Bytes | Alpha |
| --- | --- | ---: | --- |
| `mercury.webp` | 512 × 256 | 19,954 | No |
| `venus.webp` | 1024 × 512 | 11,510 | No |
| `earth.webp` | 1024 × 512 | 39,770 | No |
| `earth-night.webp` | 1024 × 512 | 15,388 | No |
| `earth-clouds.webp` | 512 × 256 | 93,320 | Yes |
| `mars.webp` | 1024 × 512 | 52,438 | No |
| `jupiter.webp` | 1024 × 512 | 35,552 | No |
| `saturn.webp` | 1024 × 512 | 8,362 | No |
| `saturn-rings.webp` | 1024 × 64 | 2,346 | Yes |
| `uranus.webp` | 1024 × 512 | 2,210 | No |
| `neptune.webp` | 1024 × 512 | 4,886 | No |
| `pluto.webp` | 1024 × 512 | 42,634 | No |
| `sun.webp` | 1024 × 512 | 77,234 | No |
| `moon.webp` | 512 × 256 | 28,250 | No |
