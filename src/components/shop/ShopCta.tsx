/**
 * components/shop/ShopCta.tsx — closing band for catalog pages.
 *
 * Keeps the commission funnel present on shop surfaces without competing
 * with the products: one editorial line, one CTA routing to the Visit
 * section on the homepage (the site's single conversion surface).
 */

import { PillLink } from '~/components/shop/PillLink'

export function ShopCta() {
  return (
    <section
      className="border-t border-champagne/15"
      style={{ borderTopWidth: '0.5px' }}
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-10 px-6 py-20 md:grid-cols-12 md:px-12 md:py-28">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-champagne md:col-span-3">
          Custom work
        </p>
        <div className="md:col-span-6">
          <h2 className="font-display text-3xl font-light italic leading-snug text-cream md:text-4xl">
            Don&rsquo;t see it in the case? It hasn&rsquo;t been made yet.
          </h2>
          <div className="mt-8">
            <PillLink href="/#visit">Book a consultation</PillLink>
          </div>
        </div>
      </div>
    </section>
  )
}
