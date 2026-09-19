# Owned UI primitives without a visual reset

Status: in-progress. Owner-approved expansion on 2026-09-19.

## Outcome

Migrate reusable interface components to locally owned shadcn/ui source while
preserving the current identity, content, responsive geometry, themes and 3D scene.
This is a component-system migration, not a template replacement. No MUI, paid
blocks, analytics, account configuration or new business features are included.

## Decisions

- Use the supported Radix flavor of shadcn/ui, Tailwind 4 utilities and local
  source in `src/components/ui/`. Keep server-safe variants for semantic links.
- Bridge semantic UI colors to existing tokens and `data-theme`; preserve dark
  default, theme persistence and the pre-paint script. Do not apply a second reset.
- Keep CSS Modules for page geometry, brand presentation and motion. Tailwind is
  the primitive styling layer, not a mandate to rewrite working custom layouts.
- Keep native details for no-JavaScript academic and work disclosures. Native
  Select is a supported shadcn component and preserves mobile platform behavior.
- Use a Radix Dialog for the gallery with direct image links as the no-JS fallback.
  Do not add charts without a meaningful data question or simulated loading delays.
- Keep Three.js/GSAP, particle geometry, scroll choreography and motion controls
  independent. Recheck them after global styling changes anyway.

## Acceptance

1. Shared buttons, linked actions, cards, badges, inputs, selects and dialog use
   owned primitives; navigation remains ordinary semantic links.
2. Both locales and themes retain the current visual direction; no layout shift,
   clipped content, reduced hit targets or horizontal overflow at 320–1920 px.
3. Keyboard, focus restoration, Escape, modified image-link clicks and native
   select behavior remain usable; academic disclosures work without JavaScript.
4. Existing scene and non-scene budgets remain enforced; no new dependency is
   pulled into the scene only to implement interface controls.
5. Pinned dependencies pass installation, audit, modern production checks and
   the independent Hostinger GLIBC 2.28 build before protected PR promotion.
6. README, skills and design documentation describe the implemented architecture,
   approved exceptions and tests. Do not claim a library guarantees accessibility.

## Execution and ownership

The coordinator owns dependencies, configuration, UI primitives, tokens and
integration. Independent worktrees migrate interactive components and server
page composition after these contracts are committed. Each lane retains the
other lane's work and records checks; only the coordinator handles PR promotion.

## Sources

- [Manual installation](https://ui.shadcn.com/docs/installation/manual)
- [Component configuration](https://ui.shadcn.com/docs/components-json)
- [Supported primitive choices](https://ui.shadcn.com/docs/changelog/2026-07-base-ui-default)
- [Button semantics](https://ui.shadcn.com/docs/components/base/button)

Checked 2026-09-19. The current default is Base UI; Radix remains an explicit
supported choice. This project selects it for focused Slot and Dialog composition,
not because the default is unsuitable or because all projects need the same base.
