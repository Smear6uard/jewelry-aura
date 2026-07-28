/**
 * components/commerce/AddToCart.tsx — the PDP buy row.
 *
 * A quantity stepper and the primary action, sized as the largest,
 * highest-contrast control on the page. The stepper's buttons are 44px
 * square; the add button is full width on a phone. The cart drawer opens
 * on success, so the shopper sees the cart change rather than being asked
 * to trust a toast.
 *
 * Failures render inline with Shopify's own message when it has one
 * ("only 2 available", say) — that message is more useful than anything
 * generic we could substitute for it.
 *
 * An unpriced piece has no add-to-cart at all: a $0 variant in a Shopify
 * cart checks out at $0. It offers a quote instead.
 */

import { useRef, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { useCart } from '~/components/commerce/CartProvider'
import { BTN_PRIMARY, BTN_PRIMARY_BLOCK } from '~/lib/ui'

interface AddToCartProps {
  merchandiseId: string | null
  soldOut: boolean
  /** True when the variant has no price set — offer a quote, not a cart. */
  unpriced?: boolean
}

const MAX_QUANTITY = 10

export function AddToCart({
  merchandiseId,
  soldOut,
  unpriced = false,
}: AddToCartProps) {
  const { add, openCart } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const unavailable = soldOut || !merchandiseId
  const disabled = unavailable || pending

  const onClick = async () => {
    if (!merchandiseId || pending) return
    setError(null)
    setPending(true)
    const result = await add(merchandiseId, quantity)
    setPending(false)
    if (result.ok) {
      openCart(buttonRef.current)
    } else {
      setError(result.message ?? 'That didn’t add. Please try again.')
    }
  }

  if (unpriced) {
    return (
      <div>
        <a href="/custom" className={BTN_PRIMARY_BLOCK}>
          Get a price for this piece
        </a>
        <p className="mt-3 text-[14px] leading-relaxed text-ink-muted">
          This one is quoted rather than listed — weight, stones and length all
          move the number. Tell us what you want and we will price it firmly.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex shrink-0 items-center bg-raised shadow-sm">
          <button
            type="button"
            disabled={unavailable || quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="flex h-12 w-11 items-center justify-center text-ink-muted transition-colors duration-hover ease-apple hover:text-ink disabled:opacity-30 motion-reduce:transition-none"
          >
            <Minus aria-hidden size={15} strokeWidth={1.6} />
          </button>
          <span
            className="min-w-8 text-center text-[15px] tabular-nums text-ink"
            aria-live="polite"
          >
            {quantity}
          </span>
          <button
            type="button"
            disabled={unavailable || quantity >= MAX_QUANTITY}
            onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
            aria-label="Increase quantity"
            className="flex h-12 w-11 items-center justify-center text-ink-muted transition-colors duration-hover ease-apple hover:text-ink disabled:opacity-30 motion-reduce:transition-none"
          >
            <Plus aria-hidden size={15} strokeWidth={1.6} />
          </button>
        </div>

        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={onClick}
          className={
            unavailable
              ? 'flex min-h-12 flex-1 cursor-not-allowed items-center justify-center bg-sunken px-6 text-[12px] label text-ink-muted'
              : `${BTN_PRIMARY} min-h-12 flex-1`
          }
        >
          {soldOut ? 'Sold out' : pending ? 'Adding…' : 'Add to cart'}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-[13px] text-brand" role="alert">
          {error}
        </p>
      )}

      {soldOut && (
        <p className="mt-3 text-[14px] text-ink-muted">
          This one is gone, but we make them.{' '}
          <a
            href="/custom"
            className="text-brand underline decoration-brand/40 underline-offset-4 transition-colors duration-hover ease-apple hover:text-brand-hover motion-reduce:transition-none"
          >
            Commission the same piece
          </a>
          .
        </p>
      )}
    </div>
  )
}
