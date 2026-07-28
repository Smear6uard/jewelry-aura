/**
 * components/layout/MobileNav.tsx — the phone drawer.
 *
 * Slides in from the left, full height, white on the cream canvas at
 * --shadow-lg. Categories are accordion rows: tapping the chevron opens
 * the same list the desktop mega menu shows, tapping the label goes
 * straight to the collection. Splitting those two targets matters on a
 * phone — an accordion that swallows the tap you meant as navigation is
 * the most common mobile-menu failure.
 *
 * Every row is 48px and every control is at least 44px wide.
 *
 * Accessibility contract mirrors CartDrawer: role="dialog" +
 * aria-modal, focus moves into the panel on open and is trapped while
 * open, Escape closes, body scroll is locked, and focus returns to the
 * burger (Header owns the trigger ref).
 *
 * A no-JavaScript visitor never reaches this component — see the
 * <noscript> category row in Header.
 */

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Phone, User, X } from 'lucide-react'
import { DURATION, easeApple, easeOutExpo } from '~/lib/motion'
import {
  CATEGORIES,
  FOOTER_SERVICE_LINKS,
  METAL_FACETS,
  STORE,
} from '~/lib/catalog'

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

/** Top-level rows that are not accordions. */
const FLAT_ROWS = [
  { label: 'Moissanite', href: '/collections/moissanite' },
  { label: 'Watch service', href: '/pages/watch-service' },
  { label: 'Custom work', href: '/custom' },
  { label: 'Shop all', href: '/shop' },
]

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    panel?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panel) return
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null)
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null
      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  // Every open starts from the same collapsed state.
  useEffect(() => {
    if (!open) setExpanded(null)
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[68]">
          <motion.button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            className="absolute inset-0 h-full w-full cursor-default bg-ink/35"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.micro, ease: easeApple }}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Shop menu"
            tabIndex={-1}
            className="absolute left-0 top-0 flex h-full w-full max-w-[21rem] flex-col bg-raised text-ink shadow-lg outline-none"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: DURATION.content, ease: easeOutExpo }}
          >
            <header className="flex items-center justify-between border-b border-hairline px-5 py-3">
              <span className="display text-[18px] text-ink">Jewelry Aura</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="-mr-2.5 flex h-11 w-11 items-center justify-center text-ink-muted transition-colors duration-hover ease-apple hover:text-ink"
              >
                <X aria-hidden size={19} strokeWidth={1.5} />
              </button>
            </header>

            <nav
              aria-label="Shop categories"
              className="flex-1 overflow-y-auto"
              data-lenis-prevent
            >
              <ul>
                {CATEGORIES.map((category) => (
                  <li key={category.handle} className="border-b border-hairline">
                    <div className="flex items-stretch">
                      <a
                        href={`/collections/${category.handle}`}
                        className="flex min-h-12 flex-1 items-center px-5 text-[15px] font-medium text-ink"
                      >
                        {category.label}
                      </a>
                      <button
                        type="button"
                        onClick={() =>
                          setExpanded((prev) =>
                            prev === category.handle ? null : category.handle,
                          )
                        }
                        aria-expanded={expanded === category.handle}
                        aria-label={`Show ${category.label} subcategories`}
                        className="flex w-12 items-center justify-center text-ink-muted transition-colors duration-hover ease-apple hover:text-ink"
                      >
                        <motion.span
                          aria-hidden
                          animate={{
                            rotate: expanded === category.handle ? 180 : 0,
                          }}
                          transition={{
                            duration: DURATION.micro,
                            ease: easeApple,
                          }}
                          className="block"
                        >
                          <ChevronDown size={17} strokeWidth={1.5} />
                        </motion.span>
                      </button>
                    </div>

                    <AnimatePresence initial={false}>
                      {expanded === category.handle && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            duration: DURATION.micro,
                            ease: easeOutExpo,
                          }}
                          className="overflow-hidden bg-sunken"
                        >
                          <ul className="px-5 py-2">
                            {category.styles.map((style) => (
                              <li key={style.value}>
                                <a
                                  href={`/collections/${category.handle}?style=${style.value}`}
                                  className="flex min-h-11 items-center text-[14px] text-ink-muted"
                                >
                                  {style.label}
                                </a>
                              </li>
                            ))}
                            {METAL_FACETS.slice(0, 3).map((metal) => (
                              <li key={metal.value}>
                                <a
                                  href={`/collections/${category.handle}?metal=${metal.value}`}
                                  className="flex min-h-11 items-center text-[14px] text-ink-muted"
                                >
                                  {metal.label}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                ))}

                {FLAT_ROWS.map((row) => (
                  <li key={row.href} className="border-b border-hairline">
                    <a
                      href={row.href}
                      className="flex min-h-12 items-center px-5 text-[15px] font-medium text-ink"
                    >
                      {row.label}
                    </a>
                  </li>
                ))}

                <li className="border-b border-hairline">
                  <a
                    href="/collections/sale"
                    className="flex min-h-12 items-center px-5 text-[15px] font-medium text-brand"
                  >
                    Sale
                  </a>
                </li>
              </ul>

              <div className="px-5 py-6">
                <p className="text-[11px] label-wide text-ink-muted">Services</p>
                <ul className="mt-2 flex flex-col">
                  {FOOTER_SERVICE_LINKS.map((link) => (
                    <li key={link.href}>
                      <a
                        href={link.href}
                        className="flex min-h-11 items-center text-[14px] text-ink-muted"
                      >
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* Account and orders sit at the bottom, in the thumb's reach
                and out of the way of the categories people came for. */}
            <footer className="safe-bottom border-t border-hairline px-5 pt-3">
              <a
                href="/pages/orders"
                className="flex min-h-11 items-center gap-2.5 text-[14px] font-medium text-ink"
              >
                <User aria-hidden size={16} strokeWidth={1.5} />
                Account and orders
              </a>
              <a
                href={STORE.phoneHref}
                className="flex min-h-11 items-center gap-2.5 text-[14px] text-ink-muted"
              >
                <Phone aria-hidden size={16} strokeWidth={1.5} />
                {STORE.phone}
              </a>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
