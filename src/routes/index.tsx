import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import { Hero } from '~/components/sections/Hero'
import { CustomPieces } from '~/components/sections/CustomPieces'
import { Services } from '~/components/sections/Services'
import { Stats } from '~/components/sections/Stats'
import { Visit } from '~/components/sections/Visit'
import { Header } from '~/components/layout/Header'
import { BestSellers } from '~/components/shop/BestSellers'
import type { ProductCardModel } from '~/lib/shopify/adapters'
import {
  HERO_SOCIAL_IMAGE,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
  jsonLdScript,
  localBusinessSchema,
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
  head: () => ({
    meta: [
      { title: SITE_TITLE },
      {
        name: 'description',
        content: SITE_DESCRIPTION,
      },
      { name: 'robots', content: 'index, follow' },
      { property: 'og:title', content: SITE_TITLE },
      { property: 'og:description', content: SITE_DESCRIPTION },
      { property: 'og:image', content: HERO_SOCIAL_IMAGE },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: SITE_URL },
      { property: 'og:site_name', content: 'Jewelry Aura' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: SITE_TITLE },
      { name: 'twitter:description', content: SITE_DESCRIPTION },
      { name: 'twitter:image', content: HERO_SOCIAL_IMAGE },
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
    // Organization JSON-LD comes from the root route (site-wide, R18);
    // only the LocalBusiness identity is homepage-specific.
    scripts: [
      {
        type: 'application/ld+json',
        children: jsonLdScript(localBusinessSchema),
      },
    ],
  }),
})

// ═══════════════════════════════════════════
// LANDING PAGE — MAIN COMPOSITION
// ═══════════════════════════════════════════
//
// Section order is the user's narrative:
//   Hero       — wordless photograph + cascade
//   CustomPieces — pinned editorial strip
//   Services   — typographic capability list
//   Stats      — three numbers, mono caps
//   Visit      — phone CTA + hours (the only conversion surface)
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
        <Stats />
        <Visit />
      </main>
    </div>
  )
}
