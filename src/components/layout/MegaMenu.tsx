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
 * crawler saw seven nav labels and nothing behind them. Here all four
 * panels ship in the initial payload and open on `:hover` /
 * `:focus-within` of their nav item. Benefits beyond SSR: keyboard
 * tabbing opens the panel for free, there is no open/close state to
 * desynchronise, and the hover-intent delay is a `transition-delay`
 * rather than a pair of timers.
 *
 * White panel on the cream canvas at --shadow-lg. Always solid — a
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

export function MegaMenuPanel({ category }: { category: Category }) {
  const base = `/collections/${category.handle}`

  return (
    <div
      className={`absolute inset-x-0 top-full hidden border-t border-hairline bg-raised shadow-lg md:block ${PANEL_STATE}`}
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-8 px-8 py-9">
        <div className="col-span-5">
          <p className="max-w-[36ch] text-[14px] leading-relaxed text-ink-muted">
            {category.blurb}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-8">
            <div>
              <ColumnHeading>Shop by style</ColumnHeading>
              <FacetLinks
                options={category.styles}
                base={base}
                param="style"
              />
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
            className="group/all mt-7 inline-flex items-center gap-1.5 text-[12px] label text-brand transition-colors duration-hover ease-apple hover:text-brand-hover"
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

        {/* A real one-of-one from the bench, labelled and linked as a
            commission. It is not stock in this category, so it points at
            /custom rather than at the collection — a photograph under a
            category heading is read as a promise about the category. */}
        <a href="/custom" className="group/piece col-span-4 block">
          <div className="relative aspect-[4/3] overflow-hidden bg-raised shadow-sm">
            <picture>
              <source type="image/avif" srcSet={`${category.featured.image}.avif`} />
              <source type="image/webp" srcSet={`${category.featured.image}.webp`} />
              <img
                src={`${category.featured.image}.jpg`}
                alt={category.featured.alt}
                width={1122}
                height={842}
                loading="lazy"
                decoding="async"
                sizes="360px"
                className="h-full w-full object-cover transition-transform duration-content ease-out-expo group-hover/piece:scale-[1.03] motion-reduce:transition-none"
              />
            </picture>
            <span className="absolute left-0 top-0 bg-raised px-2 py-1 text-[10px] label-wide text-ink shadow-sm">
              One of one
            </span>
          </div>
          <p className="mt-2.5 text-[13px] font-medium text-ink">
            {category.featured.name}
          </p>
          <p className="mt-0.5 text-[12px] text-ink-muted">
            {category.featured.meta} · Commission yours
          </p>
        </a>
      </div>
    </div>
  )
}

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 border-b border-hairline pb-2 text-[11px] label-wide text-ink-muted">
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
            className="text-[13px] text-ink-muted transition-colors duration-hover ease-apple hover:text-ink"
          >
            {option.label}
          </a>
        </li>
      ))}
    </ul>
  )
}
