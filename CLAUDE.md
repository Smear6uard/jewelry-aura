# Jewelry Aura

TanStack Start + Shopify Storefront API. Tokens in `src/app.css`, guards in
`src/lib/palette.test.ts`, rationale in `docs/PALETTE-NOTES.md`. The
homepage's dark scenes — what was decided, what was rejected, and what the
first build got wrong — are in `docs/HOME-SCENES.md`.

## COLOR RULES — non-negotiable

- Use ONLY the eight tokens in @theme. Never write any other hex, rgb, hsl,
  or Tailwind default color (no zinc/stone/amber/etc). No opacity tricks to
  invent new shades except black/velvet overlays on photography.
- Body text: ink on paper, bone on velvet. Never gold or maroon for body text.
- maroon is a STAMP, not a button. Hard rules:
  - NO BUTTON IS MAROON. Every filled button on paper is ink with bone
    text; inside a velvet scene the filled button inverts to bone and the
    ghost draws its hairline in bone. `bg-maroon` may not appear in
    `lib/ui.ts` at all.
  - Maroon appears in ZERO typography: no headings, eyebrows, links, prices,
    labels or status text. Link hover is ink with a gold hairline underline.
  - All repeating components (quick-adds, newsletter submit, card buttons,
    badges, pagination, counts, chips) use ink fills, never maroon.
  - Maroon never sits inside a dark scene, over photography, or adjacent to
    rose-gold product images.
  - Maroon keeps the small stamps — ONE OF ONE, hallmark — and the paper
    focus ring and selection highlight. That is the whole list.
  - Maroon is a FILL only. `text-maroon`, `border-maroon`, `ring-maroon` and
    `decoration-maroon` do not appear in this codebase.
- gold = material accent: 1px hairlines, the JA hallmark stamp, mono spec
  type and prices on dark scenes. On paper: hairlines only, never text.
  Gold ≤ ~5% of any viewport.
- maroon and gold never appear in the same component or adjacent.
- Ratio discipline: paper ~60%, velvet ~30%, accents ≤10% combined.
- No gradients (except near-invisible vignettes inside photos), no shadows
  for structure — hairlines do the structural work. No pure #000 or #FFF.
- Forms: errors may use a muted brick derived from maroon; nothing green/blue.

### The eight

| Token                     | Hex       | Job                                              |
| ------------------------- | --------- | ------------------------------------------------ |
| `--color-paper`           | `#F7F3EC` | canvas — every light page ground                 |
| `--color-ink`             | `#191410` | all text on paper; every filled button on paper  |
| `--color-velvet`          | `#1E1013` | near-black burgundy: dark scenes, photo ground   |
| `--color-bone`            | `#EFE9DE` | text on velvet; raised panels on paper           |
| `--color-maroon`          | `#5A1B22` | ONE OF ONE stamps + focus/selection, paper only  |
| `--color-gold`            | `#C2A15E` | hairlines; spec type and prices on velvet        |
| `--color-hairline-dark`   | `#352B1F` | rules on velvet                                  |
| `--color-hairline-light`  | `#DDD5C7` | rules on paper                                   |

### What this means in practice

- **There is no muted ink.** Secondary copy steps down by size, weight and
  case — the `.quiet` utility — not by fading toward the canvas. Do not
  reintroduce `text-ink/70`; that is the opacity trick the rules ban.
- **A raised panel is `bg-bone` + `border-hairline-light`.** Bone is 1.09:1
  against paper, so the hairline is doing the work, not the fill. There is
  no white tile and no shadow scale.
- **Any dark surface carries `data-ground="velvet"`.** That switches the
  focus ring and selection highlight to gold, because maroon may not touch
  velvet and is illegible there anyway (1.4:1).
- **Errors render in ink**, not maroon. Maroon is typography-free, so an
  error cannot be red here. `role="alert"` and explicit wording carry the
  meaning.
- **Buttons.** `BTN_INK` is the filled button on paper and `BTN_PRIMARY`
  is an alias of it — hierarchy comes from placement, not a second colour.
  `BTN_SECONDARY` is the hairline ghost and is always the second button in
  a row. Inside a velvet scene use the `_ON_VELVET` pair.
- **`.link-hover`** is the link idiom: ink type, gold hairline drawn in
  underneath. Gold on paper is a hairline, and an underline is a hairline.
- Gold on paper measures 2.2:1. It is a hairline there and never type.

## The homepage hero is a pinned, scrubbed frame

Four files hold one contract; changing any of them alone breaks it.

- `components/sections/Hero.tsx` owns the acts and reads scroll progress
  through its own stage via `useElementScrollProgress` (`lib/lenis.ts`).
  Framer's `useScroll` is not used — it reads `window.scrollY` off its
  own RAF tick and jitters against Lenis's smoothing.
- `app.css` (HERO CHOREOGRAPHY) owns the stage height, the pin, the
  curtain offset and every start state. Start states live in CSS, not in
  the component, so a `prefers-reduced-motion` visitor — who never gets
  Framer's inline style — sees the finished hero from the first frame.
- `routes/index.tsx` wraps everything below the hero in `.hero-curtain`,
  which must stay opaque: for the last act it is covering a photograph.
- `routes/__root.tsx` collapses the pin in its `<noscript>` stylesheet.

Rules: transform and opacity only, `will-change` on animated layers,
every act reversible on scroll-up, nothing time-triggered after load.
The photograph is a slot — `new-hero-horizontal.*` (lg and up) and
`new-hero-vertical.*` (below). Replacing those files replaces the hero;
regenerate the avif/webp/jpg set beside any new source.

## The homepage alternates paper and velvet, all the way down

Light sections are where a visitor chooses something; the full-bleed dark
scenes are where the workshop says something. The order is fixed and
written down in the composition note in `routes/index.tsx`:

    Hero · tiles · The case · FEATURED EXHIBIT · trust rail ·
    COMMISSIONED WORK · Moissanite · Women's · Reviews · THE BENCH

Never put two full-bleed velvet scenes next to each other. The trust rail
is paper for exactly this reason — it sits between two of them.

### The three velvet scenes carry one idea: the hallmark

A hallmark is the stamp inside a clasp — mono, factual, and the only
thing on a piece of jewelry that is a promise. Each scene is that stamp
at a different magnification, and that is the whole reason they belong on
one page:

- **Featured exhibit** — the stamp at wall scale: `5.0MM / 14K / SOLID`,
  gold mono at ~90px with gold hairlines between the terms, over the
  piece. No headline; the spec IS the type.
- **Commissioned work** — five beats, each the same three things: the
  piece, its name in display serif overhanging the photograph's edge, and
  the hallmark line (ONE OF ONE stamp + one mono spec).
- **The bench** — the four promises as one mono hairline-ruled line: the
  stamp applied to the business rather than to the metal.

Nothing else new is invented in them. No icons, no counters, no numbered
markers — these are not a sequence.

**The ONE OF ONE stamp inverts on velvet.** Maroon on velvet is 1.4:1 and
banned outright, so the stamp is a bone plate with velvet type there. It
keeps its maroon on `/custom`, where it appears once and on paper.

### Two more pinned, scrubbed scenes

`FeaturedExhibit` and `CommissionedWork` follow the hero's contract
exactly — same four files, same rules (transform and opacity only,
`will-change` on animated layers, every act reversible on scroll-up,
nothing time-triggered). Three things are specific to them:

- **They only pin at `lg`.** `useIsWide()` gates the scrubbed styles and
  the SCENE CHOREOGRAPHY block in `app.css` collapses the stage to match.
  Below that they are stacked bands with viewport-entry reveals.
- **Start states live in CSS**, inside the same `lg` query, and the
  `prefers-reduced-motion` block must repeat their **exact selectors** —
  `.commission-beat:not(:first-child) .commission-sheet` outranks a bare
  `.commission-sheet` wherever it sits in the file.
- `routes/__root.tsx` collapses both in its `<noscript>` stylesheet, via
  the shared `.scene-stage` / `.scene-pin` / `.scene-beat` classes.

Photographs are slots: `exhibit-5mm-cuban.*`, `bench-band.*`,
`womens-piece.*`. Replacing the avif/webp/jpg set replaces the scene —
and the copy names the piece, so a new photograph means new copy too.

## Motion

- `DURATION.reveal` (500ms) is the scroll-reveal beat for every section
  below the hero. `DURATION.content` (600ms) belongs to panels that open
  over the page — drawers, sheets, overlays.
- Scroll reveals play **once per direction and reverse**: `Reveal` and
  `Unmask` pass `once: false`, so the page reads the same travelling
  either way.
- `Unmask` is the image reveal: a static window, a sheet rising out of
  it, and the picture counter-moving inside. **Both the window and the
  sheet clip** — the counter-move would otherwise show through early.

## Other conventions

- `createServerFn` must be a direct static chain — the compiler will not
  follow a wrapper or a variable.
- One CTA per product card, labelled "Add" or "View", rendered once. A
  rail renders one list and hides the overflow at `md`; nothing on this
  site renders the same product twice to serve two breakpoints.
- An unpriced piece gets the hallmark plate — "Priced at the bench —
  call", on `tel:`. The bench quotes chains by weight in a minute; a
  commission form answers in a business day.
- A product URL is a public slug, not necessarily the Shopify handle —
  see `lib/shopify/product-slugs.ts`. Renaming the handle in the admin is
  the real fix and deletes that file.
- A product page opened with no option chosen opens on the **cheapest
  purchasable** variant, so the "From $X" on the card is the price that
  greets the shopper.
- Product layouts are level, equal-card grids. No staggered or asymmetric
  editorial spreads.
- Groups of near-identical Shopify listings collapse to one shelf card —
  see `lib/shopify/product-families.ts`. Merging them in the Shopify
  admin is the real fix and deletes that file.
- No published street address anywhere on the site or in its JSON-LD.
- `npm test` runs vitest; `npm run build` runs the Vite/Nitro build.
