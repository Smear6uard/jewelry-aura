/**
 * components/commerce/ProductRail.tsx — a merchandised shelf.
 *
 * Phones: a native scroll-snap carousel. Cards are 40vw so two fit with
 * roughly 15% of the viewport showing the third — the peeking card IS the
 * swipe affordance, which is why there are no arrows and no dots. Every
 * product is rendered exactly once; nothing here duplicates DOM nodes to
 * fake an infinite loop, because a crawler reads the duplicates as real
 * products and the shopper pays for them in page weight.
 *
 * Desktop: a level four-across grid, rounded DOWN to whole rows. Five
 * products would otherwise leave one card alone on row two, which reads
 * as a shelf someone stopped filling — the same "thin catalog" signal
 * `minProducts` exists to prevent, one row further down. The phone
 * carousel still shows all of them; a scroll track has no rows to leave
 * ragged.
 *
 * Same ProductCard as the catalog grid — a rail is a different layout,
 * not a different product.
 *
 * `minProducts` is the merchandising guard. A homepage rail passes 4: a
 * shelf with two pieces on it advertises a thin catalog, and a missing
 * section is invisible where a half-empty one is conspicuous. The PDP's
 * recommendation strip passes the default 1, where a short list is still
 * useful.
 */

import { ProductCard } from '~/components/commerce/ProductCard'
import { SectionHeader } from '~/components/commerce/SectionHeader'
import type { ProductCardModel } from '~/lib/shopify/adapters'

interface ProductRailProps {
  title: string
  eyebrow?: string
  products: ReadonlyArray<ProductCardModel>
  link?: { href: string; label: string }
  /** Cap on how many cards the rail shows. */
  limit?: number
  /** Below this many products the rail renders nothing at all. */
  minProducts?: number
  /** First cards load eagerly — set on the topmost rail only. */
  eager?: boolean
  id?: string
}

export function ProductRail({
  title,
  eyebrow,
  products,
  link,
  limit = 8,
  minProducts = 1,
  eager = false,
  id,
}: ProductRailProps) {
  const shown = products.slice(0, limit)
  if (shown.length < minProducts) return null

  // Whole rows only on the desktop grid. Below four there is no full row
  // to keep, so a short rail shows what it has rather than nothing.
  const COLUMNS = 4
  const level =
    shown.length >= COLUMNS
      ? shown.slice(0, Math.floor(shown.length / COLUMNS) * COLUMNS)
      : shown

  return (
    <section
      id={id}
      aria-label={title}
      className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16"
    >
      <SectionHeader title={title} eyebrow={eyebrow} link={link} />

      {/* Phones: one snap track. The negative margin lets it bleed to the
          viewport edge while the header keeps its gutter. */}
      <div className="mt-5 md:hidden">
        <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-1">
          {shown.map((product, index) => (
            <li
              key={product.handle}
              className="w-[40vw] min-w-[140px] shrink-0 snap-start"
            >
              <ProductCard
                product={product}
                sizes="40vw"
                eager={eager && index < 2}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* md and up: a level grid. Four across, tight gutters. */}
      <ul className="mt-8 hidden gap-3 md:grid md:grid-cols-4">
        {level.map((product, index) => (
          <li key={product.handle}>
            <ProductCard
              product={product}
              sizes="(min-width: 1440px) 340px, 24vw"
              eager={eager && index < 4}
            />
          </li>
        ))}
      </ul>
    </section>
  )
}
