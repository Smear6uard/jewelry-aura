export const SITE_URL = 'https://www.thejewelryaura.com'
export const SITE_NAME = 'Jewelry Aura'

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

export interface PageMetaInput {
  title: string
  description: string
  /** Absolute canonical URL of the page. */
  url: string
  ogType?: string
  image?: string
}

/**
 * The shared meta boilerplate every storefront route emits — one place
 * so a route can't silently drop og:site_name or robots.
 */
export function pageMeta({
  title,
  description,
  url,
  ogType = 'website',
  image,
}: PageMetaInput) {
  return [
    { title },
    { name: 'description', content: description },
    { name: 'robots', content: 'index, follow' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: ogType },
    { property: 'og:url', content: url },
    { property: 'og:site_name', content: SITE_NAME },
    ...(image ? [{ property: 'og:image', content: image }] : []),
  ]
}

/**
 * Serialize data for an inline <script type="application/ld+json"> —
 * TanStack renders script children via dangerouslySetInnerHTML, so a
 * merchant-editable string containing "</script>" would otherwise break
 * out of the block (stored XSS). < parses identically as JSON.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}

export interface BreadcrumbItem {
  name: string
  /** Site-relative path, e.g. "/collections/chains". */
  path: string
}

export function breadcrumbJsonLd(items: ReadonlyArray<BreadcrumbItem>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}

export interface ProductJsonLdInput {
  title: string
  description: string
  /** Site-relative product path, e.g. "/products/cuban-link". */
  path: string
  images: ReadonlyArray<string>
  offer: { price: string; currency: string; available: boolean } | null
}

/**
 * Product structured data bound to the displayed variant's live price and
 * availability (plan KTD10) — never a hardcoded snapshot.
 */
export function productJsonLd(input: ProductJsonLdInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.title,
    description: input.description,
    image: input.images,
    url: `${SITE_URL}${input.path}`,
    brand: { '@type': 'Brand', name: SITE_NAME },
    ...(input.offer
      ? {
          offers: {
            '@type': 'Offer',
            url: `${SITE_URL}${input.path}`,
            price: input.offer.price,
            priceCurrency: input.offer.currency,
            availability: input.offer.available
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
          },
        }
      : {}),
  }
}

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
