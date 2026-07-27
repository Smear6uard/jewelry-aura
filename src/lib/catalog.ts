/**
 * lib/catalog.ts — the storefront's navigation taxonomy.
 *
 * One source of truth for: the primary nav, the mega-menu panels, the
 * mobile drawer's accordion, the footer's Shop column, and the filter
 * sidebar's facet lists. Every one of those surfaces renders from this
 * file, so a category can't exist in the menu and vanish from the
 * footer.
 *
 * Why the mega-menu links carry search params
 * -------------------------------------------
 * A real store menu offers "Cuban", "Rope", "Franco" under Chains. Those
 * are not separate Shopify collections here — creating twenty collection
 * handles to back a menu is how storefronts end up with twenty 404s.
 * Instead every subcategory link lands on the parent collection with a
 * facet applied (`/collections/chains?style=cuban`), and the PLP derives
 * the facet from product titles (see lib/shopify/facets.ts). The result:
 * a menu with real depth and zero dead links, and a facet that starts
 * working the moment a matching product exists.
 */

export interface FacetOption {
  /** Value written to the URL, e.g. "cuban". */
  value: string
  label: string
}

export interface Category {
  /** Shopify collection handle. */
  handle: string
  label: string
  /** Shown in the mega menu's left rail and the drawer accordion. */
  blurb: string
  /** Style facets offered for this category, in menu order. */
  styles: FacetOption[]
  /**
   * Featured piece shown at the right edge of the mega-menu panel.
   * These are photographs of real commissions from the workshop; the
   * card names the piece rather than implying it is stock for sale.
   */
  featured: {
    image: string
    name: string
    meta: string
    alt: string
  }
}

/** Metal facets — shared across every category. */
export const METAL_FACETS: FacetOption[] = [
  { value: 'yellow-gold', label: 'Yellow gold' },
  { value: 'white-gold', label: 'White gold' },
  { value: 'rose-gold', label: 'Rose gold' },
  { value: 'two-tone', label: 'Two-tone' },
  { value: 'moissanite', label: 'Moissanite' },
  { value: 'silver', label: 'Silver' },
]

/** Price bands — the merchandising ladder used by the menu, the filter
 *  sidebar, and the homepage's Shop by price section. */
export const PRICE_FACETS: FacetOption[] = [
  { value: 'under-250', label: 'Under $250' },
  { value: '250-750', label: '$250 – $750' },
  { value: '750-plus', label: '$750 and up' },
]

export const CATEGORIES: Category[] = [
  {
    handle: 'chains',
    label: 'Chains',
    blurb: 'Cuban, rope, franco and tennis — solid gold, made to length.',
    styles: [
      { value: 'cuban', label: 'Cuban link' },
      { value: 'rope', label: 'Rope' },
      { value: 'franco', label: 'Franco' },
      { value: 'figaro', label: 'Figaro' },
      { value: 'tennis', label: 'Tennis' },
      { value: 'box', label: 'Box & wheat' },
    ],
    featured: {
      image: '/JA-image5',
      name: 'HRG',
      meta: 'White gold · Diamond globe bail',
      alt: 'Custom HRG plate pendant reading “Hustle Russell The God”, fully set in white gold with a diamond globe bail.',
    },
  },
  {
    handle: 'pendants',
    label: 'Pendants',
    blurb: 'Name plates, crosses, portraits and charms, set by hand.',
    styles: [
      { value: 'name', label: 'Name & initial' },
      { value: 'cross', label: 'Crosses' },
      { value: 'portrait', label: 'Portrait & photo' },
      { value: 'iced', label: 'Fully iced' },
      { value: 'charm', label: 'Charms' },
    ],
    featured: {
      image: '/JA-image1',
      name: 'Twenty-Three',
      meta: 'White gold · Praying-hands plate',
      alt: 'A custom 23 plate pendant with a praying-hands cap, set in white gold and baguette diamonds.',
    },
  },
  {
    handle: 'bracelets',
    label: 'Bracelets',
    blurb: 'The chain vocabulary, sized for the wrist.',
    styles: [
      { value: 'cuban', label: 'Cuban link' },
      { value: 'tennis', label: 'Tennis' },
      { value: 'rope', label: 'Rope' },
      { value: 'bangle', label: 'Bangles' },
    ],
    featured: {
      image: '/JA-image4',
      name: 'ATDB',
      meta: 'Two-tone · Hand-engraved plate',
      alt: 'A custom ATDB block pendant in two-tone gold with an engraved tagline and hand-set diamonds.',
    },
  },
  {
    handle: 'rings',
    label: 'Rings',
    blurb: 'Engagement, bands and signets — moissanite or natural stone.',
    styles: [
      { value: 'engagement', label: 'Engagement' },
      { value: 'band', label: 'Wedding bands' },
      { value: 'signet', label: 'Signet' },
      { value: 'moissanite', label: 'Moissanite' },
    ],
    featured: {
      image: '/JA-image3',
      name: 'Queen',
      meta: 'Yellow gold · Two-tone pavé',
      alt: 'A custom Queen script piece with a heart drop, in yellow gold and pavé diamonds.',
    },
  },
]

export function findCategory(handle: string): Category | undefined {
  return CATEGORIES.find((category) => category.handle === handle)
}

/** Categories that carry a mega-menu panel, by handle. */
const MEGA_MENU_HANDLES = new Set(CATEGORIES.map((c) => c.handle))

export interface NavLink {
  label: string
  href: string
  /** Present when the link opens a mega-menu panel on hover. */
  category?: Category
  /** Maroon-coloured nav item — reserved for Sale. */
  accent?: boolean
}

/**
 * Primary nav, left to right. Chains / Pendants / Bracelets / Rings open
 * mega-menu panels; the rest are direct links.
 *
 * "Watches" points at the service page rather than a collection — the
 * workshop services timepieces, it does not carry a watch catalog, and
 * a nav item that lands on an empty collection is worse than no nav
 * item at all.
 */
export const NAV_LINKS: NavLink[] = [
  ...CATEGORIES.map((category) => ({
    label: category.label,
    href: `/collections/${category.handle}`,
    category: MEGA_MENU_HANDLES.has(category.handle) ? category : undefined,
  })),
  { label: 'Moissanite', href: '/collections/moissanite' },
  { label: 'Watches', href: '/pages/watch-service' },
  { label: 'Custom', href: '/custom' },
  { label: 'Sale', href: '/collections/sale', accent: true },
]

/** Footer "Shop" column — categories plus the catch-all surfaces. */
export const FOOTER_SHOP_LINKS = [
  ...CATEGORIES.map((c) => ({ label: c.label, href: `/collections/${c.handle}` })),
  { label: 'Moissanite', href: '/collections/moissanite' },
  { label: 'Earrings', href: '/collections/earrings' },
  { label: 'Sale', href: '/collections/sale' },
  { label: 'Shop all', href: '/shop' },
]

export const FOOTER_SERVICE_LINKS = [
  { label: 'Custom commissions', href: '/custom' },
  { label: 'Jewelry repair', href: '/pages/repair' },
  { label: 'Watch service', href: '/pages/watch-service' },
  { label: 'Appraisal', href: '/pages/appraisal' },
]

export const FOOTER_SUPPORT_LINKS = [
  { label: 'Shipping', href: '/pages/shipping' },
  { label: 'Returns', href: '/pages/returns' },
  { label: 'Lifetime warranty', href: '/pages/warranty' },
  { label: 'Sizing guide', href: '/pages/sizing' },
  { label: 'FAQ', href: '/pages/faq' },
]

// ─── Store details ─────────────────────────────────────────────────────
// The one place the phone number and hours are written down. Visit,
// Footer, the custom-inquiry page and the contact schema all read here.

export const STORE = {
  phone: '630-965-6464',
  phoneHref: 'tel:6309656464',
  /**
   * The shop's street address is deliberately not published — the same
   * decision the previous build made, and no street line exists
   * anywhere in this repo to publish. The phone call is the funnel:
   * directions are given when an appointment is confirmed.
   *
   * To put the address on the site, set `street` to the real one. The
   * footer, the Visit section and the directions link all read from
   * here and will pick it up; nothing else needs to change.
   */
  street: '' as string,
  city: 'Norridge, IL',
  region: 'Chicago and the surrounding suburbs',
  hours: [
    { days: 'Mon – Sat', time: '10:00 AM – 6:00 PM' },
    { days: 'Sunday', time: 'Closed' },
  ],
  instagram: 'https://instagram.com/Jewelryaura01',
  instagramHandle: '@jewelryaura01',
} as const

/** The free-shipping threshold quoted in the announcement bar, the trust
 *  band, and the cart drawer's progress meter. One number, one place. */
export const FREE_SHIPPING_THRESHOLD = 150
