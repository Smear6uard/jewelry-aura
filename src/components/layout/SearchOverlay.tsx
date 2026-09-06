/**
 * components/layout/SearchOverlay.tsx — the search panel behind the
 * header's magnifier (desktop; phones carry a permanent search field).
 *
 * Drops from the top of the viewport with a single input and a short
 * list of popular searches, because an empty search box is a dead end
 * and the suggestions are how most people actually use it.
 *
 * Submitting is a real form navigation to /search?q= — no client-side
 * suggest, no debounced fetch. The results page is server-rendered and
 * cached, so the round trip is fast and the URL is shareable.
 */

import { useEffect, useRef } from 'react'
import { AnimatePresence, m as motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { DURATION, easeApple, easeOutExpo } from '~/lib/motion'
import { BTN_PRIMARY } from '~/lib/ui'

const POPULAR = [
  'Cuban link',
  'Name plate',
  'Moissanite',
  'Tennis chain',
  'Engagement',
  'Cross pendant',
]

interface SearchOverlayProps {
  open: boolean
  onClose: () => void
}

export function SearchOverlay({ open, onClose }: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    // Focus lands in the input; there is nothing else to reach first.
    const timer = window.setTimeout(() => inputRef.current?.focus(), 60)
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.clearTimeout(timer)
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[75]">
          <motion.button
            type="button"
            aria-label="Close search"
            tabIndex={-1}
            className="absolute inset-0 h-full w-full cursor-default bg-velvet/40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.micro, ease: easeApple }}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search"
            className="absolute inset-x-0 top-0 border-b border-hairline-light bg-bone"
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: DURATION.content, ease: easeOutExpo }}
          >
            <div className="mx-auto max-w-[820px] px-5 py-8 md:py-12">
              <form
                action="/search"
                method="get"
                className="flex items-center gap-3 border-b border-ink pb-3"
              >
                <Search
                  aria-hidden
                  size={19}
                  strokeWidth={1.5}
                  className="shrink-0 text-ink"
                />
                <label className="sr-only" htmlFor="overlay-search">
                  Search products
                </label>
                <input
                  ref={inputRef}
                  id="overlay-search"
                  type="search"
                  name="q"
                  placeholder="Search chains, pendants, moissanite…"
                  autoComplete="off"
                  className="w-full bg-transparent text-[18px] text-ink placeholder:text-ink focus:outline-none md:text-[20px]"
                />
                <button type="submit" className={`${BTN_PRIMARY} shrink-0`}>
                  Search
                </button>
              </form>

              <div className="mt-6">
                <p className="text-[11px] label-wide text-ink">
                  Popular searches
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {POPULAR.map((term) => (
                    <li key={term}>
                      <a
                        href={`/search?q=${encodeURIComponent(term)}`}
                        className="inline-flex min-h-11 items-center bg-paper px-4 text-[13px] text-ink transition-colors duration-hover ease-apple hover:bg-bone"
                      >
                        {term}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close search"
              className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center text-ink transition-colors duration-hover ease-apple hover:bg-paper"
            >
              <X aria-hidden size={19} strokeWidth={1.5} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
