/**
 * components/commerce/QuickAdd.tsx — the one action on a product card.
 *
 * Two honest states, chosen by what the card actually knows:
 *
 *   • The card carries a single purchasable variant → "Add".
 *     One tap adds it and opens the cart.
 *   • The piece needs a length, size or metal chosen first, or the card
 *     has no variant id → "View", rendered as a link to the product page.
 *
 * A button labelled "Add" that silently navigates somewhere else is the
 * worst version of this control, so the label always matches what
 * pressing it does. "View" is a word for going to look at something;
 * "Choose options" was a word for a modal this store does not have.
 *
 * ONE CONTROL PER CARD.
 *
 * There used to be two placements — a permanent button at the foot of the
 * tile on phones and a hover overlay over the image on desktop — and the
 * card rendered BOTH, hiding one per breakpoint. Every card therefore
 * shipped its call to action twice: twice in the HTML, twice to a screen
 * reader, and twice in the tab order, which is the "Choose options
 * appears twice" the shelf was showing. There is now one button, at the
 * foot of the tile, visible at every width. That is also the better
 * control: a buy button that only exists under a pointer is a lost sale
 * on the half of this traffic that has no pointer.
 */

import { useRef, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useCart } from '~/components/commerce/CartProvider'
import type { ProductCardModel } from '~/lib/shopify/adapters'

const BUTTON =
  'mt-3 flex w-full min-h-11 items-center justify-center px-3 text-[12px] label ' +
  'relative z-20 bg-ink text-bone hover:ring-1 hover:ring-gold active:scale-[0.99] ' +
  'transition-colors duration-hover ease-apple disabled:opacity-70 motion-reduce:transition-none'

export function QuickAdd({ product }: { product: ProductCardModel }) {
  const { add, openCart } = useCart()
  const [pending, setPending] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Sold-out pieces get no add control at all. A disabled "Sold out"
  // button is a tap target that does nothing; the badge already says it.
  if (!product.availableForSale) return null

  // No variant id, or the piece needs a choice made first.
  const needsOptions = !product.variantId || (product.optionCount ?? 1) > 1
  if (needsOptions) {
    return (
      <Link
        to="/products/$handle"
        params={{ handle: product.handle }}
        aria-label={`View ${product.title}`}
        className={BUTTON}
      >
        View
      </Link>
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
    <button
      ref={buttonRef}
      type="button"
      disabled={pending}
      onClick={onClick}
      aria-label={`Add ${product.title} to cart`}
      className={BUTTON}
    >
      {pending ? 'Adding…' : 'Add'}
    </button>
  )
}
