/**
 * components/commerce/ListingLayout.tsx — the PLP shell.
 *
 * /shop, every collection and the search results page all render this,
 * so the toolbar, the sidebar, the result count and the pagination
 * behave identically wherever a shopper lands. The routes differ only
 * in what they fetch and how they title it.
 *
 * No entry animation anywhere in here. Product browsing has to feel
 * instant, and a staggered reveal on a grid is a delay dressed as
 * craft.
 */

import { Breadcrumbs } from '~/components/commerce/Breadcrumbs'
import {
  FilterSheet,
  FilterSidebar,
  type FacetCounts,
} from '~/components/commerce/FilterSidebar'
import { Pagination } from '~/components/commerce/Pagination'
import { ProductGrid } from '~/components/commerce/ProductGrid'
import { SortSelect } from '~/components/commerce/SortSelect'
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
}: ListingLayoutProps) {
  const filtered = hasActiveFacets(facets)

  return (
    <main className="mx-auto max-w-[1440px] px-4 pb-16 pt-6 md:px-8 md:pb-24 md:pt-8">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} className="mb-4" />
      )}

      <header className="border-b border-hairline pb-4">
        <h1 className="font-display text-[28px] leading-none tracking-tight text-cream md:text-[38px]">
          {title}
        </h1>
        {description && (
          <p className="mt-3 max-w-[62ch] text-[14px] leading-relaxed text-cream-muted">
            {description}
          </p>
        )}
      </header>

      {/* Toolbar: count on the left, filter trigger and sort on the
          right. The count updates with the filters, which is how a
          shopper knows the filter did anything. */}
      <div className="flex items-center justify-between gap-4 py-4">
        <p className="text-[12px] text-cream-muted">
          <span className="text-cream tabular-nums">{total}</span>{' '}
          {total === 1 ? 'piece' : 'pieces'}
          {totalPages > 1 && (
            <span className="hidden md:inline">
              {' '}
              · page {page} of {totalPages}
            </span>
          )}
        </p>

        <div className="flex items-center gap-3">
          <FilterSheet
            facets={facets}
            counts={counts}
            styles={styles}
            hrefFor={hrefForFacets}
            activeCategory={activeCategory}
            total={total}
          />
          <SortSelect
            value={facets.sort ?? 'featured'}
            hrefFor={(sort: SortKey) => hrefForFacets({ sort })}
          />
        </div>
      </div>

      <div className="flex gap-6 lg:gap-10">
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
              <EmptyListing filtered={filtered} clearHref={clearHref} />
            }
          />
          <Pagination page={page} totalPages={totalPages} hrefFor={hrefForPage} />
        </div>
      </div>
    </main>
  )
}

function EmptyListing({
  filtered,
  clearHref,
}: {
  filtered: boolean
  clearHref: string
}) {
  if (!filtered) {
    return (
      <div className="border border-hairline px-6 py-20 text-center">
        <p className="text-[11px] label-wide text-cream-subtle">
          Nothing in this case yet
        </p>
        <p className="mx-auto mt-3 max-w-sm text-[15px] text-cream-muted">
          Pieces are being finished on the bench. The full catalog is one step
          away.
        </p>
        <a
          href="/shop"
          className="mt-6 inline-flex items-center bg-brand px-6 py-3 text-[11px] label text-cream transition-colors duration-hover ease-apple hover:bg-brand-hover"
        >
          Shop all pieces
        </a>
      </div>
    )
  }

  return (
    <div className="border border-hairline px-6 py-20 text-center">
      <p className="text-[11px] label-wide text-cream-subtle">No matches</p>
      <p className="mx-auto mt-3 max-w-sm text-[15px] text-cream-muted">
        Nothing matches every filter at once. Clearing one usually opens it back
        up.
      </p>
      <a
        href={clearHref}
        className="mt-6 inline-flex items-center bg-brand px-6 py-3 text-[11px] label text-cream transition-colors duration-hover ease-apple hover:bg-brand-hover"
      >
        Clear filters
      </a>
    </div>
  )
}
