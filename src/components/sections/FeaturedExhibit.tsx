/**
 * components/sections/FeaturedExhibit.tsx — one piece, one screen.
 *
 * THE HALLMARK, ENLARGED.
 *
 * A hallmark is the stamp inside a clasp: `14K`, a maker's mark, four
 * characters you need a loupe to read. It is also the only thing on a
 * piece of jewelry that is a promise rather than a decoration. This scene
 * takes that stamp off the metal and sets it at the size of a wall —
 * three terms in the mono face, gold on velvet, a hairline between each,
 * over a full-bleed photograph of the piece they describe.
 *
 * That is the whole idea, and it is why the scene carries no headline. A
 * display-serif title over a photograph would make this a hero; the spec
 * IS the type here.
 *
 * THE CHOREOGRAPHY, at lg and up. The same contract as the homepage hero
 * (see components/sections/Hero.tsx), one act shorter:
 *
 *   0 → 0.45   the three terms rise out of their baseline masks in
 *              sequence while the photograph settles from 1.06 and a
 *              velvet sheet dims it, so the type gains a ground that was
 *              not there a moment ago.
 *   0.45 → 0.7 the bench note, the price and the call to action arrive
 *              together at the foot of the frame.
 *   0.7 → 1    the whole block drifts up 10vh against the photograph's
 *              4vh, which is the parallax that reads as depth.
 *
 * Every act is driven by scroll progress through this section's own
 * stage, so every act reverses on the way back up. Transform and opacity
 * only; each animated layer carries `will-change`.
 *
 * Below lg there is no stage, no pin and no scrub: the photograph is a
 * band, the specs sit under it at 40px, and the note follows. That is a
 * CSS collapse (see EXHIBIT CHOREOGRAPHY in app.css) plus one breakpoint
 * read here, so a phone never runs the scrubbed timeline and a
 * reduced-motion visitor gets the finished scene on the first frame.
 *
 * THE PHOTOGRAPH IS A SLOT. `exhibit-5mm-cuban.{avif,webp,jpg}`.
 * Replacing those three files replaces the exhibit; the copy below names
 * the piece, so a new photograph means a new PIECE constant too.
 */

import { useRef } from 'react'
import { motion, useTransform, type MotionValue } from 'framer-motion'
import { easeOutExpoFn, useReducedMotion } from '~/lib/motion'
import { useElementScrollProgress } from '~/lib/lenis'
import { useIsWide } from '~/lib/use-media-query'
import { BTN_SECONDARY_ON_VELVET } from '~/lib/ui'

const PHOTO = '/exhibit-5mm-cuban'
const PHOTO_ALT =
  'A man in a black tee wearing the 5mm solid gold Cuban link chain, photographed against a near-black ground.'

/**
 * The piece on show. It is a real listing, and the price is the one the
 * product page charges — a scene that advertises a number the checkout
 * does not honour is worse than a scene with no number.
 */
const PIECE = {
  slug: 'cuban-link-chain',
  name: '5mm Cuban Link Chain',
  price: '$199',
  /** The hallmark, one term per line. */
  terms: ['5.0MM', '14K', 'SOLID'],
  note: 'Cut, soldered and polished to your length at the bench — five lengths, 18 to 26 inches.',
}

// ─── The timeline ────────────────────────────────────────────────────
const ACT1_END = 0.45
const ACT2_END = 0.7

/** How much progress one hallmark term takes to clear its mask. */
const TERM_SPAN = 0.2

export function FeaturedExhibit() {
  const stageRef = useRef<HTMLElement>(null)
  const progress = useElementScrollProgress(stageRef)
  const reduced = !!useReducedMotion()
  const wide = useIsWide()

  /** The scrubbed timeline is the desktop scene and nothing else. */
  const pinned = wide && !reduced

  const photoScale = useTransform(progress, [0, ACT1_END], [1.06, 1])
  const dim = useTransform(progress, [0, ACT1_END], [0, 0.42])
  const lateOpacity = useTransform(progress, [ACT1_END, ACT2_END], [0, 1])
  const lateY = useTransform(progress, [ACT1_END, ACT2_END], ['20px', '0px'], {
    ease: easeOutExpoFn,
  })
  const photoDrift = useTransform(progress, [ACT2_END, 1], ['0vh', '-4vh'])
  const contentDrift = useTransform(progress, [ACT2_END, 1], ['0vh', '-10vh'])

  const step =
    PIECE.terms.length > 1
      ? (ACT1_END - TERM_SPAN) / (PIECE.terms.length - 1)
      : 0

  const scrub = <T extends object>(style: T): T | undefined =>
    pinned ? style : undefined

  return (
    <section
      ref={stageRef}
      aria-labelledby="exhibit-heading"
      data-ground="velvet"
      className="scene-stage exhibit-stage bg-velvet"
    >
      <h2 id="exhibit-heading" className="sr-only">
        On show: {PIECE.name}
      </h2>

      <div className="scene-pin">
        {/* The photograph. Static band on phones, full-bleed layer at lg. */}
        <div className="exhibit-photo">
          <motion.div
            data-reveal
            className="h-full w-full will-change-transform"
            style={scrub({ scale: photoScale, y: photoDrift })}
          >
            <picture className="block h-full w-full">
              <source type="image/avif" srcSet={`${PHOTO}.avif`} />
              <source type="image/webp" srcSet={`${PHOTO}.webp`} />
              <img
                src={`${PHOTO}.jpg`}
                alt={PHOTO_ALT}
                width={1536}
                height={1024}
                loading="lazy"
                decoding="async"
                sizes="100vw"
                className="h-full w-full object-cover"
                style={{ objectPosition: '50% 38%' }}
              />
            </picture>
          </motion.div>

          {/* The dimmer: a velvet sheet at rising opacity rather than a
              brightness filter, because the palette's dark IS this
              colour. Only ever over the photograph, which is the one
              overlay the colour rules allow. */}
          <motion.div
            aria-hidden
            className="exhibit-dim"
            style={scrub({ opacity: dim })}
          />
        </div>

        <motion.div
          data-reveal
          className="exhibit-content will-change-transform"
          style={scrub({ y: contentDrift })}
        >
          {/* THE HALLMARK. Gold mono on velvet is the one place this
              palette lets gold carry type, and a spec is exactly the
              type it was reserved for. */}
          <dl aria-label={`${PIECE.name} specification`} className="exhibit-specs">
            {PIECE.terms.map((term, index) => (
              <div key={term} className="exhibit-term-row">
                <dt className="sr-only">{TERM_LABELS[index] ?? 'Specification'}</dt>
                <dd>
                  <MaskedTerm
                    term={term}
                    progress={progress}
                    from={index * step}
                    to={index * step + TERM_SPAN}
                    scrubbed={pinned}
                  />
                </dd>
              </div>
            ))}
          </dl>

          <motion.div
            className="exhibit-note"
            style={scrub({ opacity: lateOpacity, y: lateY })}
          >
            <p className="max-w-[34ch] text-[14px] leading-relaxed text-bone md:text-[15px]">
              {PIECE.note}
            </p>
            <p className="mt-4 flex items-baseline gap-3">
              <span className="text-[13px] label-wide text-bone">
                {PIECE.name}
              </span>
              <span className="spec text-[18px] leading-none text-gold">
                {PIECE.price}
              </span>
            </p>
            {/* "Choose a length" and not "Add to cart": five lengths
                exist and a one-tap add would pick one for the shopper.
                The label always matches what pressing it does. */}
            <a
              href={`/products/${PIECE.slug}`}
              className={`${BTN_SECONDARY_ON_VELVET} mt-5 w-full sm:w-fit sm:px-8`}
            >
              Choose a length
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

/** What each hallmark term is, for anything that cannot see the type. */
const TERM_LABELS = ['Link width', 'Metal', 'Construction']

/**
 * One hallmark term, rising out of its own baseline mask.
 *
 * The mask is a wrapping span rather than a clip-path so the overflow is
 * bounded by the term's own line box. Same construction as the hero's
 * MaskedWord, at four times the size.
 */
function MaskedTerm({
  term,
  progress,
  from,
  to,
  scrubbed,
}: {
  term: string
  progress: MotionValue<number>
  from: number
  to: number
  scrubbed: boolean
}) {
  const y = useTransform(progress, [from, to], ['110%', '0%'], {
    ease: easeOutExpoFn,
  })

  return (
    <span className="block overflow-hidden">
      <motion.span
        className="exhibit-term spec block will-change-transform"
        style={scrubbed ? { y } : undefined}
      >
        {term}
      </motion.span>
    </span>
  )
}
