/**
 * components/commerce/SortSelect.tsx — listing sort control.
 *
 * A native <select>. It gets the platform's own keyboard handling, the
 * iOS wheel picker on phones, and screen-reader support for free —
 * none of which a custom dropdown gets without work, and none of which
 * a shopper thanks you for reimplementing.
 *
 * Changing the value navigates to the same listing with `?sort=`
 * applied, so a sorted listing is a shareable URL.
 */

import { ChevronDown } from 'lucide-react'
import { SORT_OPTIONS, type SortKey } from '~/lib/shopify/facets'

interface SortSelectProps {
  value: SortKey
  hrefFor: (sort: SortKey) => string
}

export function SortSelect({ value, hrefFor }: SortSelectProps) {
  return (
    <label className="relative inline-flex items-center gap-2">
      <span className="text-[11px] label text-cream-subtle">Sort</span>
      <span className="relative">
        <select
          value={value}
          onChange={(event) => {
            window.location.assign(hrefFor(event.target.value as SortKey))
          }}
          className="cursor-pointer appearance-none border border-hairline bg-transparent py-2 pl-3 pr-8 text-[12px] text-cream transition-colors duration-hover ease-apple hover:border-cream-subtle"
        >
          {SORT_OPTIONS.map((option) => (
            <option
              key={option.value}
              value={option.value}
              className="bg-raised text-cream"
            >
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          size={13}
          strokeWidth={1.5}
          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-cream-muted"
        />
      </span>
    </label>
  )
}
