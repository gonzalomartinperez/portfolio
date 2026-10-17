# README gallery

Screenshots of the public production site used in the repository [README](../../README.md).
They show only content already published on the site; the assistant is disabled in the
captured build.

Regenerate them from a production build with a hardware GPU:

```sh
npm run build
npm run start
# in another shell
node scripts/capture-gallery.mjs
```

[`capture-gallery.mjs`](../../scripts/capture-gallery.mjs) renders desktop shots at
1440 × 900 CSS px with a device pixel ratio of 2 and mobile shots with Playwright's Pixel 7
profile, then has Chromium downscale them with high-quality smoothing and encode WebP at
quality 0.86 (1920 px wide for desktop, 780 px for mobile). The hero is frozen with its
`sceneProgress` parameter; the solar scene runs normally, so each capture is one frame of a
continuous animation. Captured on 2026-10-13 from `develop` during the preparation
cohort originally labeled `v1.1.0`. The [release history](../release-history.md#historical-source-anchors)
preserves that label's original source anchor. Relabeling a later cut does not
regenerate these captures or transfer their verification to the newer source.
