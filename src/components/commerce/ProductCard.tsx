/**
 * components/commerce/ProductCard.tsx — one product, everywhere.
 *
 * The backbone of the storefront: rails, grids, search results and the
 * "you may also like" strip all render this component. Built once so a
 * change to card density or buy behaviour lands on every surface.
 *
 * Anatomy — a bone tile on the paper canvas. Bone is only 1.09:1 against
 * paper, so the hairline is what defines the card; there is no shadow in
 * this palette to lean on:
 *
 *   image      edge-to-edge at the top, locked 4:5, no padding, no frame
 *   badge      top-left; ink or quieter, never maroon — a badge repeats
 *              across a whole grid and sits on the photograph itself
 *   name       ink sans 14px — not the display serif; product names set
 *              in a serif are what makes a grid read as a lookbook
 *   price      "From $79.99" across a variant range, struck compare-at
 *              beside a sale price, and a hallmark plate offering the
 *              phone when the piece has no price in Shopify yet
 *   rating     ink stars and a review count, only when a review app
 *              has written real data — never a zero state
 *   quick add  ONE control, full-width, at the foot of the tile, at
 *              every width. See components/commerce/QuickAdd.
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
import { STORE } from '~/lib/catalog'
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
    <article className="group/card relative flex h-full flex-col bg-bone border border-hairline-light transition-transform duration-hover ease-apple md:hover:-translate-y-0.5 motion-reduce:transition-none">
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
            className="flex h-full w-full items-center justify-center bg-bone"
          >
            {/* A piece awaiting photography leaves a gap in the grid's
                content, not in its rhythm. */}
            <span className="display text-3xl text-hairline-light">JA</span>
          </div>
        )}

        {badge && <Badge kind={badge} />}
      </div>

      <div className="flex flex-1 flex-col p-3 md:p-4">
        <h3 className="text-[13px] font-medium leading-snug text-ink md:text-[14px]">
          <Link
            to="/products/$handle"
            params={{ handle: product.handle }}
            className="transition-colors duration-hover ease-apple after:absolute after:inset-0 after:content-[''] link-hover focus-visible:text-ink motion-reduce:transition-none"
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
            <span className="text-[12px] text-ink">
              ({product.rating.count})
            </span>
          </p>
        )}

        {/* `mt-auto` pins the action to the bottom so cards in a row line
            up even when one title wraps to two lines. */}
        <div className="mt-auto">
          <QuickAdd product={product} />
        </div>
      </div>
    </article>
  )
}

/**
 * Price row.
 *
 * THE HALLMARK PLATE. A piece with no price in Shopify used to render
 * "Enquire", linking to the commission form — a word that asks the
 * shopper to start a project when all they wanted was a number, and a
 * form that answers in a business day. These are stock chains; the bench
 * quotes them by weight, on the phone, in about a minute.
 *
 * So the plate says what is true and offers the fastest way to the
 * answer. It is stamped rather than written: a hairline plate in the
 * card's own bone, uppercase, the same shape the hallmark takes
 * everywhere else on the site. On paper that stamp is ink — gold is a
 * hairline on this ground and never type.
 */
function Price({ product }: { product: ProductCardModel }) {
  if (product.unpriced) {
    return (
      <p className="mt-1.5">
        {/* Sits inside the card's stretched link area, so it needs its own
            z-index to be the thing that gets tapped. */}
        <a
          href={STORE.phoneHref}
          aria-label={`${product.title} is priced at the bench — call ${STORE.phone}`}
          className="relative z-20 inline-flex min-h-[28px] items-center border border-hairline-light bg-paper px-2 py-1 text-[10px] label-wide text-ink transition-colors duration-hover ease-apple hover:border-ink motion-reduce:transition-none"
        >
          Priced at the bench — call
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
        <s className="text-[12px] text-ink">{product.compareAtPrice}</s>
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
 * Every badge is ink or quieter — none of them is maroon, including One
 * of one. Two separate rules land on this element: a badge repeats once
 * per card across a whole grid, and it sits directly on the photograph.
 * Maroon does neither. The one-of-one stamp keeps its maroon on the
 * /custom page, where it appears once and on paper.
 *
 * Sale is an ink plate: it makes a claim about money, which is worth a
 * solid fill. New is a bone plate on a hairline, and Sold out is the
 * same plate filled to the hairline — present, legible at 12.6:1, and
 * clearly spent.
 */
const BADGE_STYLE: Record<ProductBadge, string> = {
  sale: 'bg-ink text-bone',
  new: 'bg-bone text-ink border border-hairline-light',
  'one-of-one': 'bg-ink text-bone',
  'sold-out': 'bg-hairline-light text-ink',
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
