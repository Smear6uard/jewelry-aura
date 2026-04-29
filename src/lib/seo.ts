export const SITE_URL = 'https://jewelry-aura.com'

export const HERO_SOCIAL_IMAGE = `${SITE_URL}/hero-portrait-wide.png`
export const SITE_TITLE = 'Jewelry Aura | Custom Jewelry Norridge IL'
export const SITE_DESCRIPTION =
  'Custom chains, pendants, bridal pieces, and expert jewelry repair — hand-crafted in Norridge serving the Chicago area. Book a consultation.'

const address = {
  '@type': 'PostalAddress',
  streetAddress: '4104 N Harlem Ave',
  addressLocality: 'Norridge',
  addressRegion: 'IL',
  postalCode: '60706',
  addressCountry: 'US',
} as const

const sameAs = ['https://instagram.com/Jewelryaura01'] as const

export const localBusinessSchema = {
  '@context': 'https://schema.org',
  '@type': 'JewelryStore',
  name: 'Jewelry Aura',
  image: HERO_SOCIAL_IMAGE,
  address,
  telephone: '+1-630-965-6464',
  url: SITE_URL,
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
  priceRange: '$$$',
  geo: {
    '@type': 'GeoCoordinates',
    latitude: 41.954117,
    longitude: -87.808319,
  },
  sameAs,
} as const

export const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Jewelry Aura',
  url: SITE_URL,
  logo: `${SITE_URL}/icon-512-maskable.png`,
  image: HERO_SOCIAL_IMAGE,
  telephone: '+1-630-965-6464',
  address,
  sameAs,
} as const
