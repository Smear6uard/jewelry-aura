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

/**
 * Whole amounts drop the cents ("$1,450"), fractional amounts keep them
 * ("$89.50") — the luxury-retail convention.
 */
export function formatMoney(money: MoneyNode): string {
  const value = Number.parseFloat(money.amount)
  if (!Number.isFinite(value)) return ''
  const isWhole = Number.isInteger(value)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currencyCode,
    minimumFractionDigits: isWhole ? 0 : 2,
    maximumFractionDigits: isWhole ? 0 : 2,
  }).format(value)
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

export interface CollectionModel {
  handle: string
  title: string
  description: string
  seoTitle: string
  seoDescription: string
  products: ProductCardModel[]
}

export function mapCollection(node: CollectionNode): CollectionModel {
  return {
    handle: node.handle,
    title: node.title,
    description: node.description,
    seoTitle: node.seo?.title || node.title,
    seoDescription: node.seo?.description || node.description,
    products: node.products.nodes.map(mapProductCard),
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
