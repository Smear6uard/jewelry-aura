/**
 * components/sections/MoissaniteBand.tsx — the stone, argued.
 *
 * Moissanite is the one thing on this site a shopper is likely to
 * arrive already suspicious about ("is it fake?"), so the section that
 * sells it has to answer a question rather than repeat a name. The left
 * column makes the case in three sentences; the right column is the
 * spec card — hardness, colour, cut, setting — set like the paper that
 * comes in the box with a stone.
 *
 * That spec card is why this section is not another photo tile. There
 * are no moissanite photographs in the shot list, and a stock-looking
 * sparkle image would undercut exactly the credibility the copy is
 * trying to build. Numbers on hairlines do the opposite.
 *
 * The spec branch is the site's vitrine: the whole band goes velvet and
 * the spec values are set in gold mono, which is the one use gold has
 * for type. That works precisely because the band then carries no
 * maroon — the two accents are never allowed to sit beside each other.
 *
 * When the case has moissanite pieces in it, they take over the right
 * column and the spec card steps aside — at that point the products are
 * the better argument. The band reverts to paper with it, because a
 * product card is a paper object with its own accents.
 */

import { ArrowRight } from 'lucide-react'
import { ProductCard } from '~/components/commerce/ProductCard'
import { Reveal } from '~/components/motion/Reveal'
import {
  BTN_PRIMARY,
  BTN_PRIMARY_ON_VELVET,
  BTN_SECONDARY,
  BTN_SECONDARY_ON_VELVET,
} from '~/lib/ui'
import { MOISSANITE } from '~/lib/catalog'
import type { ProductCardModel } from '~/lib/shopify/adapters'

/**
 * Verifiable properties of the stone, not marketing adjectives. Every
 * line here is a fact a shopper can check against any gemological
 * reference before they trust the price beside it.
 */
const SPECS = [
  { label: 'Hardness', value: '9.25 Mohs' },
  { label: 'Brilliance', value: '2.65 refractive index' },
  { label: 'Colour', value: 'Near-colourless D–F' },
  { label: 'Set in', value: '10K–14K solid gold' },
]

export function MoissaniteBand({
  products = [],
}: {
  products?: ReadonlyArray<ProductCardModel>
}) {
  const shown = products.slice(0, 2)
  const vitrine = shown.length === 0

  return (
    <section
      aria-label="Moissanite"
      className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16"
    >
      <Reveal>
        <div
          data-ground={vitrine ? 'velvet' : undefined}
          className={`grid overflow-hidden md:grid-cols-2 ${
            vitrine
              ? 'bg-velvet text-bone'
              : 'gap-px border border-hairline-light bg-hairline-light'
          }`}
        >
          <div
            className={`flex flex-col justify-center px-5 py-8 md:px-10 md:py-12 ${
              vitrine ? '' : 'bg-bone'
            }`}
          >
            <p
              className={`text-[11px] label-wide ${
                vitrine ? 'text-bone' : 'text-ink'
              }`}
            >
              The stone
            </p>
            <h2
              className={`display mt-2 text-[28px] leading-tight md:text-[36px] ${
                vitrine ? 'text-bone' : 'text-ink'
              }`}
            >
              Moissanite
            </h2>
            <p
              className={`mt-3 max-w-[46ch] text-[15px] leading-relaxed ${
                vitrine ? 'text-bone' : 'text-ink'
              }`}
            >
              Harder to scratch than anything but diamond, and it throws more
              colour in direct light. It buys size: the same budget sets a
              stone two or three times larger. What it does not buy is resale
              value — we will say so before you spend.
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <a
                href={MOISSANITE.href}
                className={vitrine ? BTN_PRIMARY_ON_VELVET : BTN_PRIMARY}
              >
                Shop moissanite
                <ArrowRight aria-hidden size={15} strokeWidth={1.6} />
              </a>
              <a
                href="/custom"
                className={vitrine ? BTN_SECONDARY_ON_VELVET : BTN_SECONDARY}
              >
                Commission a setting
              </a>
            </div>
          </div>

          {vitrine ? (
            <dl className="flex flex-col justify-center border-t border-hairline-dark px-5 py-8 md:border-l md:border-t-0 md:px-10 md:py-12">
              {SPECS.map((spec, index) => (
                <div
                  key={spec.label}
                  className={`flex items-baseline justify-between gap-4 py-3.5 ${
                    index > 0 ? 'border-t border-hairline-dark' : ''
                  }`}
                >
                  <dt className="text-[11px] label-wide text-bone">
                    {spec.label}
                  </dt>
                  {/* The one place gold carries type: spec values inside a
                      vitrine. 7.6:1 on velvet, and no maroon in this
                      component for it to sit next to. */}
                  <dd className="spec text-[15px] leading-none text-gold md:text-[16px]">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : (
            <div className="bg-bone px-5 py-8 md:px-10 md:py-12">
              <ul className="grid grid-cols-2 gap-2 md:gap-3">
                {shown.map((product) => (
                  <li key={product.handle}>
                    <ProductCard
                      product={product}
                      sizes="(min-width: 768px) 22vw, 44vw"
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Reveal>
    </section>
  )
}
