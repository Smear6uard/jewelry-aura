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
  // Earrings are named twice over — by fitting and by shape ("Square
  // Stud Earrings Gold") — so a pair registers for both and can be
  // reached from either door in the menu.
  ['stud', ['stud']],
  ['hoop', ['hoop', 'huggie']],
  ['heart', ['heart']],
  ['square', ['square']],
  ['circle', ['circle']],
  ['engagement', ['engagement', 'bridal', 'solitaire', 'halo']],
  ['band', ['band', 'wedding', 'eternity']],
  ['signet', ['signet', 'pinky']],
  ['bangle', ['bangle', 'cuff']],
]

/**
 * Every style this file can derive. The menu's style links are checked
 * against it in facets.test.ts, so a category cannot offer a door that
 * no product can ever come through.
 */
export const KNOWN_STYLES: ReadonlySet<string> = new Set(
  STYLE_KEYWORDS.map(([style]) => style),
)

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

/**
 * Length bands a title registers for, read from an inch measurement in
 * the product title (`20"`, `20 inch`, `20in`).
 *
 * A title can carry more than one length ("Cuban Link 20\" / 24\"") and
 * then registers for both bands, so filtering to 24" and up returns a
 * chain that is offered at 24" even if its first listed length is 20".
 * Returns empty for a piece with no length in its title — rings and
 * pendants — which is what keeps the facet honest on a mixed catalog.
 */
const LENGTH_PATTERN = /(\d{1,2})(?:\.\d)?\s*(?:"|”|''|\s?in\b|\s?inch(?:es)?\b)/gi

export function lengthsOf(title: string): string[] {
  const bands = new Set<string>()
  for (const match of title.matchAll(LENGTH_PATTERN)) {
    const inches = Number.parseInt(match[1], 10)
    // Below 8" is a bracelet measurement or a stray number, not a length
    // a chain filter should claim; above 40" is not a neck measurement.
    if (!Number.isFinite(inches) || inches < 8 || inches > 40) continue
    if (inches < 18) bands.add('under-18')
    else if (inches <= 22) bands.add('18-22')
    else bands.add('24-plus')
  }
  return [...bands]
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
  /** Length band, e.g. "18-22". Only chains and bracelets carry one. */
  length?: string
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
  length: (node: ProductCardNode, value: string) =>
    lengthsOf(node.title).includes(value),
  avail: (node: ProductCardNode, value: string) =>
    value !== 'in-stock' || node.availableForSale,
} as const

export type FacetGroup = keyof typeof PREDICATES

/**
 * The filter groups, in sidebar order. This array is the single place a
 * facet is declared: filtering, counting, URL building, the active-filter
 * badge, the clear-all link and every route's loader all read it. Adding
 * `length` to the earlier hand-written copies of this list in three routes
 * and two components is exactly the bug the helpers below prevent.
 */
export const FACET_GROUPS: FacetGroup[] = [
  'metal',
  'style',
  'price',
  'length',
  'avail',
]

const GROUPS = FACET_GROUPS

/** How many filters are currently applied — drives the mobile badge. */
export function activeFacetCount(facets: Facets): number {
  return GROUPS.filter((group) => Boolean(facets[group])).length
}

/** A patch that clears every filter, leaving sort alone. */
export function clearedFacets(): Partial<Facets> {
  return Object.fromEntries(GROUPS.map((group) => [group, undefined]))
}

/**
 * Lifts the facet values out of a route's validated search params. Routes
 * call this instead of copying field names, so a new facet reaches every
 * listing surface at once.
 */
export function facetsFromSearch(search: Facets): Facets {
  const facets: Facets = { sort: search.sort }
  for (const group of GROUPS) facets[group] = search[group]
  return facets
}

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
    const values = valuesFor(node, group)
    for (const value of values) {
      counts[value] = (counts[value] ?? 0) + 1
    }
  }
  return counts
}

/** Every value in `group` that a product registers for. */
function valuesFor(node: ProductCardNode, group: FacetGroup): string[] {
  switch (group) {
    case 'metal':
      return metalsOf(node.title)
    case 'style':
      return stylesOf(node.title)
    case 'length':
      return lengthsOf(node.title)
    case 'price': {
      const band = priceBandOf(node)
      return band ? [band] : []
    }
    case 'avail':
      return node.availableForSale ? ['in-stock'] : []
  }
}

export interface FacetCounts {
  metal: Record<string, number>
  style: Record<string, number>
  price: Record<string, number>
  length: Record<string, number>
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
    length: facetCounts(nodes, facets, 'length'),
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
    length: str('length'),
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
