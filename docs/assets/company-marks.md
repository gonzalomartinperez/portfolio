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
