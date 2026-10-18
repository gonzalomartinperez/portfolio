# Dependency compatibility review — 2026-10-18

This review covers two proposals created after the initial launch release. It does
not authorize unrelated upgrades, feature activation or infrastructure deployment.

## Contract generator: retain its compatible compiler

Dependabot [PR #178](https://github.com/gonzalomartinperez/portfolio/pull/178),
head `8f880d73f0f1d70cca51433f87223d51781d0142`, proposes TypeScript 7.0.2 for the
isolated `tools/api-contract` package. Its frozen installation failed with `ERESOLVE`
in [CI 39175343085](https://github.com/gonzalomartinperez/portfolio/actions/runs/39175343085)
before generation: `openapi-typescript` 7.13.0 requires TypeScript `^5.x`.
The [upstream package at that exact tag](https://github.com/openapi-ts/openapi-typescript/blob/openapi-typescript@7.13.0/packages/openapi-typescript/package.json)
declares that peer requirement. Microsoft's [compiler API guide](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API)
also distinguishes the JavaScript API from the native compiler's replacement API.

Reject this incompatible compiler-only proposal. Keep the generator's TypeScript
5.9.3 baseline and the application's independently verified TypeScript 7.0.2 baseline.
Do not use force, ignored peers or weakened generation checks. Dependabot continues
monitoring the generator and compatible compiler updates; compiler majors require
a coordinated generator review before re-enabling those proposals. Reconsider when
the selected generator declares support and frozen generation preserves the reviewed
schema/type contract, with normal quality and hosting checks.

## Accessibility engine: adopt with the actual UI repair

Dependabot [PR #179](https://github.com/gonzalomartinperez/portfolio/pull/179),
head `0be9f49730b06a65c06c20ed08f0ccb77cae13d8`, proposes `@axe-core/playwright`
4.14.0 and its matching `axe-core`. The [official release](https://github.com/dequelabs/axe-core/releases/tag/v4.14.0)
enables `label-content-name-mismatch` by default. The initial
[CI 39175364389](https://github.com/gonzalomartinperez/portfolio/actions/runs/39175364389)
passed quality, both builds and performance, but four browser groups failed the
same education-page accessibility assertion across both languages and device sizes.

The two academic-document links display “Open document” or “Abrir documento”,
while their accessible names previously omitted “document” or “documento”. Use the
same full localized action label for visible text and the accessible-name prefix,
followed by the document title. Keep the layout, download behavior and strict Axe
assertions unchanged. An explicit browser assertion now protects that accessible
name alongside the existing both-theme Axe checks.

## Verification

The original failing runs remain evidence. The combined candidate requires frozen
installation, dependency-tree and audit checks, unchanged contract regeneration,
the full local check, focused education browser coverage, and all existing protected
quality, hosting, browser and performance gates. Record actual results in the
delivery PR; this source review is not a passing-test or measured-speedup claim.
