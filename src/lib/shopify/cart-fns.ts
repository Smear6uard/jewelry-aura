// Cart server functions — the RPC boundary client components import.
//
// IMPORTANT: these MUST be written as direct, statically-analyzable
// `createServerFn({...}).inputValidator(...).handler(...)` chains. The
// TanStack Start compiler detects that exact shape to extract handlers
// out of the client bundle; routing it through wrapper helpers defeats
// the detection and leaks server code into the client graph (the build's
// import-protection then fails). If the builder API renames again
// (validator ⇄ inputValidator), update the four chains here plus the
// route files — grep for createServerFn.
//
// Handlers lazy-import the server-only logic module (./cart) so cookies
// and the Storefront client never enter the client graph.

import { createServerFn } from '@tanstack/react-start'
import {
  validateAddToCartInput,
  validateRemoveCartLineInput,
  validateUpdateCartLineInput,
} from './cart-validation'

/** Current cart, or null when there is no cookie or the cart is gone.
 * GET — never writes cookies, so responses stay CDN-cacheable (KTD3). */
export const getCart = createServerFn({ method: 'GET' }).handler(async () =>
  (await import('./cart')).getCartLogic(),
)

export const addToCart = createServerFn({ method: 'POST' })
  .inputValidator(validateAddToCartInput)
  .handler(async ({ data }) => (await import('./cart')).addToCartLogic(data))

export const updateCartLine = createServerFn({ method: 'POST' })
  .inputValidator(validateUpdateCartLineInput)
  .handler(async ({ data }) =>
    (await import('./cart')).updateCartLineLogic(data),
  )

export const removeCartLine = createServerFn({ method: 'POST' })
  .inputValidator(validateRemoveCartLineInput)
  .handler(async ({ data }) =>
    (await import('./cart')).removeCartLineLogic(data),
  )
