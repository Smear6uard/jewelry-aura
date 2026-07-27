/**
 * components/layout/MobileNav.tsx — the phone drawer.
 *
 * Slides in from the left. Categories are accordion rows: tapping the
 * chevron opens the same style list the desktop mega menu shows,
 * tapping the label goes straight to the collection. Splitting those
 * two targets matters on a phone — an accordion that swallows the tap
 * you meant as navigation is the most common mobile-menu failure.
 *
 * Accessibility contract mirrors CartDrawer: role="dialog" +
 * aria-modal, focus moves into the panel on open and is trapped while
 * open, Escape closes, and focus returns to the burger (Header owns
 * the trigger ref).
 */

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Phone, X } from 'lucide-react'
import { DURATION, easeApple, easeOutExpo } from '~/lib/motion'
import {
  CATEGORIES,
  FOOTER_SERVICE_LINKS,
  METAL_FACETS,
  STORE,
} from '~/lib/catalog'

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

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
            className="absolute inset-0 h-full w-full cursor-default bg-sunken/80"
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
            className="absolute left-0 top-0 flex h-full w-full max-w-[21rem] flex-col border-r border-hairline bg-raised text-cream outline-none"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: DURATION.content, ease: easeOutExpo }}
          >
            <header className="flex items-center justify-between border-b border-hairline px-5 py-4">
              <span className="font-display text-[17px] text-cream">
                Jewelry Aura
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="p-1.5 text-cream-muted transition-colors duration-hover ease-apple hover:text-cream"
              >
                <X aria-hidden size={18} strokeWidth={1.4} />
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
                        className="flex-1 px-5 py-4 text-[15px] font-medium text-cream"
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
                        className="px-5 text-cream-muted transition-colors duration-hover ease-apple hover:text-cream"
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
                          <ChevronDown size={16} strokeWidth={1.4} />
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
                          className="overflow-hidden bg-base"
                        >
                          <ul className="px-5 py-3">
                            {category.styles.map((style) => (
                              <li key={style.value}>
                                <a
                                  href={`/collections/${category.handle}?style=${style.value}`}
                                  className="block py-2 text-[14px] text-cream-muted"
                                >
                                  {style.label}
                                </a>
                              </li>
                            ))}
                            {METAL_FACETS.slice(0, 3).map((metal) => (
                              <li key={metal.value}>
                                <a
                                  href={`/collections/${category.handle}?metal=${metal.value}`}
                                  className="block py-2 text-[14px] text-cream-muted"
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

                <li className="border-b border-hairline">
                  <a
                    href="/collections/moissanite"
                    className="block px-5 py-4 text-[15px] font-medium text-cream"
                  >
                    Moissanite
                  </a>
                </li>
                <li className="border-b border-hairline">
                  <a
                    href="/custom"
                    className="block px-5 py-4 text-[15px] font-medium text-cream"
                  >
                    Custom work
                  </a>
                </li>
                <li className="border-b border-hairline">
                  <a
                    href="/collections/sale"
                    className="block px-5 py-4 text-[15px] font-medium"
                    style={{ color: '#C4A875' }}
                  >
                    Sale
                  </a>
                </li>
                <li className="border-b border-hairline">
                  <a
                    href="/shop"
                    className="block px-5 py-4 text-[15px] font-medium text-cream"
                  >
                    Shop all
                  </a>
                </li>
              </ul>

              <div className="px-5 py-6">
                <p className="text-[11px] label-wide text-cream-subtle">
                  Services
                </p>
                <ul className="mt-3 flex flex-col gap-2.5">
                  {FOOTER_SERVICE_LINKS.map((link) => (
                    <li key={link.href}>
                      <a href={link.href} className="text-[14px] text-cream-muted">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            <footer className="border-t border-hairline px-5 py-4">
              <a
                href={STORE.phoneHref}
                className="flex items-center justify-center gap-2 bg-brand px-5 py-3.5 text-[12px] label text-cream transition-colors duration-hover ease-apple hover:bg-brand-hover"
              >
                <Phone aria-hidden size={14} strokeWidth={1.5} />
                Call {STORE.phone}
              </a>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
