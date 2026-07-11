/**
 * components/shop/ProductGrid.tsx — uniform catalog grid.
 *
 * A standard shelf grid: two columns on phones, three from md up.
 * Every card shares the same 3:4 frame so rows stay level and the
 * catalog reads as a clean case of pieces, not an editorial spread.
 */

import { PillLink } from '~/components/shop/PillLink'
import { ProductCard } from '~/components/shop/ProductCard'
import type { ProductCardModel } from '~/lib/shopify/adapters'

interface ProductGridProps {
  products: ReadonlyArray<ProductCardModel>
  /** How many leading cards render eagerly (LCP candidates). */
  eagerCount?: number
}

export function ProductGrid({ products, eagerCount = 3 }: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyCatalog />
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-3 md:gap-x-6 md:gap-y-20">
      {products.map((product, index) => (
        <ProductCard
          key={product.handle}
          product={product}
          aspect="aspect-[3/4]"
          sizes="(min-width: 768px) 33vw, 50vw"
          eager={index < eagerCount}
        />
      ))}
    </div>
  )
}

function EmptyCatalog() {
  return (
    <div className="py-32 text-center md:py-48">
      <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cream-muted">
        The cases are being restocked
      </p>
      <p className="mx-auto mt-6 max-w-md font-display text-2xl italic leading-snug text-cream md:text-3xl">
        New pieces are on the bench. Come see what the workshop is finishing.
      </p>
      <div className="mt-10">
        <PillLink href="/#visit">Book a consultation</PillLink>
      </div>
    </div>
  )
}
