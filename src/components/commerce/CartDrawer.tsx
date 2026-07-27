/**
 * components/commerce/CartDrawer.tsx — the cart, one of the three
 * interactions the storefront is judged on.
 *
 * Slides in from the right over a dimmed canvas, on the brand motion
 * tokens, transform and opacity only. Opens automatically on
 * add-to-cart (CartProvider.openCart is called by QuickAdd and the PDP
 * button), because a cart that fills silently is a cart the shopper
 * forgets about.
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

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

export function CartDrawer() {
  const { isOpen, closeCart, cart, status } = useCart()
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

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70]">
          <motion.button
            type="button"
            aria-label="Close cart"
            tabIndex={-1}
            className="absolute inset-0 h-full w-full cursor-default bg-sunken/80"
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
            className="absolute right-0 top-0 flex h-full w-full max-w-[26rem] flex-col border-l border-hairline bg-raised text-cream outline-none"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: DURATION.content, ease: easeOutExpo }}
          >
            <header className="flex items-center justify-between border-b border-hairline px-5 py-4">
              <h2 className="text-[12px] label text-cream">
                Cart
                {cart && cart.totalQuantity > 0 && (
                  <span className="ml-2 text-cream-muted">
                    ({cart.totalQuantity})
                  </span>
                )}
              </h2>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close cart"
                className="p-1.5 text-cream-muted transition-colors duration-hover ease-apple hover:text-cream"
              >
                <X aria-hidden size={17} strokeWidth={1.4} />
              </button>
            </header>

            {/* data-lenis-prevent: the app-wide smooth-wheel Lenis would
                otherwise swallow wheel events over this nested scroller. */}
            <div className="flex-1 overflow-y-auto px-5" data-lenis-prevent>
              {status === 'loading' && <CartSkeleton />}
              {isEmpty && <EmptyCart onClose={closeCart} />}
              {lines.length > 0 && (
                <ul className="divide-y divide-hairline">
                  {lines.map((line) => (
                    <CartLineItem key={line.id} line={line} />
                  ))}
                </ul>
              )}
            </div>

            {cart && lines.length > 0 && (
              <footer className="border-t border-hairline px-5 py-5">
                <FreeShippingMeter
                  subtotal={parseFormattedMoney(cart.subtotal)}
                />

                <div className="mt-5 flex items-baseline justify-between">
                  <span className="text-[12px] label text-cream-muted">
                    Subtotal
                  </span>
                  <span className="text-[17px] text-cream">{cart.subtotal}</span>
                </div>
                <p className="mt-1.5 text-[12px] text-cream-subtle">
                  Shipping and tax calculated at checkout.
                </p>

                <a
                  href={cart.checkoutUrl}
                  className="mt-4 block w-full bg-brand px-6 py-4 text-center text-[12px] label text-cream transition-colors duration-hover ease-apple hover:bg-brand-hover active:scale-[0.99]"
                >
                  Check out
                </a>
                <a
                  href="/cart"
                  onClick={closeCart}
                  className="mt-3 block w-full text-center text-[11px] label text-cream-muted underline decoration-hairline underline-offset-4 transition-colors duration-hover ease-apple hover:text-cream"
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
          <div className="h-24 w-20 bg-hairline/60" />
          <div className="flex-1 space-y-3 pt-2">
            <div className="h-3 w-2/3 bg-hairline/60" />
            <div className="h-3 w-1/3 bg-hairline/60" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-20 text-center">
      <p className="text-[11px] label-wide text-cream-subtle">Your cart is empty</p>
      <p className="mt-3 max-w-[26ch] text-[15px] text-cream-muted">
        Chains, pendants and one-of-one commissions are all a tap away.
      </p>
      <a
        href="/shop"
        onClick={onClose}
        className="mt-6 inline-flex items-center bg-brand px-6 py-3 text-[11px] label text-cream transition-colors duration-hover ease-apple hover:bg-brand-hover"
      >
        Start shopping
      </a>
    </div>
  )
}
