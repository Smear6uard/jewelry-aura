// Homepage best sellers — the shop window under the hero. Shopify's
// BEST_SELLING sort ranks by sales, so the section curates itself from
// live order data: no collection to maintain, and the node order IS the
// rank (the component renders 01, 02, … straight from it).

import { SHOP_PRODUCTS_QUERY } from './queries'
import { mapProductCard, type ProductCardNode } from './adapters'
import type { ProductCardModel } from './adapters'

/**
 * Four pieces: the №1 anchor plus a stepped trio. The window stays a
 * window — the full catalog lives at /shop.
 */
export const BEST_SELLER_COUNT = 4

interface ShopProductsData {
  products: { nodes: ProductCardNode[] }
}

export type BestSellersRequest = <TData>(
  operation: string,
  options?: { variables?: Record<string, unknown> },
) => Promise<TData>

export async function getBestSellersLogic(
  request: BestSellersRequest,
  first: number = BEST_SELLER_COUNT,
): Promise<ProductCardModel[]> {
  // One-of-one pieces sell out yet keep their all-time sales rank, so the
  // raw top-N can be a window of grayed "Sold out" cards. Fetch a deeper
  // slice and let purchasable pieces lead (rank order preserved within each
  // group); sold-out pieces only backfill when there aren't enough to sell.
  const data = await request<ShopProductsData>(SHOP_PRODUCTS_QUERY, {
    variables: { first: first * 2 },
  })
  const cards = data.products.nodes.map(mapProductCard)
  const available = cards.filter((card) => card.availableForSale)
  const soldOut = cards.filter((card) => !card.availableForSale)
  return [...available, ...soldOut].slice(0, first)
}
