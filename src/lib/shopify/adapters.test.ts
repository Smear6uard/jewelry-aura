import { describe, expect, it } from 'vitest'
import {
  buildCardImage,
  formatMoney,
  mapProductCard,
  type ProductCardNode,
} from './adapters'

function cardNode(overrides: Partial<ProductCardNode> = {}): ProductCardNode {
  return {
    handle: 'cuban-link-chain',
    title: 'Cuban Link Chain',
    availableForSale: true,
    featuredImage: {
      altText: 'Cuban link chain on marble',
      width: 1600,
      height: 2000,
      w400: 'https://cdn.shopify.com/img?width=400',
      w600: 'https://cdn.shopify.com/img?width=600',
      w800: 'https://cdn.shopify.com/img?width=800',
      w1200: 'https://cdn.shopify.com/img?width=1200',
    },
    priceRange: {
      minVariantPrice: { amount: '1450.0', currencyCode: 'USD' },
      maxVariantPrice: { amount: '1450.0', currencyCode: 'USD' },
    },
    ...overrides,
  }
}

describe('formatMoney', () => {
  it('drops cents on whole amounts', () => {
    expect(formatMoney({ amount: '1450.0', currencyCode: 'USD' })).toBe(
      '$1,450',
    )
  })

  it('keeps cents on fractional amounts', () => {
    expect(formatMoney({ amount: '89.5', currencyCode: 'USD' })).toBe('$89.50')
  })

  it('returns empty string for a non-numeric amount', () => {
    expect(formatMoney({ amount: 'oops', currencyCode: 'USD' })).toBe('')
  })
})

describe('buildCardImage', () => {
  it('assembles the srcset string in ascending width order', () => {
    const image = buildCardImage(cardNode().featuredImage, 'fallback')
    expect(image?.srcSet).toBe(
      'https://cdn.shopify.com/img?width=400 400w, ' +
        'https://cdn.shopify.com/img?width=600 600w, ' +
        'https://cdn.shopify.com/img?width=800 800w, ' +
        'https://cdn.shopify.com/img?width=1200 1200w',
    )
    expect(image?.src).toBe('https://cdn.shopify.com/img?width=800')
    expect(image?.width).toBe(1600)
    expect(image?.height).toBe(2000)
  })

  it('returns null when the product has no image', () => {
    expect(buildCardImage(null, 'fallback')).toBeNull()
  })

  it('falls back to the product title for missing alt text', () => {
    const node = cardNode()
    node.featuredImage!.altText = null
    expect(buildCardImage(node.featuredImage, 'Cuban Link Chain')?.alt).toBe(
      'Cuban Link Chain',
    )
  })
})

describe('mapProductCard', () => {
  it('maps a product node to the card model', () => {
    const model = mapProductCard(cardNode())
    expect(model).toMatchObject({
      handle: 'cuban-link-chain',
      title: 'Cuban Link Chain',
      price: '$1,450',
      priceFrom: false,
      availableForSale: true,
    })
    expect(model.image).not.toBeNull()
  })

  it('flags a price range as "from" pricing', () => {
    const model = mapProductCard(
      cardNode({
        priceRange: {
          minVariantPrice: { amount: '480.0', currencyCode: 'USD' },
          maxVariantPrice: { amount: '1200.0', currencyCode: 'USD' },
        },
      }),
    )
    expect(model.priceFrom).toBe(true)
    expect(model.price).toBe('$480')
  })

  it('maps sold-out products', () => {
    const model = mapProductCard(cardNode({ availableForSale: false }))
    expect(model.availableForSale).toBe(false)
  })

  it('tolerates a product with no image', () => {
    const model = mapProductCard(cardNode({ featuredImage: null }))
    expect(model.image).toBeNull()
  })
})
