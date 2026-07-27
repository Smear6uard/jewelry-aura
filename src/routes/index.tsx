import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import { Hero } from '~/components/sections/Hero'
import { CategoryTiles } from '~/components/sections/CategoryTiles'
import { TrustBar } from '~/components/sections/TrustBar'
import { CustomWork } from '~/components/sections/CustomWork'
import { ShopByPrice } from '~/components/sections/ShopByPrice'
import { Reviews } from '~/components/sections/Reviews'
import { Visit } from '~/components/sections/Visit'
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

interface HomeShelves {
  bestSellers: ProductCardModel[]
  newArrivals: ProductCardModel[]
}

interface ShopProductsData {
  products: { nodes: ProductCardNode[] }
}

/**
 * Both homepage shelves in one round trip pair. The homepage must never
 * break on commerce trouble (missing env, API hiccup) — it degrades to
 * empty shelves, and ProductRail renders nothing rather than a titled
 * blank space.
 */
const getHomeShelves = createServerFn({ method: 'GET' }).handler(
  async (): Promise<HomeShelves> => {
    try {
      const [{ storefrontRequest }, { getBestSellersLogic }, { SHOP_PRODUCTS_QUERY }] =
        await Promise.all([
          import('~/lib/shopify/client'),
          import('~/lib/shopify/best-sellers'),
          import('~/lib/shopify/queries'),
        ])

      const [bestSellers, newest] = await Promise.all([
        getBestSellersLogic(storefrontRequest, 8),
        storefrontRequest<ShopProductsData>(SHOP_PRODUCTS_QUERY, {
          variables: { first: 8, sortKey: 'CREATED_AT' },
        }),
      ])

      return {
        bestSellers,
        newArrivals: newest.products.nodes.map(mapProductCard),
      }
    } catch (error) {
      console.warn(`[home] shelves degrading to empty: ${String(error)}`)
      return { bestSellers: [], newArrivals: [] }
    }
  },
)

// ═══════════════════════════════════════════
// ROUTE CONFIG + SEO
// ═══════════════════════════════════════════

export const Route = createFileRoute('/')({
  component: HomePage,
  loader: () => getHomeShelves(),
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
        {
          rel: 'preload',
          href: '/hero-portrait-wide.avif',
          as: 'image',
          media: '(min-width: 768px)',
        },
        {
          rel: 'preload',
          href: '/hero-portrait-tall.avif',
          as: 'image',
          media: '(max-width: 767px)',
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
//   Hero          one frame, two category CTAs, 70svh
//   CategoryTiles the "I can shop here" moment, above the fold
//   Best sellers  what other people bought
//   Trust bar     the terms, before the second shelf
//   New arrivals  what just landed
//   Custom work   the workshop's differentiator, one shelf among many
//   Shop by price for the visitor who knows the budget, not the piece
//   Reviews       social proof
//   Visit         the local close
// ═══════════════════════════════════════════

function HomePage() {
  const { bestSellers, newArrivals } = Route.useLoaderData()

  return (
    <main>
      <Hero />
      <CategoryTiles />

      <ProductRail
        id="best-sellers"
        title="Best sellers"
        eyebrow="Most bought"
        products={bestSellers}
        link={{ href: '/shop', label: 'View all' }}
        eager
      />

      <TrustBar />

      <ProductRail
        title="New arrivals"
        eyebrow="Just finished"
        products={newArrivals}
        link={{ href: '/shop?sort=featured', label: 'View all' }}
      />

      <CustomWork />
      <ShopByPrice />
      <Reviews />
      <Visit />
    </main>
  )
}
