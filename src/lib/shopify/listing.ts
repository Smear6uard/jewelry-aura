/**
 * lib/shopify/listing.ts — the shared PLP pipeline.
 *
 * One function turns a raw product list plus a facet state into
 * everything a listing page renders. /shop, every collection and the
 * search page all call it, so the order of operations is the same
 * everywhere:
 *
 *   filter → count → sort → paginate → map to cards
 *
 * Filtering before pagination is the part that matters. Slicing first
 * and filtering the slice — the shape you get when a filter is bolted
 * onto an existing paginated list — produces pages of wildly different
 * sizes and a page count that lies. Mapping last means the cards that
 * were filtered out never pay for their own image srcsets.
 */

import { mapProductCard, paginate, type ProductCardModel, type ProductCardNode } from './adapters'
import {
  allFacetCounts,
  applyFacets,
  type FacetCounts,
  type Facets,
} from './facets'

export interface ListingResult {
  /** Cards for the requested page only. */
  products: ProductCardModel[]
  /** Products matching the filters across every page. */
  total: number
  page: number
  totalPages: number
  counts: FacetCounts
}

export function buildListing(
  nodes: ReadonlyArray<ProductCardNode>,
  facets: Facets,
  page: number,
  perPage: number,
): ListingResult {
  // Counts are computed against the unfiltered pool so each group can
  // exclude its own selection (see facetCounts).
  const counts = allFacetCounts(nodes, facets)
  const matching = applyFacets(nodes, facets)
  const sliced = paginate(matching, page, perPage)

  return {
    products: sliced.items.map(mapProductCard),
    total: matching.length,
    page: sliced.page,
    totalPages: sliced.totalPages,
    counts,
  }
}
