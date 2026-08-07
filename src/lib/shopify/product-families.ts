/**
 * lib/shopify/product-families.ts — one shelf entry per piece.
 *
 * THE PROBLEM THIS SOLVES
 * -----------------------
 * The iced Miami Cuban exists in Shopify as twelve separate products —
 * three metals × four link widths — each carrying the same five lengths
 * as real variants. Every one of them is purchasable, so every one of
 * them ranks as a best seller, and a homepage shelf capped at eight
 * shows the same chain six or eight times in a row. A shopper reads that
 * as a shop with one product in it.
 *
 * The real fix is in the Shopify admin: merge the twelve listings into
 * one product with Metal, Width and Length options. That stays the
 * owner's job, and the day it happens this file matches nothing and can
 * be deleted. Until then the storefront presents the group the way the
 * catalog eventually will — one card, titled for the family, routed to
 * the best-selling member — using the same title-keyword technique
 * lib/shopify/virtual-collections.ts already uses for the category
 * pages.
 *
 * WHAT THIS DOES NOT DO
 * ---------------------
 * It does not assemble a product detail page out of twelve products. The
 * card lands on the representative listing, which offers its own five
 * lengths; choosing a different metal or width there still means going
 * back to the collection. Closing that gap needs either the admin merge
 * or a cross-product option row on the PDP, and neither of those is a
 * shelf's business.
 *
 * Nothing is reordered. Shopify returns best-selling first and the
 * family lands at the rank of its highest member, so a collapsed shelf
 * is still a sales ranking.
 */

import type { ProductCardNode } from './adapters'

export interface ProductFamily {
  key: string
  /** The title the collapsed card carries. */
  title: string
  match: (node: ProductCardNode) => boolean
}

function haystack(node: ProductCardNode): string {
  return `${node.title} ${node.handle}`.toLowerCase()
}

/**
 * The metal a listing is cut in, read off its title. Used to pick the
 * hover frame, so the card's second photograph is a different colourway
 * rather than a second angle of the same chain.
 *
 * "Rose gold" is spelled as one word in one handle
 * (`iced-rosegold-cuban-s`), hence the optional space.
 */
function metalOf(node: ProductCardNode): string | null {
  const text = haystack(node)
  if (/\byellow ?gold\b/.test(text)) return 'yellow'
  if (/\brose ?gold\b/.test(text)) return 'rose'
  if (/\bwhite ?gold\b/.test(text)) return 'white'
  return null
}

/**
 * The families the storefront collapses. One entry today, and adding a
 * second should mean deciding that a group of listings is genuinely one
 * piece — not that a shelf looked repetitive.
 */
export const PRODUCT_FAMILIES: ProductFamily[] = [
  {
    key: 'iced-miami-cuban',
    title: 'Iced Miami Cuban',
    match: (node) => {
      const text = haystack(node)
      return /\biced\b/.test(text) && /\bcuban\b/.test(text)
    },
  },
]

export function findFamily(node: ProductCardNode): ProductFamily | undefined {
  return PRODUCT_FAMILIES.find((family) => family.match(node))
}

/**
 * The card node a collapsed family renders as.
 *
 * It is the best-selling member with four changes, and nothing else is
 * invented:
 *
 *   title    the family's name, because the card now stands for all of
 *            them. It is the one string here that does not come straight
 *            out of Shopify, and it is why the admin merge is the real
 *            fix — the listing behind the card still carries its own
 *            metal in its own title.
 *   available true when any member is, since the card is a door to all
 *            of them.
 *   images   the second frame becomes a different metal, so the desktop
 *            hover crossfade shows what choosing gets you.
 *   variants emptied, which makes the card's add control read "Choose
 *            options" and route to the product page (see QuickAdd). A
 *            group of twelve listings has no single variant to add, and
 *            a "Quick add" that silently picks a metal is the dishonest
 *            version of this card.
 */
function collapse(
  family: ProductFamily,
  members: ReadonlyArray<ProductCardNode>,
): ProductCardNode {
  const [representative, ...rest] = members

  const alternate = rest.find(
    (node) => node.featuredImage && metalOf(node) !== metalOf(representative),
  )
  const hoverFrame = alternate?.featuredImage ?? representative.images?.nodes[1]

  return {
    ...representative,
    title: family.title,
    availableForSale: members.some((node) => node.availableForSale),
    images: {
      nodes: [
        ...(representative.featuredImage ? [representative.featuredImage] : []),
        ...(hoverFrame ? [hoverFrame] : []),
      ],
    },
    variants: { nodes: [] },
  }
}

/**
 * Collapses every family in a product list to a single node, leaving
 * everything else untouched and in place.
 */
export function collapseFamilies(
  nodes: ReadonlyArray<ProductCardNode>,
): ProductCardNode[] {
  const membersByFamily = new Map<string, ProductCardNode[]>()
  for (const node of nodes) {
    const family = findFamily(node)
    if (!family) continue
    const existing = membersByFamily.get(family.key)
    if (existing) existing.push(node)
    else membersByFamily.set(family.key, [node])
  }

  const emitted = new Set<string>()
  const out: ProductCardNode[] = []
  for (const node of nodes) {
    const family = findFamily(node)
    if (!family) {
      out.push(node)
      continue
    }
    if (emitted.has(family.key)) continue
    emitted.add(family.key)
    out.push(collapse(family, membersByFamily.get(family.key)!))
  }
  return out
}
