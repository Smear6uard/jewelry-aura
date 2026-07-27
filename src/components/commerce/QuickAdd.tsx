/**
 * components/commerce/QuickAdd.tsx — the button that slides up from the
 * bottom of a product card's image on hover.
 *
 * Two honest states, chosen by what the card actually knows:
 *
 *   • The card carries a single purchasable variant → "Quick add".
 *     One click adds it and opens the cart drawer.
 *   • The piece needs a length, size or metal chosen first, or the card
 *     has no variant id → "Choose options", rendered as a link to the
 *     product page.
 *
 * A button labelled "Quick add" that silently navigates somewhere else
 * is the worst version of this control, so the label always matches
 * what pressing it does.
 *
 * On touch devices (no hover) the control is always visible — there is
 * no hover to reveal it, and a hidden buy button is a lost sale.
 */

import { useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useCart } from '~/components/commerce/CartProvider'
import type { ProductCardModel } from '~/lib/shopify/adapters'

/**
 * Hidden-until-hover on pointer devices, always shown on touch. Kept as
 * a constant because the `@media(hover:hover)` variant chain is long
 * enough to bury the rest of the className.
 */
const REVEAL =
  'translate-y-0 opacity-100 transition-[transform,opacity] duration-hover ease-apple ' +
  '[@media(hover:hover)]:translate-y-[130%] [@media(hover:hover)]:opacity-0 ' +
  '[@media(hover:hover)]:group-hover:translate-y-0 [@media(hover:hover)]:group-hover:opacity-100 ' +
  '[@media(hover:hover)]:group-focus-within:translate-y-0 [@media(hover:hover)]:group-focus-within:opacity-100 ' +
  'motion-reduce:transition-none motion-reduce:translate-y-0 ' +
  '[@media(hover:hover)]:motion-reduce:opacity-0 [@media(hover:hover)]:motion-reduce:group-hover:opacity-100'

const BASE =
  'flex w-full items-center justify-center px-3 py-2.5 text-[11px] label text-cream ' +
  'bg-brand hover:bg-brand-hover active:scale-[0.99] ' +
  'transition-colors duration-hover ease-apple disabled:opacity-70'

interface QuickAddProps {
  product: ProductCardModel
  className?: string
}

export function QuickAdd({ product, className = '' }: QuickAddProps) {
  const { add, openCart } = useCart()
  const [pending, setPending] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const wrapper = `${REVEAL} ${className}`

  if (!product.availableForSale) {
    return (
      <div className={wrapper}>
        <span
          className={`${BASE} cursor-not-allowed bg-raised text-cream-muted`}
          style={{ boxShadow: 'inset 0 0 0 1px var(--color-hairline)' }}
        >
          Sold out
        </span>
      </div>
    )
  }

  // No variant id, or the piece needs a choice made first.
  const needsOptions = !product.variantId || (product.optionCount ?? 1) > 1
  if (needsOptions) {
    return (
      <div className={wrapper}>
        <Link
          to="/products/$handle"
          params={{ handle: product.handle }}
          className={`${BASE} relative z-20`}
        >
          Choose options
        </Link>
      </div>
    )
  }

  const onClick = async (event: React.MouseEvent) => {
    // The whole card is a stretched link; adding to the cart must not
    // also navigate to the product page.
    event.preventDefault()
    event.stopPropagation()
    if (pending) return
    setPending(true)
    const result = await add(product.variantId as string, 1)
    setPending(false)
    if (result.ok) openCart(buttonRef.current)
  }

  return (
    <div className={wrapper}>
      <button
        ref={buttonRef}
        type="button"
        disabled={pending}
        onClick={onClick}
        aria-label={`Add ${product.title} to cart`}
        className={`${BASE} relative z-20`}
      >
        {pending ? 'Adding…' : 'Quick add'}
      </button>
    </div>
  )
}
