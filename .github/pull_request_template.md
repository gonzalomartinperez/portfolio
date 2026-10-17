## Problem and result

Describe the concrete problem and resulting behavior. Include a short before/after
example when useful; write for a reviewer who has not seen the conversation.

## Scope and boundaries

Link the issue, task or acceptance specification. Identify changed module or API
boundaries, affected locales and any cross-owner handoff. For a small change, keep
this brief. Do not paste private discussions, keys or conversations.

## Validation

- [ ] Task PR targets `develop`, or release PR is same-repository `develop` into `main`.
- [ ] Relevant local checks pass; list commands and results below.
- [ ] Architecture rules and documented contracts remain satisfied.
- [ ] Application changes pass `npm run check` and relevant production verification.
- [ ] UI changes were checked on mobile and desktop, including relevant locales,
      themes, keyboard interactions and failure states; or this is not a UI change.
- [ ] The diff contains no secrets, private documents, generated builds or unrelated work.
- [ ] Documentation follows the final behavior; code follows `docs/code-quality.md`.

Record the tested source revision, runtime, commands, results and meaningful limits.
For documentation-only work, say which repository/link checks ran; do not imply
application tests ran. Required CI remains mandatory before integration.

## Release evidence and recovery

For a release or operationally relevant change, state the intended deployment and
safe recovery path. Distinguish required CI success from observed Hostinger
publication. Leave assistant activation and infrastructure unchanged unless
explicitly authorized. Mark this section not applicable when appropriate.
