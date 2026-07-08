// Adapters: raw Storefront API shapes -> view models the UI renders.
// Pure functions, no fetch — everything here is unit-tested.

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

export interface ProductCardNode {
  handle: string
  title: string
  availableForSale: boolean
  featuredImage: ProductCardImageNode | null
  priceRange: {
    minVariantPrice: MoneyNode
    maxVariantPrice: MoneyNode
  }
}

export interface ProductCardImage {
  src: string
  srcSet: string
  alt: string
  width: number | undefined
  height: number | undefined
}

export interface ProductCardModel {
  handle: string
  title: string
  /** Formatted min price, e.g. "$1,450" or "$89.50". */
  price: string
  /** True when variants span a price range — render as "From {price}". */
  priceFrom: boolean
  availableForSale: boolean
  image: ProductCardImage | null
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
  return {
    handle: node.handle,
    title: node.title,
    price: formatMoney(min),
    priceFrom:
      min.amount !== max.amount || min.currencyCode !== max.currencyCode,
    availableForSale: node.availableForSale,
    image: buildCardImage(node.featuredImage, node.title),
  }
}

// ─── Product detail (PDP) ────────────────────────────────────────────────

export interface VariantNode {
  id: string
  title: string
  availableForSale: boolean
  price: MoneyNode
  compareAtPrice: MoneyNode | null
  selectedOptions: Array<{ name: string; value: string }>
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
  variants: { nodes: VariantNode[] }
  selectedVariant: VariantNode | null
  fallbackVariant: VariantNode | null
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
  price: string
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

function selectionOf(variant: VariantNode): Record<string, string> {
  return Object.fromEntries(
    variant.selectedOptions.map((o) => [o.name, o.value]),
  )
}

function variantMatching(
  variants: VariantNode[],
  selection: Record<string, string>,
): VariantNode | undefined {
  return variants.find((v) =>
    v.selectedOptions.every((o) => selection[o.name] === o.value),
  )
}

export function mapVariant(variant: VariantNode): VariantModel {
  return {
    id: variant.id,
    title: variant.title,
    price: formatMoney(variant.price),
    compareAtPrice: variant.compareAtPrice
      ? formatMoney(variant.compareAtPrice)
      : null,
    availableForSale: variant.availableForSale,
  }
}

export function mapProductDetail(node: ProductDetailNode): ProductDetailModel {
  const resolved =
    node.selectedVariant ?? node.fallbackVariant ?? node.variants.nodes[0] ?? null
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
    handle: node.handle,
    title: node.title,
    description: node.description,
    seoTitle: node.seo?.title || node.title,
    seoDescription: node.seo?.description || node.description,
    images: node.images.nodes.map((image) =>
      buildGalleryImage(image, node.title),
    ),
    options,
    variant: resolved ? mapVariant(resolved) : null,
    offer: resolved
      ? {
          price: resolved.price.amount,
          currency: resolved.price.currencyCode,
          available: resolved.availableForSale,
        }
      : null,
  }
}
