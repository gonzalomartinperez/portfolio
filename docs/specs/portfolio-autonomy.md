# Portfolio autonomy and motion stability

Status: done

## Approved outcome

Keep the existing identity, bilingual routes, themes, portrait and hosting. Make
the portfolio self-contained: eight routes per locale, public CV exports, local
academic evidence and the 43 previously reviewed Filomena images. Preserve the
historical external pages without requiring them to understand the portfolio.

Baseline: `a305b60`. Integration remains task PRs → develop → main; account-side
protections and the Hostinger / Cloudflare arrangement are unchanged.

## Contracts and ownership

- Motion lane: hero implementation and focused scene stability tests. One bounded,
  time-independent visual progress drives particles, camera, avatar and logos;
  deterministic transform-based trajectories must work in either direction.
- Academic lane: one course catalogue with stable IDs, official Spanish names,
  editorial English translations, placement and documented outcomes. Highlighted
  lists reference IDs. Only the expressly approved transcript and university plan
  join the existing public certificates.
- Editorial lane: evidenced technology catalogue and localized professional copy;
  applied AI first, followed by the software engineering foundations. Preserve
  developing expertise labels and use contextual evidence, not proficiency scores.
- Coordinator: public CV export contract, routes/navigation, favicon framing,
  transitions, CI, dependencies and integration. A public export contains only
  explicitly allowed fields; public builds never access private sources.

Each lane uses a registered isolated worktree. Existing private repository work is
not part of this release. No external professional platform is edited.

## Acceptance

1. Twenty rapid scroll reversals, deterministic progress checkpoints in both
   directions, no accumulating listeners, triggers or cloned marks.
2. Shared geometry for sticky viewport and scroll travel; one animation loop,
   offscreen/hidden/accessible pause, resource cleanup and static fallbacks.
3. Passive mobile interaction that distinguishes taps from navigation gestures;
   no sensors, scroll interception or artificial scrolling.
4. Sixteen localized routes, both themes, keyboard navigation, mobile, 200% zoom,
   history, anchors, no JavaScript and reduced-motion behavior.
5. Official course names and placements reconciled to ISI 2012 version 1; transcript
   issue date and limited validity stated accurately. Missing outcomes stay missing.
6. Local documents have declared formats, sizes and hashes. No embedded viewers or
   automatic PDF downloads. Public CV derives from the approved editorial source.
7. Favicon has a larger optical footprint at 16/32 pixels without changing the
   owner-selected face. Check transparent edges and both theme backgrounds.
8. One modern build and one modern test-server lifecycle, separate GLIBC 2.28 build
   and smoke, unchanged required check names and budgets. No Biome in hosting build.
9. Compare measurements in the same environment; report physical-device and field
   metrics as unverified when only browser emulation/laboratory data is available.

## Verification record

Implementation and local acceptance are recorded in the
[verification log](../verification/portfolio-autonomy.md); the release PR records
required GitHub checks and subsequent production verification. The
[motion research](../research/motion-performance.md) explains the selected optimizations.
Physical-device frame targets and field Web Vitals remain explicitly unverified;
they are not implied by implementation completion or automated browser coverage.
