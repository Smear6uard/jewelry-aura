/**
 * components/commerce/FreeShippingMeter.tsx — progress toward free
 * shipping, shown in the cart drawer and on the cart page.
 *
 * The bar fills in ink. Maroon in the cart belongs to the checkout
 * the fill reaching the end of the track is the whole message. Copy names
 * the remaining amount rather than the percentage, because "$38 away" is
 * actionable and "74%" is not.
 */

import { FREE_SHIPPING_THRESHOLD } from '~/lib/catalog'

interface FreeShippingMeterProps {
  /** Cart subtotal in dollars. */
  subtotal: number
}

export function FreeShippingMeter({ subtotal }: FreeShippingMeterProps) {
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  const reached = remaining <= 0
  // Round the shortfall UP. A $149.99 cart is one cent short, and
  // rounding to the nearest dollar renders that as "$0 away from free
  // shipping" — a promise the cart is not actually keeping. Ceiling it
  // says "$1 away", which is true and is an amount someone can act on.
  const shortfall = Math.ceil(remaining)
  const percent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)

  return (
    <div>
      <p className="text-[13px] text-ink">
        {reached ? (
          <span className="font-medium text-ink">Free shipping unlocked.</span>
        ) : (
          <>
            <span className="font-medium text-ink">
              ${shortfall.toLocaleString('en-US')}
            </span>{' '}
            away from free shipping.
          </>
        )}
      </p>
      <div
        className="mt-2 h-[4px] w-full overflow-hidden bg-hairline-light"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={FREE_SHIPPING_THRESHOLD}
        aria-valuenow={Math.min(subtotal, FREE_SHIPPING_THRESHOLD)}
        aria-label="Progress toward free shipping"
      >
        {/* Ink throughout, deepening at the finish line. The reward
            state is the bar reaching the end, not a change of colour —
            a second accent here would be a fourth colour on the site. */}
        <div
          className="h-full transition-[width] duration-content ease-out-expo motion-reduce:transition-none"
          style={{
            width: `${percent}%`,
            backgroundColor: reached
              ? 'var(--color-ink)'
              : 'var(--color-ink)',
          }}
        />
      </div>
    </div>
  )
}
