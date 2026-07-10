/**
 * components/layout/Header.tsx — global persistent site header
 *
 * Two visual states keyed off the hero section's exit:
 *   • At rest (hero still on screen): fully transparent, sits over the
 *     photograph. No background, no blur, no border.
 *   • Scrolled (hero has fully exited the viewport top): forest-green
 *     @ 92% with backdrop blur, 0.5px champagne hairline along the
 *     bottom, and tighter vertical padding so the surface feels
 *     lower-profile once it's no longer over the photograph.
 *
 * Trigger mechanism:
 *   The hero renders a 1px sentinel at its bottom edge with the
 *   attribute `[data-hero-end]`. On every Lenis scroll tick we read
 *   that element's bounding rect — when its top crosses ≤ 0 the
 *   header flips to scrolled state. This is the "after the hero
 *   releases" trigger; it adapts cleanly when the hero's height
 *   changes (e.g. from a 150svh pinned section to the static
 *   reduced-motion fallback) without needing a hard-coded pixel
 *   threshold. We subscribe to Lenis directly rather than to
 *   `window.scroll` so the read happens in lockstep with the same
 *   smoothed source the rest of the page reads from.
 *
 * Mobile: nav links collapse off-screen (md-and-up only). Logo and
 * the "Book consultation" CTA remain so the primary action is always
 * one tap away. The burger in the corner (all breakpoints) opens the
 * category drawer (MenuDrawer) — chains through women's.
 */

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { DURATION, easeApple } from '~/lib/motion'
import { useLenis } from '~/lib/lenis'
import { useSmoothScrollTo } from '~/lib/scroll-to'
import { useCart } from '~/components/shop/CartProvider'
import { MenuDrawer } from '~/components/layout/MenuDrawer'

// "Custom" routes to the Visit section (same as every other commission
// CTA on the site) — there's no on-site customisation flow to land on,
// and the consultation funnel lives at #visit. The label stays
// aspirational; only the destination is consolidated.
// Hrefs are root-anchored so the same header works off the homepage:
// on `/` the browser treats `/#visit` as a same-document hash (the Lenis
// smooth-scroll handler still intercepts it); on `/shop` and other routes
// it becomes a real navigation back to the homepage section.
const NAV_LINKS = [
  { label: 'Shop', href: '/shop' },
  { label: 'Services', href: '/#services' },
  { label: 'Custom', href: '/#visit' },
  { label: 'Visit', href: '/#visit' },
] as const

interface HeaderProps {
  /**
   * Pages without the hero photograph (shop, collections, PDPs) render the
   * header permanently in its scrolled/solid state — there is no
   * `[data-hero-end]` sentinel to key off and no image to sit over.
   */
  solid?: boolean
}

export function Header({ solid = false }: HeaderProps) {
  const lenis = useLenis()
  const [scrolled, setScrolled] = useState(solid)
  const [menuOpen, setMenuOpen] = useState(false)
  const burgerRef = useRef<HTMLButtonElement>(null)
  const onVisitClick = useSmoothScrollTo('visit')

  const closeMenu = () => {
    setMenuOpen(false)
    // Focus returns to the trigger so keyboard users don't drop to body.
    burgerRef.current?.focus()
  }

  useEffect(() => {
    if (solid || !lenis) return

    // The hero renders different sentinels per breakpoint (one
    // inside the desktop pinned wrapper, one inside the mobile
    // photograph). Both share the `[data-hero-end]` attribute and
    // both exist in the DOM at all times — the inactive one is
    // hidden via `display:none` on its branch. We pick the one
    // that has a non-zero bounding box (i.e., the rendered branch).
    //
    // We re-query each tick rather than caching, so a hero that
    // mounts after the header (or remounts on hot-reload, or swaps
    // branches on a viewport resize) is picked up on the next
    // scroll event. Querying an attribute selector is cheap.
    const check = () => {
      const sentinels = document.querySelectorAll<HTMLElement>('[data-hero-end]')
      let active: HTMLElement | null = null
      for (const el of sentinels) {
        // offsetParent is null when the element (or any ancestor)
        // is `display:none`. Faster than reading getBoundingClientRect
        // and discriminates the rendered branch reliably.
        if (el.offsetParent !== null) {
          active = el
          break
        }
      }
      if (!active) {
        setScrolled(false)
        return
      }
      // rect.top is viewport-relative. Sentinel ≤ 0 means the hero's
      // bottom edge has crossed the viewport top — user has passed
      // the photograph. getBoundingClientRect on a 1px, never-animated
      // element doesn't trigger layout.
      const passed = active.getBoundingClientRect().top <= 0
      setScrolled((prev) => (prev === passed ? prev : passed))
    }

    // Seed once on mount (deep links / refreshes mid-page).
    check()

    const onScroll = () => check()
    lenis.on('scroll', onScroll)
    // Backstop for any scroll that bypasses Lenis (programmatic
    // window.scrollTo, anchor navigation, devtools).
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      lenis.off('scroll', onScroll)
      window.removeEventListener('scroll', onScroll)
    }
  }, [lenis, solid])

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <motion.div
        // Solid-mode pages must render already-scrolled — an unconditional
        // "top" initial would flash a transparent header on every mount.
        initial={solid ? 'scrolled' : 'top'}
        animate={scrolled ? 'scrolled' : 'top'}
        variants={{
          top: {
            backgroundColor: 'rgba(20, 38, 31, 0)',
            backdropFilter: 'blur(0px) saturate(100%)',
            borderColor: 'rgba(196, 168, 117, 0)',
            paddingTop: 24,
            paddingBottom: 24,
          },
          scrolled: {
            backgroundColor: 'rgba(20, 38, 31, 0.92)',
            backdropFilter: 'blur(16px) saturate(140%)',
            borderColor: 'rgba(196, 168, 117, 0.2)',
            paddingTop: 12,
            paddingBottom: 12,
          },
        }}
        transition={{ duration: DURATION.micro, ease: easeApple }}
        // Sub-pixel hairline so the divider reads as precision, not
        // weight. Color animates in/out via variants.
        style={{ borderBottomWidth: '0.5px', borderBottomStyle: 'solid' }}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 md:px-12">
          <div className="flex items-center gap-4 md:gap-5">
            <BurgerButton
              ref={burgerRef}
              open={menuOpen}
              onClick={() => setMenuOpen(true)}
            />
            <a
              href="/"
              className="font-serif text-[clamp(1.05rem,1.4vw,1.25rem)] tracking-[0.01em]"
              style={{ color: '#F0EBE0' }}
            >
              Jewelry Aura
            </a>
          </div>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-6 md:flex"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={link.href === '/#visit' ? onVisitClick : undefined}
                className="group relative font-sans text-[13px] text-cream-muted transition-colors duration-hover ease-apple hover:text-cream"
                style={{ letterSpacing: '0.06em' }}
              >
                {link.label}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-1 left-0 right-0 origin-left scale-x-0 transition-transform duration-hover ease-apple group-hover:scale-x-100"
                  style={{ height: '0.5px', backgroundColor: '#C4A875' }}
                />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3 sm:gap-5">
            <BookConsultationButton />
            <CartButton />
          </div>
        </div>
      </motion.div>

      {/* Rendered as a sibling of the animated bar: the bar's
          backdrop-filter creates a containing block that would trap a
          fixed-position drawer inside it. */}
      <MenuDrawer open={menuOpen} onClose={closeMenu} />
    </header>
  )
}

/**
 * The three-line burger — the drawer's only trigger, visible at every
 * breakpoint. Lines are 0.5px-adjacent hairlines in cream so the mark
 * reads as typography, not an app icon.
 */
function BurgerButton({
  ref,
  open,
  onClick,
}: {
  ref: React.Ref<HTMLButtonElement>
  open: boolean
  onClick: () => void
}) {
  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label="Open category menu"
      aria-haspopup="dialog"
      aria-expanded={open}
      className="group -ml-1 flex h-8 w-8 flex-col items-center justify-center gap-[5px] p-1"
    >
      {[0, 1, 2].map((line) => (
        <span
          key={line}
          aria-hidden
          className="block h-px w-[18px] bg-cream transition-colors duration-hover ease-apple group-hover:bg-champagne"
        />
      ))}
    </button>
  )
}

/**
 * Cart trigger + badge. The badge shows a small pulsing skeleton until
 * the post-paint getCart resolves (never a false 0), a count chip when
 * the cart has items, and nothing when it's empty.
 */
function CartButton() {
  const { count, openCart } = useCart()
  const ref = useRef<HTMLButtonElement>(null)

  return (
    <button
      ref={ref}
      type="button"
      onClick={() => openCart(ref.current)}
      aria-label={
        count === null
          ? 'Open cart'
          : `Open cart, ${count} ${count === 1 ? 'item' : 'items'}`
      }
      className="relative p-1 text-cream transition-colors duration-hover ease-apple hover:text-champagne"
    >
      <svg
        aria-hidden
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <path d="M4 6.5h12l-.9 10a1.5 1.5 0 0 1-1.5 1.35h-7.2a1.5 1.5 0 0 1-1.5-1.35L4 6.5Z" />
        <path d="M7 6.5V5a3 3 0 0 1 6 0v1.5" />
      </svg>
      {count === null && (
        <span
          aria-hidden
          className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 animate-pulse rounded-full bg-cream-muted/50"
        />
      )}
      {count !== null && count > 0 && (
        <span
          aria-hidden
          className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-champagne px-1 font-mono text-[9px] leading-none text-forest"
        >
          {count > 99 ? '99+' : count}
        </span>
      )}
    </button>
  )
}

/**
 * Pill button with a champagne hairline. On hover the fill flushes
 * to champagne and the label inverts to forest-green. Framer drives
 * the color tween so the timing stays in lockstep with the rest of
 * the site — every hover tween in the system runs at duration-hover
 * with easeApple.
 */
function BookConsultationButton() {
  const onClick = useSmoothScrollTo('visit')
  return (
    <motion.a
      href="/#visit"
      onClick={onClick}
      initial="rest"
      whileHover="hover"
      whileFocus="hover"
      variants={{
        rest: {
          backgroundColor: 'rgba(196, 168, 117, 0)',
          color: '#F0EBE0',
          borderColor: 'rgba(196, 168, 117, 0.6)',
        },
        hover: {
          backgroundColor: 'rgba(196, 168, 117, 1)',
          color: '#14261F',
          borderColor: 'rgba(196, 168, 117, 1)',
        },
      }}
      transition={{ duration: DURATION.hover, ease: easeApple }}
      className="hidden rounded-full font-sans text-[12px] font-medium uppercase tracking-[0.18em] sm:inline-flex"
      style={{
        borderWidth: '0.5px',
        borderStyle: 'solid',
        padding: '10px 22px',
      }}
    >
      Book consultation
    </motion.a>
  )
}
