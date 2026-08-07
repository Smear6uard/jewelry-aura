import { describe, expect, it, vi } from 'vitest'
import {
  BEST_SELLER_WINDOW,
  getBestSellersLogic,
  selectBestSellers,
  type BestSellersRequest,
} from './best-sellers'

const node = (handle: string, available = true, title = handle) => ({
  handle,
  title,
  availableForSale: available,
  featuredImage: null,
  priceRange: {
    minVariantPrice: { amount: '1450.0', currencyCode: 'USD' },
    maxVariantPrice: { amount: '1450.0', currencyCode: 'USD' },
  },
})

describe('selectBestSellers', () => {
  it('drops sold-out pieces entirely rather than backfilling them', () => {
    const best = selectBestSellers([
      node('sold-1', false),
      node('sold-2', false),
      node('live-1'),
      node('sold-3', false),
      node('live-2'),
    ])
    expect(best.map((product) => product.handle)).toEqual(['live-1', 'live-2'])
    expect(best[0].price).toBe('$1,450')
  })

  it('keeps pure sales-rank order when everything is purchasable', () => {
    const best = selectBestSellers([node('cuban-link-chain'), node('rope-chain')])
    expect(best.map((product) => product.handle)).toEqual([
      'cuban-link-chain',
      'rope-chain',
    ])
  })

  it('caps at the requested count', () => {
    const nodes = Array.from({ length: 12 }, (_, i) => node(`piece-${i}`))
    expect(selectBestSellers(nodes, 4)).toHaveLength(4)
  })

  it('returns empty when every best seller is sold out', () => {
    expect(selectBestSellers([node('sold-1', false), node('sold-2', false)])).toEqual(
      [],
    )
  })

  it('returns empty for an empty catalog', () => {
    expect(selectBestSellers([])).toEqual([])
  })

  /**
   * The reason the window is 120 and not `first * 2`: this catalog's
   * all-time best sellers are a run of sold-out earrings, so a shelf that
   * only reads the top sixteen renders nothing at all.
   */
  it('reaches past a long run of sold-out pieces', () => {
    const nodes = [
      ...Array.from({ length: 40 }, (_, i) => node(`sold-${i}`, false)),
      node('live-1'),
      node('live-2'),
    ]
    expect(selectBestSellers(nodes).map((p) => p.handle)).toEqual([
      'live-1',
      'live-2',
    ])
  })

  /**
   * Twelve listings of the same chain are twelve best sellers. The shelf
   * shows one card, at the rank of the highest member, and its action
   * reads "View" because there is no single variant to add.
   */
  it('collapses a product family to one card at its best rank', () => {
    const best = selectBestSellers([
      node('iced-yellow-gold-cuban-xl', true, 'Iced Yellow Gold Miami Cuban'),
      node('iced-rose-gold-cuban-xl', true, 'Iced Rose Gold Miami Cuban'),
      node('iced-white-gold-cuban-l', true, 'Iced White Gold Cuban L'),
      node('2mm-rope-chain', true, '2mm Rope Chain'),
    ])

    expect(best.map((product) => product.title)).toEqual([
      'Iced Miami Cuban',
      '2mm Rope Chain',
    ])
    expect(best[0].handle).toBe('iced-yellow-gold-cuban-xl')
    expect(best[0].variantId).toBeNull()
  })
})

describe('getBestSellersLogic', () => {
  it('fetches one wide BEST_SELLING page and selects out of it', async () => {
    const request = vi.fn(async () => ({
      products: { nodes: [node('live-1'), node('sold-1', false)] },
    })) as unknown as BestSellersRequest

    const best = await getBestSellersLogic(request)

    expect(request).toHaveBeenCalledWith(expect.stringContaining('BEST_SELLING'), {
      variables: { first: BEST_SELLER_WINDOW },
    })
    expect(best.map((product) => product.handle)).toEqual(['live-1'])
  })
})
