// Cart lifecycle server functions + cookie persistence.
//
// The cart lives in Shopify (Cart API); the browser holds only a `cart_id`
// cookie. KTD3: cookie WRITES happen exclusively inside the mutation server
// functions (add/update/remove). `getCart` reads the cookie but never writes,
// so page HTML stays cookie-free and CDN-cacheable. A cookie set during a
// request is not readable later in that same request, so the create path
// threads the new cart id in-band instead of re-reading the cookie.
//
// Business logic lives in plain exported `*Logic` functions (unit-testable in
// node); the createServerFn wrappers at the bottom stay one line each.

import {
  deleteCookie,
  getCookie,
  getRequestIP,
  setCookie,
  setResponseHeader,
} from '@tanstack/react-start/server'
import { formatMoney, type MoneyNode } from './adapters'
import { publicSlug } from './product-slugs'
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  GET_CART_QUERY,
} from './cart-queries'
import { storefrontRequest } from './client'

// ---------------------------------------------------------------------------
// Raw Storefront API shapes (mirror CART_FRAGMENT in cart-queries.ts)
// ---------------------------------------------------------------------------

export interface RawCartImage {
  url: string
  altText: string | null
  width: number | null
  height: number | null
}

export interface RawCartMerchandise {
  id: string
  title: string
  availableForSale: boolean
  price: MoneyNode
  image: RawCartImage | null
  product: {
    title: string
    handle: string
  }
}

export interface RawCartLine {
  id: string
  quantity: number
  merchandise: RawCartMerchandise
}

export interface RawCart {
  id: string
  checkoutUrl: string
  totalQuantity: number
  cost: {
    subtotalAmount: MoneyNode
  }
  lines: {
    nodes: RawCartLine[]
  }
}

interface CartUserError {
  field: string[] | null
  message: string
}

interface CartMutationPayload {
  cart: RawCart | null
  userErrors: CartUserError[]
}

// ---------------------------------------------------------------------------
// View models
// ---------------------------------------------------------------------------

export interface CartLineImage {
  src: string
  alt: string
  width: number | null
  height: number | null
}

export interface CartLineModel {
  id: string
  quantity: number
  merchandiseId: string
  /** Product title. */
  title: string
  /** Variant title; empty string when it is Shopify's "Default Title". */
  variantTitle: string
  /** Published product slug — what the line links to. */
  handle: string
  /** Formatted unit price, e.g. "$1,450". */
  price: string
  /** Formatted unit price x quantity. */
  lineTotal: string
  image: CartLineImage | null
  availableForSale: boolean
}

export interface CartModel {
  id: string
  checkoutUrl: string
  totalQuantity: number
  /** Formatted subtotal, e.g. "$2,900". */
  subtotal: string
  lines: CartLineModel[]
}

export type CartActionResult =
  | { ok: true; cart: CartModel }
  | { ok: false; message: string }

const DEFAULT_VARIANT_TITLE = 'Default Title'

function mapCartLine(line: RawCartLine): CartLineModel {
  const { merchandise } = line
  const unitAmount = Number.parseFloat(merchandise.price.amount)
  return {
    id: line.id,
    quantity: line.quantity,
    merchandiseId: merchandise.id,
    title: merchandise.product.title,
    variantTitle:
      merchandise.title === DEFAULT_VARIANT_TITLE ? '' : merchandise.title,
    // Same public slug the card linked to, so a cart line never sends a
    // shopper to a URL that contradicts the title beside it.
    handle: publicSlug(merchandise.product.handle),
    price: formatMoney(merchandise.price),
    lineTotal: formatMoney({
      amount: String(unitAmount * line.quantity),
      currencyCode: merchandise.price.currencyCode,
    }),
    image: merchandise.image
      ? {
          src: merchandise.image.url,
          alt: merchandise.image.altText || merchandise.product.title,
          width: merchandise.image.width,
          height: merchandise.image.height,
        }
      : null,
    availableForSale: merchandise.availableForSale,
  }
}

export function mapCart(raw: RawCart): CartModel {
  return {
    id: raw.id,
    checkoutUrl: raw.checkoutUrl,
    totalQuantity: raw.totalQuantity,
    subtotal: formatMoney(raw.cost.subtotalAmount),
    lines: raw.lines.nodes.map(mapCartLine),
  }
}

// ---------------------------------------------------------------------------
// Cookie + request helpers
// ---------------------------------------------------------------------------

const CART_COOKIE = 'cart_id'
const CART_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30 // 30 days

function readCartId(): string | null {
  return getCookie(CART_COOKIE) || null
}

/** Mutation-only (KTD3). Shopify carts expire well within 30 days; AE2 below
 * recreates transparently, so the cookie is never refreshed, only replaced. */
function persistCartId(cartId: string): void {
  setCookie(CART_COOKIE, cartId, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: CART_COOKIE_MAX_AGE_SECONDS,
  })
}

/** Mutation-only (KTD3): drop a cookie that points at a vanished cart. */
function clearCartId(): void {
  deleteCookie(CART_COOKIE, { path: '/' })
}

/** Buyer IP for Shopify's unthrottled buyer lane (KTD7); optional because a
 * request context may be absent (tests, background work). */
function readBuyerIp(): string | undefined {
  try {
    return getRequestIP({ xForwardedFor: true })
  } catch {
    return undefined
  }
}

// ---------------------------------------------------------------------------
// Input validation (runs in the server-fn inputValidator; treat input as
// untrusted over-the-wire JSON regardless of the declared parameter types)
// ---------------------------------------------------------------------------

// Input types + validators live in cart-validation.ts (client-safe — the
// RPC layer imports them); re-exported here so server code and tests keep
// one import path.
export {
  validateAddToCartInput,
  validateRemoveCartLineInput,
  validateUpdateCartLineInput,
} from './cart-validation'
export type {
  AddToCartInput,
  RemoveCartLineInput,
  UpdateCartLineInput,
} from './cart-validation'
import type {
  AddToCartInput,
  RemoveCartLineInput,
  UpdateCartLineInput,
} from './cart-validation'

// ---------------------------------------------------------------------------
// Business logic (plain functions, unit-tested directly)
// ---------------------------------------------------------------------------

const CART_GONE_MESSAGE =
  'Your cart is no longer available. Please add the item again.'

export async function getCartLogic(): Promise<CartModel | null> {
  // Personal data behind a GET — belt-and-braces against any shared cache
  // (the HTD table pins cart responses to `private, no-store`).
  try {
    setResponseHeader('Cache-Control', 'private, no-store')
  } catch {
    // No request context (unit tests) — nothing to set.
  }
  const cartId = readCartId()
  if (!cartId) return null

  const data = await storefrontRequest<{ cart: RawCart | null }>(
    GET_CART_QUERY,
    { variables: { cartId }, buyerIp: readBuyerIp() },
  )
  // A vanished cart (completed at checkout or expired) reads as null. The
  // stale cookie is deliberately left in place — GETs never write cookies
  // (KTD3); the next mutation cleans it up or replaces it.
  return data.cart ? mapCart(data.cart) : null
}

/** cartCreate + persist the new id. Threads the id in-band (a cookie set in
 * this request cannot be read back later in the same request). */
async function createCartWithLines(
  lines: Array<{ merchandiseId: string; quantity: number }>,
): Promise<CartActionResult> {
  const data = await storefrontRequest<{ cartCreate: CartMutationPayload }>(
    CART_CREATE_MUTATION,
    { variables: { lines }, buyerIp: readBuyerIp() },
  )
  const { cart, userErrors } = data.cartCreate
  const [firstError] = userErrors
  if (firstError) return { ok: false, message: firstError.message }
  if (!cart) return { ok: false, message: 'The cart could not be created.' }

  persistCartId(cart.id)
  return { ok: true, cart: mapCart(cart) }
}

export async function addToCartLogic(
  input: AddToCartInput,
): Promise<CartActionResult> {
  const lines = [
    { merchandiseId: input.merchandiseId, quantity: input.quantity },
  ]

  const cartId = readCartId()
  if (!cartId) return createCartWithLines(lines)

  const data = await storefrontRequest<{ cartLinesAdd: CartMutationPayload }>(
    CART_LINES_ADD_MUTATION,
    { variables: { cartId, lines }, buyerIp: readBuyerIp() },
  )
  const { cart, userErrors } = data.cartLinesAdd

  // AE2 (transparent recreate): a null cart means the cookie points at a cart
  // that no longer exists — completed at checkout or expired. Recreate with
  // the requested lines and a fresh cookie; no error surfaces to the caller.
  // (Line-level userErrors such as out-of-stock still return the cart, so
  // they fall through to the error branch below instead of recreating.)
  if (!cart) return createCartWithLines(lines)

  const [firstError] = userErrors
  if (firstError) return { ok: false, message: firstError.message }
  return { ok: true, cart: mapCart(cart) }
}

/** Shared settle step for line update/remove mutations. */
function settleLineMutation(payload: CartMutationPayload): CartActionResult {
  if (!payload.cart) {
    // The cart vanished. Recreating makes no sense here (the line ids belong
    // to the dead cart), so clear the cookie — mutations own cookie writes
    // (KTD3) — and let the next add start a fresh cart.
    clearCartId()
    return { ok: false, message: CART_GONE_MESSAGE }
  }
  const [firstError] = payload.userErrors
  if (firstError) return { ok: false, message: firstError.message }
  return { ok: true, cart: mapCart(payload.cart) }
}

export async function updateCartLineLogic(
  input: UpdateCartLineInput,
): Promise<CartActionResult> {
  // Quantity 0 is a removal — steppers can drive a single server function.
  if (input.quantity === 0) return removeCartLineLogic({ lineId: input.lineId })

  const cartId = readCartId()
  if (!cartId) return { ok: false, message: CART_GONE_MESSAGE }

  const data = await storefrontRequest<{
    cartLinesUpdate: CartMutationPayload
  }>(CART_LINES_UPDATE_MUTATION, {
    variables: { cartId, lines: [{ id: input.lineId, quantity: input.quantity }] },
    buyerIp: readBuyerIp(),
  })
  return settleLineMutation(data.cartLinesUpdate)
}

export async function removeCartLineLogic(
  input: RemoveCartLineInput,
): Promise<CartActionResult> {
  const cartId = readCartId()
  if (!cartId) return { ok: false, message: CART_GONE_MESSAGE }

  const data = await storefrontRequest<{
    cartLinesRemove: CartMutationPayload
  }>(CART_LINES_REMOVE_MUTATION, {
    variables: { cartId, lineIds: [input.lineId] },
    buyerIp: readBuyerIp(),
  })
  return settleLineMutation(data.cartLinesRemove)
}

// The createServerFn RPC wrappers live in cart-fns.ts — a module with no
// server-only imports of its own — so client components can import them
// without pulling this file into the client bundle.
