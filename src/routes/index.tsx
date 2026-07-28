import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import { Hero } from '~/components/sections/Hero'
import {
  CategoryTiles,
  type TileFallbackImage,
  type TileFallbacks,
} from '~/components/sections/CategoryTiles'
import { TrustBar } from '~/components/sections/TrustBar'
import { CustomPromo } from '~/components/sections/CustomPromo'
import { ShopByPrice } from '~/components/sections/ShopByPrice'
import { Reviews } from '~/components/sections/Reviews'
import { ProductRail } from '~/components/commerce/ProductRail'
import { mapProductCard, type ProductCardModel, type ProductCardNode } from '~/lib/shopify/adapters'
import {
  HERO_SOCIAL_IMAGE,
  HERO_SOCIAL_IMAGE_ALT,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
  itemListJsonLd,
  jsonLdScript,
  pageMeta,
} from '~/lib/seo'

// ═══════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════

/** How many products a homepage rail needs before it is worth rendering. */
const MIN_RAIL_PRODUCTS = 4

interface HomeData {
  bestSellers: ProductCardModel[]
  newArrivals: ProductCardModel[]
  tileFallbacks: TileFallbacks
}

interface ShopProductsData {
  products: { nodes: ProductCardNode[] }
}

/** Shape of one aliased collection in CATEGORY_TILE_IMAGES_QUERY. */
interface TileCollection {
  products: {
    nodes: Array<{
      title: string
      availableForSale: boolean
      featuredImage: {
        altText: string | null
        w600: string
        w1200: string
      } | null
    }>
  }
}

type TileImagesData = Record<string, TileCollection | null>

/**
 * First in-stock product image in a collection — the fallback for a
 * category tile with no dedicated asset. Returns null when the
 * collection does not exist, is empty, or has nothing photographed and
 * in stock, and the tile is then dropped rather than rendered blank.
 */
function firstInStockImage(
  collection: TileCollection | null | undefined,
  label: string,
): TileFallbackImage | null {
  const node = collection?.products.nodes.find(
    (product) => product.availableForSale && product.featuredImage,
  )
  if (!node?.featuredImage) return null
  const image = node.featuredImage
  return {
    src: image.w600,
    srcSet: `${image.w600} 600w, ${image.w1200} 1200w`,
    alt: image.altText || `${node.title} — ${label} from Jewelry Aura.`,
  }
}

/**
 * Everything the homepage needs, in one round trip pair.
 *
 * The homepage must never break on commerce trouble (missing env, API
 * hiccup) — it degrades to empty shelves and no category fallbacks, and
 * both surfaces render nothing rather than a titled blank space.
 *
 * Rails are deduped and filtered HERE rather than in the components, so
 * the guarantee is a property of the page's data and not of whichever
 * component happens to render last.
 */
const getHomeData = createServerFn({ method: 'GET' }).handler(
  async (): Promise<HomeData> => {
    try {
      const [
        { storefrontRequest },
        { getBestSellersLogic },
        { SHOP_PRODUCTS_QUERY, CATEGORY_TILE_IMAGES_QUERY },
      ] = await Promise.all([
        import('~/lib/shopify/client'),
        import('~/lib/shopify/best-sellers'),
        import('~/lib/shopify/queries'),
      ])

      const [bestSellers, newest, tiles] = await Promise.all([
        getBestSellersLogic(storefrontRequest, 8),
        storefrontRequest<ShopProductsData>(SHOP_PRODUCTS_QUERY, {
          // Over-fetched: sold-out pieces and anything already in Best
          // sellers come out below, and 8 must survive both filters.
          variables: { first: 24, sortKey: 'CREATED_AT' },
        }),
        // A missing tile fallback costs one tile; it must never cost the
        // shelves. Resolved independently of the product queries.
        storefrontRequest<TileImagesData>(CATEGORY_TILE_IMAGES_QUERY).catch(
          () => ({}) as TileImagesData,
        ),
      ])

      // No product appears twice on this page. Best sellers is ranked by
      // real sales and wins the tie; New arrivals shows what is left.
      const alreadyShown = new Set(bestSellers.map((product) => product.handle))

      const newArrivals = newest.products.nodes
        .map(mapProductCard)
        .filter(
          (product) =>
            product.availableForSale && !alreadyShown.has(product.handle),
        )
        .slice(0, 8)

      return {
        bestSellers,
        newArrivals,
        tileFallbacks: {
          chains: firstInStockImage(tiles.chains, 'chains'),
          pendants: firstInStockImage(tiles.pendants, 'pendants'),
          bracelets: firstInStockImage(tiles.bracelets, 'bracelets'),
          rings: firstInStockImage(tiles.rings, 'rings'),
        },
      }
    } catch (error) {
      console.warn(`[home] degrading to empty shelves: ${String(error)}`)
      return { bestSellers: [], newArrivals: [], tileFallbacks: {} }
    }
  },
)

// ═══════════════════════════════════════════
// ROUTE CONFIG + SEO
// ═══════════════════════════════════════════

export const Route = createFileRoute('/')({
  component: HomePage,
  loader: () => getHomeData(),
  staleTime: 60_000,
  gcTime: 5 * 60_000,
  headers: () => ({
    // Homepage cache policy (KTD2): short shared TTL, long SWR; purged
    // via the `home` tag on product updates (U9).
    'Cache-Control':
      'public, max-age=0, s-maxage=1800, stale-while-revalidate=86400',
    'Vercel-Cache-Tag': 'home,products',
  }),
  head: ({ loaderData }) => {
    const bestSellers = loaderData?.bestSellers ?? []
    return {
      meta: [
        ...pageMeta({
          title: SITE_TITLE,
          description: SITE_DESCRIPTION,
          url: SITE_URL,
          image: HERO_SOCIAL_IMAGE,
          imageAlt: HERO_SOCIAL_IMAGE_ALT,
        }),
        { property: 'og:image:width', content: '1536' },
        { property: 'og:image:height', content: '1024' },
      ],
      links: [
        { rel: 'canonical', href: SITE_URL },
        // The hero breaks at 1024px, so the preload media queries have to
        // agree with the <picture> in components/sections/Hero.tsx or the
        // browser fetches the wrong asset at high priority.
        {
          rel: 'preload',
          href: '/hero-portrait-wide.avif',
          as: 'image',
          media: '(min-width: 1024px)',
          fetchPriority: 'high',
        },
        {
          rel: 'preload',
          href: '/hero-portrait-tall.avif',
          as: 'image',
          media: '(max-width: 1023px)',
          fetchPriority: 'high',
        },
        { rel: 'preconnect', href: 'https://cdn.shopify.com' },
      ],
      // Business identity + WebSite JSON-LD come from the root route
      // (site-wide, R18). The homepage adds an ItemList of the live best
      // sellers so the shop window is eligible for a product carousel.
      scripts: bestSellers.length
        ? [
            {
              type: 'application/ld+json',
              children: jsonLdScript(
                itemListJsonLd(
                  bestSellers.map((product) => `/products/${product.handle}`),
                ),
              ),
            },
          ]
        : [],
    }
  },
})

// ═══════════════════════════════════════════
// COMPOSITION
// ═══════════════════════════════════════════
//
// The order is a shopping funnel, not a narrative:
//   Hero           one frame, two category CTAs
//   CategoryTiles  the "I can shop here" moment, above the fold
//   Best sellers   what other people bought
//   Trust bar      the terms, before the second shelf
//   New arrivals   what just landed, deduped against the shelf above
//   Custom promo   the workshop's differentiator, one band
//   Shop by price  for the visitor who knows the budget, not the piece
//   Reviews        social proof — omitted until three real ones exist
//
// A pinned custom-work gallery and a store-location section used to sit
// in this list. Both read as brand-site rather than marketplace, and both
// were removed with the sections that rendered them.
// ═══════════════════════════════════════════

function HomePage() {
  const { bestSellers, newArrivals, tileFallbacks } = Route.useLoaderData()

  return (
    <main>
      <Hero />
      <CategoryTiles fallbacks={tileFallbacks} />

      <ProductRail
        id="best-sellers"
        title="Best sellers"
        eyebrow="Most bought"
        products={bestSellers}
        link={{ href: '/shop', label: 'View all' }}
        minProducts={MIN_RAIL_PRODUCTS}
        eager
      />

      <TrustBar />

      <ProductRail
        title="New arrivals"
        eyebrow="Just finished"
        products={newArrivals}
        link={{ href: '/shop', label: 'View all' }}
        minProducts={MIN_RAIL_PRODUCTS}
      />

      <CustomPromo />
      <ShopByPrice />
      <Reviews />
    </main>
  )
}
