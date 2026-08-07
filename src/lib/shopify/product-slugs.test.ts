import { describe, expect, it } from 'vitest'

import { isValidHandle } from './adapters'
import {
  PRODUCT_SLUG_ALIASES,
  canonicalSlug,
  publicSlug,
  shopifyHandle,
} from './product-slugs'

describe('product slug aliases', () => {
  it('publishes the 4mm Cuban under the width in its title', () => {
    expect(publicSlug('6mm-cuban-link-chain')).toBe('4mm-cuban-link-chain')
    expect(shopifyHandle('4mm-cuban-link-chain')).toBe('6mm-cuban-link-chain')
  })

  it('leaves every other product alone in both directions', () => {
    for (const handle of ['cuban-link-chain', '2mm-rope-chain', 'anything']) {
      expect(publicSlug(handle)).toBe(handle)
      expect(shopifyHandle(handle)).toBe(handle)
    }
  })

  it('canonicalises both URLs of an aliased piece to the same slug', () => {
    expect(canonicalSlug('6mm-cuban-link-chain')).toBe('4mm-cuban-link-chain')
    expect(canonicalSlug('4mm-cuban-link-chain')).toBe('4mm-cuban-link-chain')
    expect(canonicalSlug('2mm-rope-chain')).toBe('2mm-rope-chain')
  })

  it('never aliases a slug onto itself or chains two aliases', () => {
    for (const [slug, handle] of Object.entries(PRODUCT_SLUG_ALIASES)) {
      expect(slug).not.toBe(handle)
      // A handle that is also a public slug would translate twice and
      // resolve to the wrong product.
      expect(PRODUCT_SLUG_ALIASES[handle]).toBeUndefined()
    }
  })

  it('keeps every alias routable', () => {
    for (const [slug, handle] of Object.entries(PRODUCT_SLUG_ALIASES)) {
      expect(isValidHandle(slug), slug).toBe(true)
      expect(isValidHandle(handle), handle).toBe(true)
    }
  })
})
