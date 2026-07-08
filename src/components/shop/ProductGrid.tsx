/**
 * components/shop/ProductGrid.tsx — editorial product listing.
 *
 * Not a uniform template grid: products flow through a repeating
 * five-card editorial spread on a 12-column grid — one anchor image,
 * then offset satellites with staggered top margins and deliberate
 * empty zones, echoing the site's asymmetric section language.
 * Collapses to a strict single column below md.
 */

import { ProductCard } from '~/components/shop/ProductCard'
import type { ProductCardModel } from '~/lib/shopify/adapters'

interface SpreadSlot {
  className: string
  aspect: string
  sizes: string
}

// One editorial "spread" = five products. col-start values carve out
// asymmetric whitespace; mt offsets break the baseline. All md+ only.
const SPREAD: ReadonlyArray<SpreadSlot> = [
  {
    className: 'md:col-span-7 md:col-start-1',
    aspect: 'aspect-[4/5]',
    sizes: '(min-width: 768px) 56vw, 100vw',
  },
  {
    className: 'md:col-span-4 md:col-start-9 md:mt-32',
    aspect: 'aspect-[3/4]',
    sizes: '(min-width: 768px) 32vw, 100vw',
  },
  {
    className: 'md:col-span-4 md:col-start-2 md:-mt-10',
    aspect: 'aspect-[3/4]',
    sizes: '(min-width: 768px) 32vw, 100vw',
  },
  {
    className: 'md:col-span-5 md:col-start-8 md:mt-16',
    aspect: 'aspect-[4/5]',
    sizes: '(min-width: 768px) 40vw, 100vw',
  },
  {
    className: 'md:col-span-4 md:col-start-4 md:mt-8',
    aspect: 'aspect-[3/4]',
    sizes: '(min-width: 768px) 32vw, 100vw',
  },
]

interface ProductGridProps {
  products: ReadonlyArray<ProductCardModel>
  /** How many leading cards render eagerly (LCP candidates). */
  eagerCount?: number
}

export function ProductGrid({ products, eagerCount = 2 }: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyCatalog />
  }

  return (
    <div className="grid grid-cols-1 gap-y-16 md:grid-cols-12 md:gap-x-6 md:gap-y-24">
      {products.map((product, index) => {
        const slot = SPREAD[index % SPREAD.length]
        return (
          <div key={product.handle} className={slot.className}>
            <ProductCard
              product={product}
              aspect={slot.aspect}
              sizes={slot.sizes}
              eager={index < eagerCount}
            />
          </div>
        )
      })}
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
      <a
        href="/#visit"
        className="mt-10 inline-flex items-center gap-3 border border-champagne/60 px-6 py-3 font-sans text-[12px] font-medium uppercase tracking-[0.18em] text-cream transition-colors duration-hover ease-apple hover:bg-champagne hover:text-forest active:scale-[0.98]"
        style={{ borderWidth: '0.5px', borderRadius: '9999px' }}
      >
        Book a consultation
      </a>
    </div>
  )
}
