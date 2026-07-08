/**
 * components/shop/CartProvider.tsx — client-side cart state.
 *
 * Hydrates AFTER paint via the uncached getCart server function (KTD3 —
 * page HTML stays cookie-free and CDN-cacheable; the badge shows a
 * skeleton until this resolves, never a false 0). A failed fetch falls
 * back to an empty-looking cart, not an error screen. Line mutations are
 * optimistic with rollback; every successful mutation reconciles with
 * the server's authoritative cart.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  addToCart,
  getCart,
  removeCartLine,
  updateCartLine,
} from '~/lib/shopify/cart-fns'
import type { CartModel } from '~/lib/shopify/cart'

export interface CartUiState {
  /** 'loading' until the post-paint getCart resolves. */
  status: 'loading' | 'ready'
  cart: CartModel | null
  /** Pre-mutation snapshot for rollback; null when no mutation in flight. */
  snapshot: CartModel | null
}

export type CartUiAction =
  | { type: 'resolved'; cart: CartModel | null }
  | { type: 'fetch-failed' }
  | { type: 'optimistic'; cart: CartModel }
  | { type: 'commit'; cart: CartModel | null }
  | { type: 'rollback' }

export const initialCartUiState: CartUiState = {
  status: 'loading',
  cart: null,
  snapshot: null,
}

export function cartReducer(
  state: CartUiState,
  action: CartUiAction,
): CartUiState {
  switch (action.type) {
    case 'resolved':
      return { status: 'ready', cart: action.cart, snapshot: null }
    case 'fetch-failed':
      // Empty-looking state, not an error surface.
      return { status: 'ready', cart: null, snapshot: null }
    case 'optimistic':
      return {
        status: 'ready',
        cart: action.cart,
        snapshot: state.snapshot ?? state.cart,
      }
    case 'commit':
      return { status: 'ready', cart: action.cart, snapshot: null }
    case 'rollback':
      // With overlapping mutations an interleaved 'commit' may have cleared
      // the shared snapshot; never null the cart because of that race —
      // keep the current cart and let the caller resync with the server.
      return {
        status: 'ready',
        cart: state.snapshot ?? state.cart,
        snapshot: null,
      }
  }
}

/** Badge value: null → skeleton; number → render (0 hides the badge). */
export function badgeCount(state: CartUiState): number | null {
  if (state.status === 'loading') return null
  return state.cart?.totalQuantity ?? 0
}

/** Local optimistic quantity change (money totals reconcile on commit). */
export function withLineQuantity(
  cart: CartModel,
  lineId: string,
  quantity: number,
): CartModel {
  const lines = cart.lines
    .map((line) => (line.id === lineId ? { ...line, quantity } : line))
    .filter((line) => line.quantity > 0)
  return {
    ...cart,
    lines,
    totalQuantity: lines.reduce((sum, line) => sum + line.quantity, 0),
  }
}

export interface CartActionOutcome {
  ok: boolean
  message?: string
}

interface CartContextValue {
  status: CartUiState['status']
  cart: CartModel | null
  /** null while loading — render a skeleton, never 0. */
  count: number | null
  isOpen: boolean
  openCart: (trigger?: HTMLElement | null) => void
  closeCart: () => void
  add: (merchandiseId: string, quantity?: number) => Promise<CartActionOutcome>
  updateLine: (lineId: string, quantity: number) => Promise<CartActionOutcome>
  removeLine: (lineId: string) => Promise<CartActionOutcome>
}

const CartContext = createContext<CartContextValue | null>(null)

export function useCart(): CartContextValue {
  const value = useContext(CartContext)
  if (!value) throw new Error('useCart must be used inside <CartProvider>')
  return value
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialCartUiState)
  const [isOpen, setIsOpen] = useState(false)
  const triggerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    let cancelled = false
    // Post-paint hydration (KTD3): the cookie read happens in this
    // uncached server-fn call, never during the page render.
    getCart()
      .then((cart) => {
        if (!cancelled) dispatch({ type: 'resolved', cart })
      })
      .catch(() => {
        if (!cancelled) dispatch({ type: 'fetch-failed' })
      })
    return () => {
      cancelled = true
    }
  }, [])

  // After a failed/rolled-back mutation the optimistic state may have
  // diverged from Shopify's truth (e.g. an interleaved commit consumed the
  // rollback snapshot) — quietly re-align with the server.
  const resync = useCallback(() => {
    getCart()
      .then((cart) => dispatch({ type: 'commit', cart }))
      .catch(() => {})
  }, [])

  const openCart = useCallback((trigger?: HTMLElement | null) => {
    triggerRef.current = trigger ?? null
    setIsOpen(true)
  }, [])

  const closeCart = useCallback(() => {
    setIsOpen(false)
    triggerRef.current?.focus()
    triggerRef.current = null
  }, [])

  const add = useCallback(
    async (merchandiseId: string, quantity = 1): Promise<CartActionOutcome> => {
      try {
        const result = await addToCart({ data: { merchandiseId, quantity } })
        if (!result.ok) return { ok: false, message: result.message }
        dispatch({ type: 'commit', cart: result.cart })
        return { ok: true }
      } catch {
        return {
          ok: false,
          message: 'We couldn’t add that just now. Please try again.',
        }
      }
    },
    [],
  )

  const updateLine = useCallback(
    async (lineId: string, quantity: number): Promise<CartActionOutcome> => {
      if (state.cart) {
        dispatch({
          type: 'optimistic',
          cart: withLineQuantity(state.cart, lineId, quantity),
        })
      }
      try {
        const result = await updateCartLine({ data: { lineId, quantity } })
        if (!result.ok) {
          dispatch({ type: 'rollback' })
          resync()
          return { ok: false, message: result.message }
        }
        dispatch({ type: 'commit', cart: result.cart })
        return { ok: true }
      } catch {
        dispatch({ type: 'rollback' })
        resync()
        return {
          ok: false,
          message: 'That change didn’t save. Please try again.',
        }
      }
    },
    [state.cart, resync],
  )

  const removeLine = useCallback(
    async (lineId: string): Promise<CartActionOutcome> => {
      if (state.cart) {
        dispatch({
          type: 'optimistic',
          cart: withLineQuantity(state.cart, lineId, 0),
        })
      }
      try {
        const result = await removeCartLine({ data: { lineId } })
        if (!result.ok) {
          dispatch({ type: 'rollback' })
          resync()
          return { ok: false, message: result.message }
        }
        dispatch({ type: 'commit', cart: result.cart })
        return { ok: true }
      } catch {
        dispatch({ type: 'rollback' })
        resync()
        return {
          ok: false,
          message: 'That change didn’t save. Please try again.',
        }
      }
    },
    [state.cart, resync],
  )

  // Memoized so consumers only re-render when cart data or drawer state
  // actually change (mirrors the LenisProvider convention).
  const value = useMemo(
    () => ({
      status: state.status,
      cart: state.cart,
      count: badgeCount(state),
      isOpen,
      openCart,
      closeCart,
      add,
      updateLine,
      removeLine,
    }),
    [state, isOpen, openCart, closeCart, add, updateLine, removeLine],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}
