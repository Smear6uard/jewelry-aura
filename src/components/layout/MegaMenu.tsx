/**
 * components/layout/MegaMenu.tsx — the full-width category panel.
 *
 * The single strongest "this is a store, not a brand site" signal in
 * the design, so it is built as a real menu: three columns of ways into
 * the category (style, metal, price), a featured piece from the
 * workshop on the right, and a shop-all link that closes the panel.
 *
 * Every link resolves. Rather than inventing twenty Shopify collection
 * handles to back twenty menu entries — the reliable way to ship a menu
 * full of 404s — subcategory links land on the parent collection with a
 * facet applied (`/collections/chains?style=cuban`). See lib/catalog.ts
 * for the reasoning and lib/shopify/facets.ts for the derivation.
 *
 * Open/close state is owned by Header (it knows about hover intent
 * across the whole nav row); this component is presentational and
 * reports pointer enter/leave so the panel counts as part of the
 * hover target.
 */

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { DURATION, easeApple, useReducedMotion } from '~/lib/motion'
import {
  METAL_FACETS,
  PRICE_FACETS,
  type Category,
  type FacetOption,
} from '~/lib/catalog'

interface MegaMenuProps {
  category: Category
  onPointerEnter: () => void
  onPointerLeave: () => void
  onNavigate: () => void
}

export function MegaMenu({
  category,
  onPointerEnter,
  onPointerLeave,
  onNavigate,
}: MegaMenuProps) {
  const reduced = !!useReducedMotion()
  const base = `/collections/${category.handle}`

  return (
    <motion.div
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
      transition={{ duration: DURATION.micro, ease: easeApple }}
      className="absolute inset-x-0 top-full border-b border-hairline bg-raised"
      style={{
        // A champagne hairline draws the panel's top edge against the
        // header — the same rule the workshop's bench work is finished
        // with, and the only metal in the chrome.
        borderTop: '1px solid rgba(196,168,117,0.35)',
        boxShadow: '0 24px 48px -24px rgba(0,0,0,0.8)',
      }}
    >
      <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-8 px-8 py-8">
        <div className="col-span-3">
          <ColumnHeading>Shop by style</ColumnHeading>
          <FacetLinks
            options={category.styles}
            base={base}
            param="style"
            onNavigate={onNavigate}
          />
        </div>

        <div className="col-span-3">
          <ColumnHeading>Shop by metal</ColumnHeading>
          <FacetLinks
            options={METAL_FACETS}
            base={base}
            param="metal"
            onNavigate={onNavigate}
          />
        </div>

        <div className="col-span-3">
          <ColumnHeading>Shop by price</ColumnHeading>
          <FacetLinks
            options={PRICE_FACETS}
            base={base}
            param="price"
            onNavigate={onNavigate}
          />

          <a
            href={base}
            onClick={onNavigate}
            className="group mt-6 inline-flex items-center gap-1.5 text-[12px] label text-champagne transition-colors duration-hover ease-apple hover:text-cream"
          >
            All {category.label.toLowerCase()}
            <ArrowRight
              aria-hidden
              size={13}
              strokeWidth={1.5}
              className="transition-transform duration-hover ease-apple group-hover:translate-x-0.5"
            />
          </a>
        </div>

        {/* Featured piece — a real commission from the workshop, named
            as one. It is a doorway into the category, not stock. */}
        <a
          href={base}
          onClick={onNavigate}
          className="group col-span-3 block"
        >
          <div className="velvet-grade relative aspect-[4/3] overflow-hidden bg-base tile-frame">
            <picture>
              <source type="image/avif" srcSet={`${category.featured.image}.avif`} />
              <source type="image/webp" srcSet={`${category.featured.image}.webp`} />
              <img
                src={`${category.featured.image}.jpg`}
                alt={category.featured.alt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-content ease-out-expo group-hover:scale-[1.03] motion-reduce:transition-none"
              />
            </picture>
            <span
              className="absolute left-0 top-0 px-2 py-1 text-[10px] label-wide text-champagne"
              style={{
                boxShadow: 'inset 0 0 0 1px rgba(196,168,117,0.55)',
                backgroundColor: 'rgba(10,9,8,0.72)',
              }}
            >
              One of one
            </span>
          </div>
          <p className="mt-2.5 text-[13px] font-medium text-cream">
            {category.featured.name}
          </p>
          <p className="mt-0.5 text-[12px] text-cream-muted">
            {category.featured.meta}
          </p>
        </a>
      </div>
    </motion.div>
  )
}

function ColumnHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 border-b border-hairline pb-2 text-[11px] label-wide text-cream-subtle">
      {children}
    </p>
  )
}

function FacetLinks({
  options,
  base,
  param,
  onNavigate,
}: {
  options: ReadonlyArray<FacetOption>
  base: string
  param: 'style' | 'metal' | 'price'
  onNavigate: () => void
}) {
  return (
    <ul className="flex flex-col gap-2">
      {options.map((option) => (
        <li key={option.value}>
          <a
            href={`${base}?${param}=${option.value}`}
            onClick={onNavigate}
            className="text-[13px] text-cream-muted transition-colors duration-hover ease-apple hover:text-cream"
          >
            {option.label}
          </a>
        </li>
      ))}
    </ul>
  )
}
