import { createFileRoute } from '@tanstack/react-router'

import { Hero } from '~/components/sections/Hero'
import { CustomPieces } from '~/components/sections/CustomPieces'
import { Services } from '~/components/sections/Services'
import { Stats } from '~/components/sections/Stats'
import { Visit } from '~/components/sections/Visit'
import { Header } from '~/components/layout/Header'

// ═══════════════════════════════════════════
// ROUTE CONFIG + SEO
// ═══════════════════════════════════════════

export const Route = createFileRoute('/')({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: 'Jewelry Aura | Affordable Luxury in Norridge' },
      {
        name: 'description',
        content:
          'Experience affordable luxury at Jewelry Aura in Norridge, IL. Custom pendants, expert jewelry repair, watch repair, and high-end gold & diamonds.',
      },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'JewelryStore',
          name: 'Jewelry Aura',
          telephone: '630-965-6464',
          address: {
            '@type': 'PostalAddress',
            streetAddress: '4104 N Harlem Ave',
            addressLocality: 'Norridge',
            addressRegion: 'IL',
            postalCode: '60706',
            addressCountry: 'US',
          },
          openingHoursSpecification: [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
              ],
              opens: '10:00',
              closes: '18:00',
            },
          ],
          sameAs: ['https://instagram.com/Jewelryaura01'],
        }),
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
      <main style={{ backgroundColor: '#14261F' }} className="text-white">
        <Header />
        <Hero />
        <CustomPieces />
        <Services />
        <Stats />
        <Visit />
      </main>
    </div>
  )
}
