import { describe, expect, it } from 'vitest'
import {
  badgeCount,
  cartReducer,
  initialCartUiState,
  withLineQuantity,
  type CartUiState,
} from './CartProvider'
import type { CartModel } from '~/lib/shopify/cart'

function cart(overrides: Partial<CartModel> = {}): CartModel {
  return {
    id: 'gid://shopify/Cart/1',
    checkoutUrl: 'https://checkout.shopify.com/c/1?key=abc',
    totalQuantity: 3,
    subtotal: '$2,900',
    lines: [
      {
        id: 'line-1',
        quantity: 2,
        merchandiseId: 'gid://shopify/ProductVariant/11',
        title: 'Cuban Link Chain',
        variantTitle: '20"',
        handle: 'cuban-link-chain',
        price: '$1,450',
        lineTotal: '$2,900',
        image: null,
        availableForSale: true,
      },
      {
        id: 'line-2',
        quantity: 1,
        merchandiseId: 'gid://shopify/ProductVariant/12',
        title: 'Signet Ring',
        variantTitle: '',
        handle: 'signet-ring',
        price: '$680',
        lineTotal: '$680',
        image: null,
        availableForSale: true,
      },
    ],
    ...overrides,
  }
}

describe('cartReducer', () => {
  it('starts loading and maps to a skeleton badge (never a false 0)', () => {
    expect(initialCartUiState.status).toBe('loading')
    expect(badgeCount(initialCartUiState)).toBeNull()
  })

  it('resolves to the fetched cart and derives the badge from quantities', () => {
    const state = cartReducer(initialCartUiState, {
      type: 'resolved',
      cart: cart(),
    })
    expect(state.status).toBe('ready')
    expect(badgeCount(state)).toBe(3)
  })

  it('maps a failed fetch to an empty-looking state', () => {
    const state = cartReducer(initialCartUiState, { type: 'fetch-failed' })
    expect(state.status).toBe('ready')
    expect(state.cart).toBeNull()
    expect(badgeCount(state)).toBe(0)
  })

  it('optimistic update then rollback restores the pre-mutation cart', () => {
    let state: CartUiState = cartReducer(initialCartUiState, {
      type: 'resolved',
      cart: cart(),
    })
    state = cartReducer(state, {
      type: 'optimistic',
      cart: withLineQuantity(state.cart!, 'line-1', 5),
    })
    expect(state.cart?.totalQuantity).toBe(6)
    state = cartReducer(state, { type: 'rollback' })
    expect(state.cart?.totalQuantity).toBe(3)
    expect(state.snapshot).toBeNull()
  })

  it('keeps the earliest snapshot across stacked optimistic updates', () => {
    let state: CartUiState = cartReducer(initialCartUiState, {
      type: 'resolved',
      cart: cart(),
    })
    state = cartReducer(state, {
      type: 'optimistic',
      cart: withLineQuantity(state.cart!, 'line-1', 5),
    })
    state = cartReducer(state, {
      type: 'optimistic',
      cart: withLineQuantity(state.cart!, 'line-2', 4),
    })
    state = cartReducer(state, { type: 'rollback' })
    expect(state.cart?.totalQuantity).toBe(3)
  })

  it('rollback after an interleaved commit keeps the cart (never nulls it)', () => {
    // Race: optimistic(A) -> optimistic(B) -> commit(A) clears the shared
    // snapshot -> rollback(B) must NOT wipe the cart to null.
    let state: CartUiState = cartReducer(initialCartUiState, {
      type: 'resolved',
      cart: cart(),
    })
    state = cartReducer(state, {
      type: 'optimistic',
      cart: withLineQuantity(state.cart!, 'line-1', 5),
    })
    const serverCartA = cart({ totalQuantity: 6 })
    state = cartReducer(state, { type: 'commit', cart: serverCartA })
    state = cartReducer(state, { type: 'rollback' })
    expect(state.cart).not.toBeNull()
    expect(state.cart).toBe(serverCartA)
  })

  it('commit replaces the cart and clears the snapshot', () => {
    let state: CartUiState = cartReducer(initialCartUiState, {
      type: 'resolved',
      cart: cart(),
    })
    state = cartReducer(state, {
      type: 'optimistic',
      cart: withLineQuantity(state.cart!, 'line-2', 0),
    })
    const serverCart = cart({ totalQuantity: 2 })
    state = cartReducer(state, { type: 'commit', cart: serverCart })
    expect(state.cart).toBe(serverCart)
    expect(state.snapshot).toBeNull()
  })
})

describe('withLineQuantity', () => {
  it('changes a line quantity and re-derives the count', () => {
    const next = withLineQuantity(cart(), 'line-1', 1)
    expect(next.totalQuantity).toBe(2)
    expect(next.lines).toHaveLength(2)
  })

  it('drops a line at quantity zero', () => {
    const next = withLineQuantity(cart(), 'line-2', 0)
    expect(next.lines).toHaveLength(1)
    expect(next.totalQuantity).toBe(2)
  })
})

describe('checkout handoff', () => {
  it('uses the checkoutUrl from the cart object untouched', () => {
    const model = cart()
    expect(model.checkoutUrl).toBe('https://checkout.shopify.com/c/1?key=abc')
  })
})
