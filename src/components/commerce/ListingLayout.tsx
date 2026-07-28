/**
 * components/commerce/ListingLayout.tsx — the PLP shell.
 *
 * /shop, every collection and the search results page all render this, so
 * the toolbar, the sidebar, the result count and the pagination behave
 * identically wherever a shopper lands. The routes differ only in what
 * they fetch and how they title it.
 *
 * Phones: a sticky toolbar pinned directly under the header carrying the
 * result count, Filter and Sort. Both open bottom sheets. Products in a
 * two-across grid. There is no sidebar at any width below md — a filter
 * rail on a 390px screen either eats half the grid or hides behind a
 * gesture.
 *
 * Desktop: filter rail on the left, sort top-right, four-across grid.
 *
 * No entry animation anywhere in here. Product browsing has to feel
 * instant, and a staggered reveal on a grid is a delay dressed as craft.
 */

import { Breadcrumbs } from '~/components/commerce/Breadcrumbs'
import {
  FilterSheet,
  FilterSidebar,
  type FacetCounts,
} from '~/components/commerce/FilterSidebar'
import { Pagination } from '~/components/commerce/Pagination'
import { ProductGrid } from '~/components/commerce/ProductGrid'
import { SortSelect, SortSheet } from '~/components/commerce/SortSelect'
import { BTN_PRIMARY } from '~/lib/ui'
import type { FacetOption } from '~/lib/catalog'
import type { BreadcrumbItem } from '~/lib/seo'
import type { ProductCardModel } from '~/lib/shopify/adapters'
import { hasActiveFacets, type Facets, type SortKey } from '~/lib/shopify/facets'

interface ListingLayoutProps {
  title: string
  description?: string
  breadcrumbs?: ReadonlyArray<BreadcrumbItem>
  products: ReadonlyArray<ProductCardModel>
  /** Total matching the current filters, across all pages. */
  total: number
  page: number
  totalPages: number
  facets: Facets
  counts: FacetCounts
  styles: FacetOption[]
  activeCategory?: string
  /** Builds a URL for a facet change (page resets to 1). */
  hrefForFacets: (patch: Partial<Facets>) => string
  /** Builds a URL for a page change (facets preserved). */
  hrefForPage: (page: number) => string
  /** Href that clears every filter — shown in the empty state. */
  clearHref: string
  /**
   * Where an unfiltered empty case sends the shopper. Women's earrings
   * with nothing in them should offer earrings, not a generic "shop
   * all" — an empty page is a fork in the road, not a dead end.
   */
  emptyAction?: { href: string; label: string }
  /** Replaces the generic restocking line when the surface knows better. */
  emptyBody?: string
}

export function ListingLayout({
  title,
  description,
  breadcrumbs,
  products,
  total,
  page,
  totalPages,
  facets,
  counts,
  styles,
  activeCategory,
  hrefForFacets,
  hrefForPage,
  clearHref,
  emptyAction,
  emptyBody,
}: ListingLayoutProps) {
  const filtered = hasActiveFacets(facets)
  const sort = facets.sort ?? 'featured'
  const hrefForSort = (next: SortKey) => hrefForFacets({ sort: next })

  return (
    <main className="pb-16 md:pb-24">
      <div className="mx-auto max-w-[1440px] px-4 pt-6 md:px-8 md:pt-8">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs items={breadcrumbs} className="mb-4" />
        )}

        <header className="border-b border-hairline pb-5">
          <h1 className="display text-[28px] leading-none text-ink md:text-[38px]">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-ink-muted">
              {description}
            </p>
          )}
        </header>
      </div>

      {/*
       * Phones: the toolbar sticks under the header so Filter and Sort
       * stay reachable however far the shopper has scrolled. Pinned at
       * --header-h rather than a hard-coded offset so it tracks the two-
       * row phone header and the one-row desktop header without drift.
       *
       * Solid, not translucent-with-a-blur. Chrome on this site is never
       * see-through, and a backdrop-filter here would also make this
       * element the containing block for any `position: fixed` descendant
       * — which would shrink the Filter and Sort sheets to the height of
       * this bar. (They are portalled out for the same reason.)
       */}
      <div
        className="sticky z-40 bg-base md:hidden"
        style={{ top: 'var(--header-h)' }}
      >
        <div className="flex items-center justify-between gap-3 border-b border-hairline px-4 py-2.5">
          <ResultCount total={total} page={page} totalPages={totalPages} />
          <div className="flex items-center gap-2">
            <FilterSheet
              facets={facets}
              counts={counts}
              styles={styles}
              hrefFor={hrefForFacets}
              activeCategory={activeCategory}
              total={total}
            />
            <SortSheet value={sort} hrefFor={hrefForSort} />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 md:px-8">
        {/* Desktop toolbar: count left, sort right. */}
        <div className="hidden items-center justify-between gap-4 py-4 md:flex">
          <ResultCount total={total} page={page} totalPages={totalPages} />
          <SortSelect value={sort} hrefFor={hrefForSort} />
        </div>

        <div className="flex gap-6 pt-4 md:pt-0 lg:gap-10">
          <FilterSidebar
            facets={facets}
            counts={counts}
            styles={styles}
            hrefFor={hrefForFacets}
            activeCategory={activeCategory}
            total={total}
          />

          <div className="min-w-0 flex-1">
            <ProductGrid
              products={products}
              density="compact"
              empty={
                <EmptyListing
                  filtered={filtered}
                  clearHref={clearHref}
                  action={emptyAction}
                  body={emptyBody}
                />
              }
            />
            <Pagination page={page} totalPages={totalPages} hrefFor={hrefForPage} />
          </div>
        </div>
      </div>
    </main>
  )
}

function ResultCount({
  total,
  page,
  totalPages,
}: {
  total: number
  page: number
  totalPages: number
}) {
  return (
    <p className="text-[13px] text-ink-muted">
      <span className="font-medium text-ink tabular-nums">{total}</span>{' '}
      {total === 1 ? 'piece' : 'pieces'}
      {totalPages > 1 && (
        <span className="hidden md:inline">
          {' '}
          · page {page} of {totalPages}
        </span>
      )}
    </p>
  )
}

function EmptyListing({
  filtered,
  clearHref,
  action,
  body,
}: {
  filtered: boolean
  clearHref: string
  action?: { href: string; label: string }
  body?: string
}) {
  if (!filtered) {
    return (
      <div className="bg-raised px-6 py-20 text-center shadow-sm">
        <p className="text-[11px] label-wide text-ink-muted">
          Nothing in this case yet
        </p>
        <p className="mx-auto mt-3 max-w-sm text-[15px] text-ink-muted">
          {body ??
            'Pieces are being finished on the bench. The full catalog is one step away.'}
        </p>
        <a href={action?.href ?? '/shop'} className={`${BTN_PRIMARY} mt-6`}>
          {action?.label ?? 'Shop all pieces'}
        </a>
      </div>
    )
  }

  return (
    <div className="bg-raised px-6 py-20 text-center shadow-sm">
      <p className="text-[11px] label-wide text-ink-muted">No matches</p>
      <p className="mx-auto mt-3 max-w-sm text-[15px] text-ink-muted">
        Nothing matches every filter at once. Clearing one usually opens it back
        up.
      </p>
      <a href={clearHref} className={`${BTN_PRIMARY} mt-6`}>
        Clear filters
      </a>
    </div>
  )
}
