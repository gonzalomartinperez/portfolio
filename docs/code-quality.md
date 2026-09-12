# Readable code and useful documentation

This is the shared development and review standard for this repository. Prefer
code that communicates its intent; comments preserve information code cannot express.
It applies to application code, tests and scripts, not generated/vendor files.

## Design for the next reader

- Name values by domain meaning and include units when ambiguous (`timeoutMs`).
  Prefer a clear intermediate value to a dense expression or explanatory comment.
- Keep functions cohesive, control flow straightforward and side effects explicit.
  Use guard clauses when they reduce nesting; avoid clever one-liners.
- Extract a helper when it names a meaningful operation or supports actual reuse.
  Do not create wrappers, generic frameworks or layers just to shorten a function.
  A little duplication is preferable to coupling unrelated concepts prematurely.
- Use strict types and narrowing; validate external input at boundaries. Handle
  failures intentionally rather than swallowing errors or returning fake success.
- Preserve Next.js conventions and existing architecture. Do not import a style
  guide's ban on default exports into framework files that require them.
- Test observable behavior, including relevant failure cases. A test name should
  state the behavior; avoid commentary that narrates every assertion.

## Decide whether a comment belongs

First ask whether a better name, type, decomposition or test makes it unnecessary.
Then ask what a maintainer would lose if the comment disappeared.

| Keep when it adds information | Remove or rewrite |
| --- | --- |
| A non-obvious constraint, invariant, security boundary or tradeoff | A paraphrase of the next line |
| A subtle algorithm, regex or ordering requirement | Numbered narration of obvious code or decorative section banners |
| A compatibility workaround with evidence and a removal condition | Unsupported claims such as “secure”, “optimized” or “production-ready” |
| Caller-facing behavior not conveyed by a signature | JSDoc on every trivial helper, component or getter |
| Required license, tool directive or JavaScript type annotation | Commented-out code, change diaries or AI authorship narration |

Prefer a short comment above the affected block. Inline comments are acceptable
when that position genuinely clarifies a small, non-obvious detail; they are not
banned. Keep useful existing explanations until their purpose is understood.
Update comments with behavior. Put longer architectural decisions in `docs/`,
change history in Git, and unfinished work in a real issue or bounded TODO with
a concrete reason/removal condition. Never invent an issue ID or ticket URL.

## JSDoc and TypeScript

Use `/** ... */` for reusable API contracts that callers cannot infer: input units,
valid ranges, side effects, mutation, ordering, cancellation, errors or ownership.
Include `@param`, `@returns`, `@throws` or a small example only when it explains
something beyond the signature. Do not promise behavior the implementation and
tests do not support. An exported symbol alone does not require a doc block.

In `.ts` and `.tsx`, types belong in TypeScript, not duplicated `{Type}` JSDoc tags.
In `.js` and `.mjs`, JSDoc may provide actual type checking: preserve `@ts-check`
and useful `@type` annotations such as those in `next.config.mjs`. Compiler/linter
directives and legally required notices are not disposable prose. Never add broad
suppressions to make a change pass; any justified exception must remain narrow.

## Examples

Prefer the name over narration:

```ts
const timeoutMs = 5_000;
```

A real constraint can justify a comment (illustrative, not an existing API):

```ts
// The provider rejects timestamps with fractional seconds.
const timestamp = Math.floor(Date.now() / 1_000);
```

For a caller contract, document behavior rather than restating types:

```ts
/** Returns a new list sorted newest first; leaves the input unchanged. */
function sortByDate(items: readonly DatedItem[]): DatedItem[];
```

## Review and enforcement

Before handoff, inspect the diff for redundant comments, stale explanations,
unnecessary abstractions and documentation that duplicates the code. Refactor only
within task scope; do not run a repository-wide comment deletion or cleanup.
Review correctness and maintainability first. Separate concrete violations from
optional wording preferences and do not trade clarity for an arbitrary line limit.

Biome owns formatting and its configured lint rules; TypeScript owns type checking.
Human/agent review owns comment usefulness and design judgment. Do not add comment
quotas, mandatory documentation coverage or regex-based “clean code” gates.

## Basis and deliberate adaptations

Reviewed 2026-09-12. This is a local policy, not a claim of a universal 2026 standard.

- [Google code review guidance](https://google.github.io/eng-practices/review/reviewer/looking-for.html): readability, useful comments, proportionate tests and complexity review.
- [Google TypeScript guide](https://google.github.io/styleguide/tsguide.html): selective TypeScript/documentation guidance, not its full corporate conventions.
- [Microsoft documentation guidance](https://microsoft.github.io/code-with-engineering-playbook/documentation/guidance/code/): distinguish maintenance context from caller documentation.
- [TypeScript JSDoc reference](https://www.typescriptlang.org/docs/handbook/jsdoc-supported-types.html): retain meaningful JavaScript type annotations.

Existing Biome formatting and Next.js framework conventions take precedence over
external style preferences. No new formatter or documentation generator is needed.
