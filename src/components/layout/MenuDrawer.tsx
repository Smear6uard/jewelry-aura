/**
 * components/layout/MenuDrawer.tsx — the category menu behind the
 * header's burger trigger.
 *
 * Left-slide drawer listing the shop's seven categories. "Women's" is a
 * disclosure row: it expands in place to reveal the same six
 * categories again, routed to their women's collections
 * (`/collections/womens-<handle>`).
 *
 * Accessibility contract mirrors CartDrawer: role="dialog" +
 * aria-modal, focus moves into the panel on open and is trapped while
 * open, Escape closes, and focus returns to the burger trigger on
 * close (Header owns the trigger ref).
 *
 * Category links are plain anchors — same idiom as the header nav —
 * so each click is a full SSR'd navigation and the drawer needs no
 * close-on-route-change plumbing.
 */

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { DURATION, easeApple, easeOutExpo } from '~/lib/motion'

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

// The six base categories. "Women's" reuses this list for its
// submenu — the handles gain a `womens-` prefix. Collections are
// curated in the Shopify admin under these exact handles.
const CATEGORIES = [
  { label: 'Chains', handle: 'chains' },
  { label: 'Pendants', handle: 'pendants' },
  { label: 'Earrings', handle: 'earrings' },
  { label: 'Rings', handle: 'rings' },
  { label: 'Bracelets', handle: 'bracelets' },
  { label: 'Moissanite', handle: 'moissanite' },
] as const

interface MenuDrawerProps {
  open: boolean
  onClose: () => void
}

export function MenuDrawer({ open, onClose }: MenuDrawerProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [womensOpen, setWomensOpen] = useState(false)

  // Escape + focus trap while open; focus moves INTO the dialog on
  // open. Same contract as CartDrawer.
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

  // The women's disclosure resets whenever the drawer closes so every
  // open starts from the same seven-row state.
  useEffect(() => {
    if (!open) setWomensOpen(false)
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60]">
          <motion.button
            type="button"
            aria-label="Close menu"
            tabIndex={-1}
            className="absolute inset-0 h-full w-full cursor-default bg-forest/70"
            style={{ backdropFilter: 'blur(2px)' }}
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
            aria-label="Shop categories"
            tabIndex={-1}
            className="absolute left-0 top-0 flex h-full w-full max-w-md flex-col bg-forest text-cream shadow-2xl outline-none"
            style={{
              borderRight: '0.5px solid rgba(196, 168, 117, 0.25)',
            }}
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: DURATION.content, ease: easeOutExpo }}
          >
            <header
              className="flex items-center justify-between border-b border-champagne/15 px-6 py-5"
              style={{ borderBottomWidth: '0.5px' }}
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-champagne">
                Browse
              </p>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-cream-muted/30 p-2 text-cream-muted transition-colors duration-hover ease-apple hover:border-champagne hover:text-champagne"
                style={{ borderWidth: '0.5px' }}
                aria-label="Close menu"
              >
                <svg
                  aria-hidden
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M2 2l10 10M12 2L2 12" />
                </svg>
              </button>
            </header>

            {/* data-lenis-prevent: the app-wide smooth-wheel Lenis would
                otherwise swallow wheel events over this nested scroller. */}
            <nav
              aria-label="Categories"
              className="flex-1 overflow-y-auto px-6 py-10"
              data-lenis-prevent
            >
              <motion.ul
                initial="closed"
                animate="open"
                variants={{
                  open: {
                    transition: { staggerChildren: 0.05, delayChildren: 0.1 },
                  },
                  closed: {},
                }}
              >
                {CATEGORIES.map((category, index) => (
                  <CategoryRow key={category.handle} index={index}>
                    <a
                      href={`/collections/${category.handle}`}
                      className="group flex items-baseline gap-4 py-4"
                    >
                      <RowIndex index={index} />
                      <RowLabel>{category.label}</RowLabel>
                    </a>
                  </CategoryRow>
                ))}

                {/* Women's — expands the same six categories in place. */}
                <CategoryRow index={CATEGORIES.length}>
                  <button
                    type="button"
                    onClick={() => setWomensOpen((prev) => !prev)}
                    aria-expanded={womensOpen}
                    className="group flex w-full items-baseline gap-4 py-4 text-left"
                  >
                    <RowIndex index={CATEGORIES.length} />
                    <RowLabel>Women&rsquo;s</RowLabel>
                    <motion.span
                      aria-hidden
                      animate={{ rotate: womensOpen ? 45 : 0 }}
                      transition={{
                        duration: DURATION.micro,
                        ease: easeApple,
                      }}
                      className="ml-auto self-center text-champagne"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 14 14"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                      >
                        <path d="M7 1v12M1 7h12" />
                      </svg>
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {womensOpen && (
                      <motion.ul
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{
                          duration: DURATION.content,
                          ease: easeOutExpo,
                        }}
                        className="overflow-hidden"
                      >
                        {CATEGORIES.map((category) => (
                          <li key={category.handle}>
                            <a
                              href={`/collections/womens-${category.handle}`}
                              className="group flex items-baseline gap-4 border-l border-champagne/20 py-3 pl-6"
                              style={{ borderLeftWidth: '0.5px' }}
                            >
                              <span className="font-display text-xl leading-none text-cream-muted transition-colors duration-hover ease-apple group-hover:text-champagne">
                                {category.label}
                              </span>
                            </a>
                          </li>
                        ))}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </CategoryRow>
              </motion.ul>
            </nav>

            <footer
              className="border-t border-champagne/15 px-6 py-6"
              style={{ borderTopWidth: '0.5px' }}
            >
              <a
                href="/shop"
                className="group inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.22em] text-champagne"
              >
                <span className="relative">
                  Shop everything
                  <span
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 -bottom-1 origin-left scale-x-0 bg-champagne transition-transform duration-hover ease-apple group-hover:scale-x-100"
                    style={{ height: '0.5px' }}
                  />
                </span>
                <span
                  aria-hidden
                  className="transition-transform duration-hover ease-apple group-hover:translate-x-1"
                >
                  &rarr;
                </span>
              </a>
            </footer>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

/** One staggered row in the drawer's waterfall reveal. */
function CategoryRow({
  index,
  children,
}: {
  index: number
  children: React.ReactNode
}) {
  return (
    <motion.li
      custom={index}
      variants={{
        open: { opacity: 1, y: 0 },
        closed: { opacity: 0, y: 20 },
      }}
      transition={{ duration: DURATION.content, ease: easeOutExpo }}
      className="border-b border-champagne/10"
      style={{ borderBottomWidth: '0.5px' }}
    >
      {children}
    </motion.li>
  )
}

function RowIndex({ index }: { index: number }) {
  return (
    <span
      aria-hidden
      className="w-6 shrink-0 font-mono text-[10px] tracking-[0.18em] text-cream-muted/60"
    >
      {String(index + 1).padStart(2, '0')}
    </span>
  )
}

function RowLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-display text-3xl leading-none text-cream transition-colors duration-hover ease-apple group-hover:text-champagne">
      {children}
    </span>
  )
}
