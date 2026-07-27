/**
 * components/commerce/ProductGrid.tsx — the dense catalog grid.
 *
 * Two across on phones, four on desktop, five on very wide screens,
 * with tight gutters. Products should feel abundant: a grid that gives
 * every piece an editorial frame reads as a lookbook, and a lookbook
 * does not convert.
 *
 * `density="compact"` steps down one column at each breakpoint for
 * grids that share the viewport with a filter sidebar.
 *
 * No scroll-reveal animation here, by design. Staggered fades on a
 * product grid delay the only thing the shopper came for.
 */

import { ProductCard } from '~/components/commerce/ProductCard'
import type { ProductCardModel } from '~/lib/shopify/adapters'

interface ProductGridProps {
  products: ReadonlyArray<ProductCardModel>
  /** How many leading cards render eagerly (LCP candidates). */
  eagerCount?: number
  density?: 'default' | 'compact'
  /** Rendered in place of the grid when there is nothing to show. */
  empty?: React.ReactNode
}

const COLUMNS = {
  default: 'grid-cols-2 md:grid-cols-4 xl:grid-cols-5',
  compact: 'grid-cols-2 md:grid-cols-3 xl:grid-cols-4',
} as const

const SIZES = {
  default: '(min-width: 1280px) 19vw, (min-width: 768px) 24vw, 48vw',
  compact: '(min-width: 1280px) 22vw, (min-width: 768px) 29vw, 48vw',
} as const

export function ProductGrid({
  products,
  eagerCount = 4,
  density = 'default',
  empty,
}: ProductGridProps) {
  if (products.length === 0) return <>{empty ?? <EmptyGrid />}</>

  return (
    <div className={`grid gap-x-2 gap-y-8 md:gap-x-3 md:gap-y-10 ${COLUMNS[density]}`}>
      {products.map((product, index) => (
        <ProductCard
          key={product.handle}
          product={product}
          sizes={SIZES[density]}
          eager={index < eagerCount}
        />
      ))}
    </div>
  )
}

function EmptyGrid() {
  return (
    <div className="border border-hairline px-6 py-20 text-center">
      <p className="text-[11px] label-wide text-cream-subtle">Nothing here yet</p>
      <p className="mx-auto mt-3 max-w-sm text-[15px] text-cream-muted">
        This case is being restocked. The full catalog is one step away.
      </p>
      <a
        href="/shop"
        className="mt-6 inline-flex items-center bg-brand px-6 py-3 text-[11px] label text-cream transition-colors duration-hover ease-apple hover:bg-brand-hover"
      >
        Shop all pieces
      </a>
    </div>
  )
}
