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

  // 44px on every control — pagination on a phone is thumbed, not clicked.
  const arrow =
    'inline-flex min-h-11 items-center gap-1.5 px-2 text-[12px] label transition-colors duration-hover ease-apple motion-reduce:transition-none'

  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex items-center justify-between gap-4 border-t border-hairline pt-5 md:mt-16"
    >
      {atStart ? (
        <span aria-disabled="true" className={`${arrow} text-ink-subtle`}>
          <ChevronLeft aria-hidden size={15} strokeWidth={1.6} /> Prev
        </span>
      ) : (
        <a
          href={hrefFor(page - 1)}
          rel="prev"
          className={`${arrow} text-ink-muted hover:text-ink`}
        >
          <ChevronLeft aria-hidden size={15} strokeWidth={1.6} /> Prev
        </a>
      )}

      <ol className="flex items-center gap-1">
        {pages.map((n) =>
          n === page ? (
            <li key={n}>
              <span
                aria-current="page"
                className="inline-flex h-11 w-11 items-center justify-center bg-brand text-[13px] tabular-nums text-cream"
              >
                {n}
              </span>
            </li>
          ) : (
            <li key={n}>
              <a
                href={hrefFor(n)}
                aria-label={`Page ${n}`}
                className="inline-flex h-11 w-11 items-center justify-center bg-raised text-[13px] tabular-nums text-ink-muted shadow-sm transition-[box-shadow,color] duration-hover ease-apple hover:text-ink hover:shadow-md motion-reduce:transition-none"
              >
                {n}
              </a>
            </li>
          ),
        )}
      </ol>

      {atEnd ? (
        <span aria-disabled="true" className={`${arrow} text-ink-subtle`}>
          Next <ChevronRight aria-hidden size={15} strokeWidth={1.6} />
        </span>
      ) : (
        <a
          href={hrefFor(page + 1)}
          rel="next"
          className={`${arrow} text-ink-muted hover:text-ink`}
        >
          Next <ChevronRight aria-hidden size={15} strokeWidth={1.6} />
        </a>
      )}
    </nav>
  )
}
