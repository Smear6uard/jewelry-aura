/**
 * components/sections/Hero.tsx — landing-page hero
 *
 * Direction: editorial atelier-dossier. Reads like the cover of a small
 * luxury house's seasonal book, not a SaaS landing page. The composition
 * commits to one bold idea: a contained portrait frame, an oversized
 * stairstep display headline that overlaps the photograph at the seam,
 * a vertical metadata rail along the right edge, a slow ticker pinned
 * to the bottom, and a rotating "made-to-order" stamp on the photo's
 * inner corner. Type and rules carry the brand — gradient washes do not.
 *
 * Layout:
 *   • Desktop ≥1024px: 12-col implicit grid. The portrait sits in cols
 *     7–11 (right-of-center, framed, NOT bleeding to the right edge).
 *     The display headline lives in cols 1–8 and the third line ("Yours")
 *     deliberately overlaps the left edge of the frame to break the grid.
 *   • Mobile <1024px: stacked. Masthead → framed portrait (vertical
 *     asset) → stairstep headline → CTAs → ticker.
 *
 * Photographs:
 *   /public/hero-portrait-wide.png  → desktop (3:2 horizontal)
 *   /public/hero-portrait-tall.png  → mobile (4:5 vertical)
 *   Both are eligible for fetchPriority=high. The <picture> element
 *   chooses based on viewport so neither asset is wasted.
 *
 * Reduced motion:
 *   The whole section collapses to a single 200ms opacity fade. The
 *   ticker still renders but its CSS marquee is paused. The rotating
 *   stamp stops spinning. SplitText falls back to a flat fade per its
 *   own reduced-motion branch.
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

// Subtle parallax — moves only the photograph, not the frame around it.
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

// Vertical metadata rail (rotated 90°, right edge of the hero).
const RAIL_TEXT = 'NORRIDGE · IL — ATELIER № 01 — SPRING / SUMMER MMXXVI'

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
        // Min-height keeps the editorial composition breathing on tall
        // viewports without forcing the type stack offscreen on short ones.
        minHeight: 'max(760px, 100svh)',
      }}
    >
      <Atmosphere />

      {/* Top masthead — the editorial signature mark */}
      <Masthead reduced={reduced} />

      {/* Vertical metadata rail — desktop only. Reads bottom→top so the
          eye runs up the spine of the page, away from the type stack. */}
      <VerticalRail reduced={reduced} />

      {/* Main composition grid. The headline and the photograph share
          this grid so their overlap is precise and reflows together. */}
      <div className="relative z-10 mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-y-10 px-6 pb-32 pt-32 md:px-10 lg:grid-cols-12 lg:gap-x-6 lg:px-16 lg:pt-36 lg:pb-40">
        {/* Mobile order: photo first, headline below. Desktop order is
            controlled by grid-column placement, so DOM order = mobile order. */}
        <PortraitFrame reduced={reduced} photoY={photoY} />
        <HeadlineBlock reduced={reduced} />
      </div>

      {/* Bottom-pinned ticker — slow horizontal marquee. */}
      <Ticker reduced={reduced} />
    </motion.section>
  )
}

// ────────────────────────────────────────────────────────────────────
// Atmosphere — background depth that doesn't read as a "gradient hero"
// ────────────────────────────────────────────────────────────────────

function Atmosphere() {
  return (
    <>
      {/* Soft radial vignette — biased toward the upper-right so the
          photograph sits in the brightest pool of light. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 72% 30%, rgba(46, 78, 61, 0.55) 0%, rgba(14, 31, 24, 0) 60%)',
        }}
      />
      {/* Bottom edge fade — settles the ticker into the type plane. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40"
        style={{
          background:
            'linear-gradient(to bottom, rgba(14, 31, 24, 0) 0%, rgba(14, 31, 24, 0.85) 80%, #0E1F18 100%)',
        }}
      />
      {/* Hand-tuned grain. Inline SVG so we don't depend on a network
          asset and don't introduce a wrapping element on <body>. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-overlay"
        style={{
          opacity: 0.25,
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
      // Sits below the global header (which has its own padding). The
      // top: clamp() lets the masthead slide down on taller viewports
      // without colliding with the photograph on short ones.
      className="absolute inset-x-0 z-10 px-6 md:px-10 lg:px-16"
      style={{ top: 'clamp(96px, 12vh, 132px)' }}
    >
      <div className="mx-auto flex max-w-[1440px] items-start justify-between">
        <div className="flex items-start gap-4">
          {/* Numeric mark, mono. Reads like a specimen tag. */}
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
// Portrait frame — the hero photograph in a contained editorial frame
// ────────────────────────────────────────────────────────────────────

function PortraitFrame({
  reduced,
  photoY,
}: {
  reduced: boolean
  photoY: ReturnType<typeof useMotionValue<number>>
}) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 24 }}
      animate={reduced ? false : { opacity: 1, y: 0 }}
      transition={
        reduced ? undefined : { duration: DURATION.page, ease: easeApple, delay: 0.05 }
      }
      // Desktop: occupies cols 7–12 with internal padding so the frame
      // never touches the right edge — that internal margin is the
      // "page" the photo prints onto.
      className="relative lg:col-start-7 lg:col-end-13 lg:row-start-1 lg:self-start"
    >
      {/* Champagne hairline outer frame. The inset is the optical mat.
          Aspect ratio is owned by .hero-frame-aspect (defined in
          app.css) so the desktop override doesn't collide with
          style-attribute specificity. */}
      <div
        className="hero-frame-aspect relative overflow-hidden"
        style={{
          borderWidth: '0.5px',
          borderStyle: 'solid',
          borderColor: 'rgba(196, 168, 117, 0.35)',
          boxShadow:
            'inset 0 0 0 1px rgba(14, 31, 24, 0.6), inset 0 0 0 1.5px rgba(196, 168, 117, 0.18)',
        }}
      >

        {/* Image — picture swaps assets per breakpoint. The motion.div
            wrapper carries the parallax y-translation. The wrapper is
            sized to the frame exactly; we don't pad it because the
            parallax range (48px) is small enough that the frame's
            inset hairline absorbs any reveal at the bottom edge. */}
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
              // Wide asset (1536×1024, 3:2) into a 5:6 frame on desktop:
              //   image gets cropped left/right; centering on 50% keeps
              //   the subject (right of image center) visible.
              // Tall asset (1122×1402, 4:5) into a 4:5 frame on mobile:
              //   no cropping; objectPosition is a no-op but harmless.
              style={{ objectPosition: '60% 50%' }}
            />
          </picture>
        </motion.div>

        {/* Inner top vignette — anchors the eye to the subject's face. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 28%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.35) 100%)',
          }}
        />

        {/* Corner ticks — four 12px L-shapes, one in each inner corner.
            Reads like crop marks on a print proof. */}
        <CropMark position="tl" />
        <CropMark position="tr" />
        <CropMark position="bl" />
        <CropMark position="br" />

        {/* Rotating made-to-order stamp, anchored to the photograph's
            inner bottom-left. Desktop only — at small widths it crowds
            the subject. */}
        <RotatingStamp reduced={reduced} />
      </div>

      {/* Frame caption — small mono tag under the photograph, like a
          plate caption in a fine-art monograph. */}
      <motion.div
        initial={reduced ? false : { opacity: 0 }}
        animate={reduced ? false : { opacity: 1 }}
        transition={
          reduced ? undefined : { delay: 1.0, duration: DURATION.content, ease: easeApple }
        }
        className="mt-4 flex items-baseline justify-between gap-6"
      >
        <span
          className="font-mono text-[10px] uppercase"
          style={{ color: '#9FB6A6', letterSpacing: '0.22em' }}
        >
          Plate I — &ldquo;Rope, 14k, hand-set&rdquo;
        </span>
        <span
          className="font-mono text-[10px] uppercase"
          style={{ color: '#7A9387', letterSpacing: '0.22em' }}
        >
          01 / 04
        </span>
      </motion.div>
    </motion.div>
  )
}

function CropMark({ position }: { position: 'tl' | 'tr' | 'bl' | 'br' }) {
  const isTop = position[0] === 't'
  const isLeft = position[1] === 'l'
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute"
      style={{
        top: isTop ? 10 : undefined,
        bottom: !isTop ? 10 : undefined,
        left: isLeft ? 10 : undefined,
        right: !isLeft ? 10 : undefined,
        width: 14,
        height: 14,
        borderColor: 'rgba(240, 235, 224, 0.7)',
        borderTopWidth: isTop ? '0.5px' : 0,
        borderBottomWidth: !isTop ? '0.5px' : 0,
        borderLeftWidth: isLeft ? '0.5px' : 0,
        borderRightWidth: !isLeft ? '0.5px' : 0,
        borderStyle: 'solid',
      }}
    />
  )
}

// ────────────────────────────────────────────────────────────────────
// Rotating made-to-order stamp — circular SVG text, slowly spinning
// ────────────────────────────────────────────────────────────────────

function RotatingStamp({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, scale: 0.9 }}
      animate={reduced ? false : { opacity: 1, scale: 1 }}
      transition={
        reduced ? undefined : { delay: 1.2, duration: DURATION.hero, ease: easeOutExpo }
      }
      className="pointer-events-none absolute hidden lg:block"
      style={{ left: 18, bottom: 18 }}
    >
      <div
        className="relative"
        style={{
          width: 110,
          height: 110,
          animation: reduced ? 'none' : 'spin-slow 18s linear infinite',
        }}
      >
        <svg viewBox="0 0 110 110" width={110} height={110} aria-hidden>
          <defs>
            <path
              id="hero-stamp-circle"
              d="M 55,55 m -42,0 a 42,42 0 1,1 84,0 a 42,42 0 1,1 -84,0"
            />
          </defs>
          <text
            fill="#C4A875"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.32em',
              textTransform: 'uppercase',
            }}
          >
            <textPath href="#hero-stamp-circle" startOffset="0">
              Made to order · Made to last · Norridge IL ·
            </textPath>
          </text>
        </svg>
        {/* Center bullet — a single champagne dot. */}
        <span
          aria-hidden
          className="absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ width: 4, height: 4, backgroundColor: '#C4A875' }}
        />
      </div>
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────────────────
// Headline block — stairstep display, italic accent, sub + CTA stack
// ────────────────────────────────────────────────────────────────────

function HeadlineBlock({ reduced }: { reduced: boolean }) {
  const baseDelay = 0.45
  return (
    <div className="relative z-10 lg:col-start-1 lg:col-end-10 lg:row-start-1 lg:self-end lg:-mb-2">
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

      {/* Stairstep display headline. Three lines, each indented further
          than the last, so the type leans into the photograph's frame.
          Last line is italic in champagne — the only chromatic accent. */}
      <h1
        aria-label="Iced. Custom. Yours."
        className="font-display"
        style={{
          color: '#F0EBE0',
          fontWeight: 400,
          // clamp tuned so the largest line clears the photograph at lg
          // but never wraps awkwardly on portrait phones.
          fontSize: 'clamp(3.5rem, 12vw, 11rem)',
          lineHeight: 0.92,
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
        <span
          aria-hidden
          className="block"
          // Stairstep: second line nudged right.
          style={{ paddingLeft: '0.18em' }}
        >
          <SplitText as="span" delay={reduced ? 0 : baseDelay + STAGGER.tight * 1.2}>
            Custom.
          </SplitText>
        </span>
        <span
          aria-hidden
          className="block italic"
          // Third line nudged further right and rendered in champagne italic.
          // On desktop this nudge plus the column overlap pushes the line
          // into the left edge of the photograph — the intended seam.
          style={{
            paddingLeft: '0.42em',
            color: '#C4A875',
            fontVariationSettings: '"opsz" 144, "SOFT" 50',
          }}
        >
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
// CTA row
// ────────────────────────────────────────────────────────────────────

function CTARow({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      initial={reduced ? false : 'hidden'}
      animate={reduced ? false : 'visible'}
      variants={fadeUp}
      transition={{ delay: 1.25, duration: DURATION.content, ease: easeOutExpo }}
      className="mt-9 flex flex-col items-stretch gap-5 sm:flex-row sm:items-center sm:gap-7"
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
          color: '#0E1F18',
          boxShadow: '0 0 0 0 rgba(196,168,117,0), 0 0 0 0 rgba(0,0,0,0)',
        },
        hover: {
          y: -2,
          backgroundColor: '#C4A875',
          color: '#0E1F18',
          boxShadow:
            '0 0 0 1px rgba(196,168,117,0.9), 0 14px 32px -10px rgba(0,0,0,0.55)',
        },
      }}
      transition={{ duration: DURATION.hover, ease: easeApple }}
      className="inline-flex items-center justify-center gap-3 rounded-none font-mono text-[11px] font-medium uppercase sm:w-auto"
      style={{ letterSpacing: '0.22em', padding: '18px 28px' }}
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
      className="group inline-flex items-center gap-3 self-center font-mono text-[11px] uppercase sm:self-auto"
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
// Vertical metadata rail — desktop spine
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
      // because rotating type at narrow widths just steals attention.
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
