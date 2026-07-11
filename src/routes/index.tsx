import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import { Hero } from '~/components/sections/Hero'
import { CustomPieces } from '~/components/sections/CustomPieces'
import { Services } from '~/components/sections/Services'
import { Visit } from '~/components/sections/Visit'
import { Header } from '~/components/layout/Header'
import { BestSellers } from '~/components/shop/BestSellers'
import type { ProductCardModel } from '~/lib/shopify/adapters'
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
// ROUTE CONFIG + SEO
// ═══════════════════════════════════════════

const getBestSellers = createServerFn({ method: 'GET' }).handler(
  async (): Promise<ProductCardModel[]> => {
    // The homepage must never break on commerce trouble (missing env,
    // API hiccup) — it degrades to an empty best-sellers section instead.
    try {
      const [{ storefrontRequest }, { getBestSellersLogic }] =
        await Promise.all([
          import('~/lib/shopify/client'),
          import('~/lib/shopify/best-sellers'),
        ])
      return await getBestSellersLogic(storefrontRequest)
    } catch (error) {
      console.warn(
        `[best-sellers] homepage degrading to empty: ${String(error)}`,
      )
      return []
    }
  },
)

export const Route = createFileRoute('/')({
  component: LandingPage,
  loader: () => getBestSellers(),
  staleTime: 60_000,
  gcTime: 5 * 60_000,
  headers: () => ({
    // Homepage cache policy (KTD2): short shared TTL, long SWR; purged via
    // the `home` tag on product updates (U9).
    'Cache-Control':
      'public, max-age=0, s-maxage=1800, stale-while-revalidate=86400',
    'Vercel-Cache-Tag': 'home,products',
  }),
  head: ({ loaderData }) => {
    const bestSellers = loaderData ?? []
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
        {
          rel: 'canonical',
          href: SITE_URL,
        },
        {
          rel: 'preload',
          href: '/hero-portrait-wide.avif',
          as: 'image',
          media: '(min-width: 1024px)',
        },
        {
          rel: 'preload',
          href: '/hero-portrait-tall.avif',
          as: 'image',
          media: '(max-width: 1023px)',
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
// LANDING PAGE — MAIN COMPOSITION
// ═══════════════════════════════════════════
//
// Section order is the user's narrative:
//   Hero        — wordless photograph + cascade
//   BestSellers — the live shop window (four ranked pieces)
//   CustomPieces — pinned editorial strip
//   Services    — typographic capability list
//   Visit       — phone CTA + hours (the only conversion surface)
//
// Lenis is provided once at the root (~/lib/lenis.LenisProvider). Every
// commission/CTA on the site routes here via lib/scroll-to so the
// smooth-scroll motion stays in lockstep with the wheel-scrolled
// choreography of the sections above.
// ═══════════════════════════════════════════

function LandingPage() {
  const bestSellers = Route.useLoaderData()

  return (
    <div className="grain-overlay">
      <Header />
      <main style={{ backgroundColor: '#14261F' }} className="text-white">
        <Hero />
        {/* The shop window sits directly under the hero (GLD/JAXXON
            model): the four best sellers, never the whole catalog — the
            editorial sections keep telling the story below. */}
        <BestSellers products={bestSellers} />
        <CustomPieces />
        <Services />
        <Visit />
      </main>
    </div>
  )
}
