/**
 * components/commerce/ProductRail.tsx — a merchandised shelf.
 *
 * Horizontal scroll on phones (cards sized so the next one peeks in,
 * which is the whole affordance), a level four-across grid from md up.
 * Same ProductCard as the catalog grid — a rail is a different layout,
 * not a different product.
 *
 * Renders nothing at all when it has no products. A titled shelf with
 * an empty space under it is worse than no shelf.
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
  /** First card loads eagerly — set on the topmost rail only. */
  eager?: boolean
  id?: string
}

export function ProductRail({
  title,
  eyebrow,
  products,
  link,
  limit = 8,
  eager = false,
  id,
}: ProductRailProps) {
  const shown = products.slice(0, limit)
  if (shown.length === 0) return null

  return (
    <section id={id} aria-label={title} className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
      <SectionHeader title={title} eyebrow={eyebrow} link={link} />

      {/* Phones: one scroll track, cards at 46vw so a third edge shows.
          The negative margin lets the track bleed to the viewport edge
          while the header keeps its gutter. */}
      <div className="mt-6 md:hidden">
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-1">
          {shown.map((product, index) => (
            <div key={product.handle} className="w-[46vw] shrink-0 snap-start">
              <ProductCard
                product={product}
                sizes="46vw"
                eager={eager && index === 0}
              />
            </div>
          ))}
        </div>
      </div>

      {/* md and up: a level grid. Four across, tight gutters. */}
      <div className="mt-8 hidden gap-x-3 gap-y-10 md:grid md:grid-cols-4">
        {shown.slice(0, 8).map((product, index) => (
          <ProductCard
            key={product.handle}
            product={product}
            sizes="(min-width: 1440px) 340px, 24vw"
            eager={eager && index < 4}
          />
        ))}
      </div>
    </section>
  )
}
