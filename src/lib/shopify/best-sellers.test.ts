import { describe, expect, it, vi } from 'vitest'
import {
  BEST_SELLER_COUNT,
  getBestSellersLogic,
  type BestSellersRequest,
} from './best-sellers'

const node = (handle: string, available = true) => ({
  handle,
  title: handle,
  availableForSale: available,
  featuredImage: null,
  priceRange: {
    minVariantPrice: { amount: '1450.0', currencyCode: 'USD' },
    maxVariantPrice: { amount: '1450.0', currencyCode: 'USD' },
  },
})

describe('getBestSellersLogic', () => {
  it('over-fetches and drops sold-out pieces entirely, keeping sales rank', async () => {
    const request = vi.fn(async () => ({
      products: {
        nodes: [
          node('sold-1', false),
          node('sold-2', false),
          node('live-1'),
          node('sold-3', false),
          node('live-2'),
          node('sold-4', false),
        ],
      },
    })) as unknown as BestSellersRequest

    const best = await getBestSellersLogic(request)

    expect(request).toHaveBeenCalledWith(expect.stringContaining('BEST_SELLING'), {
      variables: { first: BEST_SELLER_COUNT * 2 },
    })
    // Sold-out pieces are not backfilled: a homepage rail must never
    // advertise something the visitor cannot buy.
    expect(best.map((product) => product.handle)).toEqual(['live-1', 'live-2'])
    expect(best[0].price).toBe('$1,450')
  })

  it('keeps pure sales-rank order when everything is purchasable', async () => {
    const request = vi.fn(async () => ({
      products: {
        nodes: [node('cuban-link-chain'), node('rope-chain')],
      },
    })) as unknown as BestSellersRequest

    const best = await getBestSellersLogic(request)
    expect(best.map((product) => product.handle)).toEqual([
      'cuban-link-chain',
      'rope-chain',
    ])
  })

  it('caps at the requested count', async () => {
    const request = vi.fn(async () => ({
      products: {
        nodes: Array.from({ length: 12 }, (_, i) => node(`piece-${i}`)),
      },
    })) as unknown as BestSellersRequest

    expect(await getBestSellersLogic(request, 4)).toHaveLength(4)
  })

  it('returns empty when every best seller is sold out', async () => {
    const request = vi.fn(async () => ({
      products: { nodes: [node('sold-1', false), node('sold-2', false)] },
    })) as unknown as BestSellersRequest

    expect(await getBestSellersLogic(request)).toEqual([])
  })

  it('returns empty for an empty catalog', async () => {
    const request = vi.fn(async () => ({
      products: { nodes: [] },
    })) as unknown as BestSellersRequest

    expect(await getBestSellersLogic(request)).toEqual([])
  })
})
