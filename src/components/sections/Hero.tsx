/**
 * components/sections/Hero.tsx — the pinned campaign frame.
 *
 * ONE FRAME, FOUR ACTS, ONE SCRUBBED TIMELINE.
 *
 * The stage is 200svh tall and the frame inside it is pinned at 100svh,
 * so the visitor spends one screen of scrolling holding the photograph
 * still while the type assembles on top of it. Every act after the load
 * is driven by scroll progress through the stage — nothing here fires on
 * a timer once the page has settled, which means every act reverses
 * exactly when the visitor scrolls back up. A hero that plays forward
 * only is a hero that lies about where you are on the page.
 *
 *   Act 0   load, once, on a clock. The photograph rises out of black
 *           over 900ms while it settles from 1.06 to 1.0, and one pass
 *           of case light rakes across the chain. The eyebrow and the
 *           scroll cue are the only type on screen. The image gets one
 *           clean beat before anything is asked of the visitor.
 *
 *   Act 1   0 → 0.35. The headline rises word by word out of baseline
 *           masks on a heavy ease-out, while the photograph steps back:
 *           it dims toward 70% and grows to 1.03, so the type has
 *           somewhere to sit that was not there a moment ago. The
 *           eyebrow's tracking opens as it goes.
 *
 *   Act 2   0.35 → 0.55. The supporting line and both calls to action
 *           rise into place. The scroll cue fades out for good — it has
 *           been obeyed.
 *
 *   Act 3   0.55 → 1. The assembled block drifts up faster than the
 *           photograph behind it, and the rest of the page climbs over
 *           the pinned frame like a curtain. See `.hero-curtain` in
 *           app.css; it is a negative margin and a stacking context, not
 *           a second animation.
 *
 * RULES THIS FILE KEEPS
 * ---------------------
 * Transform and opacity only. The dimming is a velvet layer whose
 * opacity rises, not a `filter: brightness()` — same picture, and it
 * stays on the compositor. Every animated layer carries `will-change`.
 * Two static layers sit between the photograph and the type: a velvet
 * scrim that only exists below lg, where the vertical crop puts the
 * model's hand under the headline, and the case-light sweep. Both are
 * overlays on photography, which is the one place the colour rules
 * allow this.
 * The one exception is the eyebrow's letter-spacing, which is a layout
 * property and is deliberately animated anyway: it is a single
 * `white-space: nowrap` line in its own row, so the reflow it causes is
 * its own and reaches nothing else.
 *
 * `prefers-reduced-motion` gets a plain hero: no stage, no pin, no
 * curtain, everything visible and still. That is set in CSS rather than
 * in a branch here (see the HERO CHOREOGRAPHY block in app.css), so
 * there is never a frame where the reduced-motion visitor sees the
 * start state before React corrects it.
 *
 * THE PHOTOGRAPH IS A SLOT. Two crops — horizontal from lg up, vertical
 * below — and nothing in this file assumes anything about the frame
 * beyond where its dark quarter sits. Replacing the files replaces the
 * hero.
 */

import { useRef } from 'react'
import { motion, useTransform, type MotionValue } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { DURATION, easeOutExpo, easeOutExpoFn, useReducedMotion } from '~/lib/motion'
import { useElementScrollProgress } from '~/lib/lenis'
import { BTN_SECONDARY_ON_VELVET } from '~/lib/ui'

const PHOTO_WIDE = '/new-hero-horizontal'
const PHOTO_TALL = '/new-hero-vertical'

const PHOTO_ALT =
  'A man in an open black shirt wearing a heavy gold rope chain, lit against a deep red curtain.'

const EYEBROW = 'Custom · Iced · One of one'
const HEADLINE = 'Chains and custom work, made at our bench.'
const SUPPORT =
  'Solid gold and certified stones, hand-set to order. Free shipping over $150 and a lifetime warranty on everything we make.'

// ─── The timeline ────────────────────────────────────────────────────
//
// One place where the act boundaries are written down, so a change to
// the pacing is one edit rather than six matching pairs of numbers.

const ACT1_END = 0.35
const ACT2_END = 0.55

/**
 * How much progress one word of the headline takes to clear its mask.
 * The stagger between words is whatever divides the rest of act 1
 * evenly, which lands around 55ms at a normal wheel speed — near enough
 * to the 60ms this was drawn at, and it has the property that the last
 * word finishes exactly on the act boundary however long the headline
 * gets.
 */
const WORD_SPAN = 0.13

export function Hero() {
  const stageRef = useRef<HTMLElement>(null)
  const progress = useElementScrollProgress(stageRef)
  const reduced = !!useReducedMotion()

  // Act 1 — the photograph steps back so the type has a ground.
  const photoScale = useTransform(progress, [0, ACT1_END], [1, 1.03])
  const dim = useTransform(progress, [0, ACT1_END], [0, 0.3])
  const tracking = useTransform(progress, [0, ACT1_END], ['0.14em', '0.34em'])

  // Act 2 — the second half of the block arrives.
  const lateOpacity = useTransform(progress, [ACT1_END, ACT2_END], [0, 1])
  const lateY = useTransform(progress, [ACT1_END, ACT2_END], ['18px', '0px'], {
    ease: easeOutExpoFn,
  })
  const cueOpacity = useTransform(progress, [ACT1_END, ACT2_END], [1, 0])

  // Act 3 — parallax. The block leaves 8% of the viewport ahead of the
  // photograph, which is the whole trick: a still frame with something
  // moving off it reads as depth, where two layers at the same speed
  // read as one flat picture sliding away.
  const photoDrift = useTransform(progress, [ACT2_END, 1], ['0vh', '-4vh'])
  const contentDrift = useTransform(progress, [ACT2_END, 1], ['0vh', '-12vh'])

  const words = HEADLINE.split(' ')
  const step = words.length > 1 ? (ACT1_END - WORD_SPAN) / (words.length - 1) : 0

  /** Reduced motion takes the CSS start states, not a scrubbed style. */
  const scrub = <T extends object>(style: T): T | undefined =>
    reduced ? undefined : style

  return (
    <section
      ref={stageRef}
      aria-label="Jewelry Aura"
      data-ground="velvet"
      className="hero-stage relative z-0 bg-velvet"
    >
      <div className="hero-pin w-full overflow-hidden">
        {/*
         * Two nested transforms rather than one. The outer layer owns
         * the load settle (1.06 → 1.0, once, on a clock) and the inner
         * one owns the scrubbed push-back — writing both onto the same
         * element means whichever ran last wins and the load animation
         * snaps the moment the visitor touches the wheel.
         */}
        <motion.div
          data-reveal
          className="absolute inset-0 will-change-transform"
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: DURATION.hero, ease: easeOutExpo }}
        >
          <motion.div
            className="h-full w-full will-change-transform"
            style={scrub({ scale: photoScale, y: photoDrift })}
          >
            <picture className="block h-full w-full">
              <source
                media="(min-width: 1024px)"
                type="image/avif"
                srcSet={`${PHOTO_WIDE}.avif`}
              />
              <source
                media="(min-width: 1024px)"
                type="image/webp"
                srcSet={`${PHOTO_WIDE}.webp`}
              />
              <source
                media="(min-width: 1024px)"
                type="image/jpeg"
                srcSet={`${PHOTO_WIDE}.jpg`}
              />
              <source type="image/avif" srcSet={`${PHOTO_TALL}.avif`} />
              <source type="image/webp" srcSet={`${PHOTO_TALL}.webp`} />
              <img
                src={`${PHOTO_TALL}.jpg`}
                alt={PHOTO_ALT}
                width={1024}
                height={1536}
                fetchPriority="high"
                decoding="async"
                className="hero-photo h-full w-full object-cover"
              />
            </picture>
          </motion.div>
        </motion.div>

        {/* The dimmer. A velvet sheet at rising opacity, because the
            palette's dark IS this colour — a brightness filter would
            grey the curtain toward something the page does not own. */}
        <motion.div
          aria-hidden
          className="hero-dim absolute inset-0 bg-velvet"
          style={scrub({ opacity: dim })}
        />

        <div aria-hidden className="hero-scrim" />
        <div aria-hidden className="hero-sweep" />

        <div className="absolute inset-0 flex items-end lg:items-center">
          <motion.div
            data-reveal
            className="mx-auto w-full max-w-[1440px] px-5 pb-28 will-change-transform md:px-8 lg:pb-0"
            style={scrub({ y: contentDrift })}
          >
            <div className="max-w-[20rem] sm:max-w-[26rem] lg:max-w-[34rem]">
              <motion.p
                className="hero-eyebrow spec whitespace-nowrap text-[10px] uppercase text-gold md:text-[11px]"
                style={scrub({ letterSpacing: tracking })}
              >
                {EYEBROW}
              </motion.p>

              <h1
                aria-label={HEADLINE}
                className="hero-headline display mt-4 text-bone"
              >
                {words.map((word, index) => (
                  <MaskedWord
                    key={`${word}-${index}`}
                    word={word}
                    progress={progress}
                    from={index * step}
                    to={index * step + WORD_SPAN}
                    scrubbed={!reduced}
                    last={index === words.length - 1}
                  />
                ))}
              </h1>

              <motion.p
                className="hero-late mt-5 max-w-[42ch] text-[14px] leading-relaxed text-bone md:text-[15px]"
                style={scrub({ opacity: lateOpacity, y: lateY })}
              >
                {SUPPORT}
              </motion.p>

              <motion.div
                className="hero-late mt-7 flex flex-wrap items-center gap-x-6 gap-y-4"
                style={scrub({ opacity: lateOpacity, y: lateY })}
              >
                <a
                  href="/collections/chains"
                  className={BTN_SECONDARY_ON_VELVET}
                >
                  Shop chains
                </a>
                {/* The second ask is a line of type, not a second box.
                    One outline is already the loudest thing on a frame
                    this dark, and a matching pair would make the visitor
                    choose between them instead of pressing one. */}
                <a
                  href="/custom"
                  className="group/commission inline-flex min-h-11 items-center gap-1.5 text-[12px] label text-bone link-hover"
                >
                  Commission a piece
                  <ArrowRight
                    aria-hidden
                    size={14}
                    strokeWidth={1.6}
                    className="transition-transform duration-hover ease-apple group-hover/commission:translate-x-0.5 motion-reduce:transition-none"
                  />
                </a>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* The cue: a pulse of light running down a hairline. Same
            gesture as the case sweep above it, at the size of a hint. */}
        <motion.div
          aria-hidden
          className="hero-cue"
          style={scrub({ opacity: cueOpacity })}
        >
          <span className="hero-cue-rail">
            <span className="hero-cue-run" />
          </span>
        </motion.div>
      </div>

      <style>{`
        .hero-headline {
          font-size: clamp(2rem, 8.5vw, 2.9rem);
          line-height: 1.02;
        }
        @media (min-width: 1024px) {
          .hero-headline {
            font-size: clamp(2.9rem, 4.4vw, 4.25rem);
            line-height: 0.98;
          }
        }
        /* The vertical crop is wider than a phone, so only the
           horizontal position of the subject is a decision; the chain
           and the hand sit just right of centre. */
        .hero-photo { object-position: 54% 50%; }
        @media (min-width: 1024px) { .hero-photo { object-position: 50% 46%; } }
      `}</style>
    </section>
  )
}

/**
 * One word of the headline, rising out of its own baseline mask.
 *
 * The mask is a second span rather than a clip-path so the overflow is
 * bounded by the word's own line box — a clip on the heading would cut
 * the descenders of every line at once. Trailing space lives outside
 * the mask so the browser can still break the line normally.
 */
function MaskedWord({
  word,
  progress,
  from,
  to,
  scrubbed,
  last,
}: {
  word: string
  progress: MotionValue<number>
  from: number
  to: number
  scrubbed: boolean
  last: boolean
}) {
  const y = useTransform(progress, [from, to], ['110%', '0%'], {
    ease: easeOutExpoFn,
  })

  return (
    <>
      <span
        aria-hidden
        className="inline-block overflow-hidden align-bottom leading-[inherit]"
      >
        <motion.span
          className="hero-word inline-block will-change-transform"
          style={scrubbed ? { y } : undefined}
        >
          {word}
        </motion.span>
      </span>
      {!last && ' '}
    </>
  )
}
