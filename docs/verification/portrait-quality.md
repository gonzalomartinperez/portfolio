# Portrait resolution

The 720 × 720 WebP derivative was replaced with an AVIF encoded directly from the
approved 1254 × 1254 transparent original, without resizing, sharpening or generative
retouching. The source remains unchanged in the private asset archive.

- AVIF quality 65, effort 6, 4:4:4 chroma; 74,701 bytes.
- Alpha preserved; no EXIF or XMP embedded.
- The existing 80 KiB transfer budget remains enforced.
- Portrait frames are capped at 25rem to avoid oversized presentation on tablets.
- Browser regression checks compare decoded width against rendered width × device
  pixel ratio on the configured desktop and mobile projects, in both themes.

This restores available source detail; it does not claim to recover detail absent
from the original or guarantee pixel density at arbitrary browser zoom levels.
The previous derivative remains recoverable through Git history.
