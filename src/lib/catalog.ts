/**
 * lib/catalog.ts — the storefront's navigation taxonomy.
 *
 * One source of truth for: the burger drawer, the desktop nav and its
 * mega-menu panels, the women's submenu, the homepage sections, the
 * footer's Shop column, and the filter sidebar's facet lists. Every one
 * of those surfaces renders from this file, so a category can't exist in
 * the menu and vanish from the footer.
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
   * Dedicated homepage tile photograph — base path, no extension
   * (avif/webp/jpg all expected). Set ONLY where the workshop's shot
   * list actually covers this category: a tile is a promise about what
   * is behind it, and borrowing a pendant photograph for "Rings" breaks
   * that promise more loudly than a missing tile.
   *
   * Where this is undefined the homepage falls back to the collection's
   * first in-stock product image, and omits the tile entirely if the
   * collection is empty or does not exist yet.
   */
  tileImage?: string
  tileAlt?: string
  /**
   * Commission shown at the right edge of the mega-menu panel. These
   * are photographs of real one-of-one pieces from the bench, labelled
   * and linked as commissions — never presented as stock in this
   * category, which is why the card points at /custom.
   */
  featured: {
    image: string
    name: string
    meta: string
    alt: string
  }
}

/**
 * Metal facets — a filter, not a menu door.
 *
 * These used to run as a "Shop by metal" column in every mega-menu panel
 * and as three rows in every drawer accordion. They came out: the bench
 * names most pieces plain "Gold" or "Silver", so a menu offering Yellow
 * gold / White gold / Rose gold under Earrings was inventing a
 * distinction the catalog does not make, and two of the remaining values
 * matched nothing at all. As a PLP filter the same list is honest,
 * because FilterSidebar renders each value with its count and greys out
 * the zeroes. A menu cannot do that — it can only promise.
 *
 * FilterSidebar is the only consumer. Keep it that way.
 */
export const METAL_FACETS: FacetOption[] = [
  { value: 'yellow-gold', label: 'Yellow gold' },
  { value: 'white-gold', label: 'White gold' },
  { value: 'rose-gold', label: 'Rose gold' },
  { value: 'two-tone', label: 'Two-tone' },
  { value: 'moissanite', label: 'Moissanite' },
  { value: 'silver', label: 'Silver' },
]

/**
 * Chain and bracelet lengths, in inches.
 *
 * The workshop writes the length into the product title (`... Cuban Link
 * 20"`), which is the only place the Storefront card query can see it —
 * variant option names are not in that fetch. Values are bands rather
 * than exact inches: a shopper filtering for a 20" chain is choosing
 * between "sits at the collarbone" and "sits at the sternum", and half
 * the catalog is cut to order anyway.
 */
export const LENGTH_FACETS: FacetOption[] = [
  { value: 'under-18', label: 'Under 18"' },
  { value: '18-22', label: '18" – 22"' },
  { value: '24-plus', label: '24" and longer' },
]

/** Price bands — the merchandising ladder used by every mega-menu
 *  panel and the filter sidebar. The homepage used to offer them a
 *  third time as a section of its own; three links are not a section. */
export const PRICE_FACETS: FacetOption[] = [
  { value: 'under-250', label: 'Under $250' },
  { value: '250-750', label: '$250 – $750' },
  { value: '750-plus', label: '$750 and up' },
]

/**
 * The five shopping categories, in menu order: chains, pendants,
 * earrings, rings, bracelets. This order is the store's spine — the
 * burger drawer, the desktop nav, the women's submenu, the homepage
 * tiles and the footer all walk this array, so the sequence a shopper
 * learns in the menu is the sequence they meet everywhere else.
 */
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
    blurb: 'Name plates, picture pendants and charms, set by hand.',
    tileImage: '/JA-image1',
    tileAlt:
      'A custom white gold plate pendant set with round and baguette diamonds, on dark velvet.',
    styles: [
      { value: 'name', label: 'Name & initial' },
      { value: 'portrait', label: 'Portrait & photo' },
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
    handle: 'earrings',
    label: 'Earrings',
    blurb: 'Hearts, squares and circles — studs and hoops in gold and silver, sold as pairs.',
    /**
     * Two fittings, then three shapes — the order the case is actually
     * shopped in, and the order the bench names a pair ("Square Stud
     * Earrings Gold"). Huggies and Moissanite were dropped: nothing in
     * the catalog is either, and neither had a keyword rule behind it,
     * so both links landed on an empty case.
     */
    styles: [
      { value: 'stud', label: 'Studs' },
      { value: 'hoop', label: 'Hoops' },
      { value: 'heart', label: 'Hearts' },
      { value: 'square', label: 'Squares' },
      { value: 'circle', label: 'Circles' },
    ],
    featured: {
      image: '/JA-image2',
      name: 'Monogram',
      meta: 'White gold · Round and baguette set',
      alt: 'A custom monogram pendant in white gold, fully set with round and baguette stones.',
    },
  },
  {
    handle: 'rings',
    label: 'Rings',
    blurb: 'Engagement, bands and signets — moissanite or natural stone.',
    // Moissanite was a fourth entry here, and it is a metal rather than a
    // style — `?style=moissanite` matched nothing, ever. It keeps its own
    // door in the burger and the footer, which is where a material
    // belongs.
    styles: [
      { value: 'engagement', label: 'Engagement' },
      { value: 'band', label: 'Wedding bands' },
      { value: 'signet', label: 'Signet' },
    ],
    featured: {
      image: '/JA-image3',
      name: 'Queen',
      meta: 'Yellow gold · Two-tone pavé',
      alt: 'A custom Queen script piece with a heart drop, in yellow gold and pavé diamonds.',
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
]

export function findCategory(handle: string): Category | undefined {
  return CATEGORIES.find((category) => category.handle === handle)
}

// ─── Women's ───────────────────────────────────────────────────────────
//
// Women's is not a sixth category sitting beside the other five — it is
// the same five categories, cut for women. So it behaves like a second
// floor of the same shop: opening it in the menu re-offers Chains,
// Pendants, Earrings, Rings and Bracelets, each routed to
// /collections/womens-<handle>.
//
// One prefix, declared once. The menu, the submenu, the homepage section
// and the collection route all derive the handle from it, so there is no
// second place where "womens-earrings" is spelled out and can drift.

export const WOMENS_PREFIX = 'womens'

/** `chains` → `womens-chains`. */
export function womensHandle(handle: string): string {
  return `${WOMENS_PREFIX}-${handle}`
}

/** The parent category handle behind a women's handle, if it is one. */
export function parentOfWomens(handle: string): Category | undefined {
  if (!handle.startsWith(`${WOMENS_PREFIX}-`)) return undefined
  return findCategory(handle.slice(WOMENS_PREFIX.length + 1))
}

export const WOMENS = {
  handle: WOMENS_PREFIX,
  label: "Women's",
  href: `/collections/${WOMENS_PREFIX}`,
  blurb: 'The same five cases, cut for women — lighter links and smaller settings.',
  /** The five categories again, routed to their women's collection. */
  links: CATEGORIES.map((category) => ({
    label: category.label,
    href: `/collections/${womensHandle(category.handle)}`,
    handle: womensHandle(category.handle),
  })),
} as const

/** Moissanite is a destination of its own, not only a metal filter. */
export const MOISSANITE = {
  handle: 'moissanite',
  label: 'Moissanite',
  href: '/collections/moissanite',
} as const

// ─── Services ──────────────────────────────────────────────────────────
//
// The bench's work that is not a product: repair, watch service,
// appraisal. It earns a nav slot because it is the half of this business
// a catalog cannot show — someone with a broken clasp is not browsing
// chains, and the only route to it used to be a footer column.
//
// `href` is a real hub page (see lib/pages-content.ts), not the first
// item in its own list. A top-level menu label that quietly lands on one
// of its children is the small dishonesty that makes a menu feel
// generated.

export const SERVICES = {
  label: 'Services',
  href: '/pages/services',
  blurb:
    'Repair, watch service and written appraisal — on any piece, whether or not it came from us. Quotes are free and same-day.',
  links: [
    {
      label: 'Jewelry repair',
      href: '/pages/repair',
      note: 'Sizing, soldering, retipping, restringing',
    },
    {
      label: 'Watch service',
      href: '/pages/watch-service',
      note: 'Batteries, crystals, full movement service',
    },
    {
      label: 'Appraisal',
      href: '/pages/appraisal',
      note: 'Insurance, estate and resale valuations',
    },
  ],
} as const

export interface NavLink {
  label: string
  href: string
  /** Present when the link opens a mega-menu panel on hover. */
  category?: Category
  /** Opens the women's panel — the five categories again. */
  womens?: boolean
  /** Opens the services panel — repair, watch service, appraisal. */
  services?: boolean
  /**
   * Set in the display serif rather than the nav's uppercase sans.
   * Reserved for Custom: it is the only item in the row that is not a
   * shelf, and the change of voice says that before the label does.
   */
  signature?: boolean
}

/**
 * The desktop nav row: three shopping doors, Women's, Custom, Services.
 *
 * SIX ITEMS, NOT EIGHT. The row used to carry all five categories plus
 * Women's, Custom and Sale, which is eight labels competing at 12px and
 * a row that wrapped the moment a viewport dipped under 1200px. It is a
 * shortcut, not the taxonomy — the burger in the corner opens the full
 * list at every breakpoint — so it now carries the three cases people
 * actually arrive for (chains, pendants, bracelets) and the two doors a
 * catalog cannot show. Earrings, Rings, Moissanite and Sale keep their
 * place in the burger, the footer and the price columns of every panel.
 */
const NAV_CATEGORY_HANDLES = ['chains', 'pendants', 'bracelets'] as const

export const NAV_LINKS: NavLink[] = [
  ...NAV_CATEGORY_HANDLES.map((handle) => {
    const category = findCategory(handle)
    if (!category) throw new Error(`NAV_LINKS: no category "${handle}"`)
    return {
      label: category.label,
      href: `/collections/${category.handle}`,
      category,
    }
  }),
  { label: WOMENS.label, href: WOMENS.href, womens: true },
  { label: 'Custom', href: '/custom', signature: true },
  { label: SERVICES.label, href: SERVICES.href, services: true },
]

/** Footer "Shop" column — categories plus the catch-all surfaces. */
export const FOOTER_SHOP_LINKS = [
  ...CATEGORIES.map((c) => ({ label: c.label, href: `/collections/${c.handle}` })),
  { label: WOMENS.label, href: WOMENS.href },
  { label: MOISSANITE.label, href: MOISSANITE.href },
  { label: 'Sale', href: '/collections/sale' },
  { label: 'Shop all', href: '/shop' },
]

/** Footer "Services" column — the bench's work, plus commissions. */
export const FOOTER_SERVICE_LINKS = [
  { label: 'Custom commissions', href: '/custom' },
  ...SERVICES.links.map((link) => ({ label: link.label, href: link.href })),
]

export const FOOTER_SUPPORT_LINKS = [
  { label: 'Shipping', href: '/pages/shipping' },
  { label: 'Returns', href: '/pages/returns' },
  { label: 'Lifetime warranty', href: '/pages/warranty' },
  { label: 'Sizing guide', href: '/pages/sizing' },
  { label: 'FAQ', href: '/pages/faq' },
]

// ─── Store details ─────────────────────────────────────────────────────
//
// The one place the store's contact facts are written down. The footer,
// the custom-inquiry page and the contact schema all read from here.
//
// THIS STORE HAS NO PUBLIC LOCATION.
//
// It ships; it does not receive visitors. So there is no street line, no
// city, no map, no opening hours and no pickup counter anywhere in this
// repo — not in copy, not in JSON-LD, not as a commented-out constant
// waiting to be switched back on. Phone, email and Instagram are the
// three ways in, and the reply window below is what an hours table used
// to promise: how long before a person answers.

export const STORE = {
  phone: '630-965-6464',
  phoneHref: 'tel:6309656464',
  /**
   * What replaces an hours table: the promise a shopper actually needs.
   * No email constant here on purpose — the site has never published
   * one, and the inquiry form is the written channel.
   */
  replyWindow: 'Calls and messages answered within one business day.',
  instagram: 'https://instagram.com/Jewelryaura01',
  instagramHandle: '@jewelryaura01',
} as const

/** The free-shipping threshold quoted in the announcement bar, the trust
 *  band, and the cart drawer's progress meter. One number, one place. */
export const FREE_SHIPPING_THRESHOLD = 150
