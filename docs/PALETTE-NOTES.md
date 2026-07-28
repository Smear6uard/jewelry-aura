# Palette notes — cream canvas

The storefront canvas is warm cream (`#F2EDE4`) with near-black type and
maroon reserved for chrome. Tokens live in `src/app.css` under `@theme`.
`src/lib/palette.test.ts` enforces the contrast rules below, so a future
retune of a hex fails a test rather than shipping.

## Contrast

Measured against `--surface-base` `#F2EDE4`:

| Token             | Hex       | Ratio   | Use                                    |
| ----------------- | --------- | ------- | -------------------------------------- |
| `--text-primary`  | `#1A1614` | 15.4:1  | headings, product names, prices         |
| `--text-muted`    | `#6B625A` | 5.1:1   | body copy, captions, counts — AA floor  |
| `--text-subtle`   | `#9A9088` | 2.7:1   | **non-text only** — see below           |
| `--brand`         | `#6B1622` | 10.2:1  | links, stars, badges, eyebrows          |

Cream on the maroon bands: `#F2EDE4` on `--brand` is 10.2:1, on
`--brand-deep` 13.1:1. `cream/75` in the footer stays above 7:1.

## The one deviation from the rebuild brief

The brief specifies `--text-subtle #9A9088` and separately requires that
all text clear WCAG AA. On this canvas those two instructions conflict:
`#9A9088` measures 2.7:1, which fails AA for body text (4.5:1) and also
fails the large-text threshold (3:1). It cannot legibly carry text on
cream at any size.

So `--text-subtle` is defined at the specified hex and used for **non-text
decoration only** — facet checkboxes, the `JA` placeholder monogram, the
disabled pagination arrows, the breadcrumb separator. Every string a
shopper has to read uses `--text-muted` or darker.

The brief's one explicit text use of the token was the struck compare-at
price on a product card (`4.4`). That renders in `--text-muted` instead.
It still recedes behind the live price, which is `--text-primary` at
`font-medium` — the hierarchy is carried by weight and colour together
rather than by dropping below legibility.

If the owner would rather have a genuinely third, lighter step that also
passes AA, `#726A61` measures 4.56:1 and is the lightest value that does.
It sits close enough to `--text-muted` that the two read as one step,
which is why it was not adopted pre-emptively.

## Retired

`--color-champagne` `#C4A875` is gone from the codebase. So are the
dark-canvas surface tokens, the `.case-plate` treatment (a warm plate plus
a brightness cut, which existed to stop white-ground catalog cut-outs
glaring on a near-black page) and the `.velvet-grade` hue blend (which
existed to stop green velvet fighting the maroon accent). On cream,
neither problem exists: white-ground shots melt into the white tile and
dark-velvet shots read as jewel boxes. No product photograph on the site
carries a filter, scrim or overlay.

`#C4A875` still appears in `src/lib/shopify/adapters.test.ts` as a Shopify
variant **swatch colour** for a gold-metal option. That is product data
describing metal, not a brand token.
