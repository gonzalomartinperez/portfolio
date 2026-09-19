# Company and client marks

Retrieved from public official websites on 2026-09-19. These local assets identify
the organizations referenced by the portfolio; they do not imply endorsement.
The owner approved displaying these organizations and the named client. That is
not a trademark license from the organizations. Their marks remain their property;
no redistribution or reuse license is asserted by this repository.

## Provenance and display

| Organization | Official website | Original asset | Local PNG | Dimensions |
| --- | --- | --- | --- | --- |
| Rampy | [Product website](https://rampyapp.com/) | [Official light-theme favicon](https://framerusercontent.com/images/E8BsdeiK3nlRc8LraBXg5L0lfYE.png) | [rampy.png](../../public/images/companies/rampy.png) | 233 × 256 |
| Teamcubation | [Company website](https://teamcubation.com/) | [Official symbol](https://teamcubation.com/isotipo.svg) | [teamcubation.png](../../public/images/companies/teamcubation.png) | 212 × 160 |
| Cooperativa Obrera | [Institutional website](https://cooperativaobrera.coop/) | [Official favicon](https://cooperativaobrera.coop/images/favicon.webp) | [cooperativa-obrera.png](../../public/images/companies/cooperativa-obrera.png) | 48 × 48 |
| Pequeverso | [Client website](https://pequeverso.com/) | [Official touch icon](https://pequeverso.com/apple-touch-icon.png) | [pequeverso.png](../../public/images/companies/pequeverso.png) | 180 × 180 |

`rampyapp.com` returned HTTP 200 after redirecting to `https://www.getrampy.com/`.
The Framer asset is linked as the light-theme favicon by that official homepage,
not sourced from an unrelated image search. The Teamcubation vector source is
preserved as [teamcubation.svg](../../public/images/companies/teamcubation.svg).

PNG conversion uses Sharp without recoloring or distortion. Raster assets are
bounded to 256 pixels without enlargement; the Teamcubation SVG was rasterized at
288 DPI. PNG conversion strips source metadata. No full logo library or runtime
CDN dependency is introduced.

Visual inspection confirmed the magenta Rampy mark, orange Teamcubation symbol,
blue/red Cooperativa symbol and blue Pequeverso tile. Preserve their original
colors and aspect ratios with `object-fit: contain`; do not apply monochrome
filters. Use a restrained neutral backing surface where needed on either theme.
The Cooperativa raster is only 48 pixels: keep its displayed size at or below
48 CSS pixels; it is not a high-resolution illustration. Use the adjacent company
name as the accessible label and empty image alt text when it is redundant.

## SHA-256

### Owner-provided alternatives

On 2026-09-19 the owner supplied six 100 × 100 JPEGs. The original files remain
archived privately; only two selected assets are included here. Neither contains
EXIF or ICC metadata. Their download origins and redistribution licenses were not
provided; no additional rights are asserted. They are displayed at 40 CSS pixels
without enlargement or AI reconstruction.

- [Cooperativa Obrera](../../public/images/companies/cooperativa-obrera-100.jpg)
  replaces the 48-pixel favicon in the interface, providing enough source pixels
  for its 40-pixel tile at 2× density. SHA-256:
  `a6b0434c6ba16af42fc5170a8a4d566567c386e652517cdaa0ff23559cfd80da`.
- [Independent work](../../public/images/companies/independent.jpg) is a generic
  handshake illustration, not an employer's mark. SHA-256:
  `1f6c5347094d6d46e7a7502e9ab36495a7cf67e4b3c62a5abc6ab88428f25a48`.

The existing higher-resolution Rampy, Teamcubation and UNS resources are retained.
Kognite remains an archived option, not a newly asserted employer or credential.
The filename of the replacement Cooperativa image differs from the old favicon
so deployment does not depend on eviction of a cached asset.

### Officially retrieved assets

Pequeverso now uses its [round transparent mark](../../public/images/companies/pequeverso-isotipo.webp)
from the [official site's header resource](https://pequeverso.com/media/brand/brand-isotipo-w96-cf729aa6.webp),
retrieved 2026-09-19. The 96 × 96 WebP has alpha transparency and no EXIF or ICC
profile. It is shown at 40 CSS pixels on a round white backing, retaining the
original colours. SHA-256:
`31fd9052695fcfa3f70afa60e3817ad7602a21ebb04e8f05f4791e85864bc660`.
The original square touch icon below is retained as source history, not used by
the current company-mark component.

| File | SHA-256 |
| --- | --- |
| cooperativa-obrera.png | `249c2ef875befa6690badb0b3e31c8583c15296d39dbeb589561924b1437801c` |
| pequeverso.png | `66dee9654b69017305c9d9dffd008b30f033259a971895b24b4f1ef6e3eb6f71` |
| rampy.png | `7ccb23d10b344b7dc194ab1a97fe779d40855bf94562ef3cdfc3ef6192977c2f` |
| teamcubation.png | `d61ad75a16615d03d44d02748d7ac7d18dc561e3f18743db4e4741f91931d099` |
| teamcubation.svg | `8aa0798d93008a497eb23358b76e76b48e9840cbd5de5167879bb0d09afc5be4` |

All files were decoded to verify their formats and dimensions. Integration must
still check the rendered light/dark UI, links and accessible names; asset inspection
alone does not validate the final component.

## Additional technology marks

The following original-color SVGs were retrieved from the Devicon project's
official repository on the same date. Devicon's distribution terms do not replace
the individual brands' trademark terms. See the [Devicon license](https://github.com/devicons/devicon/blob/master/LICENSE)
and [project disclaimer](https://github.com/devicons/devicon#disclaimer).

| Mark | Source | Local asset | SHA-256 |
| --- | --- | --- | --- |
| DigitalOcean | [Devicon original](https://raw.githubusercontent.com/devicons/devicon/master/icons/digitalocean/digitalocean-original.svg) | [digitalocean.svg](../../public/brands/digitalocean.svg) | `237e683e4a5f982e299d77ad4afc4f77a6245c3905d5344d5de7cdfaaeef95af` |
| Kotlin | [Devicon original](https://raw.githubusercontent.com/devicons/devicon/master/icons/kotlin/kotlin-original.svg) | [kotlin.svg](../../public/brands/kotlin.svg) | `5053c2e1288582d1ac2cfc1e807eabb7f6059b1aa2f7d04e5cf00063682a2cbe` |

Both use a 128 × 128 viewBox, retain their original colors, and contain no scripts
or remote resource dependencies. Render them without monochrome filtering.
