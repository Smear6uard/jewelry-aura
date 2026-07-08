/**
 * components/shop/AddToCartButton.tsx — PDP add-to-cart action (U6).
 * Pending state while the server function runs; the drawer opens on
 * success; failures render inline (Shopify's message when it has one).
 */

import { useRef, useState } from 'react'
import { useCart } from '~/components/shop/CartProvider'

interface AddToCartButtonProps {
  merchandiseId: string | null
  soldOut: boolean
}

export function AddToCartButton({
  merchandiseId,
  soldOut,
}: AddToCartButtonProps) {
  const { add, openCart } = useCart()
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const disabled = soldOut || !merchandiseId || pending

  const onClick = async () => {
    if (!merchandiseId || pending) return
    setError(null)
    setPending(true)
    const result = await add(merchandiseId, 1)
    setPending(false)
    if (result.ok) {
      openCart(buttonRef.current)
    } else {
      setError(result.message ?? 'Something went wrong. Please try again.')
    }
  }

  return (
    <div>
      <button
        ref={buttonRef}
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={`w-full rounded-full px-8 py-4 font-sans text-[13px] font-medium uppercase tracking-[0.18em] transition-colors duration-hover ease-apple ${
          soldOut || !merchandiseId
            ? 'cursor-not-allowed border border-cream-muted/20 text-cream-muted/50'
            : 'bg-champagne text-forest hover:bg-champagne/90 active:scale-[0.99] disabled:opacity-70'
        }`}
        style={
          soldOut || !merchandiseId ? { borderWidth: '0.5px' } : undefined
        }
      >
        {soldOut ? 'Sold out' : pending ? 'Adding…' : 'Add to cart'}
      </button>
      {error && (
        <p
          className="mt-3 text-center font-sans text-[12px] text-champagne"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  )
}
