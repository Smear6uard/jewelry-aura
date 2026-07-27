/**
 * components/commerce/ProductCard.tsx — one product, everywhere.
 *
 * The backbone of the storefront: rails, grids, search results and the
 * "you may also like" strip all render this component. Built once so a
 * change to card density or hover behaviour lands on every surface.
 *
 * Anatomy
 *   image 4:5 on the raised surface, hairline framed
 *   badge      top-left, maroon fill (New / Sale) or champagne outline
 *   quick add  slides up from the bottom edge on hover
 *   name       cream sans 14px — not the display serif; product names
 *              set in a serif are what makes a grid read as a lookbook
 *   price      cream 14px, struck compare-at in subtle
 *   rating     champagne stars, only when rating data exists
 *
 * Link behaviour: the card is one large target via a stretched link on
 * the title, so Quick add can be a real nested control rather than an
 * anchor inside an anchor. Quick add sits above the stretched overlay
 * with an explicit z-index.
 *
 * Hover imagery: a second photograph crossfades in when the card has
 * one. When it does not — the Storefront card query does not fetch a
 * second image yet — the single image takes a slow, small scale
 * instead, so the card still answers the pointer.
 */

import { Link } from '@tanstack/react-router'
import { QuickAdd } from '~/components/commerce/QuickAdd'
import { StarRating } from '~/components/commerce/StarRating'
import type { ProductBadge, ProductCardModel } from '~/lib/shopify/adapters'

interface ProductCardProps {
  product: ProductCardModel
  /** Above-the-fold cards load eagerly for LCP. */
  eager?: boolean
  sizes?: string
}

const DEFAULT_SIZES = '(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 50vw'

export function ProductCard({
  product,
  eager = false,
  sizes = DEFAULT_SIZES,
}: ProductCardProps) {
  const badge = resolveBadge(product)
  const onSale = Boolean(product.compareAtPrice)

  return (
    <article className="group relative flex flex-col">
      <div className="case-plate relative aspect-[4/5] overflow-hidden tile-frame">
        {product.image ? (
          <>
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
              className={`h-full w-full object-cover transition-[opacity,transform] duration-hover ease-apple motion-reduce:transition-none ${
                product.hoverImage
                  ? 'group-hover:opacity-0'
                  : 'group-hover:scale-[1.03]'
              } ${product.availableForSale ? '' : 'opacity-50 saturate-50'}`}
            />
            {product.hoverImage && (
              <img
                src={product.hoverImage.src}
                srcSet={product.hoverImage.srcSet}
                sizes={sizes}
                alt=""
                aria-hidden
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-hover ease-apple group-hover:opacity-100 motion-reduce:transition-none"
              />
            )}
          </>
        ) : (
          <div
            aria-hidden
            className="flex h-full w-full items-center justify-center"
          >
            {/* Same plate as a photographed tile so a product awaiting
                photography leaves a gap in the grid's content, not in
                its rhythm. */}
            <span className="font-display text-3xl text-base/25">JA</span>
          </div>
        )}

        {badge && <Badge kind={badge} />}

        <QuickAdd product={product} className="absolute inset-x-0 bottom-0" />
      </div>

      <div className="mt-2.5 flex flex-col gap-1">
        <h3 className="text-[13px] font-medium leading-snug text-cream md:text-[14px]">
          <Link
            to="/products/$handle"
            params={{ handle: product.handle }}
            className="after:absolute after:inset-0 after:content-[''] hover:text-champagne focus-visible:text-champagne transition-colors duration-hover ease-apple"
          >
            {product.title}
          </Link>
        </h3>

        <p className="flex items-baseline gap-2 text-[13px] md:text-[14px]">
          {product.availableForSale ? (
            <>
              {product.priceFrom && (
                <span className="text-[11px] text-cream-subtle">From</span>
              )}
              <span className={onSale ? 'font-medium text-cream' : 'text-cream'}>
                {product.price}
              </span>
              {product.compareAtPrice && (
                <s className="text-[12px] text-cream-subtle">
                  {product.compareAtPrice}
                </s>
              )}
            </>
          ) : (
            <span className="label text-[11px] text-cream-subtle">Sold out</span>
          )}
        </p>

        {product.rating && (
          <p className="flex items-center gap-1.5">
            <StarRating value={product.rating.value} />
            <span className="text-[11px] text-cream-subtle">
              ({product.rating.count})
            </span>
          </p>
        )}
      </div>
    </article>
  )
}

/** An explicit badge wins; a compare-at price implies a sale. */
function resolveBadge(product: ProductCardModel): ProductBadge | null {
  if (product.badge) return product.badge
  if (product.compareAtPrice) return 'sale'
  return null
}

const BADGE_LABEL: Record<ProductBadge, string> = {
  new: 'New',
  sale: 'Sale',
  'one-of-one': 'One of one',
}

function Badge({ kind }: { kind: ProductBadge }) {
  // Sale and New take the maroon fill; one-of-one is a champagne
  // outline — it marks a piece as unrepeatable, not as discounted, and
  // sharing the sale colour would blur that.
  const outlined = kind === 'one-of-one'
  return (
    <span
      className={`absolute left-0 top-0 z-10 px-2 py-1 text-[10px] label-wide ${
        outlined ? 'text-champagne' : 'bg-brand text-cream'
      }`}
      style={
        outlined
          ? {
              boxShadow: 'inset 0 0 0 1px rgba(196,168,117,0.55)',
              backgroundColor: 'rgba(10,9,8,0.72)',
            }
          : undefined
      }
    >
      {BADGE_LABEL[kind]}
    </span>
  )
}
