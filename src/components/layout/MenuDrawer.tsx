/**
 * components/layout/MenuDrawer.tsx — the category menu, at every width.
 *
 * The three-line burger in the header corner opens this on a phone and
 * on a 27" monitor alike. That is the point: one menu, one order, one
 * thing to learn. The desktop nav row above it is a shortcut for people
 * who already know what they want, not a second, differently-worded
 * taxonomy.
 *
 * Slides in from the left, full height, bone on the paper canvas behind
 * a hairline right edge.
 *
 * THE SIX DOORS
 * -------------
 *   Chains · Pendants · Earrings · Rings · Bracelets · Women's
 *
 * The first five are accordion rows: tapping the label goes straight to
 * the collection, tapping the chevron opens its styles and metals.
 * Splitting those two targets matters on a phone — an accordion that
 * swallows the tap you meant as navigation is the most common
 * mobile-menu failure.
 *
 * Women's is the exception, and deliberately so. It is not a sixth case
 * of merchandise sitting beside the other five; it is the same five,
 * cut for women. So the whole row is the disclosure: open it and the
 * five categories are offered again, routed to their women's
 * collections. Re-asking the same question one level down is the
 * clearest way to say "everything above, for her" without writing it.
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
  MOISSANITE,
  STORE,
  WOMENS,
} from '~/lib/catalog'

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

/** Top-level rows below the six doors — destinations, not categories. */
const FLAT_ROWS = [
  { label: MOISSANITE.label, href: MOISSANITE.href },
  { label: 'Custom work', href: '/custom' },
  { label: 'Watch service', href: '/pages/watch-service' },
  { label: 'Shop all', href: '/shop' },
]

const ROW_LABEL =
  'flex min-h-12 flex-1 items-center px-5 text-[15px] font-medium text-ink'
// Split so the maroon variant can replace the colour rather than append
// it: two text-* utilities on one element resolve by stylesheet order,
// not by class-string order, and ink-muted wins that race.
const SUB_LINK_BASE =
  'flex min-h-11 items-center text-[14px] transition-colors duration-hover ease-apple motion-reduce:transition-none'
const SUB_LINK = `${SUB_LINK_BASE} text-ink hover:text-maroon`
const SUB_LINK_BRAND = `${SUB_LINK_BASE} text-maroon hover:text-ink`

interface MenuDrawerProps {
  open: boolean
  onClose: () => void
}

export function MenuDrawer({ open, onClose }: MenuDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const toggle = (key: string) =>
    setExpanded((prev) => (prev === key ? null : key))

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
            className="absolute inset-0 h-full w-full cursor-default bg-velvet/40"
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
            className="absolute left-0 top-0 flex h-full w-full max-w-[21rem] flex-col border-r border-hairline-light bg-bone text-ink outline-none sm:max-w-[23rem]"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: DURATION.content, ease: easeOutExpo }}
          >
            <header className="flex items-center justify-between border-b border-hairline-light px-5 py-3">
              <span className="display text-[18px] text-ink">Jewelry Aura</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="-mr-2.5 flex h-11 w-11 items-center justify-center text-ink transition-colors duration-hover ease-apple hover:text-maroon"
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
                  <li key={category.handle} className="border-b border-hairline-light">
                    <div className="flex items-stretch">
                      <a
                        href={`/collections/${category.handle}`}
                        className={ROW_LABEL}
                      >
                        {category.label}
                      </a>
                      <DisclosureButton
                        expanded={expanded === category.handle}
                        onClick={() => toggle(category.handle)}
                        label={`Show ${category.label} subcategories`}
                      />
                    </div>

                    <Disclosure open={expanded === category.handle}>
                      <ul className="px-5 py-2">
                        {category.styles.map((style) => (
                          <li key={style.value}>
                            <a
                              href={`/collections/${category.handle}?style=${style.value}`}
                              className={SUB_LINK}
                            >
                              {style.label}
                            </a>
                          </li>
                        ))}
                        {METAL_FACETS.slice(0, 3).map((metal) => (
                          <li key={metal.value}>
                            <a
                              href={`/collections/${category.handle}?metal=${metal.value}`}
                              className={SUB_LINK}
                            >
                              {metal.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </Disclosure>
                  </li>
                ))}

                {/*
                 * Women's: the whole row is the disclosure, because the
                 * answer to "what's in Women's" is the five rows above
                 * this one, and offering them again is the answer.
                 */}
                <li className="border-b border-hairline-light">
                  <button
                    type="button"
                    onClick={() => toggle(WOMENS.handle)}
                    aria-expanded={expanded === WOMENS.handle}
                    className="flex w-full items-stretch text-left"
                  >
                    <span className={ROW_LABEL}>{WOMENS.label}</span>
                    <span className="flex w-12 items-center justify-center text-ink">
                      <Chevron open={expanded === WOMENS.handle} />
                    </span>
                  </button>

                  <Disclosure open={expanded === WOMENS.handle}>
                    <ul className="px-5 py-2">
                      {WOMENS.links.map((link) => (
                        <li key={link.href}>
                          <a href={link.href} className={SUB_LINK}>
                            {link.label}
                          </a>
                        </li>
                      ))}
                      <li>
                        <a href={WOMENS.href} className={SUB_LINK_BRAND}>
                          All women’s
                        </a>
                      </li>
                    </ul>
                  </Disclosure>
                </li>

                {FLAT_ROWS.map((row) => (
                  <li key={row.href} className="border-b border-hairline-light">
                    <a href={row.href} className={ROW_LABEL}>
                      {row.label}
                    </a>
                  </li>
                ))}

                <li className="border-b border-hairline-light">
                  <a
                    href="/collections/sale"
                    className="flex min-h-12 items-center px-5 text-[15px] font-medium text-maroon"
                  >
                    Sale
                  </a>
                </li>
              </ul>

              <div className="px-5 py-6">
                <p className="text-[11px] label-wide text-ink">Services</p>
                <ul className="mt-2 flex flex-col">
                  {FOOTER_SERVICE_LINKS.map((link) => (
                    <li key={link.href}>
                      <a href={link.href} className={SUB_LINK}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>

            {/* Account and orders sit at the bottom, in the thumb's reach
                and out of the way of the categories people came for. */}
            <footer className="safe-bottom border-t border-hairline-light px-5 pt-3">
              <a
                href="/pages/orders"
                className="flex min-h-11 items-center gap-2.5 text-[14px] font-medium text-ink"
              >
                <User aria-hidden size={16} strokeWidth={1.5} />
                Account and orders
              </a>
              <a
                href={STORE.phoneHref}
                className="flex min-h-11 items-center gap-2.5 text-[14px] text-ink"
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

function Chevron({ open }: { open: boolean }) {
  return (
    <motion.span
      aria-hidden
      animate={{ rotate: open ? 180 : 0 }}
      transition={{ duration: DURATION.micro, ease: easeApple }}
      className="block"
    >
      <ChevronDown size={17} strokeWidth={1.5} />
    </motion.span>
  )
}

function DisclosureButton({
  expanded,
  onClick,
  label,
}: {
  expanded: boolean
  onClick: () => void
  label: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      aria-label={label}
      className="flex w-12 items-center justify-center text-ink transition-colors duration-hover ease-apple hover:text-maroon"
    >
      <Chevron open={expanded} />
    </button>
  )
}

function Disclosure({
  open,
  children,
}: {
  open: boolean
  children: React.ReactNode
}) {
  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: DURATION.micro, ease: easeOutExpo }}
          className="overflow-hidden bg-bone"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
