/**
 * components/commerce/ProductCard.tsx — one product, everywhere.
 *
 * The backbone of the storefront: rails, grids, search results and the
 * "you may also like" strip all render this component. Built once so a
 * change to card density or buy behaviour lands on every surface.
 *
 * Anatomy — a white tile on the cream canvas, separated by a luminance
 * step and --shadow-sm rather than by a border:
 *
 *   image      edge-to-edge at the top, locked 4:5, no padding, no frame
 *   badge      top-left; Sale is a maroon fill, New and One of one are
 *              white plates, Sold out is a subtle fill
 *   name       ink sans 14px — not the display serif; product names set
 *              in a serif are what makes a grid read as a lookbook
 *   price      "From $79.99" across a variant range, struck compare-at
 *              beside a sale price, "Enquire" (a link, not a notice) when
 *              the piece has no price in Shopify yet
 *   rating     maroon stars and a review count, only when a review app
 *              has written real data — never a zero state
 *   quick add  full-width and permanently visible on phones; a hover
 *              overlay on the image on desktop
 *
 * Photography carries no filter, scrim or overlay. On cream, dark velvet
 * product shots separate on their own and white-ground catalog shots
 * melt into the tile — which is why the old `.case-plate` treatment (a
 * warm plate plus a brightness cut, needed to stop white cut-outs
 * glaring on a near-black canvas) is gone.
 *
 * Link behaviour: the card is one large target via a stretched link on
 * the title, so Quick add can be a real nested control rather than an
 * anchor inside an anchor. Quick add sits above the stretched overlay
 * with an explicit z-index.
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
  const soldOut = !product.availableForSale

  return (
    <article className="group/card relative flex h-full flex-col bg-raised shadow-sm transition-[box-shadow,transform] duration-hover ease-apple md:hover:-translate-y-0.5 md:hover:shadow-md motion-reduce:transition-none">
      <div className="relative aspect-[4/5] w-full overflow-hidden">
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
              // The second-image crossfade is desktop-only: on touch
              // there is no hover to trigger it, and preloading a frame
              // nobody will see costs the shopper bandwidth.
              className={`h-full w-full object-cover transition-opacity duration-hover ease-apple motion-reduce:transition-none ${
                product.hoverImage ? 'md:group-hover/card:opacity-0' : ''
              } ${soldOut ? 'opacity-60' : ''}`}
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
                className="absolute inset-0 hidden h-full w-full object-cover opacity-0 transition-opacity duration-hover ease-apple group-hover/card:opacity-100 md:block motion-reduce:transition-none"
              />
            )}
          </>
        ) : (
          <div
            aria-hidden
            className="flex h-full w-full items-center justify-center bg-sunken"
          >
            {/* A piece awaiting photography leaves a gap in the grid's
                content, not in its rhythm. */}
            <span className="display text-3xl text-ink-subtle">JA</span>
          </div>
        )}

        {badge && <Badge kind={badge} />}

        {/* Desktop: slides up over the image on hover. */}
        <div className="hidden md:block">
          <QuickAdd product={product} placement="overlay" />
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3 md:p-4">
        <h3 className="text-[13px] font-medium leading-snug text-ink md:text-[14px]">
          <Link
            to="/products/$handle"
            params={{ handle: product.handle }}
            className="transition-colors duration-hover ease-apple after:absolute after:inset-0 after:content-[''] hover:text-brand focus-visible:text-brand motion-reduce:transition-none"
          >
            {product.title}
          </Link>
        </h3>

        <Price product={product} />

        {/* Real data only. No rating → nothing renders, and the tile
            lights up the moment a review app writes the metafield. */}
        {product.rating && (
          <p className="mt-1.5 flex items-center gap-1.5">
            <StarRating value={product.rating.value} />
            <span className="text-[12px] text-ink-muted">
              ({product.rating.count})
            </span>
          </p>
        )}

        {/* Phones: permanently visible, full width, at the foot of the
            tile. `mt-auto` pins it to the bottom so cards in a row line
            up even when one title wraps to two lines. */}
        <div className="mt-auto md:hidden">
          <QuickAdd product={product} placement="inline" />
        </div>
      </div>
    </article>
  )
}

/**
 * Price row. An unpriced piece gets an action rather than a notice: the
 * previous build rendered a static "Price on request", which is a dead
 * end on a card whose entire job is to be tapped.
 */
function Price({ product }: { product: ProductCardModel }) {
  if (product.unpriced) {
    return (
      <p className="mt-1.5">
        {/* Sits inside the card's stretched link area, so it needs its own
            z-index to be the thing that gets tapped. */}
        <a
          href="/custom"
          className="relative z-20 inline-flex min-h-[24px] items-center text-[13px] font-medium text-brand underline decoration-brand/40 underline-offset-4 transition-colors duration-hover ease-apple hover:text-brand-hover md:text-[14px] motion-reduce:transition-none"
        >
          Enquire
        </a>
      </p>
    )
  }

  return (
    <p className="mt-1.5 flex flex-wrap items-baseline gap-x-2 text-[13px] md:text-[14px]">
      <span className="font-medium text-ink">
        {product.priceFrom ? `From ${product.price}` : product.price}
      </span>
      {product.compareAtPrice && (
        <s className="text-[12px] text-ink-muted">{product.compareAtPrice}</s>
      )}
    </p>
  )
}

/** An explicit badge wins; sold out beats a sale; compare-at implies sale. */
function resolveBadge(product: ProductCardModel): ProductBadge | null {
  if (!product.availableForSale) return 'sold-out'
  if (product.badge) return product.badge
  if (product.compareAtPrice) return 'sale'
  return null
}

const BADGE_LABEL: Record<ProductBadge, string> = {
  new: 'New',
  sale: 'Sale',
  'one-of-one': 'One of one',
  'sold-out': 'Sold out',
}

/**
 * Sale takes the maroon fill — it is the only badge making a claim about
 * money. New and One of one are white plates with ink type: they mark a
 * piece as recent or unrepeatable, not as discounted, and sharing the
 * sale colour would blur that. Sold out is the quietest of the four.
 */
const BADGE_STYLE: Record<ProductBadge, string> = {
  sale: 'bg-brand text-cream',
  new: 'bg-raised text-ink shadow-sm',
  'one-of-one': 'bg-raised text-ink shadow-sm',
  'sold-out': 'bg-ink-subtle text-cream',
}

function Badge({ kind }: { kind: ProductBadge }) {
  return (
    <span
      className={`absolute left-0 top-0 z-10 px-2 py-1 text-[10px] label-wide ${BADGE_STYLE[kind]}`}
    >
      {BADGE_LABEL[kind]}
    </span>
  )
}
