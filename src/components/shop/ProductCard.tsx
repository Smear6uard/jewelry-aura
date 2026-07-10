/**
 * components/shop/ProductCard.tsx — one product on a listing surface.
 *
 * Editorial card: image with a slow scale-in on hover (transform-only),
 * serif title, mono champagne price. Fully sold-out products show a
 * "Sold out" label in place of the price. The whole card is one link —
 * no separate quick-add on listing surfaces.
 */

import { Link } from '@tanstack/react-router'
import type { ProductCardModel } from '~/lib/shopify/adapters'

interface ProductCardProps {
  product: ProductCardModel
  /** Aspect class for the image frame, set by the grid's editorial rhythm. */
  aspect?: string
  /** Above-the-fold cards load eagerly for LCP. */
  eager?: boolean
  sizes?: string
}

export function ProductCard({
  product,
  aspect = 'aspect-[4/5]',
  eager = false,
  sizes = '(min-width: 768px) 33vw, 50vw',
}: ProductCardProps) {
  return (
    <Link
      to="/products/$handle"
      params={{ handle: product.handle }}
      className="group block outline-none focus-visible:ring-1 focus-visible:ring-champagne/60"
      aria-label={
        product.availableForSale
          ? product.title
          : `${product.title} — sold out`
      }
    >
      <div
        className={`relative overflow-hidden bg-forest-surface ${aspect}`}
      >
        {product.image ? (
          <img
            src={product.image.src}
            srcSet={product.image.srcSet}
            sizes={sizes}
            alt={product.image.alt}
            width={product.image.width}
            height={product.image.height}
            loading={eager ? 'eager' : 'lazy'}
            fetchPriority={eager ? 'high' : undefined}
            decoding={eager ? 'sync' : 'async'}
            className={`h-full w-full object-cover transition-transform duration-page ease-out-expo group-hover:scale-[1.04] ${
              product.availableForSale ? '' : 'opacity-60 saturate-50'
            }`}
          />
        ) : (
          <div
            aria-hidden
            className="flex h-full w-full items-center justify-center"
          >
            <span className="font-display text-4xl italic text-cream-muted/30">
              JA
            </span>
          </div>
        )}
        {!product.availableForSale && (
          <span
            className="absolute left-4 top-4 border border-cream-muted/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-cream-muted"
            style={{ borderWidth: '0.5px' }}
          >
            Sold out
          </span>
        )}
      </div>

      {/* Two-up mobile cells are too narrow for a side-by-side
          title/price row — stack them until md. */}
      <div className="mt-3 flex flex-col gap-1 md:mt-4 md:flex-row md:items-baseline md:justify-between md:gap-4">
        <h3 className="font-serif text-[13px] leading-snug text-cream md:text-base">
          <span className="bg-gradient-to-r from-champagne to-champagne bg-[length:0%_1px] bg-left-bottom bg-no-repeat pb-0.5 transition-[background-size] duration-micro ease-apple group-hover:bg-[length:100%_1px]">
            {product.title}
          </span>
        </h3>
        {product.availableForSale ? (
          <p className="shrink-0 font-mono text-[11px] tracking-[0.08em] text-champagne">
            {product.priceFrom && (
              <span className="text-cream-muted">From </span>
            )}
            {product.price}
          </p>
        ) : (
          <p className="shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-cream-muted/70">
            Sold out
          </p>
        )}
      </div>
    </Link>
  )
}
