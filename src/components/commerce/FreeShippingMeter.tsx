/**
 * components/commerce/FreeShippingMeter.tsx — progress toward free
 * shipping, shown in the cart drawer and on the cart page.
 *
 * The bar is the one place in the cart where maroon fills a shape: it
 * is a reward state, and the fill reaching the end of the track is the
 * message. Copy names the remaining amount rather than the percentage,
 * because "$38 away" is actionable and "74%" is not.
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
      <p className="text-[12px] text-cream-muted">
        {reached ? (
          <span className="text-cream">Free shipping unlocked.</span>
        ) : (
          <>
            <span className="text-cream">
              ${shortfall.toLocaleString('en-US')}
            </span>{' '}
            away from free shipping.
          </>
        )}
      </p>
      <div
        className="mt-2 h-[3px] w-full overflow-hidden bg-hairline"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={FREE_SHIPPING_THRESHOLD}
        aria-valuenow={Math.min(subtotal, FREE_SHIPPING_THRESHOLD)}
        aria-label="Progress toward free shipping"
      >
        <div
          className="h-full transition-[width] duration-content ease-out-expo motion-reduce:transition-none"
          style={{
            width: `${percent}%`,
            backgroundColor: reached ? '#C4A875' : 'var(--color-brand-hover)',
          }}
        />
      </div>
    </div>
  )
}
