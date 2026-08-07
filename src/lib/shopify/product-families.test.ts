import { describe, expect, it } from 'vitest'
import { collapseFamilies, findFamily } from './product-families'
import type { ProductCardNode } from './adapters'

const image = (url: string) => ({
  altText: null,
  width: 1000,
  height: 1000,
  w400: `${url}?w=400`,
  w600: `${url}?w=600`,
  w800: `${url}?w=800`,
  w1200: `${url}?w=1200`,
})

const node = (
  handle: string,
  title: string,
  extra: Partial<ProductCardNode> = {},
): ProductCardNode => ({
  handle,
  title,
  availableForSale: true,
  featuredImage: image(`/${handle}`),
  priceRange: {
    minVariantPrice: { amount: '199.0', currencyCode: 'USD' },
    maxVariantPrice: { amount: '199.0', currencyCode: 'USD' },
  },
  variants: { nodes: [{ id: `gid://${handle}/1`, availableForSale: true }] },
  ...extra,
})

/** The twelve listings as the store actually names them today. */
const ICED_CUBANS: ProductCardNode[] = [
  node('iced-yellow-gold-cuban-xl', 'Iced Yellow Gold Miami Cuban'),
  node('iced-rose-gold-cuban-xl', 'Iced Rose Gold Miami Cuban'),
  node('iced-white-gold-cuban-xl', 'Iced White Gold Miami Cuban'),
  node('iced-white-gold-cuban-l', 'Iced White Gold Cuban L'),
  node('iced-rose-gold-cuban-l', 'Iced Rose Gold Cuban L'),
  node('iced-yellow-gold-cuban-l', 'Iced Yellow Gold Cuban L'),
  node('iced-white-gold-cuban-m', 'Iced White Gold Cuban M'),
  node('iced-rose-gold-cuban-m', 'Iced Rose Gold Cuban M'),
  node('iced-yellow-gold-cuban-s', 'Iced Yellow Gold Cuban S'),
  node('iced-rosegold-cuban-s', 'Iced Rose Gold Cuban S'),
  node('iced-white-gold-cuban-s', 'Iced White Gold Cuban S'),
  node('iced-yellow-gold-cuban', 'Iced Yellow Gold Cuban M'),
]

describe('findFamily', () => {
  it('claims every iced Cuban listing in the catalog', () => {
    for (const listing of ICED_CUBANS) {
      expect(findFamily(listing)?.key, listing.handle).toBe('iced-miami-cuban')
    }
  })

  it('leaves a plain Cuban link chain alone — it is not iced', () => {
    expect(findFamily(node('cuban-link-chain', '5mm Cuban Link Chain'))).toBeUndefined()
  })

  it('leaves an iced piece that is not a Cuban alone', () => {
    expect(findFamily(node('iced-tennis-chain', 'Iced Tennis Chain'))).toBeUndefined()
  })
})

describe('collapseFamilies', () => {
  it('turns twelve listings into one card', () => {
    const collapsed = collapseFamilies(ICED_CUBANS)
    expect(collapsed).toHaveLength(1)
    expect(collapsed[0].title).toBe('Iced Miami Cuban')
    // Routed to the best-selling member, which is the first one back.
    expect(collapsed[0].handle).toBe('iced-yellow-gold-cuban-xl')
  })

  it('keeps the family at the rank of its highest member', () => {
    const collapsed = collapseFamilies([
      node('2mm-rope-chain', '2mm Rope Chain'),
      ICED_CUBANS[0],
      node('cuban-link-chain', '5mm Cuban Link Chain'),
      ICED_CUBANS[1],
    ])
    expect(collapsed.map((n) => n.handle)).toEqual([
      '2mm-rope-chain',
      'iced-yellow-gold-cuban-xl',
      'cuban-link-chain',
    ])
  })

  it('empties the variant list so the card offers options, not a blind add', () => {
    expect(collapseFamilies(ICED_CUBANS)[0].variants?.nodes).toEqual([])
  })

  it('hovers to a different metal rather than the same chain twice', () => {
    const collapsed = collapseFamilies(ICED_CUBANS)
    const frames = collapsed[0].images?.nodes ?? []
    expect(frames).toHaveLength(2)
    expect(frames[0].w800).toContain('iced-yellow-gold-cuban-xl')
    expect(frames[1].w800).toContain('iced-rose-gold-cuban-xl')
  })

  it('stays purchasable while any one member is', () => {
    const [first, ...rest] = ICED_CUBANS
    const collapsed = collapseFamilies([
      { ...first, availableForSale: false },
      ...rest.map((n) => ({ ...n, availableForSale: false })),
    ])
    expect(collapsed[0].availableForSale).toBe(false)

    const withOneLive = collapseFamilies([
      { ...first, availableForSale: false },
      rest[0],
    ])
    expect(withOneLive[0].availableForSale).toBe(true)
  })

  it('passes an unfamilied catalog through untouched', () => {
    const catalog = [
      node('2mm-rope-chain', '2mm Rope Chain'),
      node('gold-tennis-chain', 'Gold Tennis Chain'),
    ]
    expect(collapseFamilies(catalog)).toEqual(catalog)
  })
})
