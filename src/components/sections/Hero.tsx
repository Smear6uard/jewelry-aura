/**
 * components/sections/Hero.tsx — landing-page hero
 *
 * Composition (full-bleed, no card frame):
 *   • Desktop ≥1024px: subject photograph occupies the right two-thirds
 *     of the viewport, edge-bleeding right + bottom. Type stack lives in
 *     the left third. A horizontal gradient (forest → transparent by
 *     ~40% screen width) sits over the image to guarantee type contrast.
 *   • Mobile <1024px: vertical photograph fills the upper two-thirds, a
 *     vertical gradient softens the seam, and the type stack sits on
 *     solid forest below.
 *
 * Photographs:
 *   The two existing assets in /public are served via <picture> with a
 *   media query — never cropped from one to the other. The horizontal
 *   asset is the desktop LCP element; the vertical is the mobile LCP
 *   element. Both are eligible for fetchPriority=high so the chosen
 *   asset paints as soon as possible.
 *
 * On-load sequence (ms relative to mount):
 *   0    photograph: fade 0→1 + scale 1.04→1.0 (DURATION.page, easeApple)
 *   200  header: handled in Header.tsx
 *   400  eyebrow:   fadeUp
 *   500  headline:  SplitText word reveal across three lines, tight stagger
 *   1100 sub-line:  fadeUp
 *   1300 CTA row:   fadeUp (both CTAs together, no inner stagger)
 *   1500 scroll indicator: fadeIn, then continuous opacity pulse
 *   1600 corner hairline (desktop only): fadeIn, then continuous opacity pulse
 *
 * Reduced motion:
 *   The whole sequence collapses to a single 200ms opacity fade for the
 *   section. No stagger, no parallax, no pulse loops. Each motion
 *   primitive (SplitText, motion.* with delays) is gated through
 *   `useReducedMotion` so the children render statically while the
 *   wrapping section handles the global fade.
 *
 * Parallax:
 *   The photograph translates 0 → 60px as the hero scrolls past. Driven
 *   off the Lenis instance directly via `useLenis()` rather than
 *   `useScroll`, so the y motion stays in lockstep with the smoothed
 *   scroll position (no 1-frame jitter from cross-RAF reads). The type
 *   stack is intentionally NOT parallaxed — only the image moves.
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

// /public files are served from the site root. Filenames contain spaces
// and commas — encode them so the URL is unambiguous in <source srcSet>
// and <img src> contexts (some attributes URL-decode differently).
const PHOTO_HORIZONTAL = '/ChatGPT%20Image%20Apr%2028%2C%202026%2C%2002_19_15%20PM.png'
const PHOTO_VERTICAL = '/ChatGPT%20Image%20Apr%2028%2C%202026%2C%2002_18_10%20PM.png'

const PHOTO_ALT =
  'A young man in a black open-collar shirt wearing a single warm gold rope chain, photographed against deep forest-green velvet.'

// Total y-translation applied to the photograph across the hero's own
// scroll lifecycle. Subtle on purpose — anything more reads as "doing
// parallax" rather than "having depth."
const PARALLAX_RANGE_PX = 60

// Pulse opacity range for the scroll indicator hairline. Centered just
// below 50% so the line still reads at its dimmest moment.
const SCROLL_PULSE_LOOP = [0.4, 0.8, 0.4] as const

// Corner hairline pulse — narrower amplitude than the scroll indicator
// because it's a decorative mark, not a wayfinding hint.
const CORNER_PULSE_LOOP = [0.45, 0.7, 0.45] as const

export function Hero() {
  // useReducedMotion can return null during SSR / before the media
  // query has matched; coerce to a strict boolean so downstream
  // components don't have to handle the tri-state.
  const reduced = !!useReducedMotion()
  const sectionRef = useRef<HTMLElement>(null)
  const photoY = useMotionValue(0)
  const lenis = useLenis()

  // ─── Parallax wiring ───────────────────────────────────────────────
  // Compute section-local progress from Lenis's smoothed scroll value
  // and the section's offset in the document. Driving photoY directly
  // (instead of via Framer's useScroll) keeps the photo's translation
  // aligned to Lenis's RAF tick, which is the whole point of running
  // Lenis in the first place.
  useEffect(() => {
    if (reduced || !lenis || !sectionRef.current) return
    const section = sectionRef.current

    const update = (scroll: number) => {
      const top = section.offsetTop
      const height = section.offsetHeight || 1
      // Local progress: 0 when the hero's top hits the viewport top,
      // 1 when the hero's bottom has just left the viewport.
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

  // ─── Reduced-motion shortcut ───────────────────────────────────────
  // When the user prefers reduced motion the entire hero fades in once
  // over 200ms and every child renders statically. Gating each child's
  // animate prop on `reduced` is verbose but keeps the JSX a single
  // tree (no fork into a parallel "static hero").
  const sectionInitial = reduced ? { opacity: 0 } : { opacity: 1 }
  const sectionAnimate = { opacity: 1 }
  const sectionTransition = reduced
    ? { duration: 0.2, ease: easeApple }
    : { duration: 0 }

  return (
    <motion.section
      ref={sectionRef}
      initial={sectionInitial}
      animate={sectionAnimate}
      transition={sectionTransition}
      className="relative h-svh min-h-[760px] w-full overflow-hidden"
      style={{ backgroundColor: '#14261F' }}
    >
      {/* ─── Photograph ─────────────────────────────────────────────
          Mobile: top-0 → bottom 1/3 (upper two-thirds).
          Desktop: right two-thirds, bleeds to the right + bottom edges.
          motion.div carries the parallax translation; <picture> picks
          the right asset per breakpoint and the <img> is the LCP element. */}
      <motion.div
        style={{ y: reduced ? 0 : photoY }}
        initial={reduced ? false : { opacity: 0, scale: 1.04 }}
        animate={reduced ? false : { opacity: 1, scale: 1 }}
        transition={
          reduced
            ? undefined
            : { duration: DURATION.page, ease: easeApple }
        }
        className="absolute inset-x-0 top-0 bottom-1/3 lg:inset-y-0 lg:left-1/3 lg:right-0 lg:bottom-0 will-change-transform"
      >
        <picture className="block h-full w-full">
          <source media="(min-width: 1024px)" srcSet={PHOTO_HORIZONTAL} />
          <source media="(max-width: 1023px)" srcSet={PHOTO_VERTICAL} />
          <img
            src={PHOTO_HORIZONTAL}
            alt={PHOTO_ALT}
            // Hero is the LCP element — never lazy-load.
            // eslint-disable-next-line jsx-a11y/img-redundant-alt -- alt is a real description, not "image of"
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </picture>
      </motion.div>

      {/* ─── Desktop gradient (forest → transparent by ~40% width) ──
          Lives over the photograph to keep the type stack legible. The
          stop positions are tuned so the photograph still feels present
          at its leftmost edge — a hard 0%→100% cutoff would read as
          a column divider, not a contrast assist. */}
      <div
        className="pointer-events-none absolute inset-0 hidden lg:block"
        style={{
          background:
            'linear-gradient(to right, #14261F 0%, rgba(20, 38, 31, 0.92) 18%, rgba(20, 38, 31, 0.55) 30%, rgba(20, 38, 31, 0) 42%)',
        }}
      />

      {/* ─── Mobile seam gradient (photo bottom → type stack) ───────
          Sits over the lower band of the photograph so the transition
          into the type stack is a soft fade, not a hard line. */}
      <div
        className="pointer-events-none absolute inset-x-0 lg:hidden"
        style={{
          top: '40%',
          bottom: '33.333%',
          background:
            'linear-gradient(to bottom, rgba(20, 38, 31, 0) 0%, rgba(20, 38, 31, 0.7) 70%, #14261F 100%)',
        }}
      />

      {/* ─── Type stack ─────────────────────────────────────────────
          Anchored to the lower third on mobile and to the left third
          on desktop. The desktop block's vertical center is biased
          slightly above viewport center so it sits roughly on the
          subject's eye line, not the page midpoint. */}
      <div className="relative z-10 flex h-full flex-col">
        <div className="flex-1 lg:hidden" aria-hidden />
        <div
          className={[
            'mx-auto w-full max-w-[1440px]',
            // Mobile: the type stack lives in the bottom third.
            'px-6 pb-16 pt-6',
            // Desktop: align to left third with generous padding,
            // and vertically center on the subject's eye line.
            'lg:flex lg:flex-1 lg:flex-col lg:justify-center lg:px-12 lg:pb-0 lg:pt-0',
            'lg:[&>*]:max-w-[40ch]',
          ].join(' ')}
        >
          <div className="lg:max-w-[44ch] lg:pr-8 lg:-mt-[6vh]">
            <Eyebrow reduced={reduced} />
            <Headline reduced={reduced} />
            <SubLine reduced={reduced} />
            <CTARow reduced={reduced} />
          </div>
        </div>
      </div>

      {/* ─── Scroll indicator ───────────────────────────────────────
          Bottom-right on desktop, centered on mobile. The hairline
          pulses opacity continuously after the initial fade. */}
      <ScrollIndicator reduced={reduced} />

      {/* ─── Corner hairline (desktop only) ─────────────────────────
          A 32px square with only top + right borders. Sits inside the
          hero (below the resting header), reads as a precision mark. */}
      <CornerHairline reduced={reduced} />
    </motion.section>
  )
}

// ────────────────────────────────────────────────────────────────────
// Type-stack pieces. Extracted as small components so each can own its
// reduced-motion branch without bloating the parent's JSX.
// ────────────────────────────────────────────────────────────────────

function Eyebrow({ reduced }: { reduced: boolean }) {
  return (
    <motion.p
      initial={reduced ? false : 'hidden'}
      animate={reduced ? false : 'visible'}
      variants={fadeUp}
      transition={{ delay: 0.4, duration: DURATION.content, ease: easeOutExpo }}
      className="font-sans text-[11px] uppercase md:text-[12px]"
      style={{ color: '#C4A875', letterSpacing: '0.18em' }}
    >
      Chicago&nbsp;·&nbsp;Bespoke jewelry
    </motion.p>
  )
}

function Headline({ reduced }: { reduced: boolean }) {
  // Three single-word lines stacked vertically. Each line is its own
  // SplitText so the per-word stagger inside SplitText still reads as
  // line-to-line cascade. Per-line `delay` extends the staggerParent's
  // start time so the rhythm is continuous from line 1 → line 3.
  const baseDelay = 0.5
  return (
    <h1
      // Aria-label spans the whole sentence so AT reads "Iced. Custom.
      // Yours." as one phrase rather than three separate lines.
      aria-label="Iced. Custom. Yours."
      className="mt-6 font-serif font-medium md:mt-7"
      style={{
        color: '#F0EBE0',
        fontSize: 'clamp(2.75rem, 8.5vw, 7rem)',
        lineHeight: 0.98,
        letterSpacing: '-0.02em',
      }}
    >
      <span aria-hidden className="block">
        <SplitText as="span" delay={reduced ? 0 : baseDelay}>
          Iced.
        </SplitText>
      </span>
      <span aria-hidden className="block">
        <SplitText as="span" delay={reduced ? 0 : baseDelay + STAGGER.tight}>
          Custom.
        </SplitText>
      </span>
      <span aria-hidden className="block">
        <SplitText as="span" delay={reduced ? 0 : baseDelay + STAGGER.tight * 2}>
          Yours.
        </SplitText>
      </span>
    </h1>
  )
}

function SubLine({ reduced }: { reduced: boolean }) {
  return (
    <motion.p
      initial={reduced ? false : 'hidden'}
      animate={reduced ? false : 'visible'}
      variants={fadeUp}
      transition={{ delay: 1.1, duration: DURATION.content, ease: easeOutExpo }}
      className="mt-7 max-w-[28ch] font-sans text-[15px] leading-relaxed md:text-[16px]"
      style={{ color: '#C0B8A6' }}
    >
      Custom chains, pendants, and bridal pieces — hand-crafted in Chicago,
      one piece at a time.
    </motion.p>
  )
}

function CTARow({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      initial={reduced ? false : 'hidden'}
      animate={reduced ? false : 'visible'}
      variants={fadeUp}
      transition={{ delay: 1.3, duration: DURATION.content, ease: easeOutExpo }}
      className="mt-10 flex flex-col items-stretch gap-5 sm:items-start lg:flex-row lg:items-center lg:gap-7"
    >
      <PrimaryCTA />
      <SecondaryCTA />
    </motion.div>
  )
}

/**
 * Cream-filled pill. On hover, lifts ~2px and gains a champagne ring
 * along with a quiet shadow — the only "reach toward you" interaction
 * in the hero. The fill itself stays cream; introducing a champagne
 * fill here would compete with the eyebrow and the secondary link.
 */
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
          boxShadow:
            '0 0 0 0px rgba(196, 168, 117, 0), 0 0 0 0 rgba(20, 38, 31, 0)',
        },
        hover: {
          y: -2,
          boxShadow:
            '0 0 0 1px rgba(196, 168, 117, 0.7), 0 12px 28px -10px rgba(20, 38, 31, 0.55)',
        },
      }}
      transition={{ duration: DURATION.hover, ease: easeApple }}
      className="inline-flex w-full items-center justify-center rounded-full font-sans text-[15px] font-medium tracking-[0.005em] sm:w-auto"
      style={{
        backgroundColor: '#F0EBE0',
        color: '#14261F',
        padding: '15px 32px',
      }}
    >
      Start a custom piece
    </motion.a>
  )
}

/**
 * Text-only link with a champagne underline that draws in left → right
 * on hover via scaleX on a child span. Arrow is a typographic → glyph,
 * not a Lucide icon — keeps the link visually weightless next to the
 * primary pill.
 */
function SecondaryCTA() {
  return (
    <a
      href="#work"
      className="group inline-flex items-center gap-2 self-center font-sans text-[14px] sm:self-start"
      style={{ color: '#C4A875', letterSpacing: '0.04em' }}
    >
      <span className="relative">
        See our work
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
// Decorative pieces
// ────────────────────────────────────────────────────────────────────

function ScrollIndicator({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      initial={reduced ? false : 'hidden'}
      animate={reduced ? false : 'visible'}
      variants={fadeIn}
      transition={{ delay: 1.5, duration: DURATION.content, ease: easeApple }}
      className={[
        // Mobile: centered horizontally, near the very bottom.
        'absolute z-10 flex items-center gap-3',
        'inset-x-0 bottom-6 justify-center',
        // Desktop: pinned to the bottom-right, no longer centered.
        'lg:inset-x-auto lg:bottom-10 lg:right-12 lg:justify-start',
      ].join(' ')}
    >
      <span
        className="font-sans text-[10px] uppercase"
        style={{ color: '#C0B8A6', letterSpacing: '0.18em' }}
      >
        Scroll
      </span>
      <motion.span
        // After the initial fade-in, opacity loops between 0.4 and 0.8
        // forever. easeInOut so the cycle reads as a "breath" rather
        // than a blink. Reduced-motion clamps to a static line.
        animate={
          reduced
            ? undefined
            : {
                opacity: [
                  SCROLL_PULSE_LOOP[0],
                  SCROLL_PULSE_LOOP[1],
                  SCROLL_PULSE_LOOP[2],
                ],
              }
        }
        transition={
          reduced
            ? undefined
            : {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1.5 + DURATION.content,
              }
        }
        className="block"
        style={{
          width: 28,
          height: '0.5px',
          backgroundColor: '#C4A875',
          opacity: reduced ? 0.6 : SCROLL_PULSE_LOOP[0],
        }}
      />
    </motion.div>
  )
}

function CornerHairline({ reduced }: { reduced: boolean }) {
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0 }}
      animate={reduced ? false : { opacity: 1 }}
      transition={{ delay: 1.6, duration: DURATION.content, ease: easeApple }}
      // Sits inside the hero (below the resting header), top-right.
      // Hidden on mobile — at this size it stops reading.
      className="pointer-events-none absolute right-12 top-28 hidden lg:block"
    >
      <motion.div
        animate={
          reduced
            ? undefined
            : {
                opacity: [
                  CORNER_PULSE_LOOP[0],
                  CORNER_PULSE_LOOP[1],
                  CORNER_PULSE_LOOP[2],
                ],
              }
        }
        transition={
          reduced
            ? undefined
            : {
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1.6 + DURATION.content,
              }
        }
        style={{
          width: 32,
          height: 32,
          borderTopWidth: '0.5px',
          borderRightWidth: '0.5px',
          borderTopStyle: 'solid',
          borderRightStyle: 'solid',
          borderColor: '#C4A875',
          opacity: reduced ? 0.5 : CORNER_PULSE_LOOP[0],
        }}
      />
    </motion.div>
  )
}
