// The homepage shop window under the hero. Shopify's BEST_SELLING sort
// ranks by sales, so the shelf curates itself from live order data: no
// collection to maintain, and the node order IS the rank.

import { SHOP_PRODUCTS_QUERY } from './queries'
import { collapseFamilies } from './product-families'
import { mapProductCard, type ProductCardNode } from './adapters'
import type { ProductCardModel } from './adapters'

/** Eight pieces: two full rows on desktop, a long swipe on a phone. */
export const BEST_SELLER_COUNT = 8

/**
 * How much of the catalog the shelf reads before it starts filtering.
 *
 * It used to be `first * 2`, which assumed the only thing that could
 * remove a product was being sold out and that it would happen to about
 * half of them. Both assumptions are wrong here: this catalog's
 * all-time best sellers are a run of sold-out earrings, so a 16-product
 * window filtered down to nothing and the homepage rendered no shelf at
 * all. Twelve near-identical listings then collapse to one card on top
 * of that.
 *
 * A boutique catalog is a couple of hundred products and the query is
 * already made once per cache period, so the honest window is "enough
 * that filtering cannot empty it".
 */
export const BEST_SELLER_WINDOW = 120

interface ShopProductsData {
  products: { nodes: ProductCardNode[] }
}

export type BestSellersRequest = <TData>(
  operation: string,
  options?: { variables?: Record<string, unknown> },
) => Promise<TData>

/**
 * Best sellers, purchasable and de-duplicated.
 *
 * Two filters, in this order:
 *
 * 1. Sold-out pieces are dropped, not backfilled around. One-of-one
 *    pieces sell out yet keep their all-time sales rank, so the raw
 *    top-N is often a window of greyed "Sold out" cards — a homepage
 *    shop window advertising things the visitor cannot buy, and the
 *    shelf that follows it looks like the whole store is empty.
 *    Sold-out pieces still appear on the PLP and in search, badged,
 *    where the shopper is browsing rather than being sold to.
 *
 * 2. Product families collapse to one card. Twelve listings of the same
 *    iced Cuban are twelve best sellers, and a shelf of eight showing
 *    six of them says "one product" louder than an empty shelf would.
 *    See lib/shopify/product-families.ts.
 *
 * Returning fewer than `first` is a legitimate outcome; the caller
 * decides whether a short shelf is worth rendering (see ProductRail's
 * `minProducts`).
 */
export function selectBestSellers(
  nodes: ReadonlyArray<ProductCardNode>,
  first: number = BEST_SELLER_COUNT,
): ProductCardModel[] {
  const purchasable = nodes.filter((node) => node.availableForSale)
  return collapseFamilies(purchasable).slice(0, first).map(mapProductCard)
}

/** `selectBestSellers` with the fetch in front of it. */
export async function getBestSellersLogic(
  request: BestSellersRequest,
  first: number = BEST_SELLER_COUNT,
): Promise<ProductCardModel[]> {
  const data = await request<ShopProductsData>(SHOP_PRODUCTS_QUERY, {
    variables: { first: BEST_SELLER_WINDOW },
  })
  return selectBestSellers(data.products.nodes, first)
}
