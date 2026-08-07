/**
 * components/layout/MegaMenu.tsx — the full-width category panel.
 *
 * The single strongest "this is a store, not a brand site" signal in the
 * design, so it is built as a real menu: three columns of ways into the
 * category (style, metal, price), a commission from the bench on the
 * right, and a shop-all link.
 *
 * Why this is CSS, not React state
 * --------------------------------
 * The previous version rendered on hover from React state, which meant
 * none of the subcategory links existed in the server-rendered HTML — a
 * crawler saw seven nav labels and nothing behind them. Here every
 * panel ships in the initial payload and opens on `:hover` /
 * `:focus-within` of their nav item. Benefits beyond SSR: keyboard
 * tabbing opens the panel for free, there is no open/close state to
 * desynchronise, and the hover-intent delay is a `transition-delay`
 * rather than a pair of timers.
 *
 * Bone panel on the paper canvas, held by a hairline. Always solid — a
 * translucent menu over product photography is unreadable on both.
 *
 * Every link resolves. Rather than inventing twenty Shopify collection
 * handles to back twenty menu entries — the reliable way to ship a menu
 * full of 404s — subcategory links land on the parent collection with a
 * facet applied (`/collections/chains?style=cuban`). See lib/catalog.ts
 * for the reasoning and lib/shopify/facets.ts for the derivation.
 */

import { ArrowRight } from 'lucide-react'
import {
  METAL_FACETS,
  PRICE_FACETS,
  SERVICES,
  STORE,
  WOMENS,
  type Category,
  type FacetOption,
} from '~/lib/catalog'

/**
 * Hidden by opacity + visibility rather than `display`, so the panel can
 * fade and so its links stay in the accessibility tree's tab order only
 * while it is reachable (`visibility: hidden` removes them from it).
 *
 * The 90ms enter delay is the hover intent: crossing the nav row does
 * not fire four panels. Leaving is immediate.
 */
const PANEL_STATE =
  'invisible opacity-0 translate-y-[-6px] ' +
  'transition-[opacity,visibility,transform] duration-micro ease-apple delay-0 ' +
  'group-hover/nav:visible group-hover/nav:opacity-100 group-hover/nav:translate-y-0 group-hover/nav:delay-[90ms] ' +
  'group-focus-within/nav:visible group-focus-within/nav:opacity-100 group-focus-within/nav:translate-y-0 ' +
  'motion-reduce:transition-none motion-reduce:translate-y-0'

/** The shared panel shell: position, hover state, grid. */
function Panel({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`absolute inset-x-0 top-full hidden border-y border-hairline-light bg-bone lg:block ${PANEL_STATE}`}
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-8 px-8 py-9">
        {children}
      </div>
    </div>
  )
}

export function MegaMenuPanel({ category }: { category: Category }) {
  const base = `/collections/${category.handle}`

  return (
    <Panel>
      <div className="col-span-5">
        <p className="max-w-[36ch] text-[14px] leading-relaxed text-ink">
          {category.blurb}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-8">
          <div>
            <ColumnHeading>Shop by style</ColumnHeading>
            <FacetLinks options={category.styles} base={base} param="style" />
          </div>
          <div>
            <ColumnHeading>Shop by metal</ColumnHeading>
            <FacetLinks options={METAL_FACETS} base={base} param="metal" />
          </div>
        </div>
      </div>

      <div className="col-span-3">
        <ColumnHeading>Shop by price</ColumnHeading>
        <FacetLinks options={PRICE_FACETS} base={base} param="price" />

        <a
          href={base}
          className="group/all mt-7 inline-flex items-center gap-1.5 text-[12px] label text-ink transition-colors duration-hover ease-apple link-hover"
        >
          All {category.label.toLowerCase()}
          <ArrowRight
            aria-hidden
            size={13}
            strokeWidth={1.6}
            className="transition-transform duration-hover ease-apple group-hover/all:translate-x-0.5 motion-reduce:transition-none"
          />
        </a>
      </div>

      <FeaturedCommission featured={category.featured} />
    </Panel>
  )
}

/**
 * The women's panel — the same five doors, one level down.
 *
 * It deliberately does NOT offer style and metal filters the way a
 * category panel does. Women's is a cut of the whole shop, not a case
 * with its own vocabulary, so the useful question here is "which case?"
 * and the answer is the list the shopper just read in the nav row above.
 */
export function WomensMenuPanel() {
  return (
    <Panel>
      <div className="col-span-5">
        <p className="max-w-[36ch] text-[14px] leading-relaxed text-ink">
          {WOMENS.blurb}
        </p>

        <div className="mt-6">
          <ColumnHeading>Shop by category</ColumnHeading>
          <ul className="grid grid-cols-2 gap-x-8 gap-y-2">
            {WOMENS.links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-[13px] text-ink transition-colors duration-hover ease-apple link-hover"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="col-span-3">
        <ColumnHeading>Shop by price</ColumnHeading>
        <FacetLinks options={PRICE_FACETS} base={WOMENS.href} param="price" />

        <a
          href={WOMENS.href}
          className="group/all mt-7 inline-flex items-center gap-1.5 text-[12px] label text-ink transition-colors duration-hover ease-apple link-hover"
        >
          All women’s
          <ArrowRight
            aria-hidden
            size={13}
            strokeWidth={1.6}
            className="transition-transform duration-hover ease-apple group-hover/all:translate-x-0.5 motion-reduce:transition-none"
          />
        </a>
      </div>

      <FeaturedCommission
        featured={{
          image: '/JA-image3',
          name: 'Queen',
          meta: 'Yellow gold · Two-tone pavé',
          alt: 'A custom Queen script piece with a heart drop, in yellow gold and pavé diamonds.',
        }}
      />
    </Panel>
  )
}

/**
 * The services panel — the bench, not a shelf.
 *
 * It deliberately carries no photograph. Every other panel ends in a
 * commission because a category panel is selling a look; this one is
 * answering "can you fix this?", and the useful things to put beside
 * that question are what each service covers and the phone number. A
 * hero shot of a repaired clasp would be decoration.
 */
export function ServicesMenuPanel() {
  return (
    <Panel>
      <div className="col-span-5">
        <p className="max-w-[38ch] text-[14px] leading-relaxed text-ink">
          {SERVICES.blurb}
        </p>

        <a
          href={STORE.phoneHref}
          className="mt-6 inline-flex text-[13px] text-ink link-hover"
        >
          {STORE.phone}
        </a>
        <p className="quiet mt-1 max-w-[34ch] text-ink">{STORE.replyWindow}</p>
      </div>

      <div className="col-span-4">
        <ColumnHeading>What we do</ColumnHeading>
        <ul className="flex flex-col gap-3">
          {SERVICES.links.map((link) => (
            <li key={link.href}>
              <a href={link.href} className="group/service block">
                <span className="text-[13px] font-medium text-ink link-hover">
                  {link.label}
                </span>
                <span className="quiet mt-0.5 block text-ink">{link.note}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="col-span-3">
        <ColumnHeading>Made to order</ColumnHeading>
        <p className="max-w-[30ch] text-[13px] leading-relaxed text-ink">
          A piece that does not exist yet is a commission, not a repair.
        </p>
        <a
          href="/custom"
          className="group/all mt-5 inline-flex items-center gap-1.5 text-[12px] label text-ink transition-colors duration-hover ease-apple link-hover"
        >
          Start a commission
          <ArrowRight
            aria-hidden
            size={13}
            strokeWidth={1.6}
            className="transition-transform duration-hover ease-apple group-hover/all:translate-x-0.5 motion-reduce:transition-none"
          />
        </a>
      </div>
    </Panel>
  )
}

/**
 * A real one-of-one from the bench, labelled and linked as a
 * commission. It is not stock in this category, so it points at /custom
 * rather than at the collection — a photograph under a category heading
 * is read as a promise about the category.
 */
function FeaturedCommission({
  featured,
}: {
  featured: Category['featured']
}) {
  return (
    <a href="/custom" className="group/piece col-span-4 block">
      <div className="relative aspect-[4/3] overflow-hidden bg-bone border border-hairline-light">
        <picture>
          <source type="image/avif" srcSet={`${featured.image}.avif`} />
          <source type="image/webp" srcSet={`${featured.image}.webp`} />
          <img
            src={`${featured.image}.jpg`}
            alt={featured.alt}
            width={1122}
            height={842}
            loading="lazy"
            decoding="async"
            sizes="360px"
            className="h-full w-full object-cover transition-transform duration-content ease-out-expo group-hover/piece:scale-[1.03] motion-reduce:transition-none"
          />
        </picture>
        <span className="absolute left-0 top-0 bg-bone px-2 py-1 text-[10px] label-wide text-ink border border-hairline-light">
          One of one
        </span>
      </div>
      <p className="mt-2.5 text-[13px] font-medium text-ink">{featured.name}</p>
      <p className="mt-0.5 text-[12px] text-ink">
        {featured.meta} · Commission yours
      </p>
    </a>
  )
}

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 border-b border-hairline-light pb-2 text-[11px] label-wide text-ink">
      {children}
    </p>
  )
}

function FacetLinks({
  options,
  base,
  param,
}: {
  options: ReadonlyArray<FacetOption>
  base: string
  param: 'style' | 'metal' | 'price'
}) {
  return (
    <ul className="flex flex-col gap-2">
      {options.map((option) => (
        <li key={option.value}>
          <a
            href={`${base}?${param}=${option.value}`}
            className="text-[13px] text-ink transition-colors duration-hover ease-apple link-hover"
          >
            {option.label}
          </a>
        </li>
      ))}
    </ul>
  )
}
