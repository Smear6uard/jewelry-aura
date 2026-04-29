import { createFileRoute } from '@tanstack/react-router'

import { Hero } from '~/components/sections/Hero'
import { CustomPieces } from '~/components/sections/CustomPieces'
import { Services } from '~/components/sections/Services'
import { Stats } from '~/components/sections/Stats'
import { Visit } from '~/components/sections/Visit'
import { Header } from '~/components/layout/Header'
import {
  HERO_SOCIAL_IMAGE,
  SITE_DESCRIPTION,
  SITE_TITLE,
  SITE_URL,
  localBusinessSchema,
  organizationSchema,
} from '~/lib/seo'

// ═══════════════════════════════════════════
// ROUTE CONFIG + SEO
// ═══════════════════════════════════════════

export const Route = createFileRoute('/')({
  component: LandingPage,
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
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(localBusinessSchema),
      },
      {
        type: 'application/ld+json',
        children: JSON.stringify(organizationSchema),
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
  return (
    <div className="grain-overlay">
      <Header />
      <main style={{ backgroundColor: '#14261F' }} className="text-white">
        <Hero />
        <CustomPieces />
        <Services />
        <Stats />
        <Visit />
      </main>
    </div>
  )
}
