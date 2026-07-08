import { describe, expect, it, vi } from 'vitest'
import {
  getFeaturedCollectionsLogic,
  type FeaturedRequest,
} from './featured'

const productNode = {
  handle: 'cuban-link-chain',
  title: 'Cuban Link Chain',
  availableForSale: true,
  featuredImage: null,
  priceRange: {
    minVariantPrice: { amount: '1450.0', currencyCode: 'USD' },
    maxVariantPrice: { amount: '1450.0', currencyCode: 'USD' },
  },
}

describe('getFeaturedCollectionsLogic', () => {
  it('tolerates a missing handle and a failing fetch — renders the rest, logs', async () => {
    const warn = vi.fn()
    const request = vi.fn(async (_op: string, options?: { variables?: Record<string, unknown> }) => {
      const handle = options?.variables?.handle
      if (handle === 'chains') {
        return {
          collection: {
            handle: 'chains',
            title: 'Chains',
            products: { nodes: [productNode] },
          },
        }
      }
      if (handle === 'pendants') return { collection: null }
      throw new Error('network down')
    }) as unknown as FeaturedRequest

    const featured = await getFeaturedCollectionsLogic(
      request,
      ['chains', 'pendants', 'rings'],
      warn,
    )

    expect(featured).toHaveLength(1)
    expect(featured[0]).toMatchObject({ handle: 'chains', title: 'Chains' })
    expect(featured[0].products[0].price).toBe('$1,450')
    expect(warn).toHaveBeenCalledTimes(2)
    expect(String(warn.mock.calls[0][0])).toContain('pendants')
    expect(String(warn.mock.calls[1][0])).toContain('rings')
  })

  it('skips collections with no products', async () => {
    const warn = vi.fn()
    const request = vi.fn(async () => ({
      collection: { handle: 'empty', title: 'Empty', products: { nodes: [] } },
    })) as unknown as FeaturedRequest

    const featured = await getFeaturedCollectionsLogic(request, ['empty'], warn)
    expect(featured).toHaveLength(0)
    expect(warn).toHaveBeenCalledOnce()
  })
})
