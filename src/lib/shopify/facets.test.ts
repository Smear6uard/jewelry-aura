import { describe, expect, it } from 'vitest'
import {
  allFacetCounts,
  applyFacets,
  facetCounts,
  hasActiveFacets,
  listingHref,
  metalsOf,
  parseFacets,
  priceBandOf,
  stylesOf,
} from './facets'
import type { ProductCardNode } from './adapters'

function node(title: string, amount: string, available = true): ProductCardNode {
  return {
    handle: title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title,
    availableForSale: available,
    featuredImage: null,
    priceRange: {
      minVariantPrice: { amount, currencyCode: 'USD' },
      maxVariantPrice: { amount, currencyCode: 'USD' },
    },
  }
}

const CATALOG: ProductCardNode[] = [
  node('10K Yellow Gold Miami Cuban Link 20"', '1450.00'),
  node('14K White Gold Rope Chain 22"', '890.00'),
  node('Sterling Silver Figaro Chain', '120.00'),
  node('14K Two-Tone Franco Chain', '2100.00', false),
  node('Moissanite Tennis Chain', '640.00'),
]

describe('metalsOf', () => {
  it('reads an explicit gold colour out of the title', () => {
    expect(metalsOf('14K White Gold Rope Chain')).toContain('white-gold')
    expect(metalsOf('Rose Gold Cuban')).toContain('rose-gold')
  })

  it('treats bare karat gold as yellow', () => {
    expect(metalsOf('14K Cuban Link 20"')).toEqual(['yellow-gold'])
  })

  it('does not also claim yellow when another gold colour matched', () => {
    expect(metalsOf('14K White Gold Rope Chain')).not.toContain('yellow-gold')
    expect(metalsOf('Two-Tone Franco')).not.toContain('yellow-gold')
  })

  it('returns every metal a title registers for', () => {
    expect(metalsOf('White Gold Moissanite Tennis Bracelet').sort()).toEqual([
      'moissanite',
      'white-gold',
    ])
  })

  it('returns nothing for a title with no metal in it', () => {
    expect(metalsOf('Praying Hands Pendant')).toEqual([])
  })
})

describe('stylesOf', () => {
  it('picks up link styles', () => {
    expect(stylesOf('Miami Cuban Link')).toContain('cuban')
    expect(stylesOf('Franco Chain')).toContain('franco')
  })

  it('picks up pendant styles', () => {
    expect(stylesOf('Custom Name Plate')).toContain('name')
    expect(stylesOf('Iced Cross Pendant').sort()).toEqual(['cross', 'iced'])
  })
})

describe('priceBandOf', () => {
  it('places prices in the merchandising ladder', () => {
    expect(priceBandOf(node('a', '99.00'))).toBe('under-250')
    expect(priceBandOf(node('b', '250.00'))).toBe('250-750')
    expect(priceBandOf(node('c', '750.00'))).toBe('250-750')
    expect(priceBandOf(node('d', '750.01'))).toBe('750-plus')
  })
})

describe('applyFacets', () => {
  it('returns everything when no facet is active', () => {
    expect(applyFacets(CATALOG, {})).toHaveLength(5)
  })

  it('filters on style', () => {
    const result = applyFacets(CATALOG, { style: 'cuban' })
    expect(result.map((n) => n.title)).toEqual([
      '10K Yellow Gold Miami Cuban Link 20"',
    ])
  })

  it('ANDs facets together', () => {
    expect(applyFacets(CATALOG, { metal: 'white-gold', style: 'rope' })).toHaveLength(1)
    expect(applyFacets(CATALOG, { metal: 'white-gold', style: 'cuban' })).toHaveLength(0)
  })

  it('filters out sold-out pieces on the in-stock facet', () => {
    const result = applyFacets(CATALOG, { avail: 'in-stock' })
    expect(result).toHaveLength(4)
    expect(result.every((n) => n.availableForSale)).toBe(true)
  })

  it('sorts by price without mutating the input', () => {
    const before = CATALOG.map((n) => n.title)
    const asc = applyFacets(CATALOG, { sort: 'price-asc' })
    expect(asc[0].title).toBe('Sterling Silver Figaro Chain')
    expect(asc[asc.length - 1].title).toBe('14K Two-Tone Franco Chain')
    expect(applyFacets(CATALOG, { sort: 'price-desc' })[0].title).toBe(
      '14K Two-Tone Franco Chain',
    )
    expect(CATALOG.map((n) => n.title)).toEqual(before)
  })

  it('leaves the source order alone on featured', () => {
    expect(applyFacets(CATALOG, { sort: 'featured' }).map((n) => n.title)).toEqual(
      CATALOG.map((n) => n.title),
    )
  })
})

describe('facetCounts', () => {
  it('counts against the other active facets, not its own group', () => {
    // With style=cuban applied, the metal list must still offer every
    // metal a cuban piece comes in — and only those.
    const counts = facetCounts(CATALOG, { style: 'cuban' }, 'metal')
    expect(counts['yellow-gold']).toBe(1)
    expect(counts['white-gold']).toBeUndefined()

    // The style group ignores its own selection, so every style a
    // product in the pool has still shows a count.
    const styles = facetCounts(CATALOG, { style: 'cuban' }, 'style')
    expect(styles.rope).toBe(1)
    expect(styles.cuban).toBe(1)
  })

  it('a count of N means selecting it yields N products', () => {
    const counts = facetCounts(CATALOG, {}, 'metal')
    for (const [metal, count] of Object.entries(counts)) {
      expect(applyFacets(CATALOG, { metal })).toHaveLength(count)
    }
  })

  it('builds every group at once', () => {
    const all = allFacetCounts(CATALOG, {})
    expect(Object.keys(all).sort()).toEqual(['avail', 'metal', 'price', 'style'])
    expect(all.avail['in-stock']).toBe(4)
  })
})

describe('parseFacets', () => {
  it('keeps valid values and drops the rest', () => {
    expect(
      parseFacets({ metal: 'white-gold', sort: 'price-asc', avail: 'in-stock' }),
    ).toEqual({
      metal: 'white-gold',
      style: undefined,
      price: undefined,
      avail: 'in-stock',
      sort: 'price-asc',
    })
  })

  it('rejects an unknown sort key and a non-string facet', () => {
    const parsed = parseFacets({ sort: 'cheapest', metal: 42, avail: 'maybe' })
    expect(parsed.sort).toBeUndefined()
    expect(parsed.metal).toBeUndefined()
    expect(parsed.avail).toBeUndefined()
  })

  it('drops an over-long value rather than passing it to a cache tag', () => {
    expect(parseFacets({ style: 'x'.repeat(41) }).style).toBeUndefined()
  })
})

describe('listingHref', () => {
  it('returns the clean path when nothing is active', () => {
    expect(listingHref('/shop', {})).toBe('/shop')
    expect(listingHref('/shop', { sort: 'featured' }, 1)).toBe('/shop')
  })

  it('emits params in a fixed order so one state is one URL', () => {
    const a = listingHref('/shop', { price: 'under-250', metal: 'silver' })
    const b = listingHref('/shop', { metal: 'silver', price: 'under-250' })
    expect(a).toBe(b)
    expect(a).toBe('/shop?metal=silver&price=under-250')
  })

  it('omits page 1 and includes later pages', () => {
    expect(listingHref('/shop', { metal: 'silver' }, 1)).toBe('/shop?metal=silver')
    expect(listingHref('/shop', { metal: 'silver' }, 3)).toBe(
      '/shop?metal=silver&page=3',
    )
  })

  it('carries surface-owned params like a search query', () => {
    expect(listingHref('/search', { metal: 'silver' }, 1, { q: 'rope chain' })).toBe(
      '/search?q=rope+chain&metal=silver',
    )
  })
})

describe('hasActiveFacets', () => {
  it('ignores sort', () => {
    expect(hasActiveFacets({ sort: 'price-asc' })).toBe(false)
    expect(hasActiveFacets({ metal: 'silver' })).toBe(true)
  })
})
