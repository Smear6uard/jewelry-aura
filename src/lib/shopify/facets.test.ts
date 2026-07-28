import { describe, expect, it } from 'vitest'
import {
  FACET_GROUPS,
  activeFacetCount,
  allFacetCounts,
  applyFacets,
  clearedFacets,
  facetCounts,
  facetsFromSearch,
  hasActiveFacets,
  lengthsOf,
  listingHref,
  metalsOf,
  parseFacets,
  priceBandOf,
  stylesOf,
  type Facets,
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
    // Every declared group, so a new facet cannot ship without counts.
    expect(Object.keys(all).sort()).toEqual([...FACET_GROUPS].sort())
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
      length: undefined,
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
    expect(hasActiveFacets({ length: '18-22' })).toBe(true)
  })
})

// ─── Length ──────────────────────────────────────────────────────────
// The PLP's length filter, read out of the product title because the
// card query cannot see variant option names.

describe('lengthsOf', () => {
  it('reads an inch measurement written in any of the usual ways', () => {
    expect(lengthsOf('10K Gold Miami Cuban Link 20"')).toEqual(['18-22'])
    expect(lengthsOf('Rope Chain 20 inch')).toEqual(['18-22'])
    expect(lengthsOf('Franco Chain 20in')).toEqual(['18-22'])
    expect(lengthsOf('Box Chain 20”')).toEqual(['18-22'])
  })

  it('places lengths in the right band', () => {
    expect(lengthsOf('Tennis Chain 16"')).toEqual(['under-18'])
    expect(lengthsOf('Cuban Link 18"')).toEqual(['18-22'])
    expect(lengthsOf('Cuban Link 22"')).toEqual(['18-22'])
    expect(lengthsOf('Cuban Link 24"')).toEqual(['24-plus'])
    expect(lengthsOf('Franco Chain 30"')).toEqual(['24-plus'])
  })

  it('registers a piece offered at several lengths for every band', () => {
    expect(lengthsOf('Cuban Link 20" / 24"').sort()).toEqual([
      '18-22',
      '24-plus',
    ])
  })

  it('returns nothing for a piece with no length in its title', () => {
    expect(lengthsOf('14K White Gold Signet Ring')).toEqual([])
    expect(lengthsOf('Praying Hands Pendant')).toEqual([])
  })

  it('ignores numbers that are not neck measurements', () => {
    // Karat marks, stone counts and years must not become lengths.
    expect(lengthsOf('10K Yellow Gold Cuban Link')).toEqual([])
    expect(lengthsOf('2 inch Charm')).toEqual([])
    expect(lengthsOf('Chain 60 inch')).toEqual([])
  })
})

describe('facet declaration is centralised', () => {
  it('counts and clears every declared group, not a hand-written subset', () => {
    for (const group of FACET_GROUPS) {
      expect(
        activeFacetCount({ [group]: 'x' } as Facets),
        `${group} counts toward the active-filter badge`,
      ).toBe(1)
      expect(
        Object.keys(clearedFacets()),
        `${group} is cleared by "clear all"`,
      ).toContain(group)
    }
    expect(activeFacetCount({ sort: 'price-asc' })).toBe(0)
  })

  it('lifts every declared group out of route search params', () => {
    const search = Object.fromEntries(
      FACET_GROUPS.map((group) => [group, `v-${group}`]),
    ) as Facets
    expect(facetsFromSearch({ ...search, sort: 'name' })).toEqual({
      ...search,
      sort: 'name',
    })
  })

  it('counts length values in allFacetCounts', () => {
    const counts = allFacetCounts(
      [node('Cuban Link 20"', '900.00'), node('Rope Chain 26"', '1200.00')],
      {},
    )
    expect(counts.length).toEqual({ '18-22': 1, '24-plus': 1 })
  })

  it('filters a listing down to a length band', () => {
    const filtered = applyFacets(CATALOG, { length: '18-22' })
    expect(filtered.map((n) => n.title)).toEqual([
      '10K Yellow Gold Miami Cuban Link 20"',
      '14K White Gold Rope Chain 22"',
    ])
  })
})
