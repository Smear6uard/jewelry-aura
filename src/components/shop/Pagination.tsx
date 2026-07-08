/**
 * components/shop/Pagination.tsx — crawlable numbered pagination.
 *
 * Real anchors (indexable, jumpable). The current page is a non-link
 * filled state; prev/next dim at the boundaries instead of disappearing,
 * so the control's geometry never shifts between pages. Page 1 links to
 * the clean URL (canonical hygiene).
 */

interface PaginationProps {
  /** Clean base path, e.g. "/collections/chains". */
  basePath: string
  page: number
  totalPages: number
}

function pageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}?page=${page}`
}

export function Pagination({ basePath, page, totalPages }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const atStart = page <= 1
  const atEnd = page >= totalPages

  const arrowClass =
    'inline-flex h-10 items-center gap-2 px-2 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors duration-hover ease-apple'

  return (
    <nav
      aria-label="Pagination"
      className="mt-20 flex items-center justify-between gap-6 md:mt-28"
    >
      {atStart ? (
        <span aria-disabled="true" className={`${arrowClass} text-cream-muted/30`}>
          <span aria-hidden>&larr;</span> Prev
        </span>
      ) : (
        <a
          href={pageHref(basePath, page - 1)}
          rel="prev"
          className={`${arrowClass} text-cream-muted hover:text-cream`}
        >
          <span aria-hidden>&larr;</span> Prev
        </a>
      )}

      <ol className="flex items-center gap-2">
        {pages.map((n) =>
          n === page ? (
            <li key={n}>
              <span
                aria-current="page"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-champagne font-mono text-[12px] text-forest"
              >
                {n}
              </span>
            </li>
          ) : (
            <li key={n}>
              <a
                href={pageHref(basePath, n)}
                aria-label={`Page ${n}`}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-champagne/25 font-mono text-[12px] text-cream-muted transition-colors duration-hover ease-apple hover:border-champagne/70 hover:text-cream active:scale-[0.98]"
                style={{ borderWidth: '0.5px' }}
              >
                {n}
              </a>
            </li>
          ),
        )}
      </ol>

      {atEnd ? (
        <span aria-disabled="true" className={`${arrowClass} text-cream-muted/30`}>
          Next <span aria-hidden>&rarr;</span>
        </span>
      ) : (
        <a
          href={pageHref(basePath, page + 1)}
          rel="next"
          className={`${arrowClass} text-cream-muted hover:text-cream`}
        >
          Next <span aria-hidden>&rarr;</span>
        </a>
      )}
    </nav>
  )
}
