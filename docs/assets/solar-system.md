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

Pluto is a dwarf planet, included as the ninth orbiting body in the requested composition. Decorative scales, speeds, spacing and orbital paths are not an astronomical simulation. Original map coverage and colors are preserved; no missing terrain was synthesized.

## Verification

The [manifest](../../public/images/solar-system/manifest.json) records official download URLs, source and output SHA-256, actual source and output dimensions, bytes, credits, licenses, color-space semantics, encoding and alpha ranges. All sixteen outputs decode successfully; none exceeds its source resolution. Cloud and ring alpha spans zero to at least 200. No JPEG/PNG/TIFF originals are committed. Integration owns runtime loading, memory-aware texture sizing, browser rendering and the final site checks.

Total image transfer: **7,187,952 bytes (6.85 MiB)**, excluding the small manifest; below the 8 MiB high-quality asset budget. Runtime GPU memory depends on decoded texture dimensions, mipmaps and renderer sizing, not these compressed transfer sizes.

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
