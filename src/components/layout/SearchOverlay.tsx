/**
 * components/layout/SearchOverlay.tsx — the search panel behind the
 * header's magnifier.
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
import { AnimatePresence, motion } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { DURATION, easeApple, easeOutExpo } from '~/lib/motion'

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
            className="absolute inset-0 h-full w-full cursor-default bg-sunken/85"
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
            className="absolute inset-x-0 top-0 border-b border-hairline bg-raised"
            initial={{ y: '-100%' }}
            animate={{ y: 0 }}
            exit={{ y: '-100%' }}
            transition={{ duration: DURATION.content, ease: easeOutExpo }}
          >
            <div className="mx-auto max-w-[820px] px-5 py-8 md:py-12">
              <form action="/search" method="get" className="flex items-center gap-3 border-b border-cream-subtle/40 pb-3">
                <Search
                  aria-hidden
                  size={18}
                  strokeWidth={1.4}
                  className="shrink-0 text-cream-muted"
                />
                <input
                  ref={inputRef}
                  type="search"
                  name="q"
                  placeholder="Search chains, pendants, moissanite…"
                  autoComplete="off"
                  aria-label="Search products"
                  className="w-full bg-transparent text-[17px] text-cream placeholder:text-cream-subtle focus:outline-none md:text-[20px]"
                />
                <button
                  type="submit"
                  className="shrink-0 bg-brand px-4 py-2 text-[11px] label text-cream transition-colors duration-hover ease-apple hover:bg-brand-hover"
                >
                  Search
                </button>
              </form>

              <div className="mt-6">
                <p className="text-[11px] label-wide text-cream-subtle">
                  Popular searches
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {POPULAR.map((term) => (
                    <li key={term}>
                      <a
                        href={`/search?q=${encodeURIComponent(term)}`}
                        className="inline-flex border border-hairline px-3 py-1.5 text-[12px] text-cream-muted transition-colors duration-hover ease-apple hover:border-cream-subtle hover:text-cream"
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
              className="absolute right-4 top-4 p-2 text-cream-muted transition-colors duration-hover ease-apple hover:text-cream"
            >
              <X aria-hidden size={18} strokeWidth={1.4} />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
