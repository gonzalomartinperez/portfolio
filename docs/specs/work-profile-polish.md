# Work profile polish

Status: in-progress

## Outcome

Make each role easier to scan for product and AI engineering impact while keeping
approved claims, qualifications, attribution, and technical detail intact.

## Acceptance

- Keep the two strategically ordered highlights visible for each role.
- Show outcome figures and their qualifiers before detailed contributions and
  architecture diagrams, so readers can assess impact before implementation.
- Keep team or collective attribution beside its figures rather than detached
  below a diagram. Do not change metrics, attribution or experience content.
- Group outcome figures in a responsive panel using the existing theme tokens;
  preserve contrast, wrapping, and the shared metric component.
- Mark independent production work with the existing bilingual production badge,
  alongside the three employer entries already confirmed in production.
- Keep native disclosures, keyboard behavior, and touch targets at least 44 px
  high. Preserve public links, company marks, stack tags and React Flow diagrams.

- Keep long copy and client actions within 320 px layouts at 200% text size.
- Teamcubation connects the portal BFF to its AI harness, and S3 → SQS →
  Python/FastAPI Lambda to both Java and Node.js services and their databases.
  No database engine or unconfirmed dependency is implied.
- React Flow permits native page gestures over both the pane and node labels,
  with browser pinch zoom preserved and explicit 44 px zoom/fit controls.
- Node details reuse approved labels in a contextual panel with a polite live
  announcement. Opening keeps node focus; Escape and its 44 px close action
  retain the selected node and page position without a modal focus trap.
- Position node details in the visible intersection of canvas and viewport,
  clear of the header and diagram controls; do not move the page to reveal them.
- Opening and closing details preserves measured graph nodes, so temporary
  remeasurement does not hide a focused button.
- CV previews retain visible, indented achievement bullets in both locales.

## Verification

Production checks pass for both locales and themes on desktop and mobile: the
professional-profile suite covers production status, qualified metrics before
diagrams, 44 px disclosures, visible CV bullets and Work at 320 px / 200% text.
Architecture checks verify node/edge topology and native gestures over panes and
labels, zoom/fit controls and accessible contextual node details. The click regression first
prepares visibility so test automation scroll is not mistaken for application
scroll. Final integrated CI remains the responsibility of the integrating task.
