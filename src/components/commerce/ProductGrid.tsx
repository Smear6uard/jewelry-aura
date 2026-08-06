/**
 * components/commerce/ProductGrid.tsx — the dense catalog grid.
 *
 * Two across on phones, four on desktop, five on very wide screens, with
 * tight gutters. Never one across: a single-column product list reads as
 * a catalog page rather than a store, and it halves how much of the
 * catalog a shopper sees per swipe.
 *
 * `density="compact"` steps down one column at each breakpoint for grids
 * that share the viewport with a filter sidebar.
 *
 * No scroll-reveal animation here, by design. Staggered fades on a
 * product grid delay the only thing the shopper came for.
 */

import { ProductCard } from '~/components/commerce/ProductCard'
import { BTN_PRIMARY } from '~/lib/ui'
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
    <ul className={`grid gap-2 md:gap-3 ${COLUMNS[density]}`}>
      {products.map((product, index) => (
        <li key={product.handle}>
          <ProductCard
            product={product}
            sizes={SIZES[density]}
            eager={index < eagerCount}
          />
        </li>
      ))}
    </ul>
  )
}

function EmptyGrid() {
  return (
    <div className="bg-bone px-6 py-20 text-center border border-hairline-light">
      <p className="text-[11px] label-wide text-ink">Nothing here yet</p>
      <p className="mx-auto mt-3 max-w-sm text-[15px] text-ink">
        This case is being restocked. The full catalog is one step away.
      </p>
      <a href="/shop" className={`${BTN_PRIMARY} mt-6`}>
        Shop all pieces
      </a>
    </div>
  )
}
