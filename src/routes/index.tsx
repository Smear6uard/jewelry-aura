import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import { Hero } from '~/components/sections/Hero'
import {
  CategoryTiles,
  type TileFallbackImage,
  type TileFallbacks,
} from '~/components/sections/CategoryTiles'
import { TrustBar } from '~/components/sections/TrustBar'
import { MoissaniteBand } from '~/components/sections/MoissaniteBand'
import { WomensShelf } from '~/components/sections/WomensShelf'
import { CustomPromo } from '~/components/sections/CustomPromo'
import { ShopByPrice } from '~/components/sections/ShopByPrice'
import { Reviews } from '~/components/sections/Reviews'
import { ProductRail } from '~/components/commerce/ProductRail'
import { CATEGORIES } from '~/lib/catalog'
import {
  buildCardImage,
  mapProductCard,
  type ProductCardModel,
  type ProductCardNode,
} from '~/lib/shopify/adapters'
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

/** The homepage shelf is a shop window, not the catalog: eight pieces. */
const BEST_SELLER_LIMIT = 8

interface HomeData {
  bestSellers: ProductCardModel[]
  moissanite: ProductCardModel[]
  tileFallbacks: TileFallbacks
}

interface ShopProductsData {
  products: { nodes: ProductCardNode[] }
}

/**
 * Everything the homepage needs, in one round trip pair.
 *
 * The homepage must never break on commerce trouble (missing env, API
 * hiccup) — it degrades to an empty shelf and no category fallbacks, and
 * both surfaces render nothing rather than a titled blank space.
 *
 * Rails are filtered HERE rather than in the components, so the
 * guarantee is a property of the page's data and not of whichever
 * component happens to render last.
 *
 * Category tile images used to come from an aliased per-collection
 * query. They now come out of the same catalog fetch, matched by the
 * virtual-collection rules — which is what makes the tiles work while
 * the Shopify collections behind the menu do not exist yet. One fetch,
 * and a tile that resolves for any category with a photographed,
 * in-stock piece in it.
 */
const getHomeData = createServerFn({ method: 'GET' }).handler(
  async (): Promise<HomeData> => {
    try {
      const [
        { storefrontRequest },
        { getBestSellersLogic },
        { SHOP_PRODUCTS_QUERY },
        { findVirtualCollection, selectVirtual },
      ] = await Promise.all([
        import('~/lib/shopify/client'),
        import('~/lib/shopify/best-sellers'),
        import('~/lib/shopify/queries'),
        import('~/lib/shopify/virtual-collections'),
      ])

      const [bestSellers, catalog] = await Promise.all([
        getBestSellersLogic(storefrontRequest, BEST_SELLER_LIMIT),
        storefrontRequest<ShopProductsData>(SHOP_PRODUCTS_QUERY, {
          variables: { first: 250 },
        }),
      ])

      const nodes = catalog.products.nodes

      const tileFallbacks: TileFallbacks = {}
      for (const category of CATEGORIES) {
        const virtual = findVirtualCollection(category.handle)
        if (!virtual) continue
        tileFallbacks[category.handle] = firstInStockImage(
          selectVirtual(nodes, virtual),
          category.label,
        )
      }

      const moissaniteCollection = findVirtualCollection('moissanite')
      const moissanite = moissaniteCollection
        ? selectVirtual(nodes, moissaniteCollection)
            .map(mapProductCard)
            .filter((product) => product.availableForSale)
            .slice(0, 2)
        : []

      return { bestSellers, moissanite, tileFallbacks }
    } catch (error) {
      console.warn(`[home] degrading to empty shelves: ${String(error)}`)
      return { bestSellers: [], moissanite: [], tileFallbacks: {} }
    }
  },
)

/**
 * First in-stock, photographed piece in a category — the fallback for a
 * category tile with no dedicated asset. Returns null when nothing
 * matches, and the tile is then dropped rather than rendered blank.
 */
function firstInStockImage(
  nodes: ReadonlyArray<ProductCardNode>,
  label: string,
): TileFallbackImage | null {
  const node = nodes.find(
    (product) => product.availableForSale && product.featuredImage,
  )
  if (!node) return null
  const image = buildCardImage(
    node.featuredImage,
    `${node.title} — ${label.toLowerCase()} from Jewelry Aura.`,
  )
  if (!image) return null
  return { src: image.src, srcSet: image.srcSet, alt: image.alt }
}

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
//   Best sellers   what other people bought — the ONE product shelf
//   Trust bar      the terms, immediately after the shelf
//   Moissanite     the stone, argued, with a route into the case
//   Women's        the five categories again, cut for her
//   Custom promo   the workshop's differentiator, one band
//   Shop by price  for the visitor who knows the budget, not the piece
//   Reviews        social proof — omitted until three real ones exist
//
// ONE PRODUCT SHELF, NOT TWO. A "New arrivals" rail used to sit below
// the trust bar. On a catalog this size the two shelves between them
// listed most of the store, which turns the homepage into the catalog
// and leaves /shop with nothing to be. Best sellers is ranked by real
// sales and capped at eight; everything else on this page is a door,
// and every door leads to a listing page that can hold the rest.
//
// A pinned custom-work gallery and a store-location section used to sit
// in this list. Both read as brand-site rather than marketplace, and both
// were removed with the sections that rendered them.
// ═══════════════════════════════════════════

function HomePage() {
  const { bestSellers, moissanite, tileFallbacks } = Route.useLoaderData()

  return (
    <main>
      <Hero />
      <CategoryTiles fallbacks={tileFallbacks} />

      <ProductRail
        id="best-sellers"
        title="Best sellers"
        eyebrow="Most bought"
        products={bestSellers}
        limit={BEST_SELLER_LIMIT}
        link={{ href: '/shop', label: 'View all' }}
        minProducts={MIN_RAIL_PRODUCTS}
        eager
      />

      <TrustBar />

      <MoissaniteBand products={moissanite} />
      <WomensShelf />

      <CustomPromo />
      <ShopByPrice />
      <Reviews />
    </main>
  )
}
