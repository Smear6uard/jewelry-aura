/**
 * The category-tile resolution rules from the merchandising pass, pinned.
 *
 * A tile without a correct image is a broken promise about what is behind
 * it, and the previous build shipped two of them (Bracelets and Rings as
 * empty typographic panels) plus one mislabelled one (a pendant
 * photograph under "Chains"). These tests are what stops that recurring.
 */

import { describe, expect, it } from 'vitest'
import { resolveTiles, type TileFallbackImage } from './CategoryTiles'
import { CATEGORIES } from '~/lib/catalog'

const remote = (alt: string): TileFallbackImage => ({
  src: 'https://cdn.shopify.com/p?width=600',
  srcSet: 'https://cdn.shopify.com/p?width=600 600w',
  alt,
})

/** Handles that have no dedicated local asset and rely on the fallback. */
const NEEDS_FALLBACK = CATEGORIES.filter((c) => !c.tileImage).map(
  (c) => c.handle,
)

describe('resolveTiles', () => {
  it('never emits a tile without an image', () => {
    for (const fallbacks of [
      {},
      { chains: remote('a chain') },
      Object.fromEntries(NEEDS_FALLBACK.map((h) => [h, remote(h)])),
    ]) {
      for (const tile of resolveTiles(fallbacks)) {
        expect(Boolean(tile.asset || tile.remote), tile.key).toBe(true)
        expect(tile.alt.length).toBeGreaterThan(0)
      }
    }
  })

  it('drops categories with no asset and no in-stock product image', () => {
    const keys = resolveTiles({}).map((tile) => tile.key)
    for (const handle of NEEDS_FALLBACK) {
      expect(keys).not.toContain(handle)
    }
    // Custom always survives: its asset ships with the repo.
    expect(keys).toContain('custom')
  })

  it('uses a collection product image when a category has no asset', () => {
    const handle = NEEDS_FALLBACK[0]
    const tiles = resolveTiles({ [handle]: remote('First in-stock piece') })
    const tile = tiles.find((t) => t.key === handle)
    expect(tile?.remote?.src).toContain('cdn.shopify.com')
    expect(tile?.alt).toBe('First in-stock piece')
    expect(tile?.asset).toBeUndefined()
  })

  it('prefers a dedicated asset over the collection fallback', () => {
    const withAsset = CATEGORIES.find((c) => c.tileImage)
    expect(withAsset, 'at least one category ships a local asset').toBeTruthy()
    const tiles = resolveTiles({
      [withAsset!.handle]: remote('should be ignored'),
    })
    const tile = tiles.find((t) => t.key === withAsset!.handle)
    expect(tile?.asset).toBe(withAsset!.tileImage)
    expect(tile?.remote).toBeUndefined()
  })

  it('caps the row at six doors — five categories plus Custom', () => {
    const all = Object.fromEntries(
      CATEGORIES.map((c) => [c.handle, remote(c.label)]),
    )
    const tiles = resolveTiles(all)
    expect(tiles.length).toBeLessThanOrEqual(6)
    // Custom is pinned last, so a full house of categories must not
    // push it off the end — the old slice(0, 5) silently did.
    expect(tiles.at(-1)?.key).toBe('custom')
  })

  it('keeps every category door when they all resolve', () => {
    const all = Object.fromEntries(
      CATEGORIES.map((c) => [c.handle, remote(c.label)]),
    )
    const keys = resolveTiles(all).map((tile) => tile.key)
    for (const category of CATEGORIES) {
      expect(keys).toContain(category.handle)
    }
  })
})
