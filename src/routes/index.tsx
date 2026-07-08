import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import { Hero } from '~/components/sections/Hero'
import { CustomPieces } from '~/components/sections/CustomPieces'
import { Services } from '~/components/sections/Services'
import { Stats } from '~/components/sections/Stats'
import { Visit } from '~/components/sections/Visit'
import { Header } from '~/components/layout/Header'
import { FeaturedCollections } from '~/components/shop/FeaturedCollections'
import type { FeaturedCollectionModel } from '~/lib/shopify/featured'
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

const getFeaturedCollections = createServerFn({ method: 'GET' }).handler(
  async (): Promise<FeaturedCollectionModel[]> => {
    // The homepage must never break on commerce trouble (missing env,
    // API hiccup) — it degrades to an empty featured section instead.
    try {
      const [{ storefrontRequest }, { getFeaturedCollectionsLogic }] =
        await Promise.all([
          import('~/lib/shopify/client'),
          import('~/lib/shopify/featured'),
        ])
      return await getFeaturedCollectionsLogic(storefrontRequest)
    } catch (error) {
      console.warn(`[featured] homepage degrading to empty: ${String(error)}`)
      return []
    }
  },
)

export const Route = createFileRoute('/')({
  component: LandingPage,
  loader: () => getFeaturedCollections(),
  staleTime: 60_000,
  gcTime: 5 * 60_000,
  headers: () => ({
    // Homepage cache policy (KTD2): short shared TTL, long SWR; purged via
    // the `home` tag on product updates (U9).
    'Cache-Control':
      'public, max-age=0, s-maxage=1800, stale-while-revalidate=86400',
    'Vercel-Cache-Tag': 'home,collections',
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
//   Visit      — phone CTA + map (the only conversion surface)
//
// Lenis is provided once at the root (~/lib/lenis.LenisProvider). Every
// commission/CTA on the site routes here via lib/scroll-to so the
// smooth-scroll motion stays in lockstep with the wheel-scrolled
// choreography of the sections above.
// ═══════════════════════════════════════════

function LandingPage() {
  const featured = Route.useLoaderData()

  return (
    <div className="grain-overlay">
      <Header />
      <main style={{ backgroundColor: '#14261F' }} className="text-white">
        <Hero />
        {/* The shop window sits directly under the hero (GLD/JAXXON
            model); the editorial sections keep telling the story below. */}
        <FeaturedCollections collections={featured} />
        <CustomPieces />
        <Services />
        <Stats />
        <Visit />
      </main>
    </div>
  )
}
