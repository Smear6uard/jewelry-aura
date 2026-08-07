/**
 * components/sections/TrustBar.tsx — the terms, slim, right after the
 * shelf.
 *
 * Four promises on one hairline-ruled line and nothing else. No icons: a
 * truck glyph next to "Free shipping" adds nothing a shopper did not
 * already read, and a row of pictograms is exactly the kind of
 * decoration that makes a trust band look like a template. No counters,
 * no fabricated stats — the claims are terms, and each one links to the
 * page that states it.
 *
 * IT IS PAPER NOW, AND ONE LINE TALL.
 *
 * It used to be a full velvet band of four cells, which was the right
 * weight when it was the page's only statement of the terms. It is not
 * any more: the four facts get a whole scene of their own at the foot of
 * the page (see sections/TheBench), and this is the reminder a shopper
 * wants immediately after the shelf. It also sits between two full-bleed
 * velvet scenes — the exhibit above it and the commissions below — and a
 * third dark band in that gap would weld all three into one long dark
 * stretch instead of a rhythm.
 *
 * Every claim here is stated identically on its policy page and in the
 * bench line. That is the point of a trust band: if any two of them
 * disagree, they are marketing rather than information.
 */

import { FREE_SHIPPING_THRESHOLD } from '~/lib/catalog'

const PROMISES = [
  { label: `Free shipping over $${FREE_SHIPPING_THRESHOLD}`, href: '/pages/shipping' },
  { label: 'Lifetime warranty', href: '/pages/warranty' },
  { label: '30-day returns', href: '/pages/returns' },
  // Was "Hand-set in <city>". The claim a shopper can act on is who
  // makes the piece, not where the bench sits.
  { label: 'Hand-set to order', href: '/pages/about' },
]

export function TrustBar() {
  return (
    <section aria-label="Store promises" className="mx-auto max-w-[1440px] px-4 md:px-8">
      <ul className="flex flex-wrap items-center gap-x-6 gap-y-0 border-y border-hairline-light py-1 md:gap-x-10">
        {PROMISES.map((promise) => (
          <li key={promise.href}>
            <a
              href={promise.href}
              className="flex min-h-11 items-center text-[10px] label-wide text-ink transition-colors duration-hover ease-apple link-hover md:text-[11px] motion-reduce:transition-none"
            >
              {promise.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
