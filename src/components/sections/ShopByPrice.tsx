/**
 * components/sections/ShopByPrice.tsx — three doors for the shopper who
 * knows their budget but not their piece.
 *
 * The oldest merchandising pattern in retail and still the most useful
 * one on a jewelry site, where the price spread between a charm and a
 * commission is two orders of magnitude. Each tile lands on the full
 * catalog with the price facet applied, so the band is three real
 * queries rather than three decorative panels.
 */

import { ArrowRight } from 'lucide-react'
import { SectionHeader } from '~/components/commerce/SectionHeader'
import { Reveal } from '~/components/motion/Reveal'
import { PRICE_FACETS } from '~/lib/catalog'

const NOTES: Record<string, string> = {
  'under-250': 'Charms, studs and starter chains',
  '250-750': 'Everyday gold and lighter links',
  '750-plus': 'Heavy links, bridal and commissions',
}

export function ShopByPrice() {
  return (
    <section
      aria-label="Shop by price"
      className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16"
    >
      <SectionHeader
        title="Shop by price"
        link={{ href: '/shop', label: 'Shop all' }}
      />

      <Reveal>
        <ul className="mt-6 grid gap-2 md:mt-8 md:grid-cols-3 md:gap-3">
          {PRICE_FACETS.map((band) => (
            <li key={band.value}>
              <a
                href={`/shop?price=${band.value}`}
                className="group/band flex items-center justify-between gap-4 bg-bone px-5 py-6 border border-hairline-light transition-colors duration-hover ease-apple md:px-6 md:py-8 motion-reduce:transition-none"
              >
                <span>
                  <span className="display block text-[22px] leading-none text-ink md:text-[26px]">
                    {band.label}
                  </span>
                  <span className="mt-2 block text-[13px] text-ink">
                    {NOTES[band.value]}
                  </span>
                </span>
                <ArrowRight
                  aria-hidden
                  size={17}
                  strokeWidth={1.6}
                  className="shrink-0 text-maroon transition-transform duration-hover ease-apple group-hover/band:translate-x-0.5 motion-reduce:transition-none"
                />
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}
