/**
 * components/commerce/SortSelect.tsx — listing sort, in two shapes.
 *
 * SortSelect (desktop) is a native <select>. It gets the platform's own
 * keyboard handling and screen-reader support for free — none of which a
 * custom dropdown gets without work, and none of which a shopper thanks
 * you for reimplementing.
 *
 * SortSheet (phone) is a bottom sheet of real links, matching the Filter
 * control beside it. The native picker would also work here, but pairing
 * a sheet with a wheel picker makes the two toolbar buttons behave like
 * different kinds of control, and the sheet's rows are 44px links that
 * survive with JavaScript off.
 *
 * Either way, choosing a value navigates to the same listing with
 * `?sort=` applied, so a sorted listing is a shareable URL.
 */

import { useRef, useState } from 'react'
import { ArrowDownUp, Check, ChevronDown } from 'lucide-react'
import { BottomSheet } from '~/components/ui/BottomSheet'
import { SORT_OPTIONS, type SortKey } from '~/lib/shopify/facets'

interface SortProps {
  value: SortKey
  hrefFor: (sort: SortKey) => string
}

/** Desktop. Hidden below md — the sheet covers that breakpoint. */
export function SortSelect({ value, hrefFor }: SortProps) {
  return (
    <label className="relative hidden items-center gap-2 md:inline-flex">
      <span className="text-[11px] label text-ink">Sort</span>
      <span className="relative">
        <select
          value={value}
          onChange={(event) => {
            window.location.assign(hrefFor(event.target.value as SortKey))
          }}
          className="cursor-pointer appearance-none bg-bone py-2.5 pl-3.5 pr-9 text-[14px] text-ink border border-hairline-light transition-colors duration-hover ease-apple focus:outline-none motion-reduce:transition-none"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          aria-hidden
          size={14}
          strokeWidth={1.6}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink"
        />
      </span>
    </label>
  )
}

/** Phone. A bottom sheet of links, matching the Filter control. */
export function SortSheet({ value, hrefFor }: SortProps) {
  const [open, setOpen] = useState(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const active = SORT_OPTIONS.find((option) => option.value === value)

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
        <ArrowDownUp aria-hidden size={15} strokeWidth={1.5} />
        Sort
      </button>

      <BottomSheet
        open={open}
        onClose={() => {
          setOpen(false)
          triggerRef.current?.focus()
        }}
        title="Sort"
      >
        <ul className="flex flex-col">
          {SORT_OPTIONS.map((option) => {
            const selected = option.value === value
            return (
              <li key={option.value} className="border-b border-hairline-light last:border-b-0">
                <a
                  href={hrefFor(option.value)}
                  aria-current={selected ? 'true' : undefined}
                  className={`flex min-h-12 items-center justify-between gap-3 text-[15px] ${
                    selected ? 'font-medium text-ink' : 'text-ink'
                  }`}
                >
                  {option.label}
                  {selected && (
                    <Check
                      aria-hidden
                      size={17}
                      strokeWidth={1.8}
                      className="shrink-0 text-ink"
                    />
                  )}
                </a>
              </li>
            )
          })}
        </ul>
        <p className="mt-4 text-[12px] text-ink">
          Currently sorted by {active?.label.toLowerCase() ?? 'featured'}.
        </p>
      </BottomSheet>
    </div>
  )
}
