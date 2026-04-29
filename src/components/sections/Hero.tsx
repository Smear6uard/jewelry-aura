/**
 * components/sections/Hero.tsx — landing-page hero
 *
 * Direction: editorial atelier. The hero photograph bleeds full to the
 * right and bottom edges of the viewport, with the type stack and CTAs
 * holding the left half of the composition. No frame, no caption, no
 * pagination — this is a hero, not a slider. The photograph is the
 * focal point; type recedes onto the velvet drape on the left.
 *
 * Layout:
 *   • Desktop ≥1024px: photograph pinned absolute to inset-y-0 / right-0,
 *     ~52% of viewport width, full hero height, edges flush with viewport.
 *     Headline + body + CTAs occupy cols 1–7 of the constrained grid on
 *     the left. A vertical metadata rail runs along the right edge.
 *   • Mobile <1024px: photograph in flow at the top of the section,
 *     full container width, vertical aspect; headline stack below.
 *
 * Photographs:
 *   /public/hero-portrait-wide.png  → desktop (3:2 horizontal)
 *   /public/hero-portrait-tall.png  → mobile (4:5 vertical)
 *
 * Reduced motion: section collapses to a 200ms opacity fade. Ticker
 * marquee pauses. SplitText falls back to a flat fade per its own
 * reduced-motion branch. Parallax disabled.
 */

import { useEffect, useRef } from 'react'
import { motion, useMotionValue } from 'framer-motion'
import {
  DURATION,
  STAGGER,
  easeApple,
  easeOutExpo,
  fadeUp,
  fadeIn,
  useReducedMotion,
} from '~/lib/motion'
import { useLenis } from '~/lib/lenis'
import { SplitText } from '~/components/motion/SplitText'

const PHOTO_WIDE = '/hero-portrait-wide.png'
const PHOTO_TALL = '/hero-portrait-tall.png'

const PHOTO_ALT =
  'A man in a black open-collar shirt wearing a warm gold rope chain, photographed against a deep forest-green velvet drape.'

// Subtle parallax — moves the photograph within its container, not the
// container itself. Range is small enough that no edge ever reveals.
const PARALLAX_RANGE_PX = 48

// Tag-line ticker. Repeated twice in the DOM so the marquee loop wraps
// without a visible seam.
const TICKER_ITEMS = [
  'Bespoke chains',
  'Iced pendants',
  'Bridal pieces',
  'Hand-set in Chicago',
  'Solid gold, never plated',
  'One piece at a time',
  'Worn, never replaced',
] as const

// Vertical metadata rail (rotated, right edge). One line, place only.
const RAIL_TEXT = 'ATELIER · NORRIDGE · IL'

export function Hero() {
  const reduced = !!useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const photoY = useMotionValue(0)
  const lenis = useLenis()

  // ─── Parallax ──────────────────────────────────────────────────────
  useEffect(() => {
    if (reduced || !lenis || !sectionRef.current) return
    const section = sectionRef.current

    const update = (scroll: number) => {
      const top = section.offsetTop
      const height = section.offsetHeight || 1
      const local = Math.min(1, Math.max(0, (scroll - top) / height))
      photoY.set(local * PARALLAX_RANGE_PX)
    }

    update(lenis.scroll)
    const onScroll = ({ scroll }: { scroll: number }) => update(scroll)
    lenis.on('scroll', onScroll)
    return () => {
      lenis.off('scroll', onScroll)
    }
  }, [lenis, photoY, reduced])

  return (
    <motion.section
      ref={sectionRef}
      initial={{ opacity: reduced ? 0 : 1 }}
      animate={{ opacity: 1 }}
      transition={reduced ? { duration: 0.2, ease: easeApple } : { duration: 0 }}
      className="relative w-full overflow-hidden"
      style={{
        backgroundColor: '#0E1F18',
        minHeight: 'max(760px, 100svh)',
      }}
    >
      {/* Background wash — sits behind the photograph. */}
      <AtmosphereBack />

      {/* The hero photograph — full-bleed right + bottom on desktop,
          in-flow at top on mobile. Behind every other layer. */}
      <FullBleedPhoto reduced={reduced} photoY={photoY} />

      {/* Foreground texture + bottom edge fade — sit ON TOP of the photo
          to unify the composition into one printed sheet and to keep the
          ticker legible against the photo's bottom edge. */}
      <AtmosphereFront />

      <Masthead reduced={reduced} />
      <VerticalRail reduced={reduced} />

      {/* Composition grid — only the headline column lives here now.
          lg:min-h pins the cell to the viewport so self-end consistently
          anchors the headline near the bottom across viewport heights. */}
      <div className="relative z-10 mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-y-10 px-6 pb-32 pt-32 md:px-10 lg:grid-cols-12 lg:gap-x-6 lg:px-16 lg:pt-36 lg:pb-40 lg:min-h-[100svh]">
        <HeadlineBlock reduced={reduced} />
      </div>

      <Ticker reduced={reduced} />
    </motion.section>
  )
}

// ────────────────────────────────────────────────────────────────────
// Atmosphere — split into back (under the photo) and front (over it)
// ────────────────────────────────────────────────────────────────────

function AtmosphereBack() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{
        // Bias the radial pool to the LEFT — the headline column lives
        // there and the photograph owns the right.
        background:
          'radial-gradient(ellipse 90% 80% at 28% 32%, rgba(46, 78, 61, 0.45) 0%, rgba(14, 31, 24, 0) 60%)',
      }}
    />
  )
}

function AtmosphereFront() {
  return (
    <>
      {/* Bottom edge fade — settles the ticker into the photo. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 z-[5] h-40"
        style={{
          background:
            'linear-gradient(to bottom, rgba(14, 31, 24, 0) 0%, rgba(14, 31, 24, 0.85) 80%, #0E1F18 100%)',
        }}
      />
      {/* Hand-tuned grain — rides over the photo so the whole composition
          reads as one printed sheet. Sits below the headline (z-10) so
          type stays crisp. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5] mix-blend-overlay"
        style={{
          opacity: 0.22,
          backgroundImage:
            'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 200 200\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'2\' stitchTiles=\'stitch\'/></filter><rect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.55\'/></svg>")',
          backgroundSize: '220px 220px',
        }}
      />
    </>
  )
}

// ────────────────────────────────────────────────────────────────────
// Masthead — top-of-hero editorial mark
// ────────────────────────────────────────────────────────────────────

function Masthead({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      initial={reduced ? false : 'hidden'}
      animate={reduced ? false : 'visible'}
      variants={fadeIn}
      transition={{ delay: 0.3, duration: DURATION.content, ease: easeApple }}
      className="absolute inset-x-0 z-10 px-6 md:px-10 lg:px-16"
      style={{ top: 'clamp(96px, 12vh, 132px)' }}
    >
      <div className="mx-auto flex max-w-[1440px] items-start justify-between">
        <div className="flex items-start gap-4">
          <span
            className="font-mono text-[11px] uppercase"
            style={{
              color: '#C4A875',
              letterSpacing: '0.16em',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            Nº 01
          </span>
          <span
            aria-hidden
            className="mt-[7px] block"
            style={{ width: 28, height: '0.5px', backgroundColor: 'rgba(196,168,117,0.55)' }}
          />
          <span
            className="font-mono text-[10px] uppercase"
            style={{ color: '#9FB6A6', letterSpacing: '0.22em' }}
          >
            Bespoke <span style={{ color: '#7A9387' }}>—</span> Chicago, IL
          </span>
        </div>

        <span
          className="hidden font-mono text-[10px] uppercase md:inline-flex"
          style={{ color: '#9FB6A6', letterSpacing: '0.22em' }}
        >
          MMXXVI / Spring · Summer
        </span>
      </div>
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────────────────
// Full-bleed photograph
// ────────────────────────────────────────────────────────────────────

function FullBleedPhoto({
  reduced,
  photoY,
}: {
  reduced: boolean
  photoY: ReturnType<typeof useMotionValue<number>>
}) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0 }}
      animate={reduced ? false : { opacity: 1 }}
      transition={
        reduced ? undefined : { duration: DURATION.page, ease: easeApple, delay: 0.05 }
      }
      // Mobile: in flow at the top of the section, full container width,
      // vertical aspect tuned to the tall asset. Desktop: pinned absolute
      // flush with the right + bottom edges of the viewport, ~52% wide,
      // full hero height (inset-y-0).
      className="relative w-full aspect-[4/5] overflow-hidden lg:absolute lg:inset-y-0 lg:right-0 lg:left-auto lg:w-[52%] lg:aspect-auto"
    >
      <motion.div
        style={{ y: reduced ? 0 : photoY }}
        className="absolute inset-0 will-change-transform"
      >
        <picture className="block h-full w-full">
          <source media="(min-width: 1024px)" srcSet={PHOTO_WIDE} />
          <source media="(max-width: 1023px)" srcSet={PHOTO_TALL} />
          <img
            src={PHOTO_TALL}
            alt={PHOTO_ALT}
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover"
            // Bias the crop right of center to keep the subject framed
            // when the wide asset is squeezed into the desktop column.
            style={{ objectPosition: '60% 50%' }}
          />
        </picture>
      </motion.div>

      {/* Vertical vignette inside the photo — keeps the subject's face
          and the chain the brightest pool of light. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.30) 100%)',
        }}
      />

      {/* Desktop only — soften the seam where the photograph meets the
          headline column. A short fade on the inner-left edge lets the
          velvet drape recede into the forest background while the right
          and bottom stay flush full-bleed. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-1/4 lg:block"
        style={{
          background:
            'linear-gradient(to right, rgba(14,31,24,0.72) 0%, rgba(14,31,24,0) 100%)',
        }}
      />
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────────────────
// Headline block — three identical cream lines, body, CTAs
// ────────────────────────────────────────────────────────────────────

function HeadlineBlock({ reduced }: { reduced: boolean }) {
  const baseDelay = 0.45
  return (
    <div className="relative z-10 lg:col-start-1 lg:col-end-8 lg:row-start-1 lg:self-end lg:-mb-2">
      {/* Section label — sits inside the headline column on desktop so
          the reading rhythm is: tag → headline → sub → CTAs. */}
      <motion.div
        initial={reduced ? false : 'hidden'}
        animate={reduced ? false : 'visible'}
        variants={fadeUp}
        transition={{ delay: 0.35, duration: DURATION.content, ease: easeOutExpo }}
        className="mb-6 flex items-center gap-3"
      >
        <span
          aria-hidden
          className="block"
          style={{ width: 26, height: '0.5px', backgroundColor: 'rgba(196,168,117,0.7)' }}
        />
        <span
          className="font-mono text-[11px] uppercase"
          style={{ color: '#C4A875', letterSpacing: '0.22em' }}
        >
          Custom · Iced · One-of-one
        </span>
      </motion.div>

      {/* Stairstep display headline — three identical cream serif lines.
          No italic, no champagne, no weight change. Each line indented
          slightly more than the last so the eye still cascades. The
          font size has been pulled back ~15% from the previous setting
          so the body and CTAs have room to breathe under the type. */}
      <h1
        aria-label="Iced. Custom. Yours."
        className="font-display"
        style={{
          color: '#F0EBE0',
          fontWeight: 400,
          fontSize: 'clamp(3rem, 10.2vw, 9.35rem)',
          lineHeight: 0.94,
          letterSpacing: '-0.035em',
          // Optical-size axis on Fraunces — push toward display setting.
          fontVariationSettings: '"opsz" 144',
        }}
      >
        <span aria-hidden className="block">
          <SplitText as="span" delay={reduced ? 0 : baseDelay}>
            Iced.
          </SplitText>
        </span>
        <span aria-hidden className="block" style={{ paddingLeft: '0.18em' }}>
          <SplitText as="span" delay={reduced ? 0 : baseDelay + STAGGER.tight * 1.2}>
            Custom.
          </SplitText>
        </span>
        <span aria-hidden className="block" style={{ paddingLeft: '0.36em' }}>
          <SplitText as="span" delay={reduced ? 0 : baseDelay + STAGGER.tight * 2.4}>
            Yours.
          </SplitText>
        </span>
      </h1>

      {/* Sub-line — short paragraph, narrower measure than the headline. */}
      <motion.p
        initial={reduced ? false : 'hidden'}
        animate={reduced ? false : 'visible'}
        variants={fadeUp}
        transition={{ delay: 1.05, duration: DURATION.content, ease: easeOutExpo }}
        className="mt-10 max-w-[34ch] font-sans text-[15px] leading-[1.65] md:text-[16px]"
        style={{ color: '#C0B8A6' }}
      >
        A small atelier in Norridge. We design, set, and finish every chain,
        pendant, and bridal piece by hand — no two ever the same.
      </motion.p>

      <CTARow reduced={reduced} />
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────
// CTA row — cream pill primary + champagne text-link secondary
// ────────────────────────────────────────────────────────────────────

function CTARow({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      initial={reduced ? false : 'hidden'}
      animate={reduced ? false : 'visible'}
      variants={fadeUp}
      transition={{ delay: 1.25, duration: DURATION.content, ease: easeOutExpo }}
      className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7"
    >
      <PrimaryCTA />
      <SecondaryCTA />
    </motion.div>
  )
}

function PrimaryCTA() {
  return (
    <motion.a
      href="#contact"
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileFocus="hover"
      variants={{
        rest: {
          y: 0,
          backgroundColor: '#F0EBE0',
          color: '#14261F',
          boxShadow: '0 0 0 0 rgba(196,168,117,0), 0 0 0 0 rgba(0,0,0,0)',
        },
        hover: {
          y: -2,
          backgroundColor: '#FFFFFF',
          color: '#14261F',
          boxShadow:
            '0 0 0 1px rgba(196,168,117,0.65), 0 14px 32px -10px rgba(0,0,0,0.55)',
        },
      }}
      transition={{ duration: DURATION.hover, ease: easeApple }}
      className="inline-flex items-center justify-center gap-3 rounded-full font-mono text-[11px] font-medium uppercase"
      style={{ letterSpacing: '0.22em', padding: '17px 30px' }}
    >
      <span>Start a custom piece</span>
      <span aria-hidden style={{ fontSize: 14 }}>
        →
      </span>
    </motion.a>
  )
}

function SecondaryCTA() {
  return (
    <a
      href="#work"
      className="group inline-flex items-center gap-3 font-mono text-[11px] uppercase"
      style={{ color: '#C4A875', letterSpacing: '0.22em' }}
    >
      <span className="relative">
        See the work
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -bottom-1 origin-left scale-x-0 transition-transform duration-hover ease-apple group-hover:scale-x-100"
          style={{ height: '0.5px', backgroundColor: '#C4A875' }}
        />
      </span>
      <span
        aria-hidden
        className="transition-transform duration-hover ease-apple group-hover:translate-x-1"
      >
        →
      </span>
    </a>
  )
}

// ────────────────────────────────────────────────────────────────────
// Vertical metadata rail — desktop spine, single line: place only
// ────────────────────────────────────────────────────────────────────

function VerticalRail({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0 }}
      animate={reduced ? false : { opacity: 1 }}
      transition={
        reduced ? undefined : { delay: 1.4, duration: DURATION.content, ease: easeApple }
      }
      // Pinned to the right edge, vertically centered. Hidden below lg
      // because rotated type at narrow widths just steals attention.
      className="pointer-events-none absolute right-4 top-1/2 z-10 hidden -translate-y-1/2 lg:block"
    >
      <div
        className="flex items-center gap-4"
        style={{
          writingMode: 'vertical-rl',
          transform: 'rotate(180deg)',
        }}
      >
        <span
          aria-hidden
          className="block"
          style={{ width: '0.5px', height: 56, backgroundColor: 'rgba(196,168,117,0.5)' }}
        />
        <span
          className="font-mono text-[10px] uppercase"
          style={{ color: '#9FB6A6', letterSpacing: '0.32em' }}
        >
          {RAIL_TEXT}
        </span>
        <span
          aria-hidden
          className="block"
          style={{ width: '0.5px', height: 56, backgroundColor: 'rgba(196,168,117,0.5)' }}
        />
      </div>
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────────────────
// Ticker — slow horizontal marquee at the bottom
// ────────────────────────────────────────────────────────────────────

function Ticker({ reduced }: { reduced: boolean }) {
  // Two copies of the items in the track. The marquee animation runs
  // from 0 → -50% so the second copy seamlessly takes the first's place.
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS]
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0 }}
      animate={reduced ? false : { opacity: 1 }}
      transition={
        reduced ? undefined : { delay: 1.5, duration: DURATION.content, ease: easeApple }
      }
      className="pointer-events-none absolute inset-x-0 bottom-0 z-10 overflow-hidden"
      style={{
        borderTopWidth: '0.5px',
        borderTopStyle: 'solid',
        borderTopColor: 'rgba(196, 168, 117, 0.18)',
        backgroundColor: 'rgba(14, 31, 24, 0.6)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="flex w-max items-center gap-10 whitespace-nowrap py-4 will-change-transform"
        style={{
          animation: reduced ? 'none' : 'hero-ticker 42s linear infinite',
        }}
      >
        {items.map((label, i) => (
          <span
            key={i}
            className="flex items-center gap-10 font-mono text-[11px] uppercase"
            style={{ color: '#9FB6A6', letterSpacing: '0.28em' }}
          >
            <span>{label}</span>
            <span aria-hidden style={{ color: '#C4A875' }}>
              ✦
            </span>
          </span>
        ))}
      </div>
    </motion.div>
  )
}
