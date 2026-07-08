/**
 * components/shop/FeaturedCollections.tsx — the homepage's shop window
 * (plan U7).
 *
 * Editorial, asymmetric composition — not a template grid. Each featured
 * collection is a "spread": an intro column with the collection name and
 * a view-all link, one anchor product, and a stepped pair beside it.
 * Alternate spreads mirror direction. Collapses to a single column on
 * mobile. When no collections resolve (placeholder handles before the
 * store is curated), a quiet shop-all invitation renders instead of a
 * broken section.
 */

import { PillLink } from '~/components/shop/PillLink'
import { ProductCard } from '~/components/shop/ProductCard'
import type { FeaturedCollectionModel } from '~/lib/shopify/featured'

/** Champagne underline-on-hover arrow link (used by the section header
 * and each spread's view-all). */
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

interface FeaturedCollectionsProps {
  collections: FeaturedCollectionModel[]
}

export function FeaturedCollections({ collections }: FeaturedCollectionsProps) {
  return (
    <section
      id="featured"
      aria-label="Featured collections"
      className="border-t border-champagne/10"
      style={{ borderTopWidth: '0.5px' }}
    >
      <div className="mx-auto max-w-[1440px] px-6 py-24 md:px-12 md:py-36">
        <header className="mb-16 flex flex-wrap items-end justify-between gap-x-12 gap-y-6 md:mb-24">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-champagne">
              The cases
            </p>
            <h2 className="mt-5 max-w-2xl font-display text-4xl font-light leading-[0.98] tracking-tight text-cream md:text-6xl">
              Worn daily. Noticed
              <span className="italic"> always.</span>
            </h2>
          </div>
          <ArrowLink href="/shop" className="mb-1">
            Shop everything
          </ArrowLink>
        </header>

        {collections.length === 0 ? (
          <EmptyFeatured />
        ) : (
          <div className="flex flex-col gap-24 md:gap-36">
            {collections.map((collection, index) => (
              <CollectionSpread
                key={collection.handle}
                collection={collection}
                mirrored={index % 2 === 1}
                eager={index === 0}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}

function CollectionSpread({
  collection,
  mirrored,
  eager,
}: {
  collection: FeaturedCollectionModel
  mirrored: boolean
  eager: boolean
}) {
  const [anchor, ...rest] = collection.products
  const pair = rest.slice(0, 2)

  return (
    <article className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-6">
      {/* Intro column */}
      <div
        className={`flex flex-col justify-end md:col-span-3 md:pb-10 ${
          mirrored ? 'md:order-3 md:col-start-10' : ''
        }`}
      >
        <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cream-muted">
          Collection
        </p>
        <h3 className="mt-3 font-display text-3xl font-light italic leading-tight text-cream md:text-4xl">
          {collection.title}
        </h3>
        <ArrowLink
          href={`/collections/${collection.handle}`}
          className="mt-6"
        >
          View all
        </ArrowLink>
      </div>

      {/* Anchor product */}
      {anchor && (
        <div
          className={`md:col-span-5 ${mirrored ? 'md:order-2 md:col-start-5' : 'md:col-start-5'}`}
        >
          <ProductCard
            product={anchor}
            aspect="aspect-[4/5]"
            sizes="(min-width: 768px) 40vw, 100vw"
            eager={eager}
          />
        </div>
      )}

      {/* Stepped pair */}
      {pair.length > 0 && (
        <div
          className={`flex flex-col gap-10 md:col-span-3 md:gap-12 ${
            mirrored ? 'md:order-1 md:col-start-1 md:mt-20' : 'md:col-start-10 md:mt-24'
          }`}
        >
          {pair.map((product) => (
            <ProductCard
              key={product.handle}
              product={product}
              aspect="aspect-[3/4]"
              sizes="(min-width: 768px) 24vw, 100vw"
            />
          ))}
        </div>
      )}
    </article>
  )
}

function EmptyFeatured() {
  return (
    <div className="py-10 md:py-16">
      <p className="max-w-md font-display text-2xl italic leading-snug text-cream md:text-3xl">
        The cases are being arranged. The full collection is already open.
      </p>
      <div className="mt-8">
        <PillLink href="/shop">Shop all pieces</PillLink>
      </div>
    </div>
  )
}
