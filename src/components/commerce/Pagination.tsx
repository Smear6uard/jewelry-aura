/**
 * components/commerce/Pagination.tsx — crawlable numbered pagination.
 *
 * Real anchors, so pages are indexable and jumpable. The current page
 * is a filled non-link; prev/next dim at the boundaries instead of
 * disappearing, so the control's geometry never shifts between pages.
 *
 * `hrefFor` is supplied by the route, which knows how to preserve the
 * active facets — paginating must not silently drop the filter the
 * shopper just applied.
 */

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface PaginationProps {
  page: number
  totalPages: number
  hrefFor: (page: number) => string
}

export function Pagination({ page, totalPages, hrefFor }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const atStart = page <= 1
  const atEnd = page >= totalPages

  const arrow =
    'inline-flex h-9 items-center gap-1.5 px-2 text-[11px] label transition-colors duration-hover ease-apple'

  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex items-center justify-between gap-4 border-t border-hairline pt-6 md:mt-16"
    >
      {atStart ? (
        <span aria-disabled="true" className={`${arrow} text-cream-subtle/40`}>
          <ChevronLeft aria-hidden size={14} strokeWidth={1.5} /> Prev
        </span>
      ) : (
        <a
          href={hrefFor(page - 1)}
          rel="prev"
          className={`${arrow} text-cream-muted hover:text-cream`}
        >
          <ChevronLeft aria-hidden size={14} strokeWidth={1.5} /> Prev
        </a>
      )}

      <ol className="flex items-center gap-1">
        {pages.map((n) =>
          n === page ? (
            <li key={n}>
              <span
                aria-current="page"
                className="inline-flex h-9 w-9 items-center justify-center bg-brand text-[12px] tabular-nums text-cream"
              >
                {n}
              </span>
            </li>
          ) : (
            <li key={n}>
              <a
                href={hrefFor(n)}
                aria-label={`Page ${n}`}
                className="inline-flex h-9 w-9 items-center justify-center border border-hairline text-[12px] tabular-nums text-cream-muted transition-colors duration-hover ease-apple hover:border-cream-subtle hover:text-cream"
              >
                {n}
              </a>
            </li>
          ),
        )}
      </ol>

      {atEnd ? (
        <span aria-disabled="true" className={`${arrow} text-cream-subtle/40`}>
          Next <ChevronRight aria-hidden size={14} strokeWidth={1.5} />
        </span>
      ) : (
        <a
          href={hrefFor(page + 1)}
          rel="next"
          className={`${arrow} text-cream-muted hover:text-cream`}
        >
          Next <ChevronRight aria-hidden size={14} strokeWidth={1.5} />
        </a>
      )}
    </nav>
  )
}
