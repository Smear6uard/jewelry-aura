/**
 * components/commerce/CartDrawer.tsx — the cart, one of the three
 * interactions the storefront is judged on.
 *
 * TWO SHAPES, PICKED BY VIEWPORT, NOT BY CSS.
 *
 *   Phones   a bottom sheet at 90dvh. The checkout button lands in the
 *            thumb zone above the home indicator, and the sheet arrives
 *            from the edge the thumb is already near.
 *   Desktop  a right-hand panel, where the cart icon is.
 *
 * The two animate on different axes, and a Framer transform target
 * cannot be swapped by a media query — hence the breakpoint read. The
 * component is always mounted (it renders null until opened), so the
 * matchMedia effect has settled long before the first open.
 *
 * Opens automatically on add-to-cart (CartProvider.openCart is called by
 * QuickAdd, the PDP button and the sticky buy bar), because a cart that
 * fills silently is a cart the shopper forgets about.
 *
 * Accessibility contract: role="dialog" + aria-modal, focus moves into
 * the panel on open and is trapped while open, Escape closes, and focus
 * returns to the trigger (CartProvider.closeCart handles the return).
 */

import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { DURATION, easeApple, easeOutExpo } from '~/lib/motion'
import { useCart } from '~/components/commerce/CartProvider'
import { CartLineItem } from '~/components/commerce/CartLineItem'
import { FreeShippingMeter } from '~/components/commerce/FreeShippingMeter'
import { parseFormattedMoney } from '~/lib/shopify/adapters'
import { useIsDesktop } from '~/lib/use-media-query'
import { BTN_PRIMARY_BLOCK } from '~/lib/ui'

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

export function CartDrawer() {
  const { isOpen, closeCart, cart, status } = useCart()
  const isDesktop = useIsDesktop()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    const panel = panelRef.current
    panel?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        closeCart()
        return
      }
      if (event.key !== 'Tab' || !panel) return
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null)
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null
      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, closeCart])

  const lines = cart?.lines ?? []
  const isEmpty = status === 'ready' && lines.length === 0

  const shell = isDesktop
    ? 'absolute right-0 top-0 h-full w-full max-w-[27rem]'
    : 'absolute inset-x-0 bottom-0 h-[90dvh]'

  const slide = isDesktop
    ? { initial: { x: '100%' }, animate: { x: 0 }, exit: { x: '100%' } }
    : { initial: { y: '100%' }, animate: { y: 0 }, exit: { y: '100%' } }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70]">
          <motion.button
            type="button"
            aria-label="Close cart"
            tabIndex={-1}
            className="absolute inset-0 h-full w-full cursor-default bg-velvet/40"
            onClick={closeCart}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.micro, ease: easeApple }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
            tabIndex={-1}
            className={`${shell} flex flex-col bg-bone text-ink border border-hairline-light outline-none`}
            {...slide}
            transition={{ duration: DURATION.content, ease: easeOutExpo }}
          >
            <header className="relative flex items-center justify-between border-b border-hairline-light pl-5 pr-1">
              {!isDesktop && (
                <span
                  aria-hidden
                  className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-hairline-light"
                />
              )}
              <h2 className="py-4 text-[12px] label text-ink">
                Cart
                {cart && cart.totalQuantity > 0 && (
                  <span className="ml-2 text-ink">
                    ({cart.totalQuantity})
                  </span>
                )}
              </h2>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close cart"
                className="flex h-11 w-11 items-center justify-center text-ink transition-colors duration-hover ease-apple hover:text-maroon motion-reduce:transition-none"
              >
                <X aria-hidden size={19} strokeWidth={1.5} />
              </button>
            </header>

            {/* data-lenis-prevent: the app-wide smooth-wheel Lenis would
                otherwise swallow wheel events over this nested scroller. */}
            <div
              className="flex-1 overflow-y-auto overscroll-contain px-5"
              data-lenis-prevent
            >
              {status === 'loading' && <CartSkeleton />}
              {isEmpty && <EmptyCart onClose={closeCart} />}
              {lines.length > 0 && (
                <ul className="divide-y divide-hairline-light">
                  {lines.map((line) => (
                    <CartLineItem key={line.id} line={line} />
                  ))}
                </ul>
              )}
            </div>

            {cart && lines.length > 0 && (
              <footer className="safe-bottom border-t border-hairline-light bg-paper px-5 pt-4">
                <FreeShippingMeter
                  subtotal={parseFormattedMoney(cart.subtotal)}
                />

                <div className="mt-4 flex items-baseline justify-between">
                  <span className="text-[12px] label text-ink">
                    Subtotal
                  </span>
                  <span className="text-[18px] font-medium text-ink">
                    {cart.subtotal}
                  </span>
                </div>
                <p className="mt-1 text-[12px] text-ink">
                  Shipping and tax calculated at checkout.
                </p>

                <a
                  href={cart.checkoutUrl}
                  className={`${BTN_PRIMARY_BLOCK} mt-3 min-h-[52px]`}
                >
                  Check out
                </a>
                <a
                  href="/cart"
                  onClick={closeCart}
                  className="mt-1 flex min-h-11 items-center justify-center text-[12px] label text-ink underline decoration-hairline-light underline-offset-4 transition-colors duration-hover ease-apple hover:text-maroon motion-reduce:transition-none"
                >
                  View full cart
                </a>
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function CartSkeleton() {
  return (
    <div className="flex flex-col gap-5 py-6" aria-hidden>
      {[0, 1].map((i) => (
        <div key={i} className="flex animate-pulse gap-4">
          <div className="h-24 w-20 bg-bone" />
          <div className="flex-1 space-y-3 pt-2">
            <div className="h-3 w-2/3 bg-bone" />
            <div className="h-3 w-1/3 bg-bone" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-20 text-center">
      <p className="text-[11px] label-wide text-ink">Your cart is empty</p>
      <p className="mt-3 max-w-[26ch] text-[15px] text-ink">
        Chains, pendants and one-of-one commissions are all a tap away.
      </p>
      <a href="/shop" onClick={onClose} className={`${BTN_PRIMARY_BLOCK} mt-6 max-w-[16rem]`}>
        Start shopping
      </a>
    </div>
  )
}
