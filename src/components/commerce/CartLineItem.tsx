/**
 * components/commerce/CartLineItem.tsx — one line in the cart.
 *
 * Shared by the drawer and the full cart page so a quantity stepper
 * cannot behave differently depending on which surface you opened. The
 * stepper's buttons are 44px square: a cart is the one screen where a
 * mis-tap costs money.
 *
 * Mutations are optimistic in CartProvider; this component only disables
 * its controls while one is in flight and surfaces the server's message
 * on failure.
 */

import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import { useCart } from '~/components/commerce/CartProvider'
import type { CartLineModel } from '~/lib/shopify/cart'

interface CartLineItemProps {
  line: CartLineModel
  /** The page version has room for a larger thumbnail. */
  size?: 'drawer' | 'page'
}

export function CartLineItem({ line, size = 'drawer' }: CartLineItemProps) {
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
    if (!result.ok) setError(result.message ?? 'That change didn’t save.')
    setBusy(false)
  }

  const thumb = size === 'page' ? 'h-28 w-24' : 'h-24 w-20'

  return (
    <li className="flex gap-4 py-5">
      <a
        href={`/products/${line.handle}`}
        className={`${thumb} block shrink-0 overflow-hidden bg-paper border border-hairline-light`}
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

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-baseline justify-between gap-4">
          <a
            href={`/products/${line.handle}`}
            className="text-[14px] font-medium leading-snug text-ink transition-colors duration-hover ease-apple hover:text-maroon motion-reduce:transition-none"
          >
            {line.title}
          </a>
          <span className="shrink-0 text-[14px] font-medium text-ink">
            {line.lineTotal}
          </span>
        </div>

        {line.variantTitle && (
          <p className="mt-1 text-[13px] text-ink">{line.variantTitle}</p>
        )}
        {!line.availableForSale && (
          <p className="mt-1 text-[12px] label text-maroon">
            Now sold out — remove to check out
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-4 pt-3">
          <div className="inline-flex items-center bg-paper border border-hairline-light">
            <button
              type="button"
              disabled={busy}
              onClick={() => changeQuantity(line.quantity - 1)}
              aria-label={`Decrease quantity of ${line.title}`}
              className="flex h-11 w-11 items-center justify-center text-ink transition-colors duration-hover ease-apple hover:text-maroon disabled:opacity-40 motion-reduce:transition-none"
            >
              <Minus aria-hidden size={14} strokeWidth={1.6} />
            </button>
            <span
              className="min-w-7 text-center text-[14px] tabular-nums text-ink"
              aria-live="polite"
            >
              {line.quantity}
            </span>
            <button
              type="button"
              disabled={busy}
              onClick={() => changeQuantity(line.quantity + 1)}
              aria-label={`Increase quantity of ${line.title}`}
              className="flex h-11 w-11 items-center justify-center text-ink transition-colors duration-hover ease-apple hover:text-maroon disabled:opacity-40 motion-reduce:transition-none"
            >
              <Plus aria-hidden size={14} strokeWidth={1.6} />
            </button>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => changeQuantity(0)}
            className="inline-flex min-h-11 items-center text-[12px] label text-ink underline decoration-hairline-light underline-offset-4 transition-colors duration-hover ease-apple hover:text-maroon disabled:opacity-40 motion-reduce:transition-none"
          >
            Remove
          </button>
        </div>

        {error && (
          <p className="mt-2 text-[13px] text-maroon" role="alert">
            {error}
          </p>
        )}
      </div>
    </li>
  )
}
