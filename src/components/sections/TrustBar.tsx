/**
 * components/sections/TrustBar.tsx — the second and last full-maroon
 * band on the site.
 *
 * Four promises, champagne hairlines between them, nothing else. No
 * icons: a truck glyph next to "Free shipping" adds nothing a shopper
 * did not already read, and a row of pictograms is exactly the kind of
 * decoration that makes a trust band look like a template.
 *
 * Every claim here is stated identically on its policy page. That is
 * the point of a trust band — if the band and the page disagree, the
 * band is marketing rather than information.
 */

import { FREE_SHIPPING_THRESHOLD, STORE } from '~/lib/catalog'

const PROMISES = [
  { label: `Free shipping over $${FREE_SHIPPING_THRESHOLD}`, href: '/pages/shipping' },
  { label: 'Lifetime warranty', href: '/pages/warranty' },
  { label: '30-day returns', href: '/pages/returns' },
  { label: `Hand-set in ${STORE.city.split(',')[0]}`, href: '/pages/about' },
]

export function TrustBar() {
  return (
    <section aria-label="Store promises" className="bg-brand">
      <ul className="mx-auto grid max-w-[1440px] grid-cols-2 md:grid-cols-4">
        {PROMISES.map((promise, index) => (
          <li
            key={promise.href}
            className={[
              'flex items-center justify-center',
              // Champagne hairlines between cells, never around the band.
              index % 2 === 1 ? 'border-l border-champagne/25' : '',
              index >= 2 ? 'border-t border-champagne/25 md:border-t-0' : '',
              index === 2 ? 'md:border-l md:border-champagne/25' : '',
            ].join(' ')}
          >
            <a
              href={promise.href}
              className="block px-3 py-3.5 text-center text-[10px] label-wide text-cream/90 transition-colors duration-hover ease-apple hover:text-cream md:py-4 md:text-[11px]"
            >
              {promise.label}
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
