# Jewelry Aura

TanStack Start + Shopify Storefront API. Tokens in `src/app.css`, guards in
`src/lib/palette.test.ts`, rationale in `docs/PALETTE-NOTES.md`.

## COLOR RULES — non-negotiable

- Use ONLY the eight tokens in @theme. Never write any other hex, rgb, hsl,
  or Tailwind default color (no zinc/stone/amber/etc). No opacity tricks to
  invent new shades except black/velvet overlays on photography.
- Body text: ink on paper, bone on velvet. Never gold or maroon for body text.
- maroon = interactive brand accent, LIGHT GROUND ONLY: primary button fill
  (bone text on it), selected states, link hover, the ONE OF ONE stamp.
  Never on velvet, never as a section background.
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
| `--color-ink`             | `#191410` | all text on paper; secondary button fill         |
| `--color-velvet`          | `#171209` | dark scenes, vitrine interiors, photo ground     |
| `--color-bone`            | `#EFE9DE` | text on velvet; raised panels on paper           |
| `--color-maroon`          | `#5A1B22` | interactive brand accent, paper only             |
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
- **Errors render in maroon on paper** (11.8:1). Maroon *is* the sanctioned
  brick; no ninth token was minted for it.
- **Primary button** = `bg-maroon text-bone`, hover darkens to `bg-ink`.
  There is no second maroon shade to hover into.
- Gold on paper measures 2.2:1. It is a hairline there and never type.

## Other conventions

- `createServerFn` must be a direct static chain — the compiler will not
  follow a wrapper or a variable.
- Product layouts are level, equal-card grids. No staggered or asymmetric
  editorial spreads.
- No published street address anywhere on the site or in its JSON-LD.
- `npm test` runs vitest; `npm run build` runs the Vite/Nitro build.
