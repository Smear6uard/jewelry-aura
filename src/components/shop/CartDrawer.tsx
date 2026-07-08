/**
 * components/shop/CartDrawer.tsx — the visible cart (plan U6).
 *
 * Accessibility contract: role="dialog" + aria-modal, focus moves into
 * the panel on open and is trapped while open, Escape closes, and focus
 * returns to the trigger (CartProvider.closeCart handles the return).
 * Motion runs on the brand tokens, transform/opacity only.
 */

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DURATION, easeApple, easeOutExpo } from '~/lib/motion'
import { useCart } from '~/components/shop/CartProvider'
import { PillLink } from '~/components/shop/PillLink'
import type { CartLineModel } from '~/lib/shopify/cart'

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

export function CartDrawer() {
  const { isOpen, closeCart, cart, status } = useCart()
  const panelRef = useRef<HTMLDivElement>(null)

  // Escape + focus trap while open.
  useEffect(() => {
    if (!isOpen) return
    const panel = panelRef.current
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
            className="absolute inset-0 h-full w-full cursor-default bg-forest/70"
            style={{ backdropFilter: 'blur(2px)' }}
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
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-forest text-cream shadow-2xl"
            style={{
              borderLeft: '0.5px solid rgba(196, 168, 117, 0.25)',
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: DURATION.content, ease: easeOutExpo }}
          >
            <header
              className="flex items-center justify-between border-b border-champagne/15 px-6 py-5"
              style={{ borderBottomWidth: '0.5px' }}
            >
              <h2 className="font-display text-xl italic text-cream">
                Your cart
                {cart && cart.totalQuantity > 0 && (
                  <span className="ml-3 font-mono text-[11px] not-italic tracking-[0.18em] text-cream-muted">
                    {cart.totalQuantity}
                  </span>
                )}
              </h2>
              <CloseButton onClick={closeCart} />
            </header>

            <div className="flex-1 overflow-y-auto px-6">
              {status === 'loading' && <CartSkeleton />}
              {isEmpty && <EmptyCart onClose={closeCart} />}
              {lines.length > 0 && (
                <ul
                  className="divide-y divide-champagne/10"
                  style={{ borderColor: 'rgba(196,168,117,0.1)' }}
                >
                  {lines.map((line) => (
                    <CartLine key={line.id} line={line} />
                  ))}
                </ul>
              )}
            </div>

            {cart && lines.length > 0 && (
              <footer
                className="border-t border-champagne/15 px-6 py-6"
                style={{ borderTopWidth: '0.5px' }}
              >
                <div className="flex items-baseline justify-between">
                  <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-cream-muted">
                    Subtotal
                  </span>
                  <span className="font-mono text-lg tracking-[0.06em] text-champagne">
                    {cart.subtotal}
                  </span>
                </div>
                <p className="mt-2 font-sans text-[12px] font-light text-cream-muted">
                  Shipping and tax are calculated at checkout.
                </p>
                <a
                  href={cart.checkoutUrl}
                  className="mt-5 block w-full rounded-full bg-champagne px-8 py-4 text-center font-sans text-[13px] font-medium uppercase tracking-[0.18em] text-forest transition-colors duration-hover ease-apple hover:bg-champagne/90 active:scale-[0.99]"
                >
                  Check out
                </a>
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-cream-muted/30 p-2 text-cream-muted transition-colors duration-hover ease-apple hover:border-champagne hover:text-champagne"
      style={{ borderWidth: '0.5px' }}
      aria-label="Close cart"
    >
      <svg
        aria-hidden
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M2 2l10 10M12 2L2 12" />
      </svg>
    </button>
  )
}

function CartSkeleton() {
  return (
    <div className="flex flex-col gap-6 py-8" aria-hidden>
      {[0, 1].map((i) => (
        <div key={i} className="flex animate-pulse gap-4">
          <div className="h-24 w-20 bg-forest-surface" />
          <div className="flex-1 space-y-3 pt-2">
            <div className="h-3 w-2/3 bg-forest-surface" />
            <div className="h-3 w-1/3 bg-forest-surface" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyCart({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-24 text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cream-muted">
        Nothing here yet
      </p>
      <p className="mt-5 max-w-[26ch] font-display text-2xl italic leading-snug text-cream">
        Your cart is waiting for its first piece.
      </p>
      <div className="mt-8">
        <PillLink href="/shop" onClick={onClose}>
          Shop all pieces
        </PillLink>
      </div>
    </div>
  )
}

function CartLine({ line }: { line: CartLineModel }) {
  const { updateLine, removeLine } = useCart()
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const changeQuantity = async (quantity: number) => {
    setError(null)
    setBusy(true)
    const result =
      quantity <= 0
        ? await removeLine(line.id)
        : await updateLine(line.id, quantity)
    if (!result.ok) setError(result.message ?? 'Something went wrong.')
    setBusy(false)
  }

  return (
    <li className="flex gap-4 py-6">
      <a
        href={`/products/${line.handle}`}
        className="block h-24 w-20 shrink-0 overflow-hidden bg-forest-surface"
        tabIndex={-1}
        aria-hidden
      >
        {line.image && (
          <img
            src={line.image.src}
            alt=""
            width={line.image.width ?? undefined}
            height={line.image.height ?? undefined}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        )}
      </a>
      <div className="flex flex-1 flex-col">
        <div className="flex items-baseline justify-between gap-4">
          <a
            href={`/products/${line.handle}`}
            className="font-serif text-[15px] leading-snug text-cream transition-colors duration-hover ease-apple hover:text-champagne"
          >
            {line.title}
          </a>
          <span className="shrink-0 font-mono text-[12px] tracking-[0.06em] text-champagne">
            {line.lineTotal}
          </span>
        </div>
        {line.variantTitle && (
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-cream-muted">
            {line.variantTitle}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3">
          <div
            className="inline-flex items-center rounded-full border border-cream-muted/25"
            style={{ borderWidth: '0.5px' }}
          >
            <button
              type="button"
              disabled={busy}
              onClick={() => changeQuantity(line.quantity - 1)}
              aria-label={`Decrease quantity of ${line.title}`}
              className="px-3 py-1.5 font-mono text-sm text-cream-muted transition-colors duration-hover ease-apple hover:text-cream disabled:opacity-40"
            >
              &minus;
            </button>
            <span
              className="min-w-7 text-center font-mono text-[12px] text-cream"
              aria-live="polite"
            >
              {line.quantity}
            </span>
            <button
              type="button"
              disabled={busy}
              onClick={() => changeQuantity(line.quantity + 1)}
              aria-label={`Increase quantity of ${line.title}`}
              className="px-3 py-1.5 font-mono text-sm text-cream-muted transition-colors duration-hover ease-apple hover:text-cream disabled:opacity-40"
            >
              +
            </button>
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => changeQuantity(0)}
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-cream-muted underline decoration-cream-muted/40 underline-offset-4 transition-colors duration-hover ease-apple hover:text-cream disabled:opacity-40"
          >
            Remove
          </button>
        </div>
        {error && (
          <p className="mt-2 font-sans text-[12px] text-champagne" role="alert">
            {error}
          </p>
        )}
      </div>
    </li>
  )
}
