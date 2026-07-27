/**
 * lib/shopify/facets.ts — product-listing facets, derived from titles.
 *
 * The Storefront card query returns handle, title, availability and a
 * price range. That is enough to power the four filters a jewelry PLP
 * actually needs: metal, style, price band, and in-stock. Metal and
 * style are read out of the product title with keyword tables — the
 * workshop names pieces descriptively ("10K Yellow Gold Miami Cuban
 * Link 20\""), so the titles carry the taxonomy already.
 *
 * Everything here is pure and runs server-side, before pagination, so a
 * filtered collection paginates over the filtered set rather than
 * filtering a page that was already sliced.
 *
 * When product metafields or tags are wired up later, only `metalsOf`
 * and `stylesOf` need to change; the filter, count and sort plumbing
 * around them stays as-is.
 */

import type { ProductCardNode } from './adapters'

// ─── Keyword tables ──────────────────────────────────────────────────
// Order is irrelevant (a product may match several metals) except that
// the bare-gold fallback only applies when no explicit gold colour
// matched — "White Gold" must not also register as yellow.

const METAL_KEYWORDS: Array<[metal: string, patterns: string[]]> = [
  ['white-gold', ['white gold', 'whitegold', 'wg ']],
  ['rose-gold', ['rose gold', 'pink gold', 'rosegold']],
  ['two-tone', ['two tone', 'two-tone', '2 tone', 'tri color', 'tri-color']],
  ['moissanite', ['moissanite', 'vvs']],
  ['silver', ['silver', 'sterling', '925']],
]

const BARE_GOLD_PATTERNS = ['gold', '10k', '14k', '18k', '22k', '24k']

const STYLE_KEYWORDS: Array<[style: string, patterns: string[]]> = [
  ['cuban', ['cuban', 'miami']],
  ['rope', ['rope']],
  ['franco', ['franco']],
  ['figaro', ['figaro']],
  ['tennis', ['tennis']],
  ['box', ['box chain', 'wheat', 'byzantine']],
  ['name', ['name', 'initial', 'letter', 'monogram', 'nameplate']],
  ['cross', ['cross', 'crucifix']],
  ['portrait', ['portrait', 'photo', 'picture', 'memorial']],
  ['iced', ['iced', 'icy', 'flooded', 'vvs']],
  ['charm', ['charm']],
  ['engagement', ['engagement', 'bridal', 'solitaire', 'halo']],
  ['band', ['band', 'wedding', 'eternity']],
  ['signet', ['signet', 'pinky']],
  ['bangle', ['bangle', 'cuff']],
]

function matchesAny(haystack: string, patterns: string[]): boolean {
  return patterns.some((pattern) => haystack.includes(pattern))
}

/** Every metal facet a title registers for. May be empty. */
export function metalsOf(title: string): string[] {
  const text = ` ${title.toLowerCase()} `
  const metals = METAL_KEYWORDS.filter(([, patterns]) =>
    matchesAny(text, patterns),
  ).map(([metal]) => metal)

  // "14K Cuban Link" is yellow gold by convention; "14K White Gold
  // Cuban" is not. Only claim yellow when no other gold colour matched.
  const hasGoldColour =
    metals.includes('white-gold') ||
    metals.includes('rose-gold') ||
    metals.includes('two-tone')
  if (!hasGoldColour && matchesAny(text, BARE_GOLD_PATTERNS)) {
    metals.push('yellow-gold')
  }
  return metals
}

/** Every style facet a title registers for. May be empty. */
export function stylesOf(title: string): string[] {
  const text = ` ${title.toLowerCase()} `
  return STYLE_KEYWORDS.filter(([, patterns]) =>
    matchesAny(text, patterns),
  ).map(([style]) => style)
}

/** Price band a product's opening price falls into. */
export function priceBandOf(node: ProductCardNode): string | null {
  const amount = Number.parseFloat(node.priceRange.minVariantPrice.amount)
  if (!Number.isFinite(amount)) return null
  if (amount < 250) return 'under-250'
  if (amount <= 750) return '250-750'
  return '750-plus'
}

// ─── Sorting ─────────────────────────────────────────────────────────

export const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Alphabetical' },
] as const

export type SortKey = (typeof SORT_OPTIONS)[number]['value']

export function isSortKey(value: unknown): value is SortKey {
  return SORT_OPTIONS.some((option) => option.value === value)
}

function openingPrice(node: ProductCardNode): number {
  const amount = Number.parseFloat(node.priceRange.minVariantPrice.amount)
  return Number.isFinite(amount) ? amount : Number.POSITIVE_INFINITY
}

// ─── Filtering ───────────────────────────────────────────────────────

export interface Facets {
  metal?: string
  style?: string
  price?: string
  /** Only "in-stock" is meaningful; absent means no availability filter. */
  avail?: string
  sort?: SortKey
}

/** Predicate for one facet group, so counts can exclude their own group. */
const PREDICATES = {
  metal: (node: ProductCardNode, value: string) =>
    metalsOf(node.title).includes(value),
  style: (node: ProductCardNode, value: string) =>
    stylesOf(node.title).includes(value),
  price: (node: ProductCardNode, value: string) => priceBandOf(node) === value,
  avail: (node: ProductCardNode, value: string) =>
    value !== 'in-stock' || node.availableForSale,
} as const

type FacetGroup = keyof typeof PREDICATES

const GROUPS: FacetGroup[] = ['metal', 'style', 'price', 'avail']

function matchesFacets(
  node: ProductCardNode,
  facets: Facets,
  except?: FacetGroup,
): boolean {
  return GROUPS.every((group) => {
    if (group === except) return true
    const value = facets[group]
    if (!value) return true
    return PREDICATES[group](node, value)
  })
}

/** Applies every active facet, then sorts. Never mutates the input. */
export function applyFacets(
  nodes: ReadonlyArray<ProductCardNode>,
  facets: Facets,
): ProductCardNode[] {
  const filtered = nodes.filter((node) => matchesFacets(node, facets))

  switch (facets.sort) {
    case 'price-asc':
      return [...filtered].sort((a, b) => openingPrice(a) - openingPrice(b))
    case 'price-desc':
      return [...filtered].sort((a, b) => openingPrice(b) - openingPrice(a))
    case 'name':
      return [...filtered].sort((a, b) => a.title.localeCompare(b.title))
    default:
      // "Featured" preserves the order Shopify returned (BEST_SELLING).
      return filtered
  }
}

/**
 * How many products each facet value would yield, given the other
 * active facets. Counting with the value's own group excluded is what
 * makes a sidebar honest: picking "Rope" from a list that says "Rope
 * (3)" must actually return three products.
 */
export function facetCounts(
  nodes: ReadonlyArray<ProductCardNode>,
  facets: Facets,
  group: FacetGroup,
): Record<string, number> {
  const pool = nodes.filter((node) => matchesFacets(node, facets, group))
  const counts: Record<string, number> = {}

  for (const node of pool) {
    const values =
      group === 'metal'
        ? metalsOf(node.title)
        : group === 'style'
          ? stylesOf(node.title)
          : group === 'price'
            ? [priceBandOf(node)].filter((v): v is string => v !== null)
            : node.availableForSale
              ? ['in-stock']
              : []
    for (const value of values) {
      counts[value] = (counts[value] ?? 0) + 1
    }
  }
  return counts
}

export interface FacetCounts {
  metal: Record<string, number>
  style: Record<string, number>
  price: Record<string, number>
  avail: Record<string, number>
}

/** Counts for every group at once — what a sidebar needs to render. */
export function allFacetCounts(
  nodes: ReadonlyArray<ProductCardNode>,
  facets: Facets,
): FacetCounts {
  return {
    metal: facetCounts(nodes, facets, 'metal'),
    style: facetCounts(nodes, facets, 'style'),
    price: facetCounts(nodes, facets, 'price'),
    avail: facetCounts(nodes, facets, 'avail'),
  }
}

/** Normalises raw search params into a validated Facets object. */
export function parseFacets(search: Record<string, unknown>): Facets {
  const str = (key: string): string | undefined => {
    const value = search[key]
    return typeof value === 'string' && value.length > 0 && value.length <= 40
      ? value
      : undefined
  }
  const sort = search.sort
  return {
    metal: str('metal'),
    style: str('style'),
    price: str('price'),
    avail: str('avail') === 'in-stock' ? 'in-stock' : undefined,
    sort: isSortKey(sort) ? sort : undefined,
  }
}

/** True when at least one filter (not counting sort) is active. */
export function hasActiveFacets(facets: Facets): boolean {
  return GROUPS.some((group) => Boolean(facets[group]))
}

/**
 * Builds a listing URL from a facet state. Empty facets and page 1 are
 * omitted so the unfiltered first page is always the clean canonical
 * path, and the params come out in a fixed order so two identical
 * filter states can't produce two different cache keys.
 *
 * `extra` carries anything the surface owns that facets do not — the
 * search page's `q`, for instance.
 */
export function listingHref(
  basePath: string,
  facets: Facets,
  page = 1,
  extra?: Record<string, string | undefined>,
): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(extra ?? {})) {
    if (value) params.set(key, value)
  }
  for (const group of GROUPS) {
    const value = facets[group]
    if (value) params.set(group, value)
  }
  if (facets.sort && facets.sort !== 'featured') params.set('sort', facets.sort)
  if (page > 1) params.set('page', String(page))

  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}
