import { describe, expect, it } from 'vitest'
import {
  buildCardImage,
  formatMoney,
  isValidHandle,
  mapCollectionPage,
  mapProductCard,
  paginate,
  parseFormattedMoney,
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

describe('mapCollectionPage', () => {
  const collection: CollectionNode = {
    handle: 'chains',
    title: 'Chains',
    description: 'Hand-finished chains.',
    seo: { title: 'Chains — Solid Gold', description: null },
    products: { nodes: [cardNode()] },
  }

  it('maps seo fields with fallbacks', () => {
    const model = mapCollectionPage(collection, 1, 24)
    expect(model.seoTitle).toBe('Chains — Solid Gold')
    expect(model.seoDescription).toBe('Hand-finished chains.')
    expect(model.products).toHaveLength(1)
    expect(model.totalPages).toBe(1)
  })

  it('falls back to title/description when seo is null', () => {
    const model = mapCollectionPage({ ...collection, seo: null }, 1, 24)
    expect(model.seoTitle).toBe('Chains')
    expect(model.seoDescription).toBe('Hand-finished chains.')
  })

  it('maps only the requested page, never the whole fetch', () => {
    const many: CollectionNode = {
      ...collection,
      products: {
        nodes: Array.from({ length: 60 }, (_, i) =>
          cardNode({ handle: `piece-${i}`, title: `Piece ${i}` }),
        ),
      },
    }
    const page2 = mapCollectionPage(many, 2, 24)
    expect(page2.products).toHaveLength(24)
    expect(page2.products[0].handle).toBe('piece-24')
    expect(page2.total).toBe(60)
    expect(page2.totalPages).toBe(3)
  })
})

import {
  mapProductDetail,
  type ProductDetailNode,
  type VariantNode,
} from './adapters'
import { jsonLdScript, productJsonLd } from '../seo'

function variantNode(
  options: Record<string, string>,
  overrides: Partial<VariantNode> = {},
): VariantNode {
  return {
    id: `gid://shopify/ProductVariant/${Object.values(options).join('-')}`,
    title: Object.values(options).join(' / '),
    availableForSale: true,
    price: { amount: '1450.0', currencyCode: 'USD' },
    compareAtPrice: null,
    selectedOptions: Object.entries(options).map(([name, value]) => ({
      name,
      value,
    })),
    ...overrides,
  }
}

function detailNode(
  overrides: Partial<ProductDetailNode> = {},
): ProductDetailNode {
  const variants = [
    variantNode({ Metal: 'Gold', Size: '18"' }),
    variantNode({ Metal: 'Gold', Size: '20"' }, { availableForSale: false }),
    variantNode({ Metal: 'Silver', Size: '18"' }),
    variantNode({ Metal: 'Silver', Size: '20"' }),
  ]
  return {
    handle: 'cuban-link-chain',
    title: 'Cuban Link Chain',
    description: 'Solid, hand-set links.',
    seo: { title: null, description: null },
    options: [
      {
        name: 'Metal',
        optionValues: [
          { name: 'Gold', swatch: { color: '#C4A875' } },
          { name: 'Silver', swatch: { color: '#C0C0C0' } },
        ],
      },
      {
        name: 'Size',
        optionValues: [
          { name: '18"', swatch: null },
          { name: '20"', swatch: null },
        ],
      },
    ],
    images: {
      nodes: [
        {
          altText: null,
          width: 1600,
          height: 2000,
          thumb: 'https://cdn.shopify.com/img?t',
          w600: 'https://cdn.shopify.com/img?w=600',
          w900: 'https://cdn.shopify.com/img?w=900',
          w1200: 'https://cdn.shopify.com/img?w=1200',
          w1600: 'https://cdn.shopify.com/img?w=1600',
        },
      ],
    },
    variants: { nodes: variants },
    selectedVariant: variants[0],
    fallbackVariant: variants[0],
    ...overrides,
  }
}

describe('mapProductDetail', () => {
  it('prefers the exact selected variant and reports its price', () => {
    const model = mapProductDetail(detailNode())
    expect(model.variant?.price).toBe('$1,450')
    expect(model.variant?.availableForSale).toBe(true)
    expect(model.offer).toEqual({
      price: '1450.0',
      currency: 'USD',
      available: true,
    })
  })

  it('falls back when the exact combination does not exist', () => {
    const node = detailNode()
    node.selectedVariant = null
    const model = mapProductDetail(node)
    expect(model.variant?.id).toBe(node.fallbackVariant!.id)
  })

  it('disables sibling option values with no available variant', () => {
    // Current selection Gold/18". Gold/20" is sold out → Size "20\"" disabled.
    const model = mapProductDetail(detailNode())
    const size = model.options.find((o) => o.name === 'Size')!
    const twenty = size.values.find((v) => v.name === '20"')!
    expect(twenty.available).toBe(false)
    const eighteen = size.values.find((v) => v.name === '18"')!
    expect(eighteen.available).toBe(true)
    expect(eighteen.selected).toBe(true)
  })

  it('builds click-target search params from the current selection', () => {
    const model = mapProductDetail(detailNode())
    const metal = model.options.find((o) => o.name === 'Metal')!
    const silver = metal.values.find((v) => v.name === 'Silver')!
    expect(silver.search).toEqual({ Metal: 'Silver', Size: '18"' })
  })

  it('marks color-swatch options and carries the swatch color', () => {
    const model = mapProductDetail(detailNode())
    const metal = model.options.find((o) => o.name === 'Metal')!
    expect(metal.isColor).toBe(true)
    expect(metal.values[0].swatchColor).toBe('#C4A875')
  })

  it('suppresses the placeholder Title option of single-variant products', () => {
    const only = variantNode({ Title: 'Default Title' })
    const node = detailNode({
      options: [
        {
          name: 'Title',
          optionValues: [{ name: 'Default Title', swatch: null }],
        },
      ],
      variants: { nodes: [only] },
      selectedVariant: null,
      fallbackVariant: only,
    })
    const model = mapProductDetail(node)
    expect(model.options).toHaveLength(0)
    expect(model.variant?.id).toBe(only.id)
  })

  it('yields a sold-out model when the resolved variant is unavailable', () => {
    const gone = variantNode({ Metal: 'Gold' }, { availableForSale: false })
    const node = detailNode({
      variants: { nodes: [gone] },
      selectedVariant: gone,
      fallbackVariant: gone,
    })
    const model = mapProductDetail(node)
    expect(model.variant?.availableForSale).toBe(false)
    expect(model.offer?.available).toBe(false)
  })
})

describe('productJsonLd', () => {
  it('binds the offer to the displayed variant price and availability', () => {
    const model = mapProductDetail(detailNode())
    const jsonLd = productJsonLd({
      title: model.title,
      description: model.description,
      path: `/products/${model.handle}`,
      images: model.images.map((i) => i.src),
      offer: model.offer,
    })
    expect(jsonLd.offers).toMatchObject({
      price: '1450.0',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock',
    })
    expect(jsonLd.url).toBe('https://www.thejewelryaura.com/products/cuban-link-chain')
  })

  it('omits offers when no variant resolved', () => {
    const jsonLd = productJsonLd({
      title: 'X',
      description: '',
      path: '/products/x',
      images: [],
      offer: null,
    })
    expect('offers' in jsonLd).toBe(false)
  })
})

describe('jsonLdScript', () => {
  it('neutralizes </script> breakout in merchant-editable strings', () => {
    const serialized = jsonLdScript(
      productJsonLd({
        title: '</script><img src=x onerror=alert(1)>',
        description: 'a < b',
        path: '/products/x',
        images: [],
        offer: null,
      }),
    )
    expect(serialized).not.toContain('<')
    // Still valid JSON that round-trips to the original string.
    const parsed = JSON.parse(serialized) as { name: string }
    expect(parsed.name).toBe('</script><img src=x onerror=alert(1)>')
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
      'https://www.thejewelryaura.com/collections/chains',
    )
  })
})

// ─── Card enrichments (hover image, quick add, sale) ─────────────────
// These branches drive behaviour the current catalog does not exercise
// — every live product is multi-variant or sold out — so they are
// pinned here rather than left to be discovered by the first
// single-variant product the shop adds.

describe('mapProductCard enrichments', () => {
  const image = (n: number) => ({
    altText: `Image ${n}`,
    width: 1600,
    height: 2000,
    w400: `https://cdn.shopify.com/img${n}?width=400`,
    w600: `https://cdn.shopify.com/img${n}?width=600`,
    w800: `https://cdn.shopify.com/img${n}?width=800`,
    w1200: `https://cdn.shopify.com/img${n}?width=1200`,
  })

  it('takes the second image as the hover frame', () => {
    const card = mapProductCard(
      cardNode({ images: { nodes: [image(1), image(2)] } }),
    )
    expect(card.hoverImage?.src).toBe('https://cdn.shopify.com/img2?width=800')
  })

  it('has no hover frame when the product has one image', () => {
    expect(mapProductCard(cardNode({ images: { nodes: [image(1)] } })).hoverImage)
      .toBeNull()
  })

  it('exposes a variant id for quick add when there is exactly one variant', () => {
    const card = mapProductCard(
      cardNode({
        variants: {
          nodes: [{ id: 'gid://shopify/ProductVariant/1', availableForSale: true }],
        },
      }),
    )
    expect(card.variantId).toBe('gid://shopify/ProductVariant/1')
    expect(card.optionCount).toBe(1)
  })

  it('withholds the variant id when a choice is needed first', () => {
    const card = mapProductCard(
      cardNode({
        variants: {
          nodes: [
            { id: 'gid://shopify/ProductVariant/1', availableForSale: true },
            { id: 'gid://shopify/ProductVariant/2', availableForSale: true },
          ],
        },
      }),
    )
    expect(card.variantId).toBeNull()
    expect(card.optionCount).toBe(2)
  })

  it('formats a compare-at price only when it is above the sale price', () => {
    const onSale = mapProductCard(
      cardNode({
        compareAtPriceRange: {
          minVariantPrice: { amount: '1800.0', currencyCode: 'USD' },
        },
      }),
    )
    expect(onSale.compareAtPrice).toBe('$1,800')

    // Shopify returns 0 rather than null when nothing is discounted.
    const notOnSale = mapProductCard(
      cardNode({
        compareAtPriceRange: {
          minVariantPrice: { amount: '0.0', currencyCode: 'USD' },
        },
      }),
    )
    expect(notOnSale.compareAtPrice).toBeNull()
  })
})

describe('parseFormattedMoney', () => {
  it('reads formatted money back to a number', () => {
    expect(parseFormattedMoney('$2,900')).toBe(2900)
    expect(parseFormattedMoney('$89.50')).toBe(89.5)
  })

  it('returns 0 for a string with no digits', () => {
    expect(parseFormattedMoney('—')).toBe(0)
  })
})
