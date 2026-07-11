/**
 * components/shop/BestSellers.tsx — the homepage's shop window.
 *
 * Four pieces ranked by live sales (Shopify BEST_SELLING), not the
 * catalog. One level row of equal cards — the owner reads staggered
 * offsets and asymmetric voids as broken (same correction the catalog
 * grid went through), so listing surfaces stay uniform. Each card
 * carries a mono rank numeral + hairline — the indexing language the
 * category drawer speaks, and here the number encodes something true:
 * sales order. When the fetch degrades to empty, a quiet shop-all
 * invitation renders instead of a broken section.
 */

import { PillLink } from '~/components/shop/PillLink'
import { ProductCard } from '~/components/shop/ProductCard'
import type { ProductCardModel } from '~/lib/shopify/adapters'

/** Champagne underline-on-hover arrow link (section header view-all). */
function ArrowLink({
  href,
  children,
  className = '',
}: {
  href: string
  children: string
  className?: string
}) {
  return (
    <a
      href={href}
      className={`group inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-champagne ${className}`}
    >
      <span className="relative">
        {children}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -bottom-1 origin-left scale-x-0 bg-champagne transition-transform duration-hover ease-apple group-hover:scale-x-100"
          style={{ height: '0.5px' }}
        />
      </span>
      <span
        aria-hidden
        className="transition-transform duration-hover ease-apple group-hover:translate-x-1"
      >
        &rarr;
      </span>
    </a>
  )
}

interface BestSellersProps {
  products: ProductCardModel[]
}

export function BestSellers({ products }: BestSellersProps) {
  return (
    <section
      id="best-sellers"
      aria-label="Best sellers"
      className="border-t border-champagne/10"
      style={{ borderTopWidth: '0.5px' }}
    >
      <div className="mx-auto max-w-[1440px] px-6 py-24 md:px-12 md:py-36">
        <header className="mb-16 flex flex-wrap items-end justify-between gap-x-12 gap-y-6 md:mb-24">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-champagne">
              Best sellers
            </p>
            <h2 className="mt-5 max-w-2xl font-display text-4xl font-light leading-[0.98] tracking-tight text-cream md:text-6xl">
              The pieces everyone
              <span className="italic"> asks for.</span>
            </h2>
          </div>
          <ArrowLink href="/shop" className="mb-1">
            Shop everything
          </ArrowLink>
        </header>

        {products.length === 0 ? (
          <EmptyBestSellers />
        ) : (
          <RankedRow products={products} />
        )}
      </div>
    </section>
  )
}

/** The ranked shelf: four equal cards, one level row (2×2 on phones).
 * Same grid rhythm as the catalog. */
function RankedRow({ products }: { products: ProductCardModel[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-12 md:grid-cols-4 md:gap-x-6">
      {products.slice(0, 4).map((product, index) => (
        <RankedCard
          key={product.handle}
          product={product}
          rank={index + 1}
          aspect="aspect-[3/4]"
          sizes="(min-width: 768px) 24vw, 50vw"
          eager={index === 0}
        />
      ))}
    </div>
  )
}

/** Mono rank numeral + hairline above the card — the drawer's indexing
 * idiom, repurposed to carry sales order. */
function RankedCard({
  product,
  rank,
  aspect,
  sizes,
  eager = false,
}: {
  product: ProductCardModel
  rank: number
  aspect: string
  sizes: string
  eager?: boolean
}) {
  return (
    <div>
      <p
        aria-hidden
        className="mb-3 flex items-center gap-3 font-mono text-[10px] tracking-[0.18em] text-champagne"
      >
        {String(rank).padStart(2, '0')}
        <span
          className="flex-1 bg-champagne/20"
          style={{ height: '0.5px' }}
        />
      </p>
      <ProductCard
        product={product}
        aspect={aspect}
        sizes={sizes}
        eager={eager}
      />
    </div>
  )
}

function EmptyBestSellers() {
  return (
    <div className="py-10 md:py-16">
      <p className="max-w-md font-display text-2xl italic leading-snug text-cream md:text-3xl">
        The counter is being set. The full collection is already open.
      </p>
      <div className="mt-8">
        <PillLink href="/shop">Shop all pieces</PillLink>
      </div>
    </div>
  )
}
