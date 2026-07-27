export const SITE_URL = 'https://www.thejewelryaura.com'
export const SITE_NAME = 'Jewelry Aura'

// Stable schema.org @id anchors. Every JSON-LD node on the site points at
// ONE canonical business entity (#organization) and ONE site node
// (#website) rather than restating the brand identity per page — that's
// how Google disambiguates the entity and builds the Knowledge Graph.
const ORG_ID = `${SITE_URL}/#organization`
const WEBSITE_ID = `${SITE_URL}/#website`

export const HERO_SOCIAL_IMAGE = `${SITE_URL}/hero-portrait-wide.png`
/**
 * Descriptive alt for the homepage share image (og:image:alt).
 *
 * The share image is the ungraded campaign file, so this describes the
 * photograph as it actually is. The homepage grades the same asset
 * toward the brand palette in CSS (see components/sections/Hero.tsx);
 * a share card cannot inherit that, and describing a colour the file
 * does not have would be worse than a plain description.
 */
export const HERO_SOCIAL_IMAGE_ALT =
  'A man in a heavy gold rope chain against dark velvet — a Jewelry Aura custom piece.'

// Titles front-load the money keywords and close with the brand (Google
// rewrites brand-first titles that bury the search terms). ≤ ~60 chars.
export const SITE_TITLE =
  "Men's Gold Chains, Moissanite & Custom Jewelry | Jewelry Aura"
export const SITE_DESCRIPTION =
  "Custom men's gold chains, moissanite, pendants & rings — hand-finished to order in our workshop, with expert in-house jewelry repair. Shop the collection."

const TELEPHONE = '+1-630-965-6464'
const sameAs = ['https://instagram.com/Jewelryaura01'] as const

const OPENING_HOURS = [
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
] as const

/**
 * The single canonical business identity, emitted site-wide from the root
 * route. `JewelryStore` ⊂ `LocalBusiness` ⊂ `Organization`, so this one
 * node carries the storefront identity, local signals, and the publisher
 * reference that `WebSite` and every Product offer's `seller` point back
 * to by `@id`.
 */
export const jewelryStoreSchema = {
  '@context': 'https://schema.org',
  '@type': 'JewelryStore',
  '@id': ORG_ID,
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: {
    '@type': 'ImageObject',
    '@id': `${SITE_URL}/#logo`,
    url: `${SITE_URL}/icon-512-maskable.png`,
    width: 512,
    height: 512,
  },
  image: HERO_SOCIAL_IMAGE,
  description:
    "Custom men's gold chains, moissanite, pendants, rings, and bridal pieces — hand-finished to order, with expert in-house jewelry repair.",
  telephone: TELEPHONE,
  priceRange: '$$$',
  paymentAccepted: 'Credit Card, Apple Pay, Google Pay, Shop Pay',
  areaServed: 'United States',
  openingHoursSpecification: OPENING_HOURS,
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: TELEPHONE,
    contactType: 'customer service',
    areaServed: 'US',
    availableLanguage: 'English',
  },
  sameAs,
} as const

/** Site-name signal; publisher points at the single business identity. */
export const webSiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': WEBSITE_ID,
  url: `${SITE_URL}/`,
  name: SITE_NAME,
  publisher: { '@id': ORG_ID },
} as const

export interface PageMetaInput {
  title: string
  description: string
  /** Absolute canonical URL of the page. */
  url: string
  ogType?: string
  image?: string
  /** Descriptive alt for the share image — set whenever `image` is set. */
  imageAlt?: string
}

// A visual jewelry brand wants the largest SERP thumbnail Google will
// grant, so the robots directive opts into large image/snippet previews
// on every indexable route.
const ROBOTS =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1'

/**
 * The shared meta boilerplate every storefront route emits — one place so
 * a route can't silently drop og:site_name, robots, or (the gap this
 * closes) the Twitter card. PDP/collection links now unfurl with a card
 * on X, Slack, and iMessage instead of a bare URL.
 */
export function pageMeta({
  title,
  description,
  url,
  ogType = 'website',
  image,
  imageAlt,
}: PageMetaInput) {
  return [
    { title },
    { name: 'description', content: description },
    { name: 'robots', content: ROBOTS },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:type', content: ogType },
    { property: 'og:url', content: url },
    { property: 'og:site_name', content: SITE_NAME },
    { property: 'og:locale', content: 'en_US' },
    ...(image
      ? [
          { property: 'og:image', content: image },
          { property: 'og:image:secure_url', content: image },
          ...(imageAlt
            ? [{ property: 'og:image:alt', content: imageAlt }]
            : []),
        ]
      : []),
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    ...(image
      ? [
          { name: 'twitter:image', content: image },
          ...(imageAlt
            ? [{ name: 'twitter:image:alt', content: imageAlt }]
            : []),
        ]
      : []),
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

/**
 * ItemList for a listing surface (collection / shop / best sellers). Each
 * ListItem carries only position + the PDP URL — the "summary page"
 * pattern Google recommends, where the product data lives on the linked
 * page. `startPosition` lets paginated collections number continuously
 * (page 2 begins where page 1 left off) instead of restarting at 1.
 */
export function itemListJsonLd(
  paths: ReadonlyArray<string>,
  startPosition = 1,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: paths.map((path, index) => ({
      '@type': 'ListItem',
      position: startPosition + index,
      url: `${SITE_URL}${path}`,
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

// ~A year out so Google never treats the price as already expired (an
// omitted priceValidUntil is read as "expires now"). Rolls forward once
// per calendar year, so it's stable within any single render (no SSR /
// hydration mismatch).
function priceValidUntil(): string {
  return `${new Date().getUTCFullYear() + 1}-12-31`
}

/**
 * Product structured data bound to the displayed variant's live price and
 * availability (plan KTD10) — never a hardcoded snapshot. The offer's
 * `seller` references the single #organization node so the product ties
 * back to the store identity.
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
            priceValidUntil: priceValidUntil(),
            availability: input.offer.available
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
            itemCondition: 'https://schema.org/NewCondition',
            seller: { '@id': ORG_ID },
          },
        }
      : {}),
  }
}
