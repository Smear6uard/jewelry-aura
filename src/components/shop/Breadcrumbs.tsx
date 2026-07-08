/**
 * components/shop/Breadcrumbs.tsx — visible breadcrumb trail, fed by the
 * same `BreadcrumbItem[]` shape the routes pass to `breadcrumbJsonLd`,
 * so the DOM and the structured data can't drift apart.
 */

import type { BreadcrumbItem } from '~/lib/seo'

interface BreadcrumbsProps {
  /** Full trail; the last item renders as the current (non-link) crumb. */
  items: ReadonlyArray<BreadcrumbItem>
  className?: string
}

export function Breadcrumbs({ items, className }: BreadcrumbsProps) {
  const last = items.length - 1
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-cream-muted">
        {items.map((item, index) => (
          <li key={item.path} className="flex items-center gap-3">
            {index > 0 && (
              <span aria-hidden className="text-champagne/60">
                /
              </span>
            )}
            {index === last ? (
              <span className="text-champagne">{item.name}</span>
            ) : (
              <a
                href={item.path}
                className="transition-colors duration-hover ease-apple hover:text-cream"
              >
                {item.name}
              </a>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
