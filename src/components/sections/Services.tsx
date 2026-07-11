/**
 * components/sections/Services.tsx — editorial services list
 *
 * Four services rendered as four columns of pure typography on the brand
 * forest canvas. No icons. No cards. No boxes. The information itself is
 * the design — the reference here is how Lange, Hermès, and Aimé Leon
 * Dore lay out capabilities pages.
 *
 * Per-column hierarchy (top → bottom):
 *   1. Champagne hairline — 0.5px tall, 80px long. Extends to 120px on
 *      column hover/focus. Full-opacity #C4A875.
 *   2. Numeral 01–04 — display serif, ~96px, cream at 60% opacity.
 *      Lifts to 100% opacity on hover/focus.
 *   3. Service name — display serif, ~28px, cream, sentence case.
 *   4. Description — sans, 15px, muted cream, capped at 28ch.
 *
 * Motion:
 *   • Header reveal: SplitText (viewport='scroll') for the headline,
 *     Reveal for the eyebrow and body line.
 *   • Columns: each leaf item is wrapped in its own `Reveal`, with a
 *     per-leaf delay derived from column index + intra-column position.
 *     This recreates the "outer sibling stagger × inner tight stagger"
 *     cascade without depending on framer-motion's variant inheritance,
 *     which proved unreliable when combined with multi-axis (entry +
 *     hover) variants on the same wrapper.
 *   • Hover/focus is a quiet polish — numeral opacity 0.6→1.0 and
 *     hairline width 80→120, both on easeApple at duration-hover.
 *     Driven by a hover-only motion wrapper around each column whose
 *     `rest`/`hover` variants propagate to the two leaf elements
 *     (hairline + numeral-inner) that participate in the hover tree.
 *
 * The forest (#14261F) canvas is shared with Hero/CustomPieces; the
 * section reads as a continuation of the same color world.
 */

import type { ReactElement } from 'react'
import { motion, type Variants } from 'framer-motion'
import { DURATION, STAGGER, easeApple } from '~/lib/motion'
import { SplitText } from '~/components/motion/SplitText'
import { Reveal } from '~/components/motion/Reveal'

// ─── Palette (mirrors Hero / CustomPieces) ───────────────────────────
const FOREST = '#14261F'
const CREAM = '#F0EBE0'
const CREAM_MUTED = '#C0B8A6'
const CHAMPAGNE = '#C4A875'

// ─── Cascade timing ──────────────────────────────────────────────────
// Per-leaf delay = column-stagger × column-index + intra-column step.
// 0:hairline → 1:numeral → 2:name → 3:description.
const COLUMN_DELAY = STAGGER.default // 0.08
const INTRA_DELAY = STAGGER.tight // 0.04
const BASE_DELAY = 0.1

const itemDelay = (columnIndex: number, leafIndex: number): number =>
  BASE_DELAY + columnIndex * COLUMN_DELAY + leafIndex * INTRA_DELAY

// ─── Hover variants ──────────────────────────────────────────────────
// The column's outer wrapper sets the rest/hover state via whileHover;
// only these two leaves carry rest/hover transforms.

const hairlineHoverVariants: Variants = {
  rest: {
    width: 80,
    transition: { duration: DURATION.hover, ease: easeApple },
  },
  hover: {
    width: 120,
    transition: { duration: DURATION.hover, ease: easeApple },
  },
}

const numeralHoverVariants: Variants = {
  rest: {
    opacity: 0.6,
    transition: { duration: DURATION.hover, ease: easeApple },
  },
  hover: {
    opacity: 1,
    transition: { duration: DURATION.hover, ease: easeApple },
  },
}

// ─── Service data ────────────────────────────────────────────────────

type Service = {
  id: string
  name: string
  desc: string
}

const SERVICES: Service[] = [
  {
    id: '01',
    name: 'Custom pieces',
    desc: 'From sketch to finished piece. Pendants, chains, bridal sets — designed with you and built by hand.',
  },
  {
    id: '02',
    name: 'Repair',
    desc: 'Broken clasps, lost stones, worn settings. We restore pieces back to better than they came.',
  },
  {
    id: '03',
    name: 'Watches',
    desc: 'Modern, vintage, and luxury timepieces serviced by certified watchmakers. Movements rebuilt, cases refinished.',
  },
  {
    id: '04',
    name: 'Gold & diamonds',
    desc: "Curated gold jewelry and certified loose stones. Bring us a budget and a taste — we'll match it.",
  },
]

// ═══════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════

export function Services(): ReactElement {
  return (
    <section
      id="services"
      data-section="services"
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: FOREST }}
    >
      {/* Soft top-edge wash — same recipe used between Hero/CustomPieces.
          The canvas color is identical to the section above; this is an
          optical settle, not a color break. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.18), rgba(0,0,0,0))',
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1280px] px-6 py-24 md:px-12 md:py-40 lg:px-16 lg:py-48">
        {/* ─── Header ──────────────────────────────────────────────── */}
        <header className="mx-auto mb-14 max-w-[44rem] text-center md:mb-28 lg:mb-32">
          <Reveal>
            <span
              className="inline-block font-sans uppercase"
              style={{
                color: CHAMPAGNE,
                letterSpacing: '0.18em',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              Services
            </span>
          </Reveal>

          <SplitText
            as="h2"
            viewport="scroll"
            delay={0.05}
            className="font-display"
          >
            What we do, hand by hand.
          </SplitText>

          <Reveal delay={0.22}>
            <p
              className="mx-auto mt-7 max-w-[44ch] font-sans text-[15px] leading-[1.65]"
              style={{ color: CREAM_MUTED }}
            >
              Four services, one standard. Every piece passes through the same
              hands.
            </p>
          </Reveal>
        </header>

        {/* ─── Mobile / tablet — compact list ──────────────────────
            The desktop's oversized 01–04 numerals collapse into one tall,
            repetitive scroll on a phone. Here each service is a single
            tight row — a quiet champagne index, the name, one line — so
            the section keeps its numbering idiom at a fraction of the
            scroll length. */}
        <div className="lg:hidden">
          {SERVICES.map((service, i) => (
            <MobileServiceRow key={service.id} service={service} index={i} />
          ))}
        </div>

        {/* ─── Desktop — editorial four-column layout ──────────────
            The large numerals earn their space side by side, so there's
            no excess scroll to pay for them. */}
        <div className="hidden lg:grid lg:grid-cols-4 lg:gap-x-12 xl:gap-x-16">
          {SERVICES.map((service, i) => (
            <ServiceColumn key={service.id} service={service} index={i} />
          ))}
        </div>
      </div>

      {/* Headline scoped style — the SplitText renders an h2 whose sizing
          must match the brand display scale. Scoping by section attribute
          keeps it from leaking into other h2s on the page. */}
      <style>{`
        [data-section="services"] header h2 {
          color: ${CREAM};
          font-weight: 400;
          font-size: clamp(2rem, 4.4vw, 3.5rem);
          line-height: 1.04;
          letter-spacing: -0.025em;
          font-variation-settings: "opsz" 144;
          margin-top: 0.85rem;
        }
      `}</style>
    </section>
  )
}

// ─── Column item ─────────────────────────────────────────────────────
//
// Each column is a hover-only motion wrapper. Entry choreography lives
// entirely inside Reveal wrappers (one per leaf) — that decouples the
// two animation axes and avoids the variant-inheritance pitfalls that
// surfaced when combining whileInView/whileHover/multi-state initial
// on the same element.

function ServiceColumn({
  service,
  index,
}: {
  service: Service
  index: number
}): ReactElement {
  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      whileFocus="hover"
      variants={{ rest: {}, hover: {} }}
      tabIndex={0}
      className="relative flex flex-col outline-none"
    >
      {/* Hairline marker — Reveal handles the entry crossfade; the inner
          motion.span carries the rest/hover width transition. */}
      <Reveal delay={itemDelay(index, 0)}>
        <motion.span
          aria-hidden
          variants={hairlineHoverVariants}
          className="block"
          style={{
            height: '0.5px',
            backgroundColor: CHAMPAGNE,
            width: 80,
          }}
        />
      </Reveal>

      {/* Numeral — Reveal fades up the wrapper; the inner motion.span
          carries the rest/hover opacity transition. */}
      <Reveal delay={itemDelay(index, 1)} className="mt-12 leading-none">
        <motion.span
          aria-hidden
          variants={numeralHoverVariants}
          className="block font-display"
          style={{
            color: CREAM,
            fontWeight: 400,
            fontSize: 'clamp(3.75rem, 7vw, 6rem)',
            letterSpacing: '-0.04em',
            lineHeight: 0.92,
            fontVariationSettings: '"opsz" 144',
            opacity: 0.6,
          }}
        >
          {service.id}
        </motion.span>
      </Reveal>

      {/* Service name — sentence case, full-opacity cream serif. */}
      <Reveal delay={itemDelay(index, 2)}>
        <h3
          className="mt-8 font-display"
          style={{
            color: CREAM,
            fontWeight: 400,
            fontSize: 'clamp(1.4rem, 1.7vw, 1.75rem)',
            letterSpacing: '-0.015em',
            lineHeight: 1.18,
            fontVariationSettings: '"opsz" 72',
          }}
        >
          {service.name}
        </h3>
      </Reveal>

      {/* Description — clean sans, capped at 28ch for editorial line
          length. */}
      <Reveal delay={itemDelay(index, 3)}>
        <p
          className="mt-5 max-w-[28ch] font-sans"
          style={{
            color: CREAM_MUTED,
            fontSize: '15px',
            lineHeight: 1.6,
          }}
        >
          {service.desc}
        </p>
      </Reveal>
    </motion.div>
  )
}

// ─── Mobile row — quiet index + name + one line, hairline-separated ───
//
// The phone layout drops the oversized numeral (it reads as noise when
// stacked) and keeps the numbering as a small mono index, matching the
// drawer's row-index idiom. Rows are hairline-separated and reveal on a
// tight stagger as the list scrolls into view.

function MobileServiceRow({
  service,
  index,
}: {
  service: Service
  index: number
}): ReactElement {
  return (
    <Reveal delay={BASE_DELAY + index * STAGGER.tight}>
      <div
        className="flex gap-5 border-t py-7 sm:gap-6"
        style={{
          borderTopWidth: '0.5px',
          borderTopColor: 'rgba(196,168,117,0.18)',
        }}
      >
        <span
          aria-hidden
          className="shrink-0 pt-1.5 font-mono text-[11px] tracking-[0.2em]"
          style={{ color: CHAMPAGNE }}
        >
          {service.id}
        </span>
        <div className="min-w-0">
          <h3
            className="font-display"
            style={{
              color: CREAM,
              fontWeight: 400,
              fontSize: '1.5rem',
              letterSpacing: '-0.015em',
              lineHeight: 1.15,
              fontVariationSettings: '"opsz" 72',
            }}
          >
            {service.name}
          </h3>
          <p
            className="mt-2 font-sans text-[14px] leading-[1.6]"
            style={{ color: CREAM_MUTED }}
          >
            {service.desc}
          </p>
        </div>
      </div>
    </Reveal>
  )
}
