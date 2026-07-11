/**
 * components/sections/Hero.tsx — pinned cinematic hero
 *
 * The image stays full-bleed forever. The photograph never shrinks
 * past 95%, never moves to one side, never exposes a flat canvas.
 * The hero is one composition: photograph as world, type as overlay.
 * A tuned velvet wash sits in the lower-left ~40% of the frame so
 * cream type lands on a contrast-safe field — fading to transparent
 * before reaching the model on the right.
 *
 * Layout / pinning:
 *   • Desktop ≥1024px: 170svh wrapper. The 100svh panel is translated
 *     down by a Lenis-coordinated motionValue so it pins at the
 *     viewport top through 70svh of choreography. NOT
 *     position:sticky — the pin is driven by scroll-linked Framer
 *     transforms so it stays in lockstep with Lenis-smoothed scroll
 *     values.
 *   • Mobile <1024px: 100svh full-bleed photograph with type
 *     overlaid at the lower-left. No pin (touch fights pinned
 *     scrolls); the cascade fires on mount with a 0.6s delay so the
 *     user reads the wordless photograph first.
 *
 * Photographs (in /public):
 *   - hero-portrait-wide.png — desktop, direct gaze, horizontal
 *   - hero-portrait-tall.png — mobile, away gaze, vertical
 *
 * Photo containment math (desktop):
 *   Wrapper extends -8% beyond every viewport edge, giving an 8%
 *   over-bleed buffer. At scale 0.95 the wrapper is 110.2% of the
 *   viewport (5.1% buffer per side); at y='-3%' it shifts up 3.3%.
 *   Net: at the worst combined state the bottom edge sits at 101.8%
 *   of viewport height — still outside the visible frame. The
 *   photograph never exposes the green canvas behind it.
 *
 * Phase model (desktop, all scroll-bound):
 *   progress 0.00         frame: wordless photograph + scroll cue
 *   progress 0 → 1        photo scale 1.0 → 0.95, parallax 0 → -3%
 *   progress 0.04 → 0.14  scroll indicator fades
 *   progress 0.18 → 0.34  eyebrow rises (clipped y-translation)
 *   progress 0.30 → 0.58  headline three lines stagger-rise
 *   progress 0.58 → 0.78  body fades up
 *   progress 0.66 → 0.86  CTA row lands
 *
 * Every reveal is a pure scroll-bound motionValue — scrolling back
 * smoothly reverses the choreography. No useMotionValueEvent
 * threshold crossings, no React state for phase booleans.
 *
 * Reduced motion: the pinned choreography is skipped. The final
 * composition (photo full-bleed, type lower-left) renders as a
 * static layout with a single mount-time opacity fade.
 *
 * Header coupling: a 1px sentinel sits at the section's bottom edge
 * with `data-hero-end`. The global Header watches that element via
 * IntersectionObserver — transparent while the sentinel is in/below
 * the viewport, opaque once it exits the top. The header therefore
 * stays transparent for the entire pin duration regardless of how
 * the choreography evolves.
 */

import { useEffect, useRef } from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
  type Variants,
} from 'framer-motion'
import {
  DURATION,
  STAGGER,
  easeApple,
  easeOutExpo,
  useReducedMotion,
} from '~/lib/motion'
import { useLenis } from '~/lib/lenis'
import { useSmoothScrollTo } from '~/lib/scroll-to'

const PHOTO_WIDE = '/hero-portrait-wide.png'
const PHOTO_WIDE_AVIF = '/hero-portrait-wide.avif'
const PHOTO_WIDE_WEBP = '/hero-portrait-wide.webp'
const PHOTO_WIDE_JPG = '/hero-portrait-wide.jpg'
const PHOTO_TALL = '/hero-portrait-tall.png'
const PHOTO_TALL_AVIF = '/hero-portrait-tall.avif'
const PHOTO_TALL_WEBP = '/hero-portrait-tall.webp'
const PHOTO_TALL_JPG = '/hero-portrait-tall.jpg'
const PHOTO_ALT =
  'A man in a black open-collar shirt wearing a heavy gold rope chain, photographed against deep forest-green velvet — a frame from a Jewelry Aura custom commission.'

const FOREST = '#14261F'
const CREAM = '#F0EBE0'
const CREAM_MUTED = '#C0B8A6'
const CHAMPAGNE = '#C4A875'
const SAGE = '#9FB6A6'

// Hand-tuned grain — sits below the type so headlines stay crisp.
const GRAIN_SVG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.55'/></svg>\")"

// Tuned velvet wash — directional linear from the bottom-left corner
// upward, deepened by a soft radial pool at the corner itself, faded
// to transparent before reaching the model on the right. The two
// gradients composite as a single atmospheric overlay; the radial
// concentrates contrast where the headline's clip mask sits.
const VELVET_WASH = [
  'linear-gradient(to top right, rgba(20,38,31,0.65) 0%, rgba(20,38,31,0.32) 22%, rgba(20,38,31,0) 50%)',
  'radial-gradient(ellipse 65% 78% at 6% 96%, rgba(20,38,31,0.40) 0%, rgba(20,38,31,0) 65%)',
].join(', ')

// Mobile wash is bottom-heavy because the type column sits across the
// full viewport width — needs a flat bottom band of contrast plus a
// directional bleed from the lower-left corner.
const VELVET_WASH_MOBILE = [
  'linear-gradient(to top, rgba(20,38,31,0.78) 0%, rgba(20,38,31,0.45) 22%, rgba(20,38,31,0) 55%)',
  'linear-gradient(to top right, rgba(20,38,31,0.55) 0%, rgba(20,38,31,0) 60%)',
].join(', ')

export function Hero() {
  const reduced = !!useReducedMotion()

  if (reduced) return <StaticHero />

  return (
    <section
      data-hero
      className="relative w-full"
      style={{ backgroundColor: FOREST }}
    >
      <h1 className="sr-only">
        Custom Men&rsquo;s Gold Chains, Moissanite &amp; Fine Jewelry
      </h1>
      <div className="hidden lg:block">
        <PinnedDesktopHero />
      </div>
      <div className="block lg:hidden">
        <MobileHero />
      </div>
    </section>
  )
}

// ────────────────────────────────────────────────────────────────────
// Desktop — pinned, scroll-choreographed sequence
// ────────────────────────────────────────────────────────────────────

function PinnedDesktopHero() {
  const lenis = useLenis()
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Manual pin — translate the inner panel down by exactly the scroll
  // distance into the wrapper so it visually sticks at the viewport
  // top across the section's pin range. Driven by a Framer motionValue
  // so we share Lenis's RAF cadence.
  const pinY = useMotionValue(0)

  // Local progress 0..1 across the pin window.
  const progress = useMotionValue(0)

  // ─── Photograph — subtle scale-down + parallax ──────────────────
  // The photo's outer wrapper extends -8% beyond every viewport edge.
  // At scale 0.95 the wrapper is still 110.2% of the viewport, so 5.1%
  // of buffer remains on each side. y='-3%' shifts up by 3.3% of
  // wrapper height — within the buffer at every scroll position.
  const photoScale = useTransform(progress, [0, 1], [1.0, 0.95])
  const photoY = useTransform(progress, [0, 1], ['0%', '-3%'])

  // Scroll indicator fades quickly once the user begins moving.
  const scrollIndicatorOpacity = useTransform(progress, [0.04, 0.14], [1, 0])

  // ─── Type stack — every reveal is scroll-bound ──────────────────
  // Eyebrow rises into its line via a clipped y-translation plus a
  // crossfade. Both windows share the same start so they read as one.
  const eyebrowY = useTransform(progress, [0.18, 0.34], ['110%', '0%'])
  const eyebrowOpacity = useTransform(progress, [0.18, 0.30], [0, 1])

  // Headline three lines, each in its own clipped row. The progress
  // ranges overlap by ~16% so the lines settle as a tight cascade.
  const lineY1 = useTransform(progress, [0.30, 0.50], ['110%', '0%'])
  const lineY2 = useTransform(progress, [0.34, 0.54], ['110%', '0%'])
  const lineY3 = useTransform(progress, [0.38, 0.58], ['110%', '0%'])

  // Body + CTA — fade-up cascade after the headline settles.
  const bodyOpacity = useTransform(progress, [0.58, 0.78], [0, 1])
  const bodyY = useTransform(progress, [0.58, 0.78], [22, 0])
  const ctaOpacity = useTransform(progress, [0.66, 0.86], [0, 1])
  const ctaY = useTransform(progress, [0.66, 0.86], [22, 0])

  useEffect(() => {
    if (!lenis || !wrapperRef.current) return
    const wrapper = wrapperRef.current

    const update = () => {
      const rect = wrapper.getBoundingClientRect()
      const local = -rect.top
      const range = Math.max(1, wrapper.offsetHeight - window.innerHeight)

      if (local <= 0) {
        pinY.set(0)
        progress.set(0)
      } else if (local >= range) {
        pinY.set(range)
        progress.set(1)
      } else {
        pinY.set(local)
        progress.set(local / range)
      }
    }

    update()
    const onScroll = () => update()
    lenis.on('scroll', onScroll)
    window.addEventListener('resize', onScroll)
    return () => {
      lenis.off('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [lenis, pinY, progress])

  return (
    <div ref={wrapperRef} className="relative h-[170svh] w-full">
      {/* Header trigger sentinel — at the wrapper's bottom edge so the
          header flips opaque only after the entire pin releases. */}
      <div
        data-hero-end
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-px w-full"
      />

      <motion.div
        style={{ y: pinY }}
        className="absolute left-0 top-0 h-[100svh] w-full overflow-hidden will-change-transform"
      >
        {/* Forest base — only visible at the photo's edges in the most
            extreme combined scale + parallax state, which itself is
            inside the viewport buffer. Never actually renders. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ backgroundColor: FOREST }}
        />

        {/* Photograph — full-bleed at every scroll position. The -8%
            inset gives the scale + parallax their headroom. */}
        <motion.div
          aria-hidden={false}
          className="absolute will-change-transform"
          style={{
            top: '-8%',
            left: '-8%',
            right: '-8%',
            bottom: '-8%',
            scale: photoScale,
            y: photoY,
            transformOrigin: 'center center',
          }}
        >
          <picture className="block h-full w-full">
            <source media="(min-width: 1024px)" type="image/avif" srcSet={PHOTO_WIDE_AVIF} />
            <source media="(min-width: 1024px)" type="image/webp" srcSet={PHOTO_WIDE_WEBP} />
            <img
              src={PHOTO_WIDE_JPG}
              alt={PHOTO_ALT}
              width={1536}
              height={1024}
              fetchPriority="high"
              decoding="async"
              className="h-full w-full object-cover"
              // Bias the crop right of center so the model and chain
              // sit at ~62% horizontal — out of the way of the type
              // column on the lower-left.
              style={{ objectPosition: '60% 50%' }}
            />
          </picture>
        </motion.div>

        {/* Velvet wash — tuned gradient that lets cream type land on a
            contrast-safe field over the lower-left shadow region. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: VELVET_WASH }}
        />

        {/* Bottom edge fade — grounds the composition. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(0,0,0,0) 70%, rgba(0,0,0,0.32) 100%)',
          }}
        />

        {/* Grain — single printed sheet across the entire frame. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-overlay"
          style={{
            opacity: 0.16,
            backgroundImage: GRAIN_SVG,
            backgroundSize: '220px 220px',
          }}
        />

        {/* Type stack — overlaid on the photograph at the lower-left.
            The stack is anchored to the viewport's bottom; CTA row
            sits ~80px above the bottom edge with the headline
            dominating the lower half. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10">
          <div className="mx-auto flex max-w-[1440px] items-end px-10 pb-8 lg:px-16 lg:pb-10">
            <div className="pointer-events-auto w-full max-w-[640px] lg:w-[54%]">
              <DesktopEyebrow y={eyebrowY} opacity={eyebrowOpacity} />
              <DesktopHeadline lineY1={lineY1} lineY2={lineY2} lineY3={lineY3} />
              <DesktopBody opacity={bodyOpacity} y={bodyY} />
              <DesktopCTAs opacity={ctaOpacity} y={ctaY} />
            </div>
          </div>
        </div>

        {/* Scroll indicator — bottom-center, the only signal that more
            content lives below the wordless first frame. */}
        <motion.div
          aria-hidden
          style={{ opacity: scrollIndicatorOpacity }}
          className="pointer-events-none absolute inset-x-0 bottom-9 z-10 flex flex-col items-center gap-3"
        >
          <span
            className="font-mono text-[10px] uppercase"
            style={{ color: SAGE, letterSpacing: '0.32em' }}
          >
            Scroll
          </span>
          <span
            className="block"
            style={{
              width: 28,
              height: '0.5px',
              backgroundColor: CHAMPAGNE,
              animation: 'hero-pulse 2s ease-in-out infinite',
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  )
}

// ─── Desktop reveals — every motion is scroll-bound ───────────────────

function DesktopEyebrow({
  y,
  opacity,
}: {
  y: MotionValue<string>
  opacity: MotionValue<number>
}) {
  return (
    <div
      className="mb-7 overflow-hidden"
      // Pad the clip mask so the eyebrow's baseline clears the bottom
      // edge during the rise.
      style={{ paddingBottom: '0.06em' }}
    >
      <motion.div
        className="flex items-center gap-3 will-change-transform"
        style={{ y, opacity }}
      >
        <span
          aria-hidden
          className="block"
          style={{
            width: 26,
            height: '0.5px',
            backgroundColor: 'rgba(196,168,117,0.7)',
          }}
        />
        <span
          className="font-mono text-[11px] uppercase"
          style={{ color: CHAMPAGNE, letterSpacing: '0.22em' }}
        >
          Custom · Iced · One-of-one
        </span>
      </motion.div>
    </div>
  )
}

function DesktopHeadline({
  lineY1,
  lineY2,
  lineY3,
}: {
  lineY1: MotionValue<string>
  lineY2: MotionValue<string>
  lineY3: MotionValue<string>
}) {
  const lines = [
    { text: 'Iced.', y: lineY1 },
    { text: 'Custom.', y: lineY2 },
    { text: 'Yours.', y: lineY3 },
  ] as const

  return (
    <div
      aria-hidden
      className="font-display"
      style={{
        color: CREAM,
        fontWeight: 400,
        fontSize: 'clamp(2.75rem, 6.3vw, 6.3rem)',
        lineHeight: 0.98,
        letterSpacing: '-0.035em',
        fontVariationSettings: '"opsz" 144',
      }}
    >
      {lines.map(({ text, y }) => (
        <span
          key={text}
          aria-hidden
          className="block overflow-hidden"
          // Pad the clip mask down so descenders ("y" in Yours) clear
          // the bottom edge during the rise without being shaved.
          style={{ paddingBottom: '0.06em' }}
        >
          <motion.span
            className="block will-change-transform"
            style={{ y }}
          >
            {text}
          </motion.span>
        </span>
      ))}
    </div>
  )
}

function DesktopBody({
  opacity,
  y,
}: {
  opacity: MotionValue<number>
  y: MotionValue<number>
}) {
  return (
    <motion.p
      style={{ opacity, y, color: CREAM_MUTED }}
      className="mt-14 max-w-[34ch] font-sans text-[15px] leading-[1.65] md:text-[16px]"
    >
      A small private atelier. We design, set, and finish every chain,
      pendant, and bridal piece by hand — no two ever the same.
    </motion.p>
  )
}

function DesktopCTAs({
  opacity,
  y,
}: {
  opacity: MotionValue<number>
  y: MotionValue<number>
}) {
  return (
    <motion.div
      style={{ opacity, y }}
      className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7"
    >
      <PrimaryCTA />
      <SecondaryCTA />
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────────────────
// Mobile — full-bleed photograph with type overlay, on-mount cascade
// ────────────────────────────────────────────────────────────────────

const mobileCascadeParent: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER.loose,
      delayChildren: 0.6,
    },
  },
}

const mobileCascadeChild: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.hero, ease: easeOutExpo },
  },
}

const mobileLineParent: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER.tight * 1.4,
      delayChildren: 0,
    },
  },
}

const mobileLineChild: Variants = {
  hidden: { y: '110%' },
  visible: {
    y: '0%',
    transition: { duration: DURATION.hero, ease: easeOutExpo },
  },
}

function MobileHero() {
  return (
    <div className="relative h-[100svh] w-full overflow-hidden">
      {/* Header trigger sentinel — section's bottom edge. */}
      <div
        data-hero-end
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-px w-full"
      />

      {/* Photograph — full-bleed. */}
      <picture className="absolute inset-0 block">
        <source media="(max-width: 1023px)" type="image/avif" srcSet={PHOTO_TALL_AVIF} />
        <source media="(max-width: 1023px)" type="image/webp" srcSet={PHOTO_TALL_WEBP} />
        <img
          src={PHOTO_TALL_JPG}
          alt={PHOTO_ALT}
          width={1122}
          height={1402}
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover"
          // Crop biases up + slightly right so the model's chain sits
          // in the upper-right quadrant — clear of the type overlay
          // at the lower-left.
          style={{ objectPosition: '55% 35%' }}
        />
      </picture>

      {/* Velvet wash — bottom-heavy variant for the mobile column. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: VELVET_WASH_MOBILE }}
      />

      {/* Grain — same recipe as desktop. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-overlay"
        style={{
          opacity: 0.16,
          backgroundImage: GRAIN_SVG,
          backgroundSize: '220px 220px',
        }}
      />

      {/* Type stack — overlaid lower-left, on-mount cascade. The 0.6s
          delayChildren keeps the photo wordless on landing so the
          mobile experience also opens with the photograph alone. */}
      <motion.div
        variants={mobileCascadeParent}
        initial="hidden"
        animate="visible"
        className="absolute inset-x-0 bottom-0 z-10 px-6 pb-8 md:px-10"
      >
        {/* Eyebrow */}
        <motion.div
          variants={mobileCascadeChild}
          className="mb-6 flex items-center gap-3"
        >
          <span
            aria-hidden
            className="block"
            style={{
              width: 26,
              height: '0.5px',
              backgroundColor: 'rgba(196,168,117,0.7)',
            }}
          />
          <span
            className="font-mono text-[11px] uppercase"
            style={{ color: CHAMPAGNE, letterSpacing: '0.22em' }}
          >
            Custom · Iced · One-of-one
          </span>
        </motion.div>

        {/* Headline */}
        <motion.div
          aria-hidden
          variants={mobileLineParent}
          className="font-display"
          style={{
            color: CREAM,
            fontWeight: 400,
            fontSize: 'clamp(2.4rem, 11.9vw, 4.6rem)',
            lineHeight: 0.98,
            letterSpacing: '-0.035em',
            fontVariationSettings: '"opsz" 144',
          }}
        >
          {(['Iced.', 'Custom.', 'Yours.'] as const).map((line) => (
            <span
              key={line}
              aria-hidden
              className="block overflow-hidden"
              style={{ paddingBottom: '0.06em' }}
            >
              <motion.span
                variants={mobileLineChild}
                className="block will-change-transform"
              >
                {line}
              </motion.span>
            </span>
          ))}
        </motion.div>

        {/* Body */}
        <motion.p
          variants={mobileCascadeChild}
          className="mt-10 max-w-[34ch] font-sans text-[15px] leading-[1.65]"
          style={{ color: CREAM_MUTED }}
        >
          A small private atelier. We design, set, and finish every chain,
          pendant, and bridal piece by hand — no two ever the same.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={mobileCascadeChild}
          className="mt-7 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-6"
        >
          <PrimaryCTA />
          <SecondaryCTA />
        </motion.div>
      </motion.div>

      {/* Scroll indicator — visible only during the wordless landing
          window, then fades out as the cascade begins. */}
      <motion.div
        aria-hidden
        initial={{ opacity: 1 }}
        animate={{ opacity: 0 }}
        transition={{ duration: 0.4, delay: 0.45, ease: easeApple }}
        className="pointer-events-none absolute inset-x-0 bottom-7 z-20 flex flex-col items-center gap-3"
      >
        <span
          className="font-mono text-[10px] uppercase"
          style={{ color: SAGE, letterSpacing: '0.32em' }}
        >
          Scroll
        </span>
        <span
          className="block"
          style={{
            width: 28,
            height: '0.5px',
            backgroundColor: CHAMPAGNE,
            animation: 'hero-pulse 2s ease-in-out infinite',
          }}
        />
      </motion.div>
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────
// CTAs — shared between desktop, mobile, and reduced-motion layouts
// ────────────────────────────────────────────────────────────────────

function PrimaryCTA() {
  // Commerce-first re-skin (plan U7): the hero's primary action now lands
  // on the storefront; the commission funnel moves to the secondary CTA.
  return (
    <motion.a
      href="/shop"
      initial="rest"
      animate="rest"
      whileHover="hover"
      whileFocus="hover"
      variants={{
        rest: {
          y: 0,
          backgroundColor: CREAM,
          color: FOREST,
          boxShadow: '0 0 0 0 rgba(0,0,0,0)',
        },
        hover: {
          y: -2,
          backgroundColor: '#FFFFFF',
          color: FOREST,
          boxShadow:
            '0 0 0 1px rgba(196,168,117,0.55), 0 14px 32px -10px rgba(0,0,0,0.55)',
        },
      }}
      transition={{ duration: DURATION.hover, ease: easeApple }}
      className="inline-flex items-center justify-center gap-3 rounded-full font-mono text-[11px] font-medium uppercase"
      style={{ letterSpacing: '0.22em', padding: '17px 30px' }}
    >
      <span>Shop the collection</span>
      <span aria-hidden style={{ fontSize: 14, lineHeight: 1 }}>
        →
      </span>
    </motion.a>
  )
}

function SecondaryCTA() {
  const onClick = useSmoothScrollTo('visit')
  return (
    <a
      href="#visit"
      onClick={onClick}
      className="group inline-flex items-center gap-3 font-mono text-[11px] uppercase"
      style={{ color: CHAMPAGNE, letterSpacing: '0.22em' }}
    >
      <span className="relative">
        Start a custom piece
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -bottom-1 origin-left scale-x-0 transition-transform duration-hover ease-apple group-hover:scale-x-100"
          style={{ height: '0.5px', backgroundColor: CHAMPAGNE }}
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
// Reduced-motion fallback — static full-bleed composition
// ────────────────────────────────────────────────────────────────────

function StaticHero() {
  return (
    <motion.section
      data-hero
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, ease: easeApple }}
      className="relative h-[100svh] w-full overflow-hidden"
      style={{ backgroundColor: FOREST }}
    >
      <h1 className="sr-only">
        Custom Men&rsquo;s Gold Chains, Moissanite &amp; Fine Jewelry
      </h1>
      {/* Photograph */}
      <picture className="absolute inset-0 block">
        <source media="(min-width: 1024px)" type="image/avif" srcSet={PHOTO_WIDE_AVIF} />
        <source media="(min-width: 1024px)" type="image/webp" srcSet={PHOTO_WIDE_WEBP} />
        <source media="(min-width: 1024px)" type="image/jpeg" srcSet={PHOTO_WIDE_JPG} />
        <source media="(max-width: 1023px)" type="image/avif" srcSet={PHOTO_TALL_AVIF} />
        <source media="(max-width: 1023px)" type="image/webp" srcSet={PHOTO_TALL_WEBP} />
        <img
          src={PHOTO_TALL_JPG}
          alt={PHOTO_ALT}
          width={1122}
          height={1402}
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover"
          style={{ objectPosition: '60% 50%' }}
        />
      </picture>

      {/* Velvet wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: VELVET_WASH }}
      />

      {/* Grain */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-overlay"
        style={{
          opacity: 0.16,
          backgroundImage: GRAIN_SVG,
          backgroundSize: '220px 220px',
        }}
      />

      {/* Type stack — lower-left overlay, no choreography */}
      <div className="absolute inset-x-0 bottom-0 z-10 px-6 pb-8 md:px-10 lg:px-16 lg:pb-10">
        <div className="mx-auto max-w-[1440px]">
          <div className="w-full max-w-[640px] lg:w-[54%]">
            <div className="mb-7 flex items-center gap-3">
              <span
                aria-hidden
                className="block"
                style={{
                  width: 26,
                  height: '0.5px',
                  backgroundColor: 'rgba(196,168,117,0.7)',
                }}
              />
              <span
                className="font-mono text-[11px] uppercase"
                style={{ color: CHAMPAGNE, letterSpacing: '0.22em' }}
              >
                Custom · Iced · One-of-one
              </span>
            </div>

            <div
              aria-hidden
              className="font-display"
              style={{
                color: CREAM,
                fontWeight: 400,
                fontSize: 'clamp(2.4rem, 6.1vw, 5.8rem)',
                lineHeight: 0.98,
                letterSpacing: '-0.035em',
                fontVariationSettings: '"opsz" 144',
              }}
            >
              <span className="block">Iced.</span>
              <span className="block">Custom.</span>
              <span className="block">Yours.</span>
            </div>

            <p
              className="mt-12 max-w-[34ch] font-sans text-[15px] leading-[1.65] md:text-[16px]"
              style={{ color: CREAM_MUTED }}
            >
              A small private atelier. We design, set, and finish every
              chain, pendant, and bridal piece by hand — no two ever the same.
            </p>

            <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-7">
              <PrimaryCTA />
              <SecondaryCTA />
            </div>
          </div>
        </div>
      </div>

      <div
        data-hero-end
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-0 h-px w-full"
      />
    </motion.section>
  )
}
