/**
 * components/commerce/AddToCart.tsx — the PDP buy row.
 *
 * A quantity stepper and the primary action, sized as the largest,
 * highest-contrast control on the page. The cart drawer opens on
 * success, so the shopper sees the cart change rather than being asked
 * to trust a toast.
 *
 * Failures render inline with Shopify's own message when it has one
 * ("only 2 available", say) — that message is more useful than anything
 * generic we could substitute for it.
 */

import { useRef, useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { useCart } from '~/components/commerce/CartProvider'

interface AddToCartProps {
  merchandiseId: string | null
  soldOut: boolean
}

const MAX_QUANTITY = 10

export function AddToCart({ merchandiseId, soldOut }: AddToCartProps) {
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

  return (
    <div>
      <div className="flex gap-2">
        <div className="flex shrink-0 items-center border border-hairline">
          <button
            type="button"
            disabled={unavailable || quantity <= 1}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
            className="px-3 py-4 text-cream-muted transition-colors duration-hover ease-apple hover:text-cream disabled:opacity-30"
          >
            <Minus aria-hidden size={14} strokeWidth={1.5} />
          </button>
          <span
            className="min-w-8 text-center text-[14px] tabular-nums text-cream"
            aria-live="polite"
          >
            {quantity}
          </span>
          <button
            type="button"
            disabled={unavailable || quantity >= MAX_QUANTITY}
            onClick={() => setQuantity((q) => Math.min(MAX_QUANTITY, q + 1))}
            aria-label="Increase quantity"
            className="px-3 py-4 text-cream-muted transition-colors duration-hover ease-apple hover:text-cream disabled:opacity-30"
          >
            <Plus aria-hidden size={14} strokeWidth={1.5} />
          </button>
        </div>

        <button
          ref={buttonRef}
          type="button"
          disabled={disabled}
          onClick={onClick}
          className={`flex-1 px-6 py-4 text-[12px] label transition-colors duration-hover ease-apple ${
            unavailable
              ? 'cursor-not-allowed border border-hairline text-cream-subtle'
              : 'bg-brand text-cream hover:bg-brand-hover active:scale-[0.99] disabled:opacity-70'
          }`}
        >
          {soldOut ? 'Sold out' : pending ? 'Adding…' : 'Add to cart'}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-[12px] text-champagne" role="alert">
          {error}
        </p>
      )}

      {soldOut && (
        <p className="mt-3 text-[13px] text-cream-muted">
          This one is gone, but we make them.{' '}
          <a
            href="/custom"
            className="text-cream underline decoration-champagne/50 underline-offset-4 transition-colors duration-hover ease-apple hover:text-champagne"
          >
            Commission the same piece
          </a>
          .
        </p>
      )}
    </div>
  )
}
