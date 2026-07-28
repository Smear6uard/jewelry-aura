// Homepage best sellers — the shop window under the hero. Shopify's
// BEST_SELLING sort ranks by sales, so the section curates itself from
// live order data: no collection to maintain, and the node order IS the
// rank.

import { SHOP_PRODUCTS_QUERY } from './queries'
import { mapProductCard, type ProductCardNode } from './adapters'
import type { ProductCardModel } from './adapters'

/** Eight pieces: two full rows on desktop, a long swipe on a phone. */
export const BEST_SELLER_COUNT = 8

interface ShopProductsData {
  products: { nodes: ProductCardNode[] }
}

export type BestSellersRequest = <TData>(
  operation: string,
  options?: { variables?: Record<string, unknown> },
) => Promise<TData>

/**
 * Best sellers, purchasable only.
 *
 * One-of-one pieces sell out yet keep their all-time sales rank, so the
 * raw top-N is often a window of greyed "Sold out" cards. The rail
 * over-fetches and drops anything unavailable rather than backfilling
 * with it: a sold-out piece in a homepage shop window advertises
 * something the visitor cannot buy, and the shelf that follows it looks
 * like the whole store is empty. Sold-out pieces still appear on the
 * PLP and in search, badged, where the shopper is browsing rather than
 * being sold to.
 *
 * Returning fewer than `first` is a legitimate outcome; the caller
 * decides whether a short rail is worth rendering (see ProductRail's
 * `minProducts`).
 */
export async function getBestSellersLogic(
  request: BestSellersRequest,
  first: number = BEST_SELLER_COUNT,
): Promise<ProductCardModel[]> {
  const data = await request<ShopProductsData>(SHOP_PRODUCTS_QUERY, {
    variables: { first: first * 2 },
  })
  return data.products.nodes
    .map(mapProductCard)
    .filter((card) => card.availableForSale)
    .slice(0, first)
}
