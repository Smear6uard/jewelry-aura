/**
 * components/layout/Header.tsx — global persistent site header
 *
 * Two visual states keyed off scroll position:
 *   • At rest (scrollY ≤ 80px): fully transparent, sits over the hero.
 *   • Scrolled (scrollY > 80px): forest-green @ 92% with backdrop blur,
 *     0.5px champagne hairline along the bottom, vertical padding
 *     compresses (24px → 12px) so the surface feels lower-profile once
 *     it's no longer over the photograph.
 *
 * Why subscribe directly to the Lenis instance instead of `useScroll`:
 *   Lenis is the source of truth for the smoothed scroll position. Its
 *   internal RAF tick can land *between* Framer's tick if we read
 *   window.scrollY through `useScroll`, producing a 1-frame jitter on
 *   the state flip. Subscribing via `useLenis().on('scroll', …)` keeps
 *   us aligned with Lenis's own update cadence — one source, no race.
 *
 * Why an event subscription instead of `useScrollProgress`:
 *   The on/off threshold is an absolute 80px, not a percentage of the
 *   document. `useScrollProgress` is the right tool for percent-based
 *   parallax (used in Hero); a pixel threshold is cleaner against the
 *   raw `lenis.scroll` value.
 *
 * Mobile: nav links collapse off-screen (md-and-up only). Logo and the
 * "Book consultation" CTA remain so the primary action is always one
 * tap away. A full mobile drawer is intentionally out of scope for
 * this prompt.
 */

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  DURATION,
  easeApple,
  easeOutExpo,
} from '~/lib/motion'
import { useLenis } from '~/lib/lenis'

const NAV_LINKS = [
  { label: 'Services', href: '#services' },
  { label: 'Custom', href: '#custom' },
  { label: 'Visit', href: '#visit' },
] as const

const SCROLL_THRESHOLD = 80

export function Header() {
  const lenis = useLenis()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    if (!lenis) return
    // Seed once in case the user lands mid-page (deep link / refresh).
    setScrolled(lenis.scroll > SCROLL_THRESHOLD)

    const onScroll = ({ scroll }: { scroll: number }) => {
      // Cheap diff: only flip React state when crossing the threshold.
      setScrolled((prev) => {
        const next = scroll > SCROLL_THRESHOLD
        return prev === next ? prev : next
      })
    }
    lenis.on('scroll', onScroll)
    return () => {
      lenis.off('scroll', onScroll)
    }
  }, [lenis])

  return (
    <motion.header
      // The hero photograph fades in at 0.0s; the header fades in at
      // 0.2s so the image has visually "landed" before the chrome
      // arrives over it. See Hero.tsx for the rest of the sequence.
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DURATION.content, delay: 0.2, ease: easeOutExpo }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <motion.div
        initial="top"
        animate={scrolled ? 'scrolled' : 'top'}
        variants={{
          // backdrop-filter is supported unprefixed in every browser
          // we target (Safari 18+, Chrome, FF). The -webkit- prefix
          // was needed pre-2024 only — dropping it lets Framer's
          // Variant type accept the object cleanly.
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
        // Hairline drawn at sub-pixel weight so it reads as a precision
        // line, not a divider. The color animates in/out via variants.
        style={{ borderBottomWidth: '0.5px', borderBottomStyle: 'solid' }}
      >
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 md:px-12">
          <a
            href="#"
            className="font-serif text-[clamp(1.05rem,1.4vw,1.25rem)] tracking-[0.01em] text-cream"
            style={{ color: '#F0EBE0' }}
          >
            Jewelry Aura
          </a>

          <nav
            aria-label="Primary"
            className="hidden items-center gap-6 md:flex"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="group relative font-sans text-[13px] text-cream-muted transition-colors duration-hover ease-apple hover:text-cream"
                style={{ letterSpacing: '0.06em' }}
              >
                {link.label}
                {/* Underline draws in from the left on hover. scaleX
                    keeps the line crisp without re-layout. */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -bottom-1 left-0 right-0 origin-left scale-x-0 transition-transform duration-hover ease-apple group-hover:scale-x-100"
                  style={{ height: '0.5px', backgroundColor: '#C4A875' }}
                />
              </a>
            ))}
          </nav>

          <BookConsultationButton />
        </div>
      </motion.div>
    </motion.header>
  )
}

/**
 * Pill button with a champagne hairline. On hover the fill flushes to
 * champagne and the label inverts to forest-green. Framer drives the
 * color tween so the timing stays in lockstep with the rest of the
 * site — every hover tween in the system runs at duration-hover with
 * easeApple.
 */
function BookConsultationButton() {
  return (
    <motion.a
      href="#contact"
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
