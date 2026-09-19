# Owned shadcn/ui primitives

Imported patterns reviewed on 2026-09-19 from the official
[Radix Nova registry](https://ui.shadcn.com/r/styles/radix-nova/button.json).
Source: [shadcn-ui/ui](https://github.com/shadcn-ui/ui), MIT licensed.

The local components retain the source-owned shadcn composition: variants,
class merging, semantic native elements and Radix primitives for Slot and Dialog.
They are intentionally adapted to this portfolio's tokens, larger touch targets,
neutral bilingual labels, server rendering and existing page geometry. There is
no claim that these are byte-identical registry outputs.

`components.json` declares the supported Radix Nova flavor. Future CLI additions
must be reviewed rather than overwriting local behavior blindly. Imports use
individual Radix packages, and the local `cn` helper uses clsx and tailwind-merge.
No full component registry, paid block collection or alternate animation engine
is installed. Tailwind utilities intentionally omit Preflight to preserve the
existing reset and the unaffected 3D scene.

## Upstream license

Copyright (c) 2023 shadcn

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
