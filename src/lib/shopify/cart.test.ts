import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Mock } from 'vitest'
import {
  deleteCookie,
  getCookie,
  setCookie,
} from '@tanstack/react-start/server'
import { storefrontRequest } from './client'
import {
  addToCartLogic,
  getCartLogic,
  mapCart,
  removeCartLineLogic,
  updateCartLineLogic,
  validateAddToCartInput,
  validateRemoveCartLineInput,
  validateUpdateCartLineInput,
  type AddToCartInput,
  type RawCart,
  type RawCartLine,
} from './cart'

vi.mock('./client', () => ({
  storefrontRequest: vi.fn(),
}))

vi.mock('@tanstack/react-start/server', () => ({
  getCookie: vi.fn(),
  setCookie: vi.fn(),
  deleteCookie: vi.fn(),
  getRequestIP: vi.fn(() => '203.0.113.7'),
}))

const storefrontMock = storefrontRequest as unknown as Mock
const getCookieMock = getCookie as unknown as Mock
const setCookieMock = setCookie as unknown as Mock
const deleteCookieMock = deleteCookie as unknown as Mock

const CART_ID = 'gid://shopify/Cart/abc123'
const VARIANT_ID = 'gid://shopify/ProductVariant/111'
const LINE_ID = 'gid://shopify/CartLine/line-1'

function rawLine(overrides: Partial<RawCartLine> = {}): RawCartLine {
  return {
    id: LINE_ID,
    quantity: 2,
    merchandise: {
      id: VARIANT_ID,
      title: 'Default Title',
      availableForSale: true,
      price: { amount: '1450.0', currencyCode: 'USD' },
      image: {
        url: 'https://cdn.shopify.com/ring.jpg',
        altText: null,
        width: 1200,
        height: 1500,
      },
      product: { title: 'Aurora Ring', handle: 'aurora-ring' },
    },
    ...overrides,
  }
}

function rawCart(overrides: Partial<RawCart> = {}): RawCart {
  return {
    id: CART_ID,
    checkoutUrl: 'https://test-store.myshopify.com/cart/c/abc123',
    totalQuantity: 2,
    cost: {
      subtotalAmount: { amount: '2900.0', currencyCode: 'USD' },
      totalAmount: { amount: '2900.0', currencyCode: 'USD' },
    },
    lines: { nodes: [rawLine()] },
    ...overrides,
  }
}

/** Route mocked storefrontRequest by operation-name substring. */
function respondByOperation(map: Record<string, unknown>) {
  storefrontMock.mockImplementation(async (operation: string) => {
    for (const [name, payload] of Object.entries(map)) {
      if (operation.includes(name)) return payload
    }
    throw new Error(`unexpected operation: ${operation.slice(0, 80)}`)
  })
}

function operationOfCall(index: number): string {
  return storefrontMock.mock.calls[index][0] as string
}

beforeEach(() => {
  vi.clearAllMocks()
  getCookieMock.mockReturnValue(undefined)
})

describe('addToCartLogic', () => {
  it('creates a cart on first add (no cookie) and sets the cart_id cookie', async () => {
    respondByOperation({
      'mutation CartCreate': {
        cartCreate: { cart: rawCart(), userErrors: [] },
      },
    })

    const result = await addToCartLogic({
      merchandiseId: VARIANT_ID,
      quantity: 2,
    })

    expect(storefrontMock).toHaveBeenCalledTimes(1)
    expect(operationOfCall(0)).toContain('mutation CartCreate')
    expect(storefrontMock.mock.calls[0][1]).toMatchObject({
      variables: { lines: [{ merchandiseId: VARIANT_ID, quantity: 2 }] },
    })
    expect(setCookieMock).toHaveBeenCalledTimes(1)
    expect(setCookieMock).toHaveBeenCalledWith('cart_id', CART_ID, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
    expect(result).toMatchObject({ ok: true })
    if (result.ok) {
      expect(result.cart.lines).toHaveLength(1)
      expect(result.cart.lines[0].merchandiseId).toBe(VARIANT_ID)
    }
  })

  it('appends to the existing cart when the cookie is present, without rewriting the cookie', async () => {
    getCookieMock.mockReturnValue(CART_ID)
    respondByOperation({
      'mutation CartLinesAdd': {
        cartLinesAdd: { cart: rawCart(), userErrors: [] },
      },
    })

    const result = await addToCartLogic({
      merchandiseId: VARIANT_ID,
      quantity: 1,
    })

    expect(storefrontMock).toHaveBeenCalledTimes(1)
    expect(operationOfCall(0)).toContain('mutation CartLinesAdd')
    expect(storefrontMock.mock.calls[0][1]).toMatchObject({
      variables: {
        cartId: CART_ID,
        lines: [{ merchandiseId: VARIANT_ID, quantity: 1 }],
      },
    })
    expect(setCookieMock).not.toHaveBeenCalled()
    expect(result.ok).toBe(true)
  })

  it('AE2: transparently recreates when the cart no longer exists', async () => {
    getCookieMock.mockReturnValue('gid://shopify/Cart/expired')
    const NEW_CART_ID = 'gid://shopify/Cart/fresh'
    respondByOperation({
      'mutation CartLinesAdd': {
        cartLinesAdd: {
          cart: null,
          userErrors: [
            { field: ['cartId'], message: 'The specified cart does not exist.' },
          ],
        },
      },
      'mutation CartCreate': {
        cartCreate: { cart: rawCart({ id: NEW_CART_ID }), userErrors: [] },
      },
    })

    const result = await addToCartLogic({
      merchandiseId: VARIANT_ID,
      quantity: 2,
    })

    expect(storefrontMock).toHaveBeenCalledTimes(2)
    expect(operationOfCall(0)).toContain('mutation CartLinesAdd')
    expect(operationOfCall(1)).toContain('mutation CartCreate')
    expect(setCookieMock).toHaveBeenCalledWith(
      'cart_id',
      NEW_CART_ID,
      expect.objectContaining({ httpOnly: true }),
    )
    expect(result.ok).toBe(true)
  })

  it('returns { ok: false } with Shopify message on userErrors (cart still exists)', async () => {
    getCookieMock.mockReturnValue(CART_ID)
    respondByOperation({
      'mutation CartLinesAdd': {
        cartLinesAdd: {
          cart: rawCart(),
          userErrors: [
            { field: ['lines'], message: 'This item is out of stock.' },
          ],
        },
      },
    })

    const result = await addToCartLogic({
      merchandiseId: VARIANT_ID,
      quantity: 5,
    })

    expect(result).toEqual({ ok: false, message: 'This item is out of stock.' })
    // No recreate attempt, no cookie churn.
    expect(storefrontMock).toHaveBeenCalledTimes(1)
    expect(setCookieMock).not.toHaveBeenCalled()
    expect(deleteCookieMock).not.toHaveBeenCalled()
  })

  it('surfaces cartCreate userErrors instead of setting a cookie', async () => {
    respondByOperation({
      'mutation CartCreate': {
        cartCreate: {
          cart: null,
          userErrors: [
            { field: ['lines'], message: 'The merchandise does not exist.' },
          ],
        },
      },
    })

    const result = await addToCartLogic({
      merchandiseId: 'gid://shopify/ProductVariant/nope',
      quantity: 1,
    })

    expect(result).toEqual({
      ok: false,
      message: 'The merchandise does not exist.',
    })
    expect(setCookieMock).not.toHaveBeenCalled()
  })
})

describe('updateCartLineLogic', () => {
  it('round-trips a quantity update', async () => {
    getCookieMock.mockReturnValue(CART_ID)
    respondByOperation({
      'mutation CartLinesUpdate': {
        cartLinesUpdate: { cart: rawCart(), userErrors: [] },
      },
    })

    const result = await updateCartLineLogic({ lineId: LINE_ID, quantity: 4 })

    expect(operationOfCall(0)).toContain('mutation CartLinesUpdate')
    expect(storefrontMock.mock.calls[0][1]).toMatchObject({
      variables: { cartId: CART_ID, lines: [{ id: LINE_ID, quantity: 4 }] },
    })
    expect(result.ok).toBe(true)
  })

  it('treats quantity 0 as a removal', async () => {
    getCookieMock.mockReturnValue(CART_ID)
    respondByOperation({
      'mutation CartLinesRemove': {
        cartLinesRemove: { cart: rawCart(), userErrors: [] },
      },
    })

    const result = await updateCartLineLogic({ lineId: LINE_ID, quantity: 0 })

    expect(storefrontMock).toHaveBeenCalledTimes(1)
    expect(operationOfCall(0)).toContain('mutation CartLinesRemove')
    expect(storefrontMock.mock.calls[0][1]).toMatchObject({
      variables: { cartId: CART_ID, lineIds: [LINE_ID] },
    })
    expect(result.ok).toBe(true)
  })

  it('clears the cookie and errors when the cart vanished', async () => {
    getCookieMock.mockReturnValue(CART_ID)
    respondByOperation({
      'mutation CartLinesUpdate': {
        cartLinesUpdate: { cart: null, userErrors: [] },
      },
    })

    const result = await updateCartLineLogic({ lineId: LINE_ID, quantity: 2 })

    expect(result.ok).toBe(false)
    expect(deleteCookieMock).toHaveBeenCalledWith('cart_id', { path: '/' })
    expect(setCookieMock).not.toHaveBeenCalled()
  })

  it('errors without an API call when there is no cart cookie', async () => {
    const result = await updateCartLineLogic({ lineId: LINE_ID, quantity: 2 })

    expect(result.ok).toBe(false)
    expect(storefrontMock).not.toHaveBeenCalled()
  })
})

describe('removeCartLineLogic', () => {
  it('round-trips a line removal', async () => {
    getCookieMock.mockReturnValue(CART_ID)
    respondByOperation({
      'mutation CartLinesRemove': {
        cartLinesRemove: {
          cart: rawCart({ totalQuantity: 0, lines: { nodes: [] } }),
          userErrors: [],
        },
      },
    })

    const result = await removeCartLineLogic({ lineId: LINE_ID })

    expect(operationOfCall(0)).toContain('mutation CartLinesRemove')
    expect(storefrontMock.mock.calls[0][1]).toMatchObject({
      variables: { cartId: CART_ID, lineIds: [LINE_ID] },
    })
    expect(result).toMatchObject({ ok: true })
    if (result.ok) expect(result.cart.lines).toHaveLength(0)
  })

  it('passes Shopify userErrors through as { ok: false }', async () => {
    getCookieMock.mockReturnValue(CART_ID)
    respondByOperation({
      'mutation CartLinesRemove': {
        cartLinesRemove: {
          cart: rawCart(),
          userErrors: [
            { field: ['lineIds'], message: 'The line does not exist.' },
          ],
        },
      },
    })

    const result = await removeCartLineLogic({ lineId: 'bogus' })

    expect(result).toEqual({ ok: false, message: 'The line does not exist.' })
  })
})

describe('getCartLogic', () => {
  it('returns null without any fetch or cookie write when there is no cookie', async () => {
    const cart = await getCartLogic()

    expect(cart).toBeNull()
    expect(storefrontMock).not.toHaveBeenCalled()
    expect(setCookieMock).not.toHaveBeenCalled()
    expect(deleteCookieMock).not.toHaveBeenCalled()
  })

  it('returns null when the cart is gone, deferring cookie cleanup (KTD3: GET never writes)', async () => {
    getCookieMock.mockReturnValue(CART_ID)
    respondByOperation({ 'query GetCart': { cart: null } })

    const cart = await getCartLogic()

    expect(cart).toBeNull()
    expect(setCookieMock).not.toHaveBeenCalled()
    expect(deleteCookieMock).not.toHaveBeenCalled()
  })

  it('fetches the cart by cookie id and forwards the buyer IP', async () => {
    getCookieMock.mockReturnValue(CART_ID)
    respondByOperation({ 'query GetCart': { cart: rawCart() } })

    const cart = await getCartLogic()

    expect(operationOfCall(0)).toContain('query GetCart')
    expect(storefrontMock.mock.calls[0][1]).toMatchObject({
      variables: { cartId: CART_ID },
      buyerIp: '203.0.113.7',
    })
    expect(cart?.id).toBe(CART_ID)
    expect(cart?.subtotal).toBe('$2,900')
  })
})

describe('mapCart', () => {
  it('maps a full raw cart to the view model', () => {
    const model = mapCart(
      rawCart({
        totalQuantity: 3,
        lines: {
          nodes: [
            rawLine(),
            rawLine({
              id: 'gid://shopify/CartLine/line-2',
              quantity: 1,
              merchandise: {
                ...rawLine().merchandise,
                id: 'gid://shopify/ProductVariant/222',
                title: 'Gold / Size 7',
                availableForSale: false,
                price: { amount: '89.5', currencyCode: 'USD' },
                image: null,
              },
            }),
          ],
        },
      }),
    )

    expect(model.id).toBe(CART_ID)
    expect(model.checkoutUrl).toBe(
      'https://test-store.myshopify.com/cart/c/abc123',
    )
    expect(model.totalQuantity).toBe(3)
    expect(model.subtotal).toBe('$2,900')

    const [first, second] = model.lines
    // "Default Title" is Shopify's placeholder for single-variant products.
    expect(first.variantTitle).toBe('')
    expect(first.title).toBe('Aurora Ring')
    expect(first.handle).toBe('aurora-ring')
    expect(first.price).toBe('$1,450')
    expect(first.lineTotal).toBe('$2,900') // 1450 x 2
    expect(first.image).toEqual({
      src: 'https://cdn.shopify.com/ring.jpg',
      alt: 'Aurora Ring', // altText null falls back to the product title
      width: 1200,
      height: 1500,
    })
    expect(first.availableForSale).toBe(true)

    expect(second.variantTitle).toBe('Gold / Size 7')
    expect(second.price).toBe('$89.50')
    expect(second.lineTotal).toBe('$89.50')
    expect(second.image).toBeNull()
    expect(second.availableForSale).toBe(false)
  })
})

describe('input validation', () => {
  it('accepts and returns a normalized add-to-cart input', () => {
    expect(
      validateAddToCartInput({ merchandiseId: VARIANT_ID, quantity: 3 }),
    ).toEqual({ merchandiseId: VARIANT_ID, quantity: 3 })
  })

  it('rejects bad merchandise ids', () => {
    expect(() =>
      validateAddToCartInput({ merchandiseId: '', quantity: 1 }),
    ).toThrow(/merchandiseId/)
    expect(() =>
      validateAddToCartInput({ merchandiseId: '   ', quantity: 1 }),
    ).toThrow(/merchandiseId/)
    expect(() =>
      validateAddToCartInput({
        merchandiseId: 42,
        quantity: 1,
      } as unknown as AddToCartInput),
    ).toThrow(/merchandiseId/)
    expect(() =>
      validateAddToCartInput(null as unknown as AddToCartInput),
    ).toThrow(/object/)
  })

  it('rejects bad quantities for add (zero, negative, fractional, NaN, non-number)', () => {
    for (const quantity of [0, -1, 1.5, Number.NaN, Infinity]) {
      expect(() =>
        validateAddToCartInput({ merchandiseId: VARIANT_ID, quantity }),
      ).toThrow(/quantity/)
    }
    expect(() =>
      validateAddToCartInput({
        merchandiseId: VARIANT_ID,
        quantity: '2',
      } as unknown as AddToCartInput),
    ).toThrow(/quantity/)
  })

  it('allows quantity 0 for updates (removal) but rejects negatives and fractions', () => {
    expect(
      validateUpdateCartLineInput({ lineId: LINE_ID, quantity: 0 }),
    ).toEqual({ lineId: LINE_ID, quantity: 0 })
    expect(() =>
      validateUpdateCartLineInput({ lineId: LINE_ID, quantity: -1 }),
    ).toThrow(/quantity/)
    expect(() =>
      validateUpdateCartLineInput({ lineId: LINE_ID, quantity: 2.5 }),
    ).toThrow(/quantity/)
    expect(() =>
      validateUpdateCartLineInput({ lineId: '', quantity: 1 }),
    ).toThrow(/lineId/)
  })

  it('validates remove input', () => {
    expect(validateRemoveCartLineInput({ lineId: LINE_ID })).toEqual({
      lineId: LINE_ID,
    })
    expect(() => validateRemoveCartLineInput({ lineId: '' })).toThrow(/lineId/)
  })
})
