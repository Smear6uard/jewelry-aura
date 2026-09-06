/**
 * components/sections/CommissionedWork.tsx — five pieces, five beats.
 *
 * This is the page's argument. Everything else on the homepage says "we
 * sell chains"; this says "we make things that did not exist before you
 * asked", and it says it with the only evidence that counts — the five
 * finished commissions, one at a time, at the size of a poster.
 *
 * It replaces a promo band ("One of one": one photo, one paragraph, one
 * button) that made the same claim in the same amount of space as a
 * shipping notice.
 *
 * THE BEAT. Each of the five is the same three things in the same
 * places, which is what makes them read as a series rather than five
 * slides:
 *
 *   the photograph   held in a gloved hand on green velvet, ~60% of the
 *                    frame, always right of centre
 *   the name         display serif at poster scale, overlapping the
 *                    photograph's left edge, in bone
 *   the hallmark     the ONE OF ONE stamp and one mono spec line, under
 *                    the name — the same stamp the featured exhibit sets
 *                    at wall scale, back at the size it is on the metal
 *
 * THE STAMP IS BONE HERE, NOT MAROON. Maroon is the one-of-one mark on
 * paper and it stays that way on /custom. It may not touch velvet — the
 * rule is in CLAUDE.md and the reason is measurable: maroon on velvet is
 * 1.4:1, so a maroon plate on this ground is a dark rectangle nobody can
 * read. The stamp inverts and keeps its job.
 *
 * THE CHOREOGRAPHY, at lg and up. One pinned frame, five beats stacked
 * inside it, each owning a fifth of the section's scroll:
 *
 *   unmask   the arriving beat's photograph rises out of its own frame
 *            over the first third of its window, while the picture
 *            inside counter-moves — the frame uncovers it, it does not
 *            slide in.
 *   drift    the beat leaves 6vh up across its window, so the one
 *            arriving over it has something to be in front of.
 *   name     rises out of a baseline mask with the photograph.
 *
 * Every value is scrubbed off scroll progress, so scrolling back up
 * reverses the sequence exactly. Transform and opacity only.
 *
 * Below lg it is five stacked beats with the same unmask played on
 * viewport entry instead — no pin, no stage, no scrub. The layout
 * collapse is CSS (see COMMISSION CHOREOGRAPHY in app.css) and the scrub
 * is skipped here, so a phone never runs the pinned timeline and a
 * reduced-motion visitor gets the finished beats on the first frame.
 */

import { useRef } from 'react'
import { m as motion, useTransform, type MotionValue } from 'framer-motion'
import { easeOutExpoFn, useReducedMotion } from '~/lib/motion'
import { useElementScrollProgress } from '~/lib/lenis'
import { useIsWide } from '~/lib/use-media-query'
import { Reveal } from '~/components/motion/Reveal'
import { Unmask } from '~/components/motion/Unmask'
import { COMMISSIONS, type Commission } from '~/lib/commissions'
import { BTN_PRIMARY_ON_VELVET } from '~/lib/ui'

/** Of each beat's window, how much of it the arrival takes. */
const ARRIVAL = 0.34

export function CommissionedWork() {
  const stageRef = useRef<HTMLDivElement>(null)
  const reduced = !!useReducedMotion()
  const wide = useIsWide()
  const pinned = wide && !reduced
  const progress = useElementScrollProgress(stageRef, pinned)

  return (
    <section
      aria-labelledby="commissioned-heading"
      data-ground="velvet"
      className="bg-velvet"
    >
      <div className="mx-auto max-w-[1440px] px-4 pb-8 pt-14 md:px-8 md:pb-10 md:pt-20">
        <Reveal>
          {/* NO EYEBROW. The paper sections above this one open with a
              small uppercase line over the heading, and that is right for
              them — a shelf needs saying what kind of shelf it is. These
              three velvet scenes share a different voice: the exhibit has
              no heading at all, the bench has nothing but its four facts,
              and a label reading "From the bench" over a heading reading
              "Commissioned work" is a label labelling a label. It is also
              the eyebrow /custom already uses, which would make two pages
              read as one module. The title opens the section on its
              own. */}
          <h2
            id="commissioned-heading"
            className="commission-title display text-bone"
          >
            Commissioned work
          </h2>
          <p className="mt-5 max-w-[54ch] text-[15px] leading-relaxed text-bone">
            Five pieces that did not exist until somebody asked for them.
            Every one was drawn with its owner, quoted firmly, cast and set
            by hand, and made exactly once.
          </p>
        </Reveal>
      </div>

      {/*
       * The stage's height is five beats' worth of scrolling at lg, and
       * `auto` below it — the CSS owns that, because a phone renders the
       * same list in normal flow.
       */}
      <div ref={stageRef} className="scene-stage commission-stage">
        {/* A list, not an ordered one: five pieces in a fixed order is
            not a ranking, and nothing about Kemo follows from
            Twenty-Three. */}
        <ul className="scene-pin commission-pin">
          {COMMISSIONS.map((piece, index) => (
            <Beat
              key={piece.image}
              piece={piece}
              index={index}
              count={COMMISSIONS.length}
              progress={progress}
              scrubbed={pinned}
            />
          ))}
        </ul>
      </div>

      <div className="mx-auto max-w-[1440px] px-4 pb-14 pt-10 md:px-8 md:pb-20 md:pt-12">
        <Reveal>
          <div className="border-t border-hairline-dark pt-8 md:flex md:items-end md:justify-between md:gap-10">
            <p className="max-w-[46ch] text-[15px] leading-relaxed text-bone">
              Bring a sketch, a reference or a name. Most commissions take
              three to five weeks from the first call.
            </p>
            <a
              href="/custom"
              className={`${BTN_PRIMARY_ON_VELVET} mt-6 w-full md:mt-0 md:w-fit md:px-8`}
            >
              Start a custom piece
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

/**
 * One beat.
 *
 * At lg every beat is absolutely stacked inside the pinned frame and
 * reads its own window out of the section's progress; below lg they are
 * five ordinary blocks and the unmask fires on viewport entry instead.
 * One markup tree serves both — rendering a pinned set and a stacked set
 * would put five photographs in the HTML twice.
 */
function Beat({
  piece,
  index,
  count,
  progress,
  scrubbed,
}: {
  piece: Commission
  index: number
  count: number
  progress: MotionValue<number>
  scrubbed: boolean
}) {
  const span = 1 / count
  const from = index * span
  const to = from + span
  const arrived = from + span * ARRIVAL
  /**
   * When this beat is gone. It leaves during the NEXT beat's arrival and
   * faster than that arrival takes, because for most of its exit it is
   * already hidden behind the picture coming over it — what is left to
   * clear is its name and the strip of photograph its drift has lifted
   * above the incoming frame. Two poster names crossing each other is
   * the one thing this sequence cannot do.
   */
  const departed = to + span * ARRIVAL * 0.6
  const last = index === count - 1

  // The arrival: the sheet rises out of the window, the picture inside it
  // counter-moves so it lags rather than rides. The first beat is already
  // in place when the section starts — there is nothing above it for it
  // to arrive over.
  const sheetY = useTransform(
    progress,
    [from, arrived],
    [index === 0 ? '0%' : '100%', '0%'],
    { ease: easeOutExpoFn },
  )
  const pictureY = useTransform(
    progress,
    [from, arrived],
    [index === 0 ? '0%' : '-32%', '0%'],
    { ease: easeOutExpoFn },
  )
  const nameY = useTransform(
    progress,
    [from, arrived],
    [index === 0 ? '0%' : '110%', '0%'],
    { ease: easeOutExpoFn },
  )
  // The departure: it leaves before the next one has fully covered it,
  // which is what stops the sequence reading as a slideshow.
  const drift = useTransform(progress, [arrived, to], ['0vh', '-6vh'])
  // The last beat holds: there is nothing behind it to reveal, and the
  // section's closing call to action scrolls up under it.
  const frameOpacity = useTransform(progress, [to, departed], [1, last ? 1 : 0])
  // The caption has no mask of its own, so it needs the one property
  // that can hold a stacked beat back before its turn.
  const captionOpacity = useTransform(
    progress,
    [from, arrived],
    [index === 0 ? 1 : 0, 1],
  )

  const scrub = <T extends object>(style: T): T | undefined =>
    scrubbed ? style : undefined

  return (
    <li className="scene-beat commission-beat" style={{ zIndex: index + 1 }}>
      <motion.div
        data-reveal
        className="commission-frame will-change-[transform,opacity]"
        style={scrub({ y: drift, opacity: frameOpacity })}
      >
        <figure className="commission-figure">
          {/* The photograph. Scrubbed unmask at lg; the shared
              viewport-entry unmask below it. */}
          {scrubbed ? (
            <div className="commission-photo">
              {/* The sheet clips as well as the window — the picture
                  inside it counter-moves, and without the sheet's own
                  box that fraction of the picture would show through
                  before the beat's turn. */}
              <motion.div
                className="commission-sheet h-full w-full overflow-hidden will-change-transform"
                style={{ y: sheetY }}
              >
                <motion.div
                  className="commission-picture h-full w-full will-change-transform"
                  style={{ y: pictureY }}
                >
                  <Picture piece={piece} />
                </motion.div>
              </motion.div>
            </div>
          ) : (
            <Unmask className="commission-photo">
              <Picture piece={piece} />
            </Unmask>
          )}

          <motion.figcaption
            className="commission-caption"
            style={scrub({ opacity: captionOpacity })}
          >
            <h3 className="commission-name display text-bone">
              <span className="block overflow-hidden">
                <motion.span
                  className="commission-name-inner block will-change-transform"
                  style={scrub({ y: nameY })}
                >
                  {piece.name}
                </motion.span>
              </span>
            </h3>

            <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
              {/* The stamp. Bone on velvet — see the note at the top of
                  this file for why it is not maroon here. */}
              <span className="bg-bone px-2 py-1 text-[10px] label-wide text-velvet">
                One of one
              </span>
              <span className="spec text-[12px] text-gold md:text-[13px]">
                {piece.spec}
              </span>
            </p>
          </motion.figcaption>
        </figure>
      </motion.div>
    </li>
  )
}

function Picture({ piece }: { piece: Commission }) {
  return (
    <picture className="block h-full w-full">
      <source type="image/avif" srcSet={`${piece.image}.avif`} />
      <source type="image/webp" srcSet={`${piece.image}.webp`} />
      <img
        src={`${piece.image}.jpg`}
        alt={piece.alt}
        width={piece.width}
        height={piece.height}
        loading="lazy"
        decoding="async"
        sizes="(min-width: 1024px) 46vw, 92vw"
        className="h-full w-full object-cover"
        style={{ objectPosition: piece.focus }}
      />
    </picture>
  )
}
