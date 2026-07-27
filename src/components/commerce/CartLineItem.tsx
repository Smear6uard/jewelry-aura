/**
 * components/commerce/CartLineItem.tsx — one line in the cart.
 *
 * Shared by the drawer and the full cart page so a quantity stepper
 * cannot behave differently depending on which surface you opened.
 * Mutations are optimistic in CartProvider; this component only
 * disables its controls while one is in flight and surfaces the
 * server's message on failure.
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
        className={`${thumb} case-plate block shrink-0 overflow-hidden tile-frame`}
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
            className="text-[14px] font-medium leading-snug text-cream transition-colors duration-hover ease-apple hover:text-champagne"
          >
            {line.title}
          </a>
          <span className="shrink-0 text-[14px] text-cream">
            {line.lineTotal}
          </span>
        </div>

        {line.variantTitle && (
          <p className="mt-1 text-[12px] text-cream-muted">{line.variantTitle}</p>
        )}
        {!line.availableForSale && (
          <p className="mt-1 text-[11px] label text-champagne">
            Now sold out — remove to check out
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-4 pt-3">
          <div className="inline-flex items-center border border-hairline">
            <button
              type="button"
              disabled={busy}
              onClick={() => changeQuantity(line.quantity - 1)}
              aria-label={`Decrease quantity of ${line.title}`}
              className="px-2.5 py-1.5 text-cream-muted transition-colors duration-hover ease-apple hover:text-cream disabled:opacity-40"
            >
              <Minus aria-hidden size={13} strokeWidth={1.5} />
            </button>
            <span
              className="min-w-8 text-center text-[13px] tabular-nums text-cream"
              aria-live="polite"
            >
              {line.quantity}
            </span>
            <button
              type="button"
              disabled={busy}
              onClick={() => changeQuantity(line.quantity + 1)}
              aria-label={`Increase quantity of ${line.title}`}
              className="px-2.5 py-1.5 text-cream-muted transition-colors duration-hover ease-apple hover:text-cream disabled:opacity-40"
            >
              <Plus aria-hidden size={13} strokeWidth={1.5} />
            </button>
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={() => changeQuantity(0)}
            className="text-[11px] label text-cream-subtle underline decoration-hairline underline-offset-4 transition-colors duration-hover ease-apple hover:text-cream disabled:opacity-40"
          >
            Remove
          </button>
        </div>

        {error && (
          <p className="mt-2 text-[12px] text-champagne" role="alert">
            {error}
          </p>
        )}
      </div>
    </li>
  )
}
