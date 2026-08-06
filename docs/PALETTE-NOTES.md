# Palette notes — eight tokens, two grounds

The storefront runs on eight colours and nothing else. The rules are in
`CLAUDE.md`, the tokens in `src/app.css` under `@theme`, and
`src/lib/palette.test.ts` enforces both — the contrast pairings *and* a
scan of the source tree for off-palette hex, Tailwind default colours,
shadow utilities and opacity-derived shades. A retune of a hex fails a
test rather than shipping.

## The two grounds

| Ground | Fill | Body type | Rules | Accent |
| ------ | ---- | --------- | ----- | ------ |
| paper  | `#F7F3EC` | ink `#191410` | hairline-light `#DDD5C7` | maroon `#5A1B22` |
| velvet | `#171209` | bone `#EFE9DE` | hairline-dark `#352B1F`  | gold `#C2A15E` |

Velvet is the announcement bar, the trust band, the footer, the
moissanite vitrine and the image lightbox. Each of those carries
`data-ground="velvet"`, which switches the focus ring and the selection
highlight to gold — maroon may not touch velvet, and at 1.4:1 it would be
invisible there anyway.

## Contrast

| Pairing | Ratio | Verdict |
| ------- | ----- | ------- |
| ink on paper | 16.5:1 | AAA |
| maroon on paper | 11.8:1 | AAA — links, stamps, selected states, errors |
| bone on velvet | 15.4:1 | AAA |
| gold on velvet | 7.6:1 | AAA — spec type and prices |
| bone on maroon | 10.8:1 | AAA — primary button |
| bone on ink | 15.1:1 | AAA — secondary button, sale badge |
| velvet on bone | 15.4:1 | AAA — button inside a velvet scene |
| hairline-light on paper | 1.32:1 | a rule, not type |
| gold on paper | **2.2:1** | **hairline only — never type** |

## Three consequences worth knowing

**There is no muted ink.** The palette has one text colour per ground, so
secondary copy steps down by size, weight and case rather than by fading
toward the canvas — the `.quiet` utility. About 106 `text-ink-muted` uses
became `text-ink`. Hierarchy that used to be carried by colour is now
carried by type, which is stricter and less forgiving: a caption that
reads as heavy needs a smaller size or a label treatment, not a lighter
grey. If the owner ever wants the third step back, `#726A61` is the
lightest value that still passes AA on paper — but it would be a ninth
token and `palette.test.ts` would have to be told about it.

**Bone panels depend on their hairline.** Bone is 1.09:1 against paper.
The old build separated a white tile from cream with a luminance step
plus `--shadow-sm`; there is no shadow scale now, so every raised panel
is `bg-bone` **plus** `border border-hairline-light`. Drop the border and
the panel disappears. A test asserts bone stays below 1.2:1 so nobody
"fixes" the fill instead of drawing the rule.

**Maroon and gold never meet.** The moissanite band is the only place
gold carries type, and it works because that band goes fully velvet and
therefore carries no maroon — the CTAs invert to bone
(`BTN_PRIMARY_ON_VELVET`). When real moissanite products exist, the band
reverts to paper and the product cards bring maroon back with them. The
two treatments never coexist.

## Deliberate deviations

- **Form errors are maroon, not a new brick.** The rules allow "a muted
  brick derived from maroon"; maroon itself measures 11.8:1 on paper and
  is already that colour, so no ninth token was minted. Inside the velvet
  footer the error goes gold, since maroon is barred from that ground.
- **Placeholders are ink and italic.** With no muted step, a placeholder
  would otherwise be indistinguishable from a typed value. `::placeholder
  { font-style: italic }` in `app.css` separates hint from value by shape
  rather than by an invented shade.
- **Disabled controls use element opacity.** `opacity-25`/`opacity-40` on
  a disabled chip or pagination arrow is a state treatment, not a colour:
  it does not add a shade to the palette, and the codebase already used
  `disabled:opacity-*`. Setting them in `hairline-light` instead would
  have been 1.3:1 — legal for disabled controls, unreadable in practice.
- **Velvet scrims are the one opacity exception.** `bg-velvet/40` behind a
  drawer and `bg-velvet/95` behind the lightbox are overlays on
  photography and page content, which the rules permit. The test allows
  `bg-velvet/NN` and nothing else.
- **One literal hex survives.** `theme-color` in `src/routes/__root.tsx`
  is a `<meta>` value and a meta tag cannot read a custom property, so
  `#F7F3EC` is spelled out there. It is the single allowlisted path in
  the off-palette-hex test.

## Retired

The `base` / `raised` / `sunken` surface set, `ink-muted`, `ink-subtle`,
`brand` / `brand-hover` / `brand-deep`, `cream`, and the entire
`--shadow-sm|md|lg` scale. Maroon is no longer a section background: the
three bands that were solid maroon are velvet now, which is what gets the
page to its ~30% dark without turning the store into a dark theme.

`#C4A875` still appears in `src/lib/shopify/adapters.test.ts` as a Shopify
variant **swatch colour** for a gold-metal option. That is product data
describing metal, not a brand token, and it lives in a test file the
palette scan does not read.
