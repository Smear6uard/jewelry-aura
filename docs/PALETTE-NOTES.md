# Palette notes — eight tokens, two grounds

The storefront runs on eight colours and nothing else. The rules are in
`CLAUDE.md`, the tokens in `src/app.css` under `@theme`, and
`src/lib/palette.test.ts` enforces both — the contrast pairings *and* a
scan of the source tree for off-palette hex, Tailwind default colours,
shadow utilities and opacity-derived shades. A retune of a hex fails a
test rather than shipping.

## Maroon is a stamp, not a button

Maroon appears in exactly **one fill** in the source:

| Where | What |
| ----- | ---- |
| `routes/custom.tsx` | the ONE OF ONE stamp |

plus two states in `app.css`: the `:focus-visible` ring and `::selection`,
both on paper only.

**No button on this site is maroon.** `BTN_PRIMARY` was a maroon fill on
the theory that one saturated block per viewport reads as the one thing
to press. It does — once. Every page has a primary action, so the
"signature" turned up on the hero, on the cart, on the PDP, on the sticky
buy bar and under every form: a workhorse wearing a signature's clothes.
`BTN_PRIMARY` is now an alias of `BTN_INK`, and hierarchy comes from
placement and from what sits beside a button instead of from a second
colour.

Everything else that used to be maroon is ink: every eyebrow, link, price,
star, arrow, badge, chip, count bubble, quick-add, checkbox, progress bar,
nav indicator and selected state. `palette.test.ts` asserts the single
remaining fill literally, and separately asserts that the word `maroon`
cannot appear in `lib/ui.ts` at all — if it can't reach the button
vocabulary it can't reach a button.

**Maroon is a fill only.** `text-maroon`, `border-maroon`, `ring-maroon`
and `decoration-maroon` are banned outright and tested for. The moment
maroon can be typography it becomes a link colour again, and from there an
eyebrow, and from there the workhorse it was demoted from.

**Link hover is `.link-hover`** (defined in `app.css`): the type holds at
ink and a gold hairline draws in underneath. Gold on paper is a hairline,
and an underline is a hairline — so the link idiom and the colour rule are
the same rule. Icon-only controls can't take an underline, so they fill
with the opposite ground on hover (bone on paper, paper inside a bone
panel). The nav indicator and the burger's hover mark went gold with them.

**Two CTAs in a row = one fill and one ghost.** `BTN_SECONDARY` is the
hairline ghost and is always the second button. `BTN_INK` is the filled
button for anything that repeats — same weight as primary, no brand
colour, and it hovers by drawing a gold hairline rather than shifting its
fill (there is no darker ink to move to).

Product card badges are all ink — a badge repeats across a grid *and*
sits on the photograph, so two separate rules land on it.

## The two grounds

| Ground | Fill | Body type | Rules | Accent |
| ------ | ---- | --------- | ----- | ------ |
| paper  | `#F7F3EC` | ink `#191410` | hairline-light `#DDD5C7` | maroon `#5A1B22` (stamp + focus) |
| velvet | `#1E1013` | bone `#EFE9DE` | hairline-dark `#352B1F`  | gold `#C2A15E` |

**Velvet is a near-black burgundy, not an espresso.** It was `#171209`
until the campaign photography changed. The homepage hero is shot against
a deep red curtain, and a brown-black page ground behind a red-black
photograph reads as two darks that *almost* match — the worst possible
relationship between a frame and its page. Warming the ground toward the
curtain makes the photograph continue the page instead of sitting on it.
The shift is small in ratio terms (bone on velvet 15.4:1 → 15.3:1, gold
7.6:1 → 7.5:1) and every guard still clears AAA.

Velvet is the announcement bar, the trust band, the footer, the
moissanite vitrine and the image lightbox. Each of those carries
`data-ground="velvet"`, which switches the focus ring and the selection
highlight to gold — maroon may not touch velvet, and at 1.4:1 it would be
invisible there anyway.

## Contrast

| Pairing | Ratio | Verdict |
| ------- | ----- | ------- |
| ink on paper | 16.5:1 | AAA |
| maroon on paper | 11.8:1 | AAA — the stamp and the focus ring |
| bone on velvet | 15.3:1 | AAA |
| gold on velvet | 7.5:1 | AAA — spec type and prices |
| bone on maroon | 10.8:1 | AAA — the stamp's own type |
| bone on ink | 15.1:1 | AAA — every filled button, sale badge |
| velvet on bone | 15.3:1 | AAA — button inside a velvet scene |
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

**Maroon and gold never meet.** Gold carries type only on velvet (the
moissanite band, the hero eyebrow), and those scenes carry no maroon at
all — their CTAs invert to bone. On paper gold does most of the
interaction marking (link underlines, the nav indicator, the ink button's
hover ring), which is safe precisely because maroon has retreated to one
stamp that none of those sit beside.

## Deliberate deviations

- **Form errors are ink.** Maroon is typography-free, so an error cannot
  be red here. `role="alert"` plus explicit wording carries the meaning,
  which is what WCAG asks for anyway (never colour alone). Inside the
  velvet footer the error is gold, the only accent legal on that ground.
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
