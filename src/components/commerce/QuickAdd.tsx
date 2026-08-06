/**
 * components/commerce/QuickAdd.tsx — the add button on a product card.
 *
 * Two honest states, chosen by what the card actually knows:
 *
 *   • The card carries a single purchasable variant → "Quick add".
 *     One tap adds it and opens the cart.
 *   • The piece needs a length, size or metal chosen first, or the card
 *     has no variant id → "Choose options", rendered as a link to the
 *     product page.
 *
 * A button labelled "Quick add" that silently navigates somewhere else is
 * the worst version of this control, so the label always matches what
 * pressing it does.
 *
 * TWO PLACEMENTS, NOT ONE RESPONSIVE ONE.
 *
 *   placement="inline"  Phones. A permanently visible, full-width button
 *                       at the foot of the tile. Nothing about it is
 *                       hover-dependent, because there is no hover on a
 *                       touch screen and a buy button that only exists
 *                       under a pointer is a lost sale.
 *   placement="overlay" Desktop. Slides up over the bottom edge of the
 *                       image on card hover or keyboard focus.
 *
 * The card renders both and lets the breakpoint pick, so the mobile
 * control is never a hidden desktop control that happens to be visible.
 */

import { useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useCart } from '~/components/commerce/CartProvider'
import type { ProductCardModel } from '~/lib/shopify/adapters'

/** Slide-up reveal for the desktop overlay placement only. */
const OVERLAY_REVEAL =
  'absolute inset-x-0 bottom-0 translate-y-[130%] opacity-0 ' +
  'transition-[transform,opacity] duration-hover ease-apple ' +
  'group-hover/card:translate-y-0 group-hover/card:opacity-100 ' +
  'group-focus-within/card:translate-y-0 group-focus-within/card:opacity-100 ' +
  'motion-reduce:transition-none'

const BUTTON =
  'flex w-full min-h-11 items-center justify-center px-3 text-[12px] label ' +
  'bg-maroon text-bone hover:bg-ink active:scale-[0.99] ' +
  'transition-colors duration-hover ease-apple disabled:opacity-70 motion-reduce:transition-none'

interface QuickAddProps {
  product: ProductCardModel
  placement: 'inline' | 'overlay'
}

export function QuickAdd({ product, placement }: QuickAddProps) {
  const { add, openCart } = useCart()
  const [pending, setPending] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Sold-out pieces get no add control at all. A disabled "Sold out"
  // button is a tap target that does nothing; the badge already says it.
  if (!product.availableForSale) return null

  const wrapper = placement === 'overlay' ? OVERLAY_REVEAL : 'mt-3'

  // No variant id, or the piece needs a choice made first.
  const needsOptions = !product.variantId || (product.optionCount ?? 1) > 1
  if (needsOptions) {
    return (
      <div className={wrapper}>
        <Link
          to="/products/$handle"
          params={{ handle: product.handle }}
          className={`${BUTTON} relative z-20`}
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
        className={`${BUTTON} relative z-20`}
      >
        {pending ? 'Adding…' : 'Quick add'}
      </button>
    </div>
  )
}
