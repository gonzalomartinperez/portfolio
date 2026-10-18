# README diagram sources

[Portfolio overview](../../README.md#architecture-at-a-glance) · [Application architecture](../architecture.md) · [Design system](../design.md)

These first-party illustrations explain three different questions. They are conceptual
views of this repository, not UML deployment specifications, employer infrastructure
maps or evidence that an optional service is active.

| View | Question and layout | Editable source | Light / dark artwork |
| --- | --- | --- | --- |
| Application context | What does this site own, and where does it connect? Top-to-bottom layers separate reviewed inputs, application composition, deployment and an independently gated API integration. | [Mermaid](architecture-overview.mmd) | [Light](architecture-overview-light.svg) · [Dark](architecture-overview-dark.svg) |
| Solar rendering | How does the scene become ready while protecting reading? A top-to-bottom pipeline distinguishes preparation, independent mask input, the first-frame crossfade and quality feedback. | [Mermaid](solar-rendering.mmd) | [Light](solar-rendering-light.svg) · [Dark](solar-rendering-dark.svg) |
| Delivery and quality | How does reviewed code reach the site? Task and release pull requests share one build across eight browser groups and performance checks. Independent workflow, secret and quality jobs feed an explicit aggregate; the hosting contract keeps optional features off. | [Mermaid](delivery-flow.mmd) | [Light](delivery-flow-light.svg) · [Dark](delivery-flow-dark.svg) |

## Reading the diagrams

Solid arrows indicate a dependency, delivery output or rendering input, according to
the view. They do not imply that every connected component is a network service.
Numbered cards provide a reading order; they are not runtime identifiers or timing
measurements. Group outlines describe responsibility, not security certification.

In the application view, dashed connections identify the optional assistant path;
its build gate remains off. The App Router's separate deployment connection leads
to managed Hostinger hosting, while the assistant API remains outside that deployment.
The site has no application database or model-provider key. Independently gated
product analytics and its noncredentialed transport are documented in the
[analytics boundary](../architecture.md#minimal-product-analytics).

In the solar view, the dashed connection identifies the crossfade from the complete
server-rendered scene once the first render is ready. Texture loading and pre-frame
preparation feed the render pass separately from the reading mask. Quality adaptation
feeds back into the same renderer. A fallback remains available under reduced motion,
unavailable WebGL, texture failure or context loss; hidden tabs suspend rendering.
The [solar specification](../specs/immersive-solar-scene.md) holds the detailed behavior.

## Delivery dependency graph

The delivery view follows `.github/workflows/ci.yml`: **Workflow validation**,
**Secret scan** and **Quality (development)** start independently. Quality unlocks
**Build** and **Hosting contract**; Build unlocks **Browser tests** (eight groups)
and **Performance checks** (bundle budgets and server-rendered routes). The build
archive is normalized and scanned before transfer, then its provenance is verified
before extraction and local restoration. It is a synthetic-enabled CI artifact,
not a production deployment or an activation decision. The separate hosting build
keeps assistant and analytics disabled and checks the observed GLIBC 2.28 baseline.

Solid arrows within the CI panel are job dependencies. The dashed collector on the
left represents seven separate `needs` edges into **Required checks**, including
the upstream jobs as well as the leaf jobs. It is not a sequential job chain.
The aggregate always runs and requires every result to be `success`; skipped,
cancelled or failed prerequisites cannot satisfy it. The temporary **Quality checks**
job only forwards that aggregate result under the legacy check name; it is omitted
from the artwork rather than drawn as another validation layer.

Branch arrows describe the protected task → develop → release → main workflow and
native Hostinger delivery, not CI jobs or automatic permission to deploy. Nightly
has its own frozen-candidate run and aggregate; it is not a required pull-request
prerequisite and is not included in this Core CI graph. Source integration never
activates the assistant.

## Editing and review

Center each README illustration with `<p align="center">` around its existing
`<picture>` and meaningful fallback `<img>`. Keep captions and Markdown source
links outside that HTML block. Link the editable Mermaid source rather than
rendering a second, uncentered copy of the same graph. Do not depend on custom CSS
classes that GitHub may strip. This is README presentation, not a website change.

The `.mmd` files retain the compact semantic graph; the SVGs are hand-editable,
publication-ready views of that graph. Keep their nodes, connections and conditional
meaning synchronized when changing architecture. The SVG geometry is intentionally
curated rather than a promise of byte-for-byte Mermaid generation. Do not introduce
an application dependency or external rendering service to update documentation.

Use top-to-bottom layouts for layers and phases, left-to-right for a short pipeline,
and UML sequence diagrams when ordering interactions is the actual question. Preserve
complete semantics without forcing every view into the same orientation or notation.
Avoid very wide posters: the README should still establish hierarchy on a phone,
with native-size SVG links and nearby prose available for the finer detail.

The palette follows the portfolio's blue/cyan identity over neutral surfaces. Both
variants use system typography, 25 px card titles and 20 px descriptions at a 640 px
native width. Text uses explicit lines instead of font-dependent wrapping. Color
reinforces labels; it does not encode the only distinction between service ownership,
optional paths or fallback behavior. Each SVG includes a title and a prose description;
the README also provides image alternatives and surrounding context.

Keep all artwork self-contained: no scripts, foreign objects, remote images, fonts,
links or icon packs inside an SVG. The light and dark variants must preserve geometry
and wording. Review rendered output at native size and at a narrow mobile width in
both themes; inspect clipping, card/arrow intersections, readable line breaks and the
corresponding Mermaid source. Source validation and visual review do not certify
universal accessibility or the deployed GitHub renderer's behavior.
