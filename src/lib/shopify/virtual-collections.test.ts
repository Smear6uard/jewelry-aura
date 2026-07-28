/**
 * The keyword rules behind every category page, pinned.
 *
 * These rules are the only thing standing between the menu's twelve
 * handles and twelve 404s, and they run on product titles — which means
 * the failure mode is silent and plausible. "Earrings" contains "ring";
 * a substring rule files every pair of studs in the ring case and
 * nobody notices until a customer does.
 */

import { describe, expect, it } from 'vitest'
import {
  findVirtualCollection,
  selectVirtual,
  virtualCollectionHandles,
} from './virtual-collections'
import { CATEGORIES, WOMENS } from '~/lib/catalog'
import type { ProductCardNode } from './adapters'

function product(
  title: string,
  overrides: Partial<ProductCardNode> = {},
): ProductCardNode {
  return {
    handle: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title,
    availableForSale: true,
    featuredImage: null,
    priceRange: {
      minVariantPrice: { amount: '199.00', currencyCode: 'USD' },
      maxVariantPrice: { amount: '199.00', currencyCode: 'USD' },
    },
    ...overrides,
  }
}

const CATALOG = [
  product('14K Gold Cuban Link Chain 20"'),
  product('4mm Rope Chain'),
  product('Gold Tennis Chain'),
  product('Silver Square Earrings'),
  product('Gold Circle Earrings'),
  product('White Gold Signet Ring'),
  product('Moissanite Engagement Ring'),
  product('Cuban Link Bracelet'),
  product('Diamond Cross Pendant'),
]

function titlesIn(handle: string): string[] {
  const collection = findVirtualCollection(handle)
  if (!collection) throw new Error(`no virtual collection for ${handle}`)
  return selectVirtual(CATALOG, collection).map((node) => node.title)
}

describe('findVirtualCollection', () => {
  it('resolves every handle the menus link to', () => {
    for (const handle of virtualCollectionHandles()) {
      expect(findVirtualCollection(handle), handle).toBeTruthy()
    }
  })

  it('covers all five categories and the women’s cut of each', () => {
    const handles = virtualCollectionHandles()
    for (const category of CATEGORIES) {
      expect(handles).toContain(category.handle)
      expect(handles).toContain(`womens-${category.handle}`)
    }
    expect(handles).toContain(WOMENS.handle)
  })

  it('leaves unknown handles to 404', () => {
    expect(findVirtualCollection('not-a-case')).toBeUndefined()
    expect(findVirtualCollection('womens-watches')).toBeUndefined()
  })

  it('gives every collection an empty state that routes onward', () => {
    for (const handle of virtualCollectionHandles()) {
      const collection = findVirtualCollection(handle)!
      expect(collection.emptyAction.href, handle).toMatch(/^\//)
      expect(collection.emptyAction.label.length, handle).toBeGreaterThan(0)
      expect(collection.emptyBody.length, handle).toBeGreaterThan(0)
    }
  })

  it('sends an empty women’s case to its parent category', () => {
    const collection = findVirtualCollection('womens-earrings')!
    expect(collection.emptyAction.href).toBe('/collections/earrings')
  })
})

describe('category rules', () => {
  it('files chains by every link vocabulary', () => {
    expect(titlesIn('chains')).toEqual([
      '14K Gold Cuban Link Chain 20"',
      '4mm Rope Chain',
      'Gold Tennis Chain',
    ])
  })

  it('does not read "earrings" as a ring', () => {
    const rings = titlesIn('rings')
    expect(rings).toEqual([
      'White Gold Signet Ring',
      'Moissanite Engagement Ring',
    ])
    expect(rings.join(' ')).not.toContain('Earrings')
  })

  it('does not read a bracelet as a chain', () => {
    expect(titlesIn('chains')).not.toContain('Cuban Link Bracelet')
    expect(titlesIn('bracelets')).toEqual(['Cuban Link Bracelet'])
  })

  it('finds earrings and pendants', () => {
    expect(titlesIn('earrings')).toEqual([
      'Silver Square Earrings',
      'Gold Circle Earrings',
    ])
    expect(titlesIn('pendants')).toEqual(['Diamond Cross Pendant'])
  })

  it('finds moissanite by the stone, not the setting', () => {
    expect(titlesIn('moissanite')).toEqual(['Moissanite Engagement Ring'])
  })
})

describe('women’s rules', () => {
  it('claims nothing until a piece is actually marked for women', () => {
    expect(titlesIn('womens-earrings')).toEqual([])
    expect(titlesIn(WOMENS.handle)).toEqual([])
  })

  it('picks up a women’s piece in the right category only', () => {
    const catalog = [...CATALOG, product('Women’s Gold Hoop Earrings')]
    const earrings = findVirtualCollection('womens-earrings')!
    const chains = findVirtualCollection('womens-chains')!
    expect(selectVirtual(catalog, earrings).map((n) => n.title)).toEqual([
      'Women’s Gold Hoop Earrings',
    ])
    expect(selectVirtual(catalog, chains)).toEqual([])
  })
})

describe('sale', () => {
  const onSale = product('Marked Down Rope Chain', {
    compareAtPriceRange: { minVariantPrice: { amount: '299.00', currencyCode: 'USD' } },
  })
  const notOnSale = product('Full Price Rope Chain', {
    compareAtPriceRange: { minVariantPrice: { amount: '0.0', currencyCode: 'USD' } },
  })

  it('is a compare-at above the asking price, nothing else', () => {
    const sale = findVirtualCollection('sale')!
    expect(
      selectVirtual([...CATALOG, onSale, notOnSale], sale).map((n) => n.title),
    ).toEqual(['Marked Down Rope Chain'])
  })
})
