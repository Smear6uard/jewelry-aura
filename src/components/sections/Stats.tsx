/**
 * components/sections/Stats.tsx — small typographic trust band
 *
 * Three stats only. The previous "100% Satisfaction" entry was filler
 * — anything one-stop shop can claim, removed. The remaining three
 * are concrete: years of craft, pieces restored, public review score.
 *
 * Brand grammar:
 *   • Forest #14261F canvas, continuous with adjacent sections.
 *   • Numerals in display serif, cream — the type does the work.
 *   • Eyebrow labels in mono caps, sage, 0.32em tracking — match the
 *     supporting-text rhythm of Hero / CustomPieces.
 *   • Champagne for the inline review star and the column hairline
 *     rule. No mustard yellow, no filled gold pictograms.
 *   • A 0.5px champagne hairline above each numeral — same rule the
 *     Visit info blocks use, so the page reads as one consistent
 *     typographic system on the way down.
 */

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { DURATION, STAGGER, easeOutExpo } from '~/lib/motion'

// ─── Palette ────────────────────────────────────────────────────────
const FOREST = '#14261F'
const CREAM = '#F0EBE0'
const CHAMPAGNE = '#C4A875'
const SAGE = '#9FB6A6'

type Stat = {
  value: string
  label: string
  /** Inline glyph rendered after the numeral (e.g. ★ for the rating). */
  glyph?: string
}

const STATS: readonly Stat[] = [
  { value: '15+', label: 'Years of Craft' },
  { value: '5,000+', label: 'Pieces Restored' },
  { value: '4.9', label: 'Google Rating', glyph: '★' },
]

export function Stats() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-20%' })

  return (
    <section
      ref={ref}
      data-section="stats"
      className="relative w-full"
      style={{ backgroundColor: FOREST }}
    >
      {/* Top hairline — soft champagne rule that reads as a section
          break without weight. Sits flush with the previous section's
          bottom edge so the canvas stays continuous. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0"
        style={{
          height: '0.5px',
          background:
            'linear-gradient(90deg, rgba(196,168,117,0) 0%, rgba(196,168,117,0.25) 50%, rgba(196,168,117,0) 100%)',
        }}
      />

      <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-12 md:py-24">
        <div className="grid grid-cols-1 gap-y-12 sm:grid-cols-3 sm:gap-x-12">
          {STATS.map((stat, i) => (
            <StatColumn key={stat.label} stat={stat} index={i} inView={inView} />
          ))}
        </div>
      </div>

      {/* Bottom hairline — mirror of the top so the band is bracketed
          by the same soft rule on either edge. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0"
        style={{
          height: '0.5px',
          background:
            'linear-gradient(90deg, rgba(196,168,117,0) 0%, rgba(196,168,117,0.25) 50%, rgba(196,168,117,0) 100%)',
        }}
      />
    </section>
  )
}

function StatColumn({
  stat,
  index,
  inView,
}: {
  stat: Stat
  index: number
  inView: boolean
}) {
  const delay = 0.08 + index * STAGGER.default

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: DURATION.content, ease: easeOutExpo, delay }}
      className="flex flex-col items-start"
    >
      {/* Hairline cap — same rule used at the Visit eyebrow + info
          blocks. Keeps the entire lower half of the page on one
          typographic system. */}
      <span
        aria-hidden
        className="mb-7 block"
        style={{
          width: 26,
          height: '0.5px',
          backgroundColor: 'rgba(196,168,117,0.7)',
        }}
      />

      <div className="flex items-baseline gap-2">
        <span
          className="font-display"
          style={{
            color: CREAM,
            fontWeight: 400,
            fontSize: 'clamp(2.4rem, 4.6vw, 4rem)',
            lineHeight: 1,
            letterSpacing: '-0.025em',
            fontVariationSettings: '"opsz" 144',
          }}
        >
          {stat.value}
        </span>
        {stat.glyph && (
          <span
            aria-hidden
            className="font-display"
            style={{
              color: CHAMPAGNE,
              fontSize: 'clamp(1.6rem, 3vw, 2.4rem)',
              lineHeight: 1,
            }}
          >
            {stat.glyph}
          </span>
        )}
      </div>

      <span
        className="mt-4 font-mono text-[11px] uppercase"
        style={{ color: SAGE, letterSpacing: '0.28em' }}
      >
        {stat.label}
      </span>
    </motion.div>
  )
}
