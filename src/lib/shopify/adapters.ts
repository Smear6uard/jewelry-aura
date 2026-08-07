// Adapters: raw Storefront API shapes -> view models the UI renders.
// Pure functions, no fetch — everything here is unit-tested.

import { publicSlug } from './product-slugs'

export interface MoneyNode {
  amount: string
  currencyCode: string
}

export interface ProductCardImageNode {
  altText: string | null
  width: number | null
  height: number | null
  w400: string
  w600: string
  w800: string
  w1200: string
}

/** A Storefront metafield, as returned by `metafield(namespace:key:)`. */
export interface MetafieldNode {
  value: string | null
}

export interface ProductCardNode {
  handle: string
  title: string
  availableForSale: boolean
  featuredImage: ProductCardImageNode | null
  priceRange: {
    minVariantPrice: MoneyNode
    maxVariantPrice: MoneyNode
  }
  /**
   * Card enrichments. Optional because not every caller's fixture (or a
   * future leaner query) supplies them, and every one degrades to a
   * quieter card rather than an error — see ProductCardModel.
   */
  images?: { nodes: ProductCardImageNode[] }
  variants?: { nodes: Array<{ id: string; availableForSale: boolean }> }
  compareAtPriceRange?: { minVariantPrice: MoneyNode }
  /** `reviews.rating` — the metafield every major review app writes. */
  ratingMetafield?: MetafieldNode | null
  /** `reviews.rating_count` — an integer as a string. */
  ratingCountMetafield?: MetafieldNode | null
}

export interface ProductCardImage {
  src: string
  srcSet: string
  alt: string
  width: number | undefined
  height: number | undefined
}

/** Small uppercase flag in a card's top-left corner. */
export type ProductBadge = 'new' | 'sale' | 'one-of-one' | 'sold-out'

export interface ProductRating {
  /** 0–5, one decimal. */
  value: number
  count: number
}

export interface ProductCardModel {
  handle: string
  title: string
  /** Formatted min price, e.g. "$1,450" or "$89.50". "" when unpriced. */
  price: string
  /** True when variants span a price range — render as "From {price}". */
  priceFrom: boolean
  /**
   * True when the piece carries no real price in Shopify (amount is
   * missing or zero). The card stamps a hallmark plate offering the
   * phone rather than a dead "Price on request" string — a shopper
   * looking at an unpriced chain needs a way to get the number, not a
   * notice that there isn't one.
   */
  unpriced: boolean
  availableForSale: boolean
  image: ProductCardImage | null
  /**
   * Optional card enrichments. Each degrades to a quieter card rather
   * than an error: no second image means the desktop hover falls back
   * to a slow scale, no rating means no star row at all (never a zero
   * state), no variantId means the card's action becomes "View" and
   * routes to the product page instead of the cart.
   */
  /** Second photograph, crossfaded in on desktop hover. */
  hoverImage?: ProductCardImage | null
  /** Formatted was-price; presence flags the card as on sale. */
  compareAtPrice?: string | null
  /** Explicit badge; a compareAtPrice implies "sale" without one. */
  badge?: ProductBadge
  /** Present only when a review app has written real rating data. */
  rating?: ProductRating
  /** Merchandise id for one-click add. Absent → link to the PDP. */
  variantId?: string | null
  /** >1 means the piece needs a size/length choice before it can be added. */
  optionCount?: number
}

// Intl.NumberFormat construction is the expensive part of the API; cache
// one formatter per currency/precision (called per card, per cart line).
const moneyFormatters = new Map<string, Intl.NumberFormat>()

function moneyFormatter(currencyCode: string, isWhole: boolean): Intl.NumberFormat {
  const key = `${currencyCode}:${isWhole}`
  let formatter = moneyFormatters.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: isWhole ? 0 : 2,
      maximumFractionDigits: isWhole ? 0 : 2,
    })
    moneyFormatters.set(key, formatter)
  }
  return formatter
}

/**
 * Whole amounts drop the cents ("$1,450"), fractional amounts keep them
 * ("$89.50") — the luxury-retail convention.
 */
export function formatMoney(money: MoneyNode): string {
  const value = Number.parseFloat(money.amount)
  if (!Number.isFinite(value)) return ''
  return moneyFormatter(money.currencyCode, Number.isInteger(value)).format(value)
}

/**
 * True when the amount is missing or zero.
 *
 * A zero amount means the piece has not been priced in the admin yet,
 * not that it is free. Rendering "$0" next to a gold chain reads as a
 * broken store, so the view models carry an `unpriced` flag and the UI
 * offers an action — the hallmark plate, on `tel:` — in place of a
 * number.
 * The underlying Shopify variant is still $0 — that is a catalog fix,
 * not a display one, and this only stops the storefront advertising it.
 */
export function isUnpriced(money: MoneyNode): boolean {
  const value = Number.parseFloat(money.amount)
  return !Number.isFinite(value) || value <= 0
}

/** Formatted price, or "" when the piece has not been priced yet. */
export function priceLabel(money: MoneyNode): string {
  return isUnpriced(money) ? '' : formatMoney(money)
}

/**
 * Rating from a review app's product metafields.
 *
 * `reviews.rating` is Shopify's `rating` metafield type, whose value is
 * JSON: {"value":"4.7","scale_min":"1","scale_max":"5"}. Judge.me,
 * Okendo, Loox, Yotpo and Shopify's own Product Reviews all write it, or
 * a plain decimal string. Both shapes are accepted.
 *
 * Returns null unless there is a positive count AND a positive value —
 * "★☆☆☆☆ (0)" is a worse signal than no stars at all, so a product with
 * no reviews renders nothing.
 */
export function mapRating(
  ratingField: MetafieldNode | null | undefined,
  countField: MetafieldNode | null | undefined,
): ProductRating | undefined {
  const count = Number.parseInt(countField?.value ?? '', 10)
  if (!Number.isFinite(count) || count <= 0) return undefined

  const raw = ratingField?.value
  if (!raw) return undefined

  let value = Number.NaN
  if (raw.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(raw) as { value?: string | number }
      value = Number.parseFloat(String(parsed.value ?? ''))
    } catch {
      return undefined
    }
  } else {
    value = Number.parseFloat(raw)
  }

  if (!Number.isFinite(value) || value <= 0) return undefined
  // One decimal, never rounded up to a whole star.
  return { value: Math.min(5, Math.round(value * 10) / 10), count }
}

/**
 * Reads a formatted money string back to a number ("$2,900" → 2900,
 * "$89.50" → 89.5). The cart model carries formatted strings only; the
 * free-shipping meter needs an amount to measure against a threshold.
 * Returns 0 when the string holds no digits.
 */
export function parseFormattedMoney(formatted: string): number {
  const digits = formatted.replace(/[^0-9.]/g, '')
  const value = Number.parseFloat(digits)
  return Number.isFinite(value) ? value : 0
}

const CARD_SRCSET_WIDTHS = [
  ['w400', 400],
  ['w600', 600],
  ['w800', 800],
  ['w1200', 1200],
] as const

export function buildCardImage(
  image: ProductCardImageNode | null,
  fallbackAlt: string,
): ProductCardImage | null {
  if (!image) return null
  const srcSet = CARD_SRCSET_WIDTHS.filter(([key]) => image[key])
    .map(([key, width]) => `${image[key]} ${width}w`)
    .join(', ')
  if (!srcSet) return null
  return {
    src: image.w800 || image.w1200 || image.w600 || image.w400,
    srcSet,
    alt: image.altText || fallbackAlt,
    width: image.width ?? undefined,
    height: image.height ?? undefined,
  }
}

/**
 * Shopify handles are lowercase alphanumerics and hyphens. Route params
 * are validated against this BEFORE they reach a query or a
 * `Vercel-Cache-Tag` header — anything else 404s without a fetch.
 */
const HANDLE_PATTERN = /^[a-z0-9-]+$/

export function isValidHandle(handle: string): boolean {
  return HANDLE_PATTERN.test(handle)
}

export interface CollectionNode {
  handle: string
  title: string
  description: string
  seo: { title: string | null; description: string | null } | null
  products: { nodes: ProductCardNode[] }
}

export interface CollectionPageModel {
  handle: string
  title: string
  description: string
  seoTitle: string
  seoDescription: string
  /** Only the requested page's products, mapped — never the full fetch. */
  products: ProductCardModel[]
  page: number
  totalPages: number
  total: number
}

/**
 * Slices FIRST, then maps only the visible page — the 250-product fetch
 * (KTD8) must not pay card-mapping cost for products it discards.
 */
export function mapCollectionPage(
  node: CollectionNode,
  page: number,
  perPage: number,
): CollectionPageModel {
  const sliced = paginate(node.products.nodes, page, perPage)
  return {
    handle: node.handle,
    title: node.title,
    description: node.description,
    seoTitle: node.seo?.title || node.title,
    seoDescription: node.seo?.description || node.description,
    products: sliced.items.map(mapProductCard),
    page: sliced.page,
    totalPages: sliced.totalPages,
    total: sliced.total,
  }
}

export interface Page<T> {
  items: T[]
  page: number
  perPage: number
  total: number
  totalPages: number
}

/**
 * Server-side slice for crawlable ?page=N pagination (KTD8). A page
 * beyond range returns empty items — the route turns that into a 404.
 */
export function paginate<T>(items: T[], page: number, perPage: number): Page<T> {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / perPage))
  const start = (page - 1) * perPage
  return {
    items: page >= 1 ? items.slice(start, start + perPage) : [],
    page,
    perPage,
    total,
    totalPages,
  }
}

export function mapProductCard(node: ProductCardNode): ProductCardModel {
  const min = node.priceRange.minVariantPrice
  const max = node.priceRange.maxVariantPrice

  // The second photograph, when there is one. `images` includes the
  // featured image at index 0, so the hover frame is index 1.
  const gallery = node.images?.nodes ?? []
  const hoverImage =
    gallery.length > 1 ? buildCardImage(gallery[1], node.title) : null

  const variants = node.variants?.nodes ?? []

  // Shopify's compareAtPriceRange is zero (not null) when nothing is on
  // sale, and a compare-at below the sale price is not a discount.
  const compareAt = node.compareAtPriceRange?.minVariantPrice
  const compareAtAmount = compareAt ? Number.parseFloat(compareAt.amount) : 0
  const onSale =
    Number.isFinite(compareAtAmount) &&
    compareAtAmount > Number.parseFloat(min.amount)

  const unpriced = isUnpriced(min)

  return {
    // The URL the site publishes, which is the Shopify handle for every
    // product but the one whose handle contradicts its title. See
    // lib/shopify/product-slugs.ts.
    handle: publicSlug(node.handle),
    title: node.title,
    price: priceLabel(min),
    // A range only reads as a range when there is a number to open it.
    priceFrom:
      !unpriced &&
      (min.amount !== max.amount || min.currencyCode !== max.currencyCode),
    unpriced,
    availableForSale: node.availableForSale,
    image: buildCardImage(node.featuredImage, node.title),
    hoverImage,
    compareAtPrice: onSale && compareAt ? formatMoney(compareAt) : null,
    rating: mapRating(node.ratingMetafield, node.ratingCountMetafield),
    // One variant node back from `variants(first: 2)` means there is
    // exactly one — safe to add straight to the cart.
    variantId: variants.length === 1 ? variants[0].id : null,
    optionCount: variants.length > 1 ? 2 : 1,
  }
}

// ─── Product detail (PDP) ────────────────────────────────────────────────

/**
 * The part of a variant the option-availability math reads. Narrower than
 * VariantNode on purpose: `selectionOf` and `variantMatching` have no
 * business seeing a price, and typing them this way says so.
 */
export interface VariantAvailabilityNode {
  id: string
  availableForSale: boolean
  selectedOptions: Array<{ name: string; value: string }>
}

export interface VariantNode extends VariantAvailabilityNode {
  title: string
  price: MoneyNode
  compareAtPrice: MoneyNode | null
}

export interface GalleryImageNode {
  altText: string | null
  width: number | null
  height: number | null
  thumb: string
  w600: string
  w900: string
  w1200: string
  w1600: string
}

export interface ProductDetailNode {
  handle: string
  title: string
  description: string
  seo: { title: string | null; description: string | null } | null
  options: Array<{
    name: string
    optionValues: Array<{ name: string; swatch: { color: string | null } | null }>
  }>
  images: { nodes: GalleryImageNode[] }
  /**
   * Every variant. Carries prices as well as availability so the page can
   * open on the one the card advertised — see `cheapestAvailable`.
   */
  variants: { nodes: VariantNode[] }
  selectedVariant: VariantNode | null
  fallbackVariant: VariantNode | null
  ratingMetafield?: MetafieldNode | null
  ratingCountMetafield?: MetafieldNode | null
}

export interface GalleryImage {
  src: string
  srcSet: string
  thumb: string
  alt: string
  width: number | undefined
  height: number | undefined
}

export interface OptionValueModel {
  name: string
  swatchColor: string | null
  selected: boolean
  /** False when no purchasable variant exists for this value given the
   *  rest of the current selection — rendered disabled. */
  available: boolean
  /** Search params that select this value (current selection + override). */
  search: Record<string, string>
}

export interface OptionModel {
  name: string
  isColor: boolean
  values: OptionValueModel[]
}

export interface VariantModel {
  id: string
  title: string
  /** Formatted price, or "" when the variant has not been priced. */
  price: string
  /** True when the variant carries no real price — the PDP offers to quote. */
  unpriced: boolean
  compareAtPrice: string | null
  availableForSale: boolean
}

export interface ProductDetailModel {
  handle: string
  title: string
  description: string
  seoTitle: string
  seoDescription: string
  images: GalleryImage[]
  options: OptionModel[]
  variant: VariantModel | null
  /** Present only when a review app has written real rating data. */
  rating?: ProductRating
  /** Raw amount/currency of the displayed variant — feeds JSON-LD. */
  offer: { price: string; currency: string; available: boolean } | null
}

const GALLERY_SRCSET_WIDTHS = [
  ['w600', 600],
  ['w900', 900],
  ['w1200', 1200],
  ['w1600', 1600],
] as const

export function buildGalleryImage(
  node: GalleryImageNode,
  fallbackAlt: string,
): GalleryImage {
  const srcSet = GALLERY_SRCSET_WIDTHS.filter(([key]) => node[key])
    .map(([key, width]) => `${node[key]} ${width}w`)
    .join(', ')
  return {
    src: node.w900 || node.w1200 || node.w600,
    srcSet,
    thumb: node.thumb,
    alt: node.altText || fallbackAlt,
    width: node.width ?? undefined,
    height: node.height ?? undefined,
  }
}

function selectionOf(variant: VariantAvailabilityNode): Record<string, string> {
  return Object.fromEntries(
    variant.selectedOptions.map((o) => [o.name, o.value]),
  )
}

function variantMatching(
  variants: VariantAvailabilityNode[],
  selection: Record<string, string>,
): VariantAvailabilityNode | undefined {
  return variants.find((v) =>
    v.selectedOptions.every((o) => selection[o.name] === o.value),
  )
}

export function mapVariant(variant: VariantNode): VariantModel {
  const unpriced = isUnpriced(variant.price)
  return {
    id: variant.id,
    title: variant.title,
    price: priceLabel(variant.price),
    unpriced,
    // A compare-at only means something beside a real price.
    compareAtPrice:
      variant.compareAtPrice && !unpriced
        ? formatMoney(variant.compareAtPrice)
        : null,
    availableForSale: variant.availableForSale,
  }
}

/**
 * The cheapest variant a shopper can actually buy, or null when none is.
 *
 * THIS IS WHAT THE CARD PROMISED. A card whose variants span a range
 * renders "From $79.99" off `priceRange.minVariantPrice`, and Shopify's
 * `selectedOrFirstAvailableVariant` resolves to the FIRST variant in
 * option order instead — on the 2mm Rope that is the 16", at $149.99.
 * The shopper taps a $79.99 chain and lands on one priced at nearly
 * double, which reads as a switch even though both numbers are true.
 *
 * So a product page opened with no length chosen opens on the cheapest
 * purchasable length. Ties keep option order, which is the order the
 * selector renders.
 *
 * Unpriced variants ($0 in the admin, R-side catalog work) are not
 * "cheapest" — they are unpriced, and picking one would hide a real price
 * behind a piece that has none.
 */
function cheapestAvailable(variants: ReadonlyArray<VariantNode>): VariantNode | null {
  let best: VariantNode | null = null
  let bestAmount = Number.POSITIVE_INFINITY
  for (const variant of variants) {
    if (!variant.availableForSale || isUnpriced(variant.price)) continue
    const amount = Number.parseFloat(variant.price.amount)
    if (!Number.isFinite(amount) || amount >= bestAmount) continue
    best = variant
    bestAmount = amount
  }
  return best
}

export function mapProductDetail(node: ProductDetailNode): ProductDetailModel {
  // The exact combination in the URL wins. With nothing selected —
  // `variantBySelectedOptions` returns null for an empty option list —
  // the page opens on the cheapest purchasable variant, which is the
  // price the card that linked here was advertising. Shopify's
  // first-available resolution is the last resort, and the only one left
  // when every variant is sold out or unpriced.
  const resolved =
    node.selectedVariant ??
    cheapestAvailable(node.variants.nodes) ??
    node.fallbackVariant ??
    null
  const selection = resolved ? selectionOf(resolved) : {}

  // Shopify's placeholder option for single-variant products.
  const realOptions = node.options.filter(
    (o) =>
      !(o.name === 'Title' && o.optionValues.length === 1) &&
      o.optionValues.length > 0,
  )

  const options: OptionModel[] = realOptions.map((option) => ({
    name: option.name,
    isColor:
      option.name.toLowerCase() === 'color' ||
      option.optionValues.some((v) => v.swatch?.color),
    values: option.optionValues.map((value) => {
      const candidate = { ...selection, [option.name]: value.name }
      const match = variantMatching(node.variants.nodes, candidate)
      return {
        name: value.name,
        swatchColor: value.swatch?.color ?? null,
        selected: selection[option.name] === value.name,
        available: match?.availableForSale ?? false,
        search: candidate,
      }
    }),
  }))

  return {
    // The published URL, not necessarily the Shopify handle — see
    // lib/shopify/product-slugs.ts. Breadcrumbs and the canonical link
    // both read this.
    handle: publicSlug(node.handle),
    title: node.title,
    description: node.description,
    seoTitle: node.seo?.title || node.title,
    seoDescription: node.seo?.description || node.description,
    images: node.images.nodes.map((image) =>
      buildGalleryImage(image, node.title),
    ),
    options,
    variant: resolved ? mapVariant(resolved) : null,
    rating: mapRating(node.ratingMetafield, node.ratingCountMetafield),
    offer: resolved
      ? {
          price: resolved.price.amount,
          currency: resolved.price.currencyCode,
          available: resolved.availableForSale,
        }
      : null,
  }
}
