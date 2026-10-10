# Route theme audit readiness

## Observed failure

Release PR #102 at `524af79` failed the required flaky-test gate in
[CI run 38018714318, browser shard 3](https://github.com/gonzalomartinperez/portfolio/actions/runs/38018714318/job/114114914956).
The desktop English About audit failed once and passed on retry; both education
audits passed. The failing target was the outline Contact action near the end of
the About page.

The retained trace records the dark action as `#e8edf4` on `#000000`, contrast
17.85:1. After switching the same document to light, Axe measured the action as
`#0f141b` on `#000000`, contrast 1.13:1, and identified `body` as the background
node. The light audit began approximately 168 ms after the theme attribute changed.
The footer also retained dark colors in that audit. The stylesheet defines the
light body background as `#fafafb`; neither action nor body has a color transition.

The previous readiness check covered academic document cards only, so it checked
no surfaces on About. Two animation frames alone did not establish that the
backdrop used for contrast had resolved. The trace records Axe's measurements,
not independent computed-style telemetry, so it does not establish whether the
mixed values originated in browser style invalidation or Axe's measurement.

## Correction and acceptance

Before each route audit, check the actual body background and inherited text,
default card backgrounds and text, and primary-text actions inside `main` against
the root's resolved theme tokens. Then await the existing two animation frames.
Reading the affected backdrop and foreground also makes an unresolved theme fail
the readiness assertion instead of proceeding on an unrelated empty collection.
Education retains its explicit two-document-card assertion.

Each route still switches dark to light on the same page and receives the full
WCAG 2 A/AA and WCAG 2.1 AA Axe audit. Graphics, motion preferences, test and
assertion timeouts, retries, overflow checks, console-error checks, and the
failure-on-flaky-tests gate are unchanged. No product palette is modified.

## Verification

- `npm ci --no-audit --no-fund` and `npm run check` passed using Node.js 24.21.0.
- The production build kept the assistant disabled by default.
- `CI=true npx playwright test tests/browser/routes.spec.ts --project=desktop
  --project=mobile --grep 'is accessible, responsive and complete in both themes'`
  passed all 32 cases on their first attempt in 9.2 minutes: all eight routes in
  both languages and both viewports, with 64 dark/light Axe audits in total.
  The managed loopback server used isolated ports 3190/3191 and one browser worker;
  normal graphics and the committed configuration were retained.

Required GitHub checks still govern integration. Physical device and screen-reader
testing are outside this test-synchronization change.
