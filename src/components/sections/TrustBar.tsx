/**
 * components/sections/TrustBar.tsx — one of three velvet bands.
 *
 * Four promises, hairlines between them, nothing else. No icons: a
 * truck glyph next to "Free shipping" adds nothing a shopper did not
 * already read, and a row of pictograms is exactly the kind of
 * decoration that makes a trust band look like a template. No counters,
 * no fabricated stats — the claims are terms, and each one is a link to
 * the page that states it.
 *
 * Every claim here is stated identically on its policy page. That is the
 * point of a trust band — if the band and the page disagree, the band is
 * marketing rather than information.
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
    <section
      aria-label="Store promises"
      data-ground="velvet"
      className="bg-velvet text-bone"
    >
      <ul className="mx-auto grid max-w-[1440px] grid-cols-2 md:grid-cols-4">
        {PROMISES.map((promise, index) => (
          <li
            key={promise.href}
            className={[
              'flex items-center justify-center',
              // Hairlines between cells, never around the band.
              index % 2 === 1 ? 'border-l border-hairline-dark' : '',
              index >= 2 ? 'border-t border-hairline-dark md:border-t-0' : '',
              index === 2 ? 'md:border-l md:border-hairline-dark' : '',
            ].join(' ')}
          >
            <a
              href={promise.href}
              className="flex min-h-11 w-full items-center justify-center px-3 py-3 text-center text-[10px] label-wide text-bone transition-colors duration-hover ease-apple hover:text-gold md:text-[11px] motion-reduce:transition-none"
            >
              {promise.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
