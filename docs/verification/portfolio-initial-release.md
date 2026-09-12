# Verification — portfolio initial release

Records what was actually checked for
[the initial release](../specs/portfolio-initial-release.md), on **2026-09-12**, on the task
branch `feat/portfolio-initial-release`.

Conditions: Windows 11, Node 24.19.0, npm 11.19.0, `next@16.3.5` production build
(`next build --webpack`) served by `next start` on loopback. Browser checks drove headless
Chrome over the DevTools Protocol with SwiftShader software rendering — that is enough to
exercise the WebGL path and to compare rendered frames, but it is **not** a measurement of
performance on real hardware.

## Automated checks

| Command | Result |
| --- | --- |
| `npm run test:repository` | Pass — UTF-8, Markdown links, skill adapters, Next/SWC lockfile alignment |
| `npm run test:content` | Pass — 13 content invariants |
| `npm run lint` | Pass — Biome, 0 errors |
| `npm run build` | Pass — 21 routes, all prerendered static |
| `npm run test:budget` | Pass — 7 budgets |
| `npm run test:rendered` | Pass — 14 integration tests over the production server |
| `npm run test:smoke` | Pass — HTML, title, `main` landmark, 404 |

## Criteria

| ID | Result | Evidence |
| --- | --- | --- |
| AC-1 | Verified by review | Every claim traced to the private evidence map before writing; `test:content` blocks prohibited claims |
| AC-2 | Pass | `test:content` asserts Filomena names the three-person team in both locales; product figures sit in `context`, personal work in `contributions` |
| AC-3 | Pass | `test:content` requires a `qualifier` on every `Metric` and asserts the 70% figure is marked a client estimate |
| AC-4 | Pass | `test:content` forbids Senior/Tech Lead/Staff/Architect, English above B2, DevOps ownership, "award-winning" |
| AC-5 | Pass | `test:content` and `test:rendered` both reject local paths, private-source references and the phone number |
| AC-6 | Pass | 14 routes return 200 in both languages; each was requested directly, not navigated to |
| AC-7 | Pass | Unknown path returns 404 **with** the shell. This initially failed — removing the root layout left the 404 bare — and is now a root `not-found.tsx` rendering the full document |
| AC-8 | Pass | 16 distinct internal hrefs crawled from every route, all resolve. External evidence links were fetched during research, not on every run |
| AC-9 | Pass | `sitemap.xml` lists all 14 localised URLs with `hreflang` alternates; `robots.txt` allows crawling and names the sitemap |
| AC-10 | Pass | Exactly one `h1` per route, no skipped heading levels, in both languages |
| AC-11 | Partial | Skip link present and first in tab order on every route; the pause control is focusable and operable by keyboard. A full manual tab-through with a screen reader was **not** performed |
| AC-12 | Pass | Contrast computed from the tokens: dark ≥5.4:1 for body text, light ≥5.4:1; `--line-control` 3.4:1 dark and 3.0:1 light |
| AC-13 | Pass | Visible pause control present; clicking it freezes the field (screenshot hashes identical over 1.2 s) and resuming animates again. Under `prefers-reduced-motion: reduce` the engine is never created and no control is shown |
| AC-14 | Pass | Canvas is `aria-hidden="true"` with no `tabindex`; the still SVG likewise |
| AC-15 | Pass | `test:rendered` asserts positioning, actions and evidence links are present in server HTML; the language switcher is real links |
| AC-16 | Pass | Hero heading and portrait are server-rendered; the field mounts afterwards over a server-rendered still |
| AC-17 | Pass | The stage reserves a 1:1 box with `contain: layout paint` before the canvas mounts |
| AC-18 | Pass | Frames freeze on `visibilitychange` with `document.hidden` true; `IntersectionObserver` handles off-screen; disposal deletes buffers, program and VAO, cancels the frame and removes every listener |
| AC-19 | Pass by construction and review | `createFieldEngine` returns `null` on a missing context or failed link, leaving the still visible; `webglcontextlost` calls `preventDefault()` and `webglcontextrestored` rebuilds. **Context loss was not forced in a browser** — see limitations |
| AC-20 | Pass | Device pixel ratio capped at 2, and 1.5 below 640 px; 9,000 points on desktop, 3,500 on small viewports |
| AC-21 | Pass | Hero chunk measures **4.0 KB gzipped** against a 30 KB budget; enforced by `test:budget` |
| AC-22 | Pass | No horizontal overflow at 320, 390, 768 or 1440 px; `documentElement.scrollWidth` equals `clientWidth` at every width |
| AC-23 | Pass by construction | Navigation links are 2.25 rem tall, buttons 2.75 rem, the theme toggle and each language option 2.25 rem |

## Themes and languages

- An explicit `light` choice resolves to `data-theme="light"` before first paint, with
  `body` background `rgb(250, 250, 251)`, `--field-near` `#0a6e9b` and `--field-additive` `0`.
- An explicit `dark` choice resolves to `#000000`.
- The hero field re-reads its palette when the theme changes, and switches from additive to
  alpha blending on light so the cloud does not wash out.
- Both language trees render with the correct `<html lang>`, and each page carries `en`, `es`
  and `x-default` alternates plus its own canonical URL.

## Defects found and fixed during verification

1. **Canvas stayed at its default 300×150 backing size.** The stylesheet selector was
   `.layer canvas`, but the canvas *is* the `.layer` element. Found by looking at a screenshot.
2. **The 404 page lost the site shell** when the root layout was replaced by two per-language
   root layouts. Found by `test:rendered`, fixed with a root `not-found.tsx`.
3. **The hero field was far too faint** after the shell rewrite — point size had fallen below a
   pixel. Found by screenshot, corrected by raising point scale and alpha.
4. **"five universities" overstated the Filomena deployment**: one of the five institutions is
   not a university. Corrected to "institutions" in both locales.
5. **The Spanish site linked English evidence.** Both Notion write-ups exist in Spanish; the
   Spanish content now links them, and `test:content` guards it.

Two earlier "failures" were faults in the checks themselves, not the site, and are recorded so
the results are not overstated: a screenshot taken without device emulation appeared to show
mobile overflow, and `toDataURL()` on a WebGL canvas without `preserveDrawingBuffer` returned
stale data, making a frame comparison meaningless. Both were replaced with sounder methods.

## Limitations

- No screen-reader pass. Semantics were verified structurally, which is not the same thing.
- No real-device or real-network measurement, and no field data. The budgets above are transfer
  sizes, not Core Web Vitals results.
- WebGL context loss was reasoned about and implemented to the specification, but not forced
  through `WEBGL_lose_context` in a browser.
- Rendering was verified under SwiftShader, not on a GPU.
- External evidence links are not re-checked by any automated run.
- CI passing proves neither accessibility nor a successful deployment. Hostinger's deployed
  commit must be confirmed separately in hPanel.
