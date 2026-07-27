/**
 * components/commerce/FilterSidebar.tsx — PLP faceting.
 *
 * Every filter is a real link carrying search params, so a filtered
 * listing is server-rendered, shareable, cacheable and crawlable. That
 * also means the control degrades to a plain list of links with
 * JavaScript off, which is what a filter should be.
 *
 * Counts come from lib/shopify/facets and exclude their own group, so
 * "Rope (3)" always yields three products. Values that would yield zero
 * are rendered disabled rather than hidden — a filter list that
 * reshuffles under the cursor is disorienting, and the zero is
 * information.
 *
 * Two exports over the same panel, because the two placements sit in
 * different parts of the page: `FilterSheet` is the phone trigger and
 * its slide-over, which belongs in the toolbar row; `FilterSidebar` is
 * the desktop rail, which belongs beside the grid.
 */

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { SlidersHorizontal, X } from 'lucide-react'
import { DURATION, easeApple, easeOutExpo } from '~/lib/motion'
import {
  CATEGORIES,
  METAL_FACETS,
  PRICE_FACETS,
  type FacetOption,
} from '~/lib/catalog'
import {
  hasActiveFacets,
  type FacetCounts,
  type Facets,
} from '~/lib/shopify/facets'

export type { FacetCounts }

export interface FilterProps {
  facets: Facets
  counts: FacetCounts
  /** Style options for the current category; empty hides the group. */
  styles: FacetOption[]
  /** Builds the URL for a facet change. Undefined values clear a facet. */
  hrefFor: (patch: Partial<Facets>) => string
  /** Highlighted category in the Category group, if any. */
  activeCategory?: string
  /** Number of products currently matching. */
  total: number
}

/** Desktop rail. Hidden below md — the sheet covers that breakpoint. */
export function FilterSidebar(props: FilterProps) {
  return (
    <aside
      aria-label="Filters"
      className="hidden w-[190px] shrink-0 md:block lg:w-[210px]"
    >
      <Panel {...props} />
    </aside>
  )
}

/** Phone trigger + slide-over. Hidden from md up. */
export function FilterSheet(props: FilterProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const count = activeCount(props.facets)

  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex items-center gap-2 border border-hairline px-3.5 py-2 text-[11px] label text-cream transition-colors duration-hover ease-apple hover:border-cream-subtle"
      >
        <SlidersHorizontal aria-hidden size={14} strokeWidth={1.4} />
        Filter
        {count > 0 && (
          <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center bg-brand px-1 text-[10px] leading-none text-cream">
            {count}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-[65]">
            <motion.button
              type="button"
              aria-label="Close filters"
              tabIndex={-1}
              className="absolute inset-0 h-full w-full cursor-default bg-sunken/80"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: DURATION.micro, ease: easeApple }}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Filters"
              className="absolute left-0 top-0 flex h-full w-full max-w-[20rem] flex-col border-r border-hairline bg-raised"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: DURATION.content, ease: easeOutExpo }}
            >
              <header className="flex items-center justify-between border-b border-hairline px-5 py-4">
                <h2 className="text-[12px] label text-cream">Filter</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close filters"
                  className="p-1.5 text-cream-muted transition-colors duration-hover ease-apple hover:text-cream"
                >
                  <X aria-hidden size={17} strokeWidth={1.4} />
                </button>
              </header>
              <div
                className="flex-1 overflow-y-auto px-5 py-5"
                data-lenis-prevent
              >
                <Panel {...props} />
              </div>
              <footer className="border-t border-hairline px-5 py-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-full bg-brand px-6 py-3 text-[11px] label text-cream transition-colors duration-hover ease-apple hover:bg-brand-hover"
                >
                  Show {props.total} {props.total === 1 ? 'piece' : 'pieces'}
                </button>
              </footer>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

function activeCount(facets: Facets): number {
  return [facets.metal, facets.style, facets.price, facets.avail].filter(Boolean)
    .length
}

function Panel({
  facets,
  counts,
  styles,
  hrefFor,
  activeCategory,
}: FilterProps) {
  return (
    <div className="flex flex-col gap-7">
      {hasActiveFacets(facets) && (
        <a
          href={hrefFor({
            metal: undefined,
            style: undefined,
            price: undefined,
            avail: undefined,
          })}
          className="inline-flex w-fit items-center text-[11px] label text-champagne underline decoration-champagne/40 underline-offset-4 transition-colors duration-hover ease-apple hover:text-cream"
        >
          Clear all filters
        </a>
      )}

      <Group title="Category">
        <ul className="flex flex-col gap-1.5">
          {CATEGORIES.map((category) => (
            <li key={category.handle}>
              <a
                href={`/collections/${category.handle}`}
                className={`text-[13px] transition-colors duration-hover ease-apple hover:text-cream ${
                  activeCategory === category.handle
                    ? 'text-cream'
                    : 'text-cream-muted'
                }`}
              >
                {category.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="/shop"
              className="text-[13px] text-cream-muted transition-colors duration-hover ease-apple hover:text-cream"
            >
              Shop all
            </a>
          </li>
        </ul>
      </Group>

      {styles.length > 0 && (
        <Group title="Style">
          <FacetList
            options={styles}
            counts={counts.style}
            active={facets.style}
            hrefFor={(value) => hrefFor({ style: value })}
          />
        </Group>
      )}

      <Group title="Metal">
        <FacetList
          options={METAL_FACETS}
          counts={counts.metal}
          active={facets.metal}
          hrefFor={(value) => hrefFor({ metal: value })}
        />
      </Group>

      <Group title="Price">
        <FacetList
          options={PRICE_FACETS}
          counts={counts.price}
          active={facets.price}
          hrefFor={(value) => hrefFor({ price: value })}
        />
      </Group>

      <Group title="Availability">
        <FacetList
          options={[{ value: 'in-stock', label: 'In stock' }]}
          counts={counts.avail}
          active={facets.avail}
          hrefFor={(value) => hrefFor({ avail: value })}
        />
      </Group>
    </div>
  )
}

function Group({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h3 className="mb-3 border-b border-hairline pb-2 text-[11px] label-wide text-cream-subtle">
        {title}
      </h3>
      {children}
    </section>
  )
}

function FacetList({
  options,
  counts,
  active,
  hrefFor,
}: {
  options: ReadonlyArray<FacetOption>
  counts: Record<string, number>
  active: string | undefined
  /** Passing undefined clears this facet — used to toggle the active one off. */
  hrefFor: (value: string | undefined) => string
}) {
  return (
    <ul className="flex flex-col gap-1.5">
      {options.map((option) => {
        const count = counts[option.value] ?? 0
        const selected = active === option.value

        if (count === 0 && !selected) {
          return (
            <li
              key={option.value}
              className="flex items-baseline justify-between gap-2 text-[13px] text-cream-subtle/50"
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="inline-block h-[9px] w-[9px] shrink-0 border border-hairline"
                />
                {option.label}
              </span>
              <span className="text-[11px] tabular-nums">0</span>
            </li>
          )
        }

        return (
          <li key={option.value}>
            <a
              href={hrefFor(selected ? undefined : option.value)}
              aria-pressed={selected}
              className={`flex items-baseline justify-between gap-2 text-[13px] transition-colors duration-hover ease-apple hover:text-cream ${
                selected ? 'text-cream' : 'text-cream-muted'
              }`}
            >
              <span className="flex items-center gap-2">
                <span
                  aria-hidden
                  className={`inline-block h-[9px] w-[9px] shrink-0 border ${
                    selected
                      ? 'border-brand-hover bg-brand-hover'
                      : 'border-hairline'
                  }`}
                />
                {option.label}
              </span>
              <span className="text-[11px] tabular-nums text-cream-subtle">
                {count}
              </span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}
