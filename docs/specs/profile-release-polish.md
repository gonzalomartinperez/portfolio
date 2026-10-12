# Profile release polish

Status: done

## Scope

Keep the public website, reviewed CVs, GitHub profile and manually applied LinkedIn packet consistent. The website identity is Software Engineer | AI Engineer | Product Engineer; the formal current job remains AI Engineer at Rampy.

## Acceptance

- Header, footer, profile metadata and social images use the shared three-role identity without horizontal overflow in either language or theme.
- Employer names link to the official Rampy, Teamcubation and Cooperativa Obrera sites. Web links include a new-tab notice and safe relationship attributes; reviewed PDF company names retain viewer-controlled hyperlinks.
- Hero and solar surfaces show no manual pause controls. Reduced motion, hidden-tab suspension, WebGL recovery and scoped assistant motion holds remain functional; carousel controls remain available.
- Reviewed CV source, public projection, document manifest and served production-build downloads agree. Public deployment verification follows promotion to main.
- Documentation describes the real rendering, assistant and approved-document boundaries with readable diagrams.
- The disabled assistant keeps its composer and recovery controls usable at 320 px and 200% text size. Portrait mobile omits a redundant maximize action; desktop and wide landscape preserve meaningful expansion, draft and focus.
- The assistant stays disabled in production. The existing v1.0.0 tag remains unchanged.

## Verification

Verified 2026-10-12. The complete required CI passed for implementation head `55e851b0f40021676be1b1cdad629d63b1b57cf1` ([run](https://github.com/gonzalomartinperez/portfolio/actions/runs/38290929844)): development quality, all eight isolated browser shards, Hostinger compatibility and branch policy.

Local verification covered the full repository/content/assistant/document/lint/build checks, 20 rendered assertions, 128 route/locale/theme/viewport combinations at 320/390/1024/1440 px, official employer links across EN/ES and desktop/mobile themes, reviewed CV export parity, and visual review of both social images. Four portfolio documentation diagrams and two career-system diagrams were rendered locally and reviewed in the relevant themes.

The first integrated run exposed an incorrect assistant test expectation under reduced motion. The corrected test requires the background to remain static after minimizing; all browser projects passed without changing deadlines or product behavior. Earlier local WebGL initialization stalls occurred during another repository's concurrent browser run; the isolated CI supplies the completed engine coverage.

The final assistant refinement also passed the complete local quality checks. Its browser review covers readable recovery notices, aligned 44 px toolbar actions and actual expansion geometry; local mock previews are clearly labeled and do not claim production API responses. Required CI is repeated on the final integrated head.

Production publishing and live document-byte verification are recorded in the release pull request. This specification records implementation acceptance; it does not claim an enabled assistant or a deployed assistant API.
