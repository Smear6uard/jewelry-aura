// Homepage featured collections (plan U7). The handle list is a config
// constant the owner curates — swapping a handle is a one-line change.
// Missing or misconfigured handles degrade gracefully: the rest render,
// the failure is logged, and the section never breaks the homepage.

import { FEATURED_COLLECTION_QUERY } from './queries'
import { mapProductCard, type ProductCardNode } from './adapters'
import type { ProductCardModel } from './adapters'

/**
 * PLACEHOLDERS until the owner picks the real collections — update when
 * the store's collections exist (Outstanding Question in the plan).
 */
export const FEATURED_COLLECTION_HANDLES = [
  'chains',
  'pendants',
  'rings',
] as const

const PRODUCTS_PER_COLLECTION = 4

export interface FeaturedCollectionModel {
  handle: string
  title: string
  products: ProductCardModel[]
}

interface FeaturedCollectionData {
  collection: {
    handle: string
    title: string
    products: { nodes: ProductCardNode[] }
  } | null
}

export type FeaturedRequest = <TData>(
  operation: string,
  options?: { variables?: Record<string, unknown> },
) => Promise<TData>

/**
 * Fetches each featured handle independently; a handle that is missing
 * (null collection) or whose fetch throws is skipped with a warning so
 * the remaining collections still render.
 */
export async function getFeaturedCollectionsLogic(
  request: FeaturedRequest,
  handles: ReadonlyArray<string> = FEATURED_COLLECTION_HANDLES,
  warn: (message: string) => void = console.warn,
): Promise<FeaturedCollectionModel[]> {
  const results = await Promise.all(
    handles.map(async (handle) => {
      try {
        const data = await request<FeaturedCollectionData>(
          FEATURED_COLLECTION_QUERY,
          { variables: { handle, first: PRODUCTS_PER_COLLECTION } },
        )
        if (!data.collection) {
          warn(`[featured] collection handle not found: "${handle}"`)
          return null
        }
        if (data.collection.products.nodes.length === 0) {
          warn(`[featured] collection "${handle}" has no products; skipping`)
          return null
        }
        return {
          handle: data.collection.handle,
          title: data.collection.title,
          products: data.collection.products.nodes.map(mapProductCard),
        }
      } catch (error) {
        warn(`[featured] failed to load collection "${handle}": ${String(error)}`)
        return null
      }
    }),
  )
  return results.filter(
    (result): result is FeaturedCollectionModel => result !== null,
  )
}
