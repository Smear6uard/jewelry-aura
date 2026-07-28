/**
 * lib/shopify/virtual-collections.ts — category pages that work before
 * the collections exist.
 *
 * THE PROBLEM THIS SOLVES
 * -----------------------
 * The menu promises six doors. Shopify currently has zero collections
 * behind them, so every /collections/<handle> was a 404 — a store whose
 * entire navigation is broken links, which is worse than a store with a
 * short catalog. Creating the collections in the admin is the real fix
 * and stays the owner's job; this is what keeps the storefront honest
 * until then, and it steps aside the moment a real collection appears.
 *
 * HOW IT WORKS
 * ------------
 * A virtual collection is a keyword rule over the full product list, the
 * same technique lib/shopify/facets.ts already uses to derive metal and
 * style from product titles — the workshop names pieces descriptively
 * ("14K Gold Circle Earrings"), so the titles carry the taxonomy. The
 * route asks Shopify for the collection first and only falls back here
 * when the handle does not exist.
 *
 * Rules are word-boundary regexes, not substring tests. "Earrings"
 * contains "ring"; a substring rule puts every pair of studs in the ring
 * case, which is exactly the kind of quiet wrongness a shopper notices
 * and a developer doesn't.
 *
 * Matching zero products is a valid outcome. The page then renders its
 * branded empty state with a route onward (see `emptyAction` in
 * ListingLayout) rather than a 404 — "nothing here yet" is a true
 * statement about a case being filled, and it keeps the link crawlable.
 */

import { CATEGORIES, WOMENS, WOMENS_PREFIX, womensHandle } from '~/lib/catalog'
import type { ProductCardNode } from './adapters'

export interface VirtualCollection {
  handle: string
  title: string
  description: string
  /** Shown in the empty state so a dead end becomes a door. */
  emptyAction: { href: string; label: string }
  /** Copy for the empty state — states what is missing, not "oops". */
  emptyBody: string
  match: (node: ProductCardNode) => boolean
}

// ─── Keyword rules ───────────────────────────────────────────────────

interface Rule {
  include: RegExp
  /** Vetoes a match — bracelets are not chains, studs are not rings. */
  exclude?: RegExp
}

const CATEGORY_RULES: Record<string, Rule> = {
  chains: {
    include: /\b(chains?|cuban|rope|franco|figaro|byzantine|wheat|box chain|link)\b/,
    exclude: /\b(bracelets?|bangles?|anklets?|earrings?|rings?)\b/,
  },
  pendants: {
    include: /\b(pendants?|charms?|crosses|cross|crucifix|medallions?|lockets?|name ?plates?|initial)\b/,
  },
  earrings: {
    include: /\b(earrings?|studs?|hoops?|huggies?)\b/,
  },
  rings: {
    include: /\b(rings?|bands?|signet|solitaire|eternity)\b/,
    exclude: /\b(earrings?|chains?|bracelets?)\b/,
  },
  bracelets: {
    include: /\b(bracelets?|bangles?|cuffs?|anklets?)\b/,
  },
  moissanite: {
    include: /\b(moissanite|vvs)\b/,
  },
}

/**
 * Women's signals. Nothing in the catalog carries one today, which is
 * the honest answer: a women's page that quietly served the men's case
 * would break the promise the menu just made. When the workshop titles
 * or tags a piece for women it appears here with no code change.
 */
const WOMENS_SIGNAL = /\b(women'?s?|womens|ladies|lady|her)\b/

function haystack(node: ProductCardNode): string {
  return node.title.toLowerCase()
}

function matchesRule(node: ProductCardNode, rule: Rule): boolean {
  const text = haystack(node)
  if (rule.exclude?.test(text)) return false
  return rule.include.test(text)
}

// ─── Definitions ─────────────────────────────────────────────────────

function categoryCollection(handle: string): VirtualCollection | undefined {
  const category = CATEGORIES.find((c) => c.handle === handle)
  const rule = CATEGORY_RULES[handle]
  if (!category || !rule) return undefined
  return {
    handle,
    title: category.label,
    description: category.blurb,
    emptyAction: { href: '/shop', label: 'Shop all pieces' },
    emptyBody:
      'Pieces for this case are being finished and photographed. The full catalog is one step away.',
    match: (node) => matchesRule(node, rule),
  }
}

function womensCollection(handle: string): VirtualCollection | undefined {
  const parentHandle = handle.slice(WOMENS_PREFIX.length + 1)
  const category = CATEGORIES.find((c) => c.handle === parentHandle)
  const rule = CATEGORY_RULES[parentHandle]
  if (!category || !rule) return undefined
  const label = `Women’s ${category.label.toLowerCase()}`
  return {
    handle,
    title: label,
    description: `${category.blurb} Cut for women — lighter links and smaller settings.`,
    emptyAction: {
      href: `/collections/${parentHandle}`,
      label: `Shop all ${category.label.toLowerCase()}`,
    },
    emptyBody: `${label} are being photographed. Everything in the ${category.label.toLowerCase()} case is one step away.`,
    match: (node) =>
      matchesRule(node, rule) && WOMENS_SIGNAL.test(haystack(node)),
  }
}

const WOMENS_ALL: VirtualCollection = {
  handle: WOMENS.handle,
  title: WOMENS.label,
  description: WOMENS.blurb,
  emptyAction: { href: '/shop', label: 'Shop all pieces' },
  emptyBody:
    'The women’s case is being photographed. Everything else in the shop is one step away.',
  match: (node) => WOMENS_SIGNAL.test(haystack(node)),
}

const MOISSANITE_ALL: VirtualCollection = {
  handle: 'moissanite',
  title: 'Moissanite',
  description:
    'Colourless moissanite, hand-set in solid gold — the brilliance of a diamond at a fraction of the weight in cost.',
  emptyAction: { href: '/custom', label: 'Commission a moissanite piece' },
  emptyBody:
    'Moissanite pieces are cut to order rather than stocked. Tell us the setting and the stone size and we quote it.',
  match: (node) => matchesRule(node, CATEGORY_RULES.moissanite),
}

/**
 * Sale is derived from the data rather than a keyword: a piece is on
 * sale when Shopify carries a compare-at price above the asking price.
 * Same definition the product card uses to draw the Sale badge, so the
 * collection and the badges can never disagree.
 */
const SALE: VirtualCollection = {
  handle: 'sale',
  title: 'Sale',
  description: 'Pieces marked down from their list price, while they last.',
  emptyAction: { href: '/shop', label: 'Shop all pieces' },
  emptyBody: 'Nothing is marked down right now. Everything else is one step away.',
  match: (node) => {
    const compareAt = node.compareAtPriceRange?.minVariantPrice
    if (!compareAt) return false
    const was = Number.parseFloat(compareAt.amount)
    const now = Number.parseFloat(node.priceRange.minVariantPrice.amount)
    return Number.isFinite(was) && Number.isFinite(now) && was > now
  },
}

/**
 * The virtual collection for a handle, or undefined when the handle is
 * not one the storefront promises anywhere — those still 404, which is
 * the correct answer for a URL nobody linked to.
 */
export function findVirtualCollection(
  handle: string,
): VirtualCollection | undefined {
  if (handle === WOMENS.handle) return WOMENS_ALL
  if (handle === 'moissanite') return MOISSANITE_ALL
  if (handle === 'sale') return SALE
  if (handle.startsWith(`${WOMENS_PREFIX}-`)) return womensCollection(handle)
  return categoryCollection(handle)
}

/** Every handle the menus link to — used by the sitemap. */
export function virtualCollectionHandles(): string[] {
  return [
    ...CATEGORIES.map((c) => c.handle),
    WOMENS.handle,
    ...CATEGORIES.map((c) => womensHandle(c.handle)),
    'moissanite',
    'sale',
  ]
}

/** Products in a virtual collection, in the order Shopify returned them. */
export function selectVirtual(
  nodes: ReadonlyArray<ProductCardNode>,
  collection: VirtualCollection,
): ProductCardNode[] {
  return nodes.filter((node) => collection.match(node))
}
