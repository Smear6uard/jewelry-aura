import { describe, expect, it } from 'vitest'
import {
  buildCardImage,
  formatMoney,
  isValidHandle,
  mapCollection,
  mapProductCard,
  paginate,
  type CollectionNode,
  type ProductCardNode,
} from './adapters'
import { breadcrumbJsonLd } from '../seo'

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

describe('isValidHandle', () => {
  it('accepts lowercase alphanumerics and hyphens', () => {
    expect(isValidHandle('cuban-link-chain')).toBe(true)
    expect(isValidHandle('chains2')).toBe(true)
  })

  it('rejects traversal, uppercase, and injection shapes', () => {
    for (const bad of [
      '',
      'Chains',
      'a/b',
      '../etc',
      'a b',
      'a,b',
      'a%20b',
      'chaîne',
    ]) {
      expect(isValidHandle(bad), bad).toBe(false)
    }
  })
})

describe('paginate', () => {
  const items = Array.from({ length: 48 }, (_, i) => i)

  it('slices exact page boundaries', () => {
    const p1 = paginate(items, 1, 24)
    expect(p1.items[0]).toBe(0)
    expect(p1.items).toHaveLength(24)
    const p2 = paginate(items, 2, 24)
    expect(p2.items[0]).toBe(24)
    expect(p2.items).toHaveLength(24)
    expect(p2.totalPages).toBe(2)
  })

  it('handles a non-full final page', () => {
    const p = paginate(Array.from({ length: 25 }, (_, i) => i), 2, 24)
    expect(p.items).toHaveLength(1)
    expect(p.totalPages).toBe(2)
  })

  it('returns empty items beyond the last page', () => {
    const p = paginate(items, 3, 24)
    expect(p.items).toHaveLength(0)
    expect(p.totalPages).toBe(2)
  })

  it('treats an empty list as one page', () => {
    const p = paginate([], 1, 24)
    expect(p.items).toHaveLength(0)
    expect(p.totalPages).toBe(1)
  })
})

describe('mapCollection', () => {
  const collection: CollectionNode = {
    handle: 'chains',
    title: 'Chains',
    description: 'Hand-finished chains.',
    seo: { title: 'Chains — Solid Gold', description: null },
    products: { nodes: [cardNode()] },
  }

  it('maps seo fields with fallbacks', () => {
    const model = mapCollection(collection)
    expect(model.seoTitle).toBe('Chains — Solid Gold')
    expect(model.seoDescription).toBe('Hand-finished chains.')
    expect(model.products).toHaveLength(1)
  })

  it('falls back to title/description when seo is null', () => {
    const model = mapCollection({ ...collection, seo: null })
    expect(model.seoTitle).toBe('Chains')
    expect(model.seoDescription).toBe('Hand-finished chains.')
  })
})

describe('breadcrumbJsonLd', () => {
  it('names Home then the collection with absolute urls', () => {
    const jsonLd = breadcrumbJsonLd([
      { name: 'Home', path: '/' },
      { name: 'Chains', path: '/collections/chains' },
    ])
    expect(jsonLd['@type']).toBe('BreadcrumbList')
    expect(jsonLd.itemListElement).toHaveLength(2)
    expect(jsonLd.itemListElement[0]).toMatchObject({
      position: 1,
      name: 'Home',
    })
    expect(jsonLd.itemListElement[1].item).toBe(
      'https://jewelry-aura.com/collections/chains',
    )
  })
})
