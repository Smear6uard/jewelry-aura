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
 * Two exports over the same panel:
 *   FilterSheet    the phone control — a bottom sheet, never a sidebar
 *                  and never a left slide-over. Its rows are 44px.
 *   FilterSidebar  the desktop rail beside the grid.
 */

import { useEffect, useRef, useState } from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { BottomSheet } from '~/components/ui/BottomSheet'
import { BTN_PRIMARY_BLOCK } from '~/lib/ui'
import {
  CATEGORIES,
  LENGTH_FACETS,
  METAL_FACETS,
  PRICE_FACETS,
  type FacetOption,
} from '~/lib/catalog'
import {
  activeFacetCount,
  clearedFacets,
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
      <Panel {...props} touch={false} />
    </aside>
  )
}

/** Phone trigger + bottom sheet. Hidden from md up. */
export function FilterSheet(props: FilterProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)

  // Every facet link is a navigation, so the sheet does not need to
  // survive one — but if the browser restores this page from the back
  // cache with the sheet flagged open, close it.
  useEffect(() => {
    const onPageShow = () => setOpen(false)
    window.addEventListener('pageshow', onPageShow)
    return () => window.removeEventListener('pageshow', onPageShow)
  }, [])

  const count = activeFacetCount(props.facets)

  const close = () => {
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div className="md:hidden">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="inline-flex min-h-11 items-center gap-2 bg-bone px-4 text-[12px] label text-ink border border-hairline-light transition-colors duration-hover ease-apple motion-reduce:transition-none"
      >
        <SlidersHorizontal aria-hidden size={15} strokeWidth={1.5} />
        Filter
        {count > 0 && (
          <span className="ml-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-maroon px-1 text-[10px] font-semibold leading-none text-bone">
            {count}
          </span>
        )}
      </button>

      <BottomSheet
        open={open}
        onClose={close}
        title="Filter"
        footer={
          <button type="button" onClick={close} className={BTN_PRIMARY_BLOCK}>
            Show {props.total} {props.total === 1 ? 'piece' : 'pieces'}
          </button>
        }
      >
        <Panel {...props} touch />
      </BottomSheet>
    </div>
  )
}

function Panel({
  facets,
  counts,
  styles,
  hrefFor,
  activeCategory,
  touch,
}: FilterProps & { touch: boolean }) {
  return (
    <div className="flex flex-col gap-7">
      {hasActiveFacets(facets) && (
        <a
          href={hrefFor(clearedFacets())}
          className="inline-flex w-fit items-center text-[12px] label text-maroon underline decoration-maroon underline-offset-4 transition-colors duration-hover ease-apple hover:text-ink motion-reduce:transition-none"
        >
          Clear all filters
        </a>
      )}

      <Group title="Category">
        <ul className="flex flex-col">
          {CATEGORIES.map((category) => (
            <li key={category.handle}>
              <a
                href={`/collections/${category.handle}`}
                className={`flex items-center text-[13px] transition-colors duration-hover ease-apple hover:text-maroon motion-reduce:transition-none ${
                  touch ? 'min-h-11' : 'py-1'
                } ${
                  activeCategory === category.handle
                    ? 'font-medium text-ink'
                    : 'text-ink'
                }`}
              >
                {category.label}
              </a>
            </li>
          ))}
          <li>
            <a
              href="/shop"
              className={`flex items-center text-[13px] text-ink transition-colors duration-hover ease-apple hover:text-maroon motion-reduce:transition-none ${
                touch ? 'min-h-11' : 'py-1'
              }`}
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
            touch={touch}
          />
        </Group>
      )}

      <Group title="Metal">
        <FacetList
          options={METAL_FACETS}
          counts={counts.metal}
          active={facets.metal}
          hrefFor={(value) => hrefFor({ metal: value })}
          touch={touch}
        />
      </Group>

      {/* Length is hidden where nothing in the listing has one — rings
          and pendants carry no inch measurement, and a group of three
          zeroes is noise rather than information. */}
      {Object.keys(counts.length).length > 0 && (
        <Group title="Length">
          <FacetList
            options={LENGTH_FACETS}
            counts={counts.length}
            active={facets.length}
            hrefFor={(value) => hrefFor({ length: value })}
            touch={touch}
          />
        </Group>
      )}

      <Group title="Price">
        <FacetList
          options={PRICE_FACETS}
          counts={counts.price}
          active={facets.price}
          hrefFor={(value) => hrefFor({ price: value })}
          touch={touch}
        />
      </Group>

      <Group title="Availability">
        <FacetList
          options={[{ value: 'in-stock', label: 'In stock' }]}
          counts={counts.avail}
          active={facets.avail}
          hrefFor={(value) => hrefFor({ avail: value })}
          touch={touch}
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
      <h3 className="mb-2 border-b border-hairline-light pb-2 text-[11px] label-wide text-ink">
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
  touch,
}: {
  options: ReadonlyArray<FacetOption>
  counts: Record<string, number>
  active: string | undefined
  /** Passing undefined clears this facet — used to toggle the active one off. */
  hrefFor: (value: string | undefined) => string
  touch: boolean
}) {
  const row = touch ? 'min-h-11' : 'py-1'

  return (
    <ul className="flex flex-col">
      {options.map((option) => {
        const count = counts[option.value] ?? 0
        const selected = active === option.value

        if (count === 0 && !selected) {
          return (
            <li
              key={option.value}
              className={`flex items-center justify-between gap-2 text-[13px] text-ink opacity-40 ${row}`}
            >
              <span className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  className="inline-block h-[11px] w-[11px] shrink-0 border border-hairline-light"
                />
                {option.label}
              </span>
              <span className="text-[12px] tabular-nums">0</span>
            </li>
          )
        }

        return (
          <li key={option.value}>
            <a
              href={hrefFor(selected ? undefined : option.value)}
              aria-pressed={selected}
              className={`flex items-center justify-between gap-2 text-[13px] transition-colors duration-hover ease-apple hover:text-maroon motion-reduce:transition-none ${row} ${
                selected ? 'font-medium text-ink' : 'text-ink'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <span
                  aria-hidden
                  className={`inline-block h-[11px] w-[11px] shrink-0 border ${
                    selected ? 'border-maroon bg-maroon' : 'border-hairline-light'
                  }`}
                />
                {option.label}
              </span>
              <span className="text-[12px] tabular-nums text-ink">
                {count}
              </span>
            </a>
          </li>
        )
      })}
    </ul>
  )
}
