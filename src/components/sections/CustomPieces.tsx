/**
 * components/sections/CustomPieces.tsx — pinned horizontal-scroll editorial strip
 *
 * Custom Pieces section — replaces the legacy bento grid wholesale. Pieces
 * flow horizontally as the user scrolls vertically through the section.
 * Mirrors the scroll-pinning pattern used by KITH and Bottega Veneta case
 * studies: pin the section to the viewport, translate the piece strip
 * horizontally on a Lenis-coupled motionValue.
 *
 * Layout / pinning (desktop ≥1024px):
 *   • 360svh wrapper. The 100svh panel is translated down by a Lenis-
 *     coordinated motionValue so it pins at the viewport top across the
 *     full pin range. NOT position:sticky — the pin is driven by scroll-
 *     linked Framer transforms so it stays in lockstep with Lenis-smoothed
 *     scroll values (mirrors the Hero's pin architecture).
 *   • Inside the panel: a horizontal track containing the section header
 *     column + N piece cards + the final commission card. The track's
 *     translateX maps progress 0..1 to 0 → −(trackWidth − viewportWidth).
 *   • Header column lives at the start of the track; it slides off as the
 *     strip advances. The brief calls for the header to be visible "as the
 *     strip begins," not for it to remain fixed once the strip overtakes it.
 *
 * Mobile (<1024px): horizontal-on-vertical scroll doesn't work on touch.
 *   The pin is replaced with a native snap-x carousel — same cards, same
 *   hover quality, swiped with the thumb. Section header sits above.
 *
 * Photographs (in /public):
 *   - JA-image1..5.png — pieces re-photographed on forest velvet, lighting
 *     matched to the hero portrait. Display in full color, no filters,
 *     no desaturation.
 *
 * Card hover (the section's polish moment):
 *   • Scale 1.0 → 1.02 (easeApple, duration-hover).
 *   • Warm radial wash fades in over the photo — a barely-perceptible
 *     temperature shift toward champagne.
 *   • "Commission similar →" caption fades up beneath the meta line.
 *
 * Reveal cadence:
 *   • Section header: SplitText (viewport='scroll') for the headline,
 *     Reveal for body copy.
 *   • Piece cards: opacity 0.55 → 1.0 as each card crosses the central
 *     50% of the viewport. Implemented with whileInView + a margin-
 *     shrunken viewport so the trigger fires on horizontal entry rather
 *     than the section's vertical pin.
 *
 * Progress indicator:
 *   • Champagne hairline, 1px, anchored to the bottom of the pinned
 *     viewport. Width animates from 0% → 100% across pin progress. The
 *     mobile carousel uses native scroll progress for the same hairline.
 *
 * Reduced motion: the pinned choreography collapses to a static stack of
 *   piece cards on desktop (no horizontal travel, no pin); mobile keeps
 *   the native carousel which is already user-driven.
 */

import { useEffect, useRef, useState } from 'react'
import {
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import {
  DURATION,
  easeApple,
  easeOutExpo,
  useReducedMotion,
} from '~/lib/motion'
import { useLenis } from '~/lib/lenis'
import { useSmoothScrollTo } from '~/lib/scroll-to'
import { SplitText } from '~/components/motion/SplitText'
import { Reveal } from '~/components/motion/Reveal'

// ─── Palette (mirrors hero) ─────────────────────────────────────────
const FOREST = '#14261F'
const FOREST_DEEP = '#0E1A15'
const CREAM = '#F0EBE0'
const CREAM_MUTED = '#C0B8A6'
const CHAMPAGNE = '#C4A875'
const SAGE = '#9FB6A6'

// Hand-tuned grain — same recipe as the hero so the two sections share
// a single film stock. Dialed lower opacity here because the velvet
// backgrounds in the photographs already carry their own texture.
const GRAIN_SVG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/></svg>\")"

// ─── Piece data ─────────────────────────────────────────────────────
// Numbered as a curated dossier — "No. 01 / Twenty-Three" reads as a
// gallery card label, not an SKU. Meta line names material + form;
// no prices, ever (these are commissions, not products).

type Piece = {
  id: string
  name: string
  meta: string
  image: string
  width: number
  height: number
  alt: string
  /** objectPosition for the photograph crop. */
  focus?: string
}

const PIECES: Piece[] = [
  {
    id: '01',
    name: 'Twenty-Three',
    meta: 'White gold · Praying-hands plate',
    image: '/JA-image1.png',
    width: 1122,
    height: 1402,
    alt: 'Custom 23 plate pendant with praying-hands cap, set in white gold and baguette diamonds, photographed on forest velvet.',
    focus: '52% 50%',
  },
  {
    id: '02',
    name: 'Kemo',
    meta: 'White gold · Custom monogram',
    image: '/JA-image2.png',
    width: 1122,
    height: 1402,
    alt: 'Custom KEMO monogram pendant in white gold, fully iced with round and baguette stones, on forest velvet.',
    focus: '52% 50%',
  },
  {
    id: '03',
    name: 'Queen',
    meta: 'Yellow gold · Heart drop · Two-tone',
    image: '/JA-image3.png',
    width: 1122,
    height: 1402,
    alt: 'Custom Queen script pendant with heart drop, yellow gold and pavé diamonds, on forest velvet.',
    focus: '50% 50%',
  },
  {
    id: '04',
    name: 'ATDB',
    meta: 'Two-tone · Hand-engraved plate',
    image: '/JA-image4.png',
    width: 1122,
    height: 1402,
    alt: 'Custom ATDB block pendant in two-tone gold with engraved tagline, hand-set diamonds, on forest velvet.',
    focus: '52% 50%',
  },
  {
    id: '05',
    name: 'ATDB · Suspended',
    meta: 'Two-tone · Cuban link suspension',
    image: '/JA-image5.png',
    width: 1086,
    height: 1448,
    alt: 'Custom ATDB plate suspended on a baguette-set Cuban link chain, two-tone gold, on forest velvet.',
    focus: '48% 45%',
  },
]

// ═══════════════════════════════════════════════════════════════════
// Top-level component — branches by viewport and reduced-motion
// ═══════════════════════════════════════════════════════════════════

export function CustomPieces() {
  const reduced = !!useReducedMotion()

  return (
    <section
      id="work"
      data-section="custom-pieces"
      className="relative w-full"
      style={{ backgroundColor: FOREST }}
    >
      {/* Top edge — soft fade from the section above for continuity. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0))',
        }}
      />

      <div className="hidden lg:block">
        {reduced ? <StaticDesktop /> : <PinnedDesktopStrip />}
      </div>
      <div className="block lg:hidden">
        <MobileCarousel />
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════════════════════════════
// Desktop — pinned, scroll-choreographed horizontal strip
// ═══════════════════════════════════════════════════════════════════

function PinnedDesktopStrip() {
  const lenis = useLenis()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  // Manual pin — same pattern as Hero. translateY equals the section's
  // local scroll into the wrapper, capped at the wrapper's pin range.
  const pinY = useMotionValue(0)
  // Local progress 0..1 across the pin window.
  const progress = useMotionValue(0)

  // Horizontal travel is computed at runtime from the rendered track
  // width minus viewport width. Storing the max distance in state lets
  // the transform chain stay declarative.
  const [maxX, setMaxX] = useState(0)

  // Track translateX — left across progress 0..1.
  const trackX = useTransform(progress, [0, 1], [0, -maxX])

  // Progress hairline width.
  const progressBarWidth = useTransform(progress, [0, 1], ['0%', '100%'])

  // Recompute the maximum translation distance whenever the track or
  // viewport resizes. The wrapper height is set in svh so it scales
  // with viewport vertical changes; the horizontal range scales with
  // both viewport width and any responsive card sizing.
  useEffect(() => {
    if (!trackRef.current) return
    const measure = () => {
      const track = trackRef.current
      if (!track) return
      const trackWidth = track.scrollWidth
      const viewportWidth = window.innerWidth
      const distance = Math.max(0, trackWidth - viewportWidth)
      setMaxX(distance)
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(trackRef.current)
    window.addEventListener('resize', measure)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

  // Pin coordination — subscribe directly to Lenis's smoothed scroll
  // event so the pin and the horizontal translation share its RAF tick.
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
    <div ref={wrapperRef} className="relative h-[360svh] w-full">
      <motion.div
        style={{ y: pinY }}
        className="absolute left-0 top-0 h-[100svh] w-full overflow-hidden will-change-transform"
      >
        {/* Section base — forest with a soft top-edge wash so the strip
            reads as a coherent stage. */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{ backgroundColor: FOREST }}
        />

        {/* Velvet wash — directional pool from the lower-left, mirrors
            the hero's atmospheric grammar. Softer here so the photos
            (which carry their own velvet) keep their full color. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              'radial-gradient(ellipse 70% 80% at 8% 96%, rgba(20,38,31,0.55) 0%, rgba(20,38,31,0) 60%)',
              'linear-gradient(to top, rgba(14,26,21,0.5) 0%, rgba(14,26,21,0) 35%)',
            ].join(', '),
          }}
        />

        {/* Grain — same printed sheet as the hero. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-overlay"
          style={{
            opacity: 0.12,
            backgroundImage: GRAIN_SVG,
            backgroundSize: '220px 220px',
          }}
        />

        {/* Horizontal track — header + pieces + commission card. The
            track itself is a flex row; the section header is its first
            child so it shares the row's vertical centering. */}
        <motion.div
          ref={trackRef}
          style={{ x: trackX }}
          className="absolute left-0 top-0 flex h-full items-center will-change-transform"
        >
          <SectionHeader total={PIECES.length} />

          {PIECES.map((piece, i) => (
            <PieceCard key={piece.id} piece={piece} index={i} />
          ))}

          <CommissionCard />
        </motion.div>

        {/* Bottom progress hairline — champagne, 1px, fills L→R with
            pin progress. Sits 28px from the bottom edge so it reads as
            an editorial caption rule, not a UI scrollbar. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-12 bottom-7 z-10 flex items-center gap-4"
        >
          <span
            className="font-mono text-[10px] uppercase"
            style={{ color: SAGE, letterSpacing: '0.32em' }}
          >
            Scroll · Strip
          </span>
          <span
            className="relative h-px flex-1 overflow-hidden"
            style={{ backgroundColor: 'rgba(196,168,117,0.18)' }}
          >
            <motion.span
              className="absolute left-0 top-0 block h-full"
              style={{
                width: progressBarWidth,
                backgroundColor: CHAMPAGNE,
              }}
            />
          </span>
          <ProgressIndex progress={progress} total={PIECES.length + 1} />
        </div>
      </motion.div>
    </div>
  )
}

// ─── Section header — first cell of the horizontal track ─────────────

function SectionHeader({ total }: { total: number }) {
  return (
    <div
      // Width sized so the first piece card peeks into the viewport on
      // initial pin — gives the strip a hint of forward motion.
      className="flex h-full shrink-0 flex-col justify-center pl-[clamp(2.5rem,5vw,5.5rem)] pr-[clamp(3rem,6vw,7rem)]"
      style={{ width: 'min(46rem, 50vw)' }}
    >
      {/* Eyebrow */}
      <Reveal>
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
            The work · No. 01 — 0{total}
          </span>
        </div>
      </Reveal>

      {/* Headline — split-rise word stagger, viewport-triggered. */}
      <SplitText
        as="h2"
        viewport="scroll"
        delay={0.05}
        className="font-display"
      >
        Custom pieces, hand-set in-house.
      </SplitText>

      <style>{`
        [data-section="custom-pieces"] h2 {
          color: ${CREAM};
          font-weight: 400;
          font-size: clamp(2.25rem, 4.4vw, 4.25rem);
          line-height: 0.98;
          letter-spacing: -0.03em;
          font-variation-settings: "opsz" 144;
          max-width: 14ch;
        }
      `}</style>

      {/* Body */}
      <Reveal delay={0.18}>
        <p
          className="mt-9 max-w-[36ch] font-sans text-[15px] leading-[1.65]"
          style={{ color: CREAM_MUTED }}
        >
          Each piece is one of one. Designed with the client, set by hand,
          finished to spec — no two ever the same. What you see is a curated
          frame of the work; the rest lives in the studio.
        </p>
      </Reveal>

      {/* Curation caption */}
      <Reveal delay={0.28}>
        <div className="mt-10 flex items-baseline gap-3">
          <span
            className="font-mono text-[10px] uppercase"
            style={{ color: SAGE, letterSpacing: '0.32em' }}
          >
            Currently showing
          </span>
          <span
            className="font-display text-[15px]"
            style={{ color: CREAM, letterSpacing: '0.02em' }}
          >
            {total} of 40+
          </span>
        </div>
      </Reveal>

      {/* Forward arrow — typographic, points the eye into the strip. */}
      <Reveal delay={0.38}>
        <div className="mt-10 flex items-center gap-3">
          <span
            aria-hidden
            className="block"
            style={{
              width: 60,
              height: '0.5px',
              backgroundColor: 'rgba(196,168,117,0.55)',
            }}
          />
          <span
            className="font-mono text-[11px] uppercase"
            style={{ color: CHAMPAGNE, letterSpacing: '0.28em' }}
          >
            Scroll →
          </span>
        </div>
      </Reveal>
    </div>
  )
}

// ─── Piece card — the editorial unit ─────────────────────────────────

function PieceCard({ piece, index }: { piece: Piece; index: number }) {
  const onCTAClick = useSmoothScrollTo('visit')
  const imageBase = piece.image.replace(/\.png$/, '')
  return (
    <motion.figure
      // The card animates between two states (rest / hover). Framer's
      // variant model keeps the children (caption fade-in) in the same
      // animation graph as the parent's scale and warm wash.
      tabIndex={0}
      className="relative mx-[clamp(2.25rem,3.4vw,4rem)] flex h-[64svh] shrink-0 flex-col outline-none"
      // Tall 3:4 portrait at 64svh tall.
      style={{ width: 'calc(64svh * 0.75)' }}
      // Cards reveal as they cross the center 50% of the viewport. The
      // negative left/right margins shrink the IO root so the trigger
      // fires on horizontal entry — vertical pin position is irrelevant.
      // `once: false` so cards dim again on the way out.
      initial={{ opacity: 0.55 }}
      whileInView={{ opacity: 1 }}
      viewport={{ amount: 0.55, once: false, margin: '0px -22% 0px -22%' }}
      transition={{ duration: DURATION.micro, ease: easeApple }}
    >
      {/* Hover variants live on a nested wrapper so the inView opacity
          fade and the hover scale/wash run on independent animation
          graphs — Framer would otherwise collapse them into a single
          variant transition and the inView opacity would re-trigger
          every hover. */}
      <motion.div
        initial="rest"
        whileHover="hover"
        whileFocus="hover"
        variants={{ rest: {}, hover: {} }}
        className="relative h-full w-full"
      >
        {/* Photograph wrapper — scale lives here so the warm wash and
            the caption (below) animate independently of the photo's
            scale transform. */}
        <motion.div
          className="relative h-[88%] w-full overflow-hidden"
          variants={{
            rest: { scale: 1 },
            hover: { scale: 1.02 },
          }}
          transition={{ duration: DURATION.hover * 1.6, ease: easeApple }}
          style={{
            backgroundColor: FOREST_DEEP,
            // Editorial framing rule — a hairline of champagne sits
            // around the photo, just enough to register as a frame.
            boxShadow: 'inset 0 0 0 0.5px rgba(196,168,117,0.28)',
          }}
        >
          <picture className="block h-full w-full">
            <source type="image/avif" srcSet={`${imageBase}.avif`} />
            <source type="image/webp" srcSet={`${imageBase}.webp`} />
            <img
              src={`${imageBase}.jpg`}
              alt={piece.alt}
              width={piece.width}
              height={piece.height}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover"
              style={{ objectPosition: piece.focus ?? '50% 50%' }}
            />
          </picture>

          {/* Warm light shift on hover — barely-perceptible champagne
              radial that fades in over the photo. The mix-blend-overlay
              biases the tone warmer without lifting overall brightness
              into a flash. */}
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 mix-blend-overlay"
            variants={{
              rest: { opacity: 0 },
              hover: { opacity: 0.55 },
            }}
            transition={{ duration: DURATION.hover * 2, ease: easeApple }}
            style={{
              background:
                'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(196,168,117,0.55) 0%, rgba(196,168,117,0.15) 40%, rgba(0,0,0,0) 75%)',
            }}
          />

          {/* Vignette — keeps the meta caption legible at the lower-left
              of the photo on cards that have light reflections there. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                'linear-gradient(to top, rgba(0,0,0,0.32) 0%, rgba(0,0,0,0) 35%)',
            }}
          />

          {/* Card index — printed at upper-left of the photo as a
              gallery label. Champagne mono on the photograph itself
              gives the card its editorial signature. */}
          <div className="absolute left-4 top-4 flex items-center gap-2">
            <span
              aria-hidden
              className="block"
              style={{
                width: 18,
                height: '0.5px',
                backgroundColor: 'rgba(196,168,117,0.85)',
              }}
            />
            <span
              className="font-mono text-[10px] uppercase"
              style={{ color: CHAMPAGNE, letterSpacing: '0.32em' }}
            >
              No. {piece.id}
            </span>
          </div>
        </motion.div>

        {/* Caption block — sits beneath the photograph in a dedicated
            12% strip. Two layers stacked: meta line (always visible)
            and "Commission similar" line (fades up on hover). Using
            a clipped wrapper so the hover line rises into place
            instead of nudging the meta. */}
        <figcaption className="relative h-[12%] w-full pt-4">
          <div className="flex items-baseline justify-between gap-4">
            <h3
              className="font-display text-[clamp(1.15rem,1.5vw,1.55rem)]"
              style={{
                color: CREAM,
                fontWeight: 400,
                letterSpacing: '-0.01em',
                fontVariationSettings: '"opsz" 72',
              }}
            >
              {piece.name}
            </h3>
            <span
              className="font-mono text-[10px] uppercase shrink-0"
              style={{ color: SAGE, letterSpacing: '0.28em' }}
            >
              One of one
            </span>
          </div>

          {/* Meta + hover caption stack — the wrapper has fixed height
              and overflow-hidden so the hover line slides up into the
              meta's place without reflowing the card. */}
          <div className="relative mt-2 h-5 overflow-hidden">
            <motion.div
              className="absolute inset-0 flex items-center"
              variants={{
                rest: { y: 0 },
                hover: { y: '-100%' },
              }}
              transition={{ duration: DURATION.hover * 1.4, ease: easeApple }}
            >
              <span
                className="font-mono text-[11px]"
                style={{ color: CREAM_MUTED, letterSpacing: '0.06em' }}
              >
                {piece.meta}
              </span>
            </motion.div>
            <motion.div
              className="absolute inset-0 flex items-center"
              variants={{
                rest: { y: '100%' },
                hover: { y: 0 },
              }}
              transition={{ duration: DURATION.hover * 1.4, ease: easeApple }}
            >
              <a
                href="#visit"
                onClick={onCTAClick}
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase"
                style={{ color: CHAMPAGNE, letterSpacing: '0.22em' }}
              >
                <span>Commission similar</span>
                <span aria-hidden style={{ fontSize: 13, lineHeight: 1 }}>
                  →
                </span>
              </a>
            </motion.div>
          </div>
        </figcaption>
      </motion.div>

      <span className="sr-only">{`Piece ${index + 1} of ${PIECES.length}`}</span>
    </motion.figure>
  )
}

// ─── Commission card — the strip's terminal CTA ──────────────────────

function CommissionCard() {
  const onClick = useSmoothScrollTo('visit')
  return (
    <motion.a
      href="#visit"
      onClick={onClick}
      initial="rest"
      whileHover="hover"
      whileFocus="hover"
      variants={{ rest: {}, hover: {} }}
      className="relative mx-[clamp(2.25rem,3.4vw,4rem)] flex h-[64svh] shrink-0 flex-col items-stretch outline-none"
      style={{ width: 'calc(64svh * 0.75)' }}
    >
      <motion.div
        className="relative flex h-[88%] w-full flex-col items-center justify-center overflow-hidden"
        variants={{
          rest: { scale: 1 },
          hover: { scale: 1.02 },
        }}
        transition={{ duration: DURATION.hover * 1.6, ease: easeApple }}
        style={{
          backgroundColor: FOREST_DEEP,
          // Champagne hairline frame — same rule as the piece cards so
          // this card reads as part of the same set, just inverted.
          boxShadow:
            'inset 0 0 0 0.5px rgba(196,168,117,0.45), 0 30px 80px -40px rgba(0,0,0,0.6)',
        }}
      >
        {/* Subtle inner velvet pool so the canvas has depth, not flat
            paint. Mirrors the lighting of the photographs. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              'radial-gradient(ellipse 90% 90% at 50% 65%, rgba(196,168,117,0.06) 0%, rgba(20,38,31,0) 60%)',
              'radial-gradient(ellipse 100% 70% at 50% 0%, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 55%)',
            ].join(', '),
          }}
        />

        {/* Grain on this card too so the texture matches the photos. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-overlay"
          style={{
            opacity: 0.18,
            backgroundImage: GRAIN_SVG,
            backgroundSize: '220px 220px',
          }}
        />

        {/* Index label — same position and typography as the piece
            cards. Reads as the next entry in the dossier. */}
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span
            aria-hidden
            className="block"
            style={{
              width: 18,
              height: '0.5px',
              backgroundColor: 'rgba(196,168,117,0.85)',
            }}
          />
          <span
            className="font-mono text-[10px] uppercase"
            style={{ color: CHAMPAGNE, letterSpacing: '0.32em' }}
          >
            No. {String(PIECES.length + 1).padStart(2, '0')}
          </span>
        </div>

        {/* Eyebrow */}
        <span
          className="font-mono text-[10px] uppercase"
          style={{ color: SAGE, letterSpacing: '0.32em' }}
        >
          The next one
        </span>

        {/* Centered serif headline — single line of cream type. */}
        <h3
          className="mt-6 px-8 text-center font-display"
          style={{
            color: CREAM,
            fontWeight: 400,
            fontSize: 'clamp(1.85rem, 2.6vw, 2.6rem)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            fontVariationSettings: '"opsz" 144',
          }}
        >
          Commission yours.
        </h3>

        <p
          className="mt-5 max-w-[28ch] px-6 text-center font-sans text-[13px] leading-[1.65]"
          style={{ color: CREAM_MUTED }}
        >
          Bring a sketch, a reference, or a name. We design and set the rest.
        </p>

        {/* CTA — pill, fades and lifts on hover. */}
        <motion.div
          className="mt-9 inline-flex items-center justify-center gap-3 rounded-full border font-mono text-[11px] uppercase"
          style={{
            borderColor: 'rgba(196,168,117,0.55)',
            color: CREAM,
            letterSpacing: '0.22em',
            padding: '14px 26px',
          }}
          variants={{
            rest: {
              backgroundColor: 'rgba(196,168,117,0)',
              color: CREAM,
              y: 0,
            },
            hover: {
              backgroundColor: CREAM,
              color: FOREST,
              y: -2,
            },
          }}
          transition={{ duration: DURATION.hover, ease: easeApple }}
        >
          <span>Start a piece</span>
          <span aria-hidden style={{ fontSize: 13, lineHeight: 1 }}>
            →
          </span>
        </motion.div>
      </motion.div>

      {/* Caption matched to the piece-card layout so the strip's
          baseline reads as one continuous editorial rule. */}
      <div className="relative h-[12%] w-full pt-4">
        <div className="flex items-baseline justify-between gap-4">
          <span
            className="font-display text-[clamp(1.15rem,1.5vw,1.55rem)]"
            style={{
              color: CREAM,
              fontWeight: 400,
              letterSpacing: '-0.01em',
              fontVariationSettings: '"opsz" 72',
            }}
          >
            Yours, next.
          </span>
          <span
            className="font-mono text-[10px] uppercase shrink-0"
            style={{ color: CHAMPAGNE, letterSpacing: '0.28em' }}
          >
            Begin →
          </span>
        </div>
        <div className="mt-2 h-5 flex items-center">
          <span
            className="font-mono text-[11px]"
            style={{ color: CREAM_MUTED, letterSpacing: '0.06em' }}
          >
            By consultation · Private studio
          </span>
        </div>
      </div>
    </motion.a>
  )
}

// ─── Progress index — small "1 / 6" readout next to the hairline ─────

function ProgressIndex({
  progress,
  total,
}: {
  progress: MotionValue<number>
  total: number
}) {
  // Map progress 0..1 to 1..total. Floor so each card "owns" its
  // numeric stretch of the strip rather than crossfading mid-card.
  const [index, setIndex] = useState(1)
  useEffect(() => {
    return progress.on('change', (v) => {
      const n = Math.min(total, Math.max(1, Math.floor(v * total) + 1))
      setIndex(n)
    })
  }, [progress, total])

  return (
    <span
      className="font-mono text-[10px] uppercase tabular-nums shrink-0"
      style={{ color: CREAM, letterSpacing: '0.32em' }}
    >
      {String(index).padStart(2, '0')}
      <span style={{ color: 'rgba(196,168,117,0.45)' }}> / </span>
      {String(total).padStart(2, '0')}
    </span>
  )
}

// ═══════════════════════════════════════════════════════════════════
// Mobile — native horizontal swipe carousel
// ═══════════════════════════════════════════════════════════════════

function MobileCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [progress, setProgress] = useState(0)

  // Native scroll progress drives the same hairline used on desktop.
  useEffect(() => {
    const el = scrollerRef.current
    if (!el) return
    const update = () => {
      const max = el.scrollWidth - el.clientWidth
      if (max <= 0) {
        setProgress(0)
        return
      }
      setProgress(el.scrollLeft / max)
    }
    update()
    el.addEventListener('scroll', update, { passive: true })
    return () => el.removeEventListener('scroll', update)
  }, [])

  return (
    <div className="relative w-full px-6 pb-16 pt-20">
      {/* Header */}
      <div className="mb-12 flex flex-col">
        <div className="mb-6 flex items-center gap-3">
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
            The work · 0{PIECES.length}
          </span>
        </div>

        <SplitText
          as="h2"
          viewport="scroll"
          delay={0.05}
          className="font-display"
        >
          Custom pieces, hand-set in-house.
        </SplitText>

        <Reveal delay={0.18}>
          <p
            className="mt-7 max-w-[34ch] font-sans text-[15px] leading-[1.65]"
            style={{ color: CREAM_MUTED }}
          >
            Each piece is one of one. Designed with the client, set by hand,
            finished to spec — no two ever the same.
          </p>
        </Reveal>

        <Reveal delay={0.28}>
          <div className="mt-7 flex items-baseline gap-3">
            <span
              className="font-mono text-[10px] uppercase"
              style={{ color: SAGE, letterSpacing: '0.32em' }}
            >
              Showing
            </span>
            <span
              className="font-display text-[15px]"
              style={{ color: CREAM, letterSpacing: '0.02em' }}
            >
              {PIECES.length} of 40+
            </span>
          </div>
        </Reveal>
      </div>

      {/* Carousel — native snap-x, full-bleed by negative margin so the
          cards reach the viewport edge while the header keeps its
          gutter. */}
      <div
        ref={scrollerRef}
        className="-mx-6 flex snap-x snap-mandatory gap-5 overflow-x-auto overflow-y-hidden px-6 pb-4"
        style={{
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <style>{`
          [data-section="custom-pieces"] [data-mobile-scroller]::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {PIECES.map((piece) => (
          <MobilePieceCard key={piece.id} piece={piece} />
        ))}

        <MobileCommissionCard />
      </div>

      {/* Hairline progress — same rule as desktop. */}
      <div className="mt-7 flex items-center gap-4 px-1">
        <span
          className="font-mono text-[10px] uppercase"
          style={{ color: SAGE, letterSpacing: '0.32em' }}
        >
          Swipe
        </span>
        <span
          className="relative h-px flex-1 overflow-hidden"
          style={{ backgroundColor: 'rgba(196,168,117,0.18)' }}
        >
          <span
            className="absolute left-0 top-0 block h-full transition-[width]"
            style={{
              width: `${Math.round(progress * 100)}%`,
              backgroundColor: CHAMPAGNE,
              transitionDuration: '120ms',
              transitionTimingFunction: 'cubic-bezier(0.32,0.72,0,1)',
            }}
          />
        </span>
      </div>

      <style>{`
        [data-section="custom-pieces"] h2 {
          color: ${CREAM};
          font-weight: 400;
          font-size: clamp(2rem, 8vw, 3.25rem);
          line-height: 1.0;
          letter-spacing: -0.03em;
          font-variation-settings: "opsz" 144;
          max-width: 14ch;
        }
      `}</style>
    </div>
  )
}

function MobilePieceCard({ piece }: { piece: Piece }) {
  const imageBase = piece.image.replace(/\.png$/, '')
  return (
    <motion.figure
      initial="rest"
      whileTap="hover"
      whileHover="hover"
      variants={{ rest: {}, hover: {} }}
      className="relative flex w-[80vw] max-w-[28rem] shrink-0 snap-center flex-col"
      style={{ height: '70svh' }}
    >
      <motion.div
        className="relative h-[88%] w-full overflow-hidden"
        variants={{ rest: { scale: 1 }, hover: { scale: 1.015 } }}
        transition={{ duration: DURATION.hover * 1.6, ease: easeApple }}
        style={{
          backgroundColor: FOREST_DEEP,
          boxShadow: 'inset 0 0 0 0.5px rgba(196,168,117,0.28)',
        }}
      >
        <picture className="block h-full w-full">
          <source type="image/avif" srcSet={`${imageBase}.avif`} />
          <source type="image/webp" srcSet={`${imageBase}.webp`} />
          <img
            src={`${imageBase}.jpg`}
            alt={piece.alt}
            width={piece.width}
            height={piece.height}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            style={{ objectPosition: piece.focus ?? '50% 50%' }}
          />
        </picture>
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-overlay"
          variants={{ rest: { opacity: 0 }, hover: { opacity: 0.45 } }}
          transition={{ duration: DURATION.hover * 2, ease: easeApple }}
          style={{
            background:
              'radial-gradient(ellipse 80% 70% at 50% 45%, rgba(196,168,117,0.5) 0%, rgba(196,168,117,0.12) 40%, rgba(0,0,0,0) 75%)',
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.34) 0%, rgba(0,0,0,0) 38%)',
          }}
        />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span
            aria-hidden
            className="block"
            style={{
              width: 18,
              height: '0.5px',
              backgroundColor: 'rgba(196,168,117,0.85)',
            }}
          />
          <span
            className="font-mono text-[10px] uppercase"
            style={{ color: CHAMPAGNE, letterSpacing: '0.32em' }}
          >
            No. {piece.id}
          </span>
        </div>
      </motion.div>

      <figcaption className="relative h-[12%] w-full pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3
            className="font-display text-[1.25rem]"
            style={{
              color: CREAM,
              fontWeight: 400,
              letterSpacing: '-0.01em',
              fontVariationSettings: '"opsz" 72',
            }}
          >
            {piece.name}
          </h3>
          <span
            className="font-mono text-[9px] uppercase shrink-0"
            style={{ color: SAGE, letterSpacing: '0.28em' }}
          >
            1 of 1
          </span>
        </div>
        <span
          className="mt-1 block font-mono text-[11px]"
          style={{ color: CREAM_MUTED, letterSpacing: '0.06em' }}
        >
          {piece.meta}
        </span>
      </figcaption>
    </motion.figure>
  )
}

function MobileCommissionCard() {
  const onClick = useSmoothScrollTo('visit')
  return (
    <a
      href="#visit"
      onClick={onClick}
      className="relative flex w-[80vw] max-w-[28rem] shrink-0 snap-center flex-col"
      style={{ height: '70svh' }}
    >
      <div
        className="relative flex h-[88%] w-full flex-col items-center justify-center overflow-hidden"
        style={{
          backgroundColor: FOREST_DEEP,
          boxShadow:
            'inset 0 0 0 0.5px rgba(196,168,117,0.45), 0 30px 80px -40px rgba(0,0,0,0.5)',
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background: [
              'radial-gradient(ellipse 90% 90% at 50% 65%, rgba(196,168,117,0.07) 0%, rgba(20,38,31,0) 60%)',
              'radial-gradient(ellipse 100% 70% at 50% 0%, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 55%)',
            ].join(', '),
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-overlay"
          style={{
            opacity: 0.18,
            backgroundImage: GRAIN_SVG,
            backgroundSize: '220px 220px',
          }}
        />
        <div className="absolute left-4 top-4 flex items-center gap-2">
          <span
            aria-hidden
            className="block"
            style={{
              width: 18,
              height: '0.5px',
              backgroundColor: 'rgba(196,168,117,0.85)',
            }}
          />
          <span
            className="font-mono text-[10px] uppercase"
            style={{ color: CHAMPAGNE, letterSpacing: '0.32em' }}
          >
            No. {String(PIECES.length + 1).padStart(2, '0')}
          </span>
        </div>
        <span
          className="font-mono text-[10px] uppercase"
          style={{ color: SAGE, letterSpacing: '0.32em' }}
        >
          The next one
        </span>
        <h3
          className="mt-5 px-8 text-center font-display"
          style={{
            color: CREAM,
            fontWeight: 400,
            fontSize: '1.85rem',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            fontVariationSettings: '"opsz" 144',
          }}
        >
          Commission yours.
        </h3>
        <p
          className="mt-4 max-w-[26ch] px-6 text-center font-sans text-[13px] leading-[1.6]"
          style={{ color: CREAM_MUTED }}
        >
          Bring a sketch, a reference, or a name.
        </p>
        <span
          className="mt-7 inline-flex items-center justify-center gap-3 rounded-full border font-mono text-[11px] uppercase"
          style={{
            borderColor: 'rgba(196,168,117,0.6)',
            color: CREAM,
            letterSpacing: '0.22em',
            padding: '13px 22px',
          }}
        >
          <span>Start a piece</span>
          <span aria-hidden style={{ fontSize: 13, lineHeight: 1 }}>
            →
          </span>
        </span>
      </div>
      <div className="relative h-[12%] w-full pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <span
            className="font-display text-[1.25rem]"
            style={{
              color: CREAM,
              fontWeight: 400,
              letterSpacing: '-0.01em',
              fontVariationSettings: '"opsz" 72',
            }}
          >
            Yours, next.
          </span>
          <span
            className="font-mono text-[9px] uppercase shrink-0"
            style={{ color: CHAMPAGNE, letterSpacing: '0.28em' }}
          >
            Begin →
          </span>
        </div>
        <span
          className="mt-1 block font-mono text-[11px]"
          style={{ color: CREAM_MUTED, letterSpacing: '0.06em' }}
        >
          By consultation · Private studio
        </span>
      </div>
    </a>
  )
}

// ═══════════════════════════════════════════════════════════════════
// Reduced-motion desktop fallback — vertical stack, no pin
// ═══════════════════════════════════════════════════════════════════

function StaticDesktop() {
  return (
    <div className="relative w-full px-12 py-32">
      <div className="mx-auto max-w-[1280px]">
        <div className="mb-20 max-w-[44rem]">
          <div className="mb-6 flex items-center gap-3">
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
              The work · 0{PIECES.length}
            </span>
          </div>
          <h2
            className="font-display"
            style={{
              color: CREAM,
              fontWeight: 400,
              fontSize: 'clamp(2.25rem, 4.4vw, 4.25rem)',
              lineHeight: 0.98,
              letterSpacing: '-0.03em',
              fontVariationSettings: '"opsz" 144',
              maxWidth: '14ch',
            }}
          >
            Custom pieces, hand-set in-house.
          </h2>
          <p
            className="mt-9 max-w-[36ch] font-sans text-[15px] leading-[1.65]"
            style={{ color: CREAM_MUTED }}
          >
            Each piece is one of one. Designed with the client, set by hand,
            finished to spec — no two ever the same.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-y-20">
          {PIECES.map((piece) => (
            <StaticPieceFigure key={piece.id} piece={piece} />
          ))}
        </div>
      </div>
    </div>
  )
}

// Suppress unused-import lint until we wire the variant elsewhere. The
// easeOutExpo import is exposed for future motion adjustments.
void easeOutExpo

function StaticPieceFigure({ piece }: { piece: Piece }) {
  const imageBase = piece.image.replace(/\.png$/, '')

  return (
    <figure className="grid grid-cols-1 items-center gap-10 md:grid-cols-12">
      <div
        className="relative col-span-7 overflow-hidden"
        style={{
          aspectRatio: '3 / 4',
          boxShadow: 'inset 0 0 0 0.5px rgba(196,168,117,0.28)',
          backgroundColor: FOREST_DEEP,
        }}
      >
        <picture className="block h-full w-full">
          <source type="image/avif" srcSet={`${imageBase}.avif`} />
          <source type="image/webp" srcSet={`${imageBase}.webp`} />
          <img
            src={`${imageBase}.jpg`}
            alt={piece.alt}
            width={piece.width}
            height={piece.height}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
            style={{ objectPosition: piece.focus ?? '50% 50%' }}
          />
        </picture>
      </div>
      <figcaption className="col-span-5 flex flex-col">
        <span
          className="font-mono text-[10px] uppercase"
          style={{ color: CHAMPAGNE, letterSpacing: '0.32em' }}
        >
          No. {piece.id}
        </span>
        <h3
          className="mt-3 font-display"
          style={{
            color: CREAM,
            fontWeight: 400,
            fontSize: '2rem',
            letterSpacing: '-0.02em',
          }}
        >
          {piece.name}
        </h3>
        <span
          className="mt-2 font-mono text-[11px]"
          style={{ color: CREAM_MUTED, letterSpacing: '0.06em' }}
        >
          {piece.meta}
        </span>
      </figcaption>
    </figure>
  )
}
