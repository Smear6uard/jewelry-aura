/**
 * components/sections/Hero.tsx — the campaign frame.
 *
 * 70svh, not 100. A hero that fills the viewport tells the visitor the
 * page is an experience; a hero that leaves the next shelf peeking
 * above the fold tells them it is a shop. The category tiles below are
 * meant to be visible without a full swipe, and the height is set for
 * that, not for the photograph.
 *
 * Motion budget: one fade-up of the type stack on load, SplitText on
 * the headline. That is the site's entire load choreography — the rest
 * of the motion budget goes to hover, the mega menu and the cart, which
 * are the interactions a shopper actually touches.
 *
 * On the photograph
 * -----------------
 * The asset in /public is the previous build's campaign shot: gold on
 * FOREST-GREEN velvet. There is no maroon-velvet frame in the repo to
 * swap in, so the green is graded out with the shared `.velvet-grade`
 * treatment (see app.css) — the same one the category tiles and the
 * commission gallery use, so every editorial frame on the site is the
 * same stock. A real maroon-velvet reshoot replaces the asset and the
 * class comes off.
 */

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { DURATION, easeOutExpo, useReducedMotion } from '~/lib/motion'
import { SplitText } from '~/components/motion/SplitText'

const PHOTO_WIDE_AVIF = '/hero-portrait-wide.avif'
const PHOTO_WIDE_WEBP = '/hero-portrait-wide.webp'
const PHOTO_WIDE_JPG = '/hero-portrait-wide.jpg'
const PHOTO_TALL_AVIF = '/hero-portrait-tall.avif'
const PHOTO_TALL_WEBP = '/hero-portrait-tall.webp'
const PHOTO_TALL_JPG = '/hero-portrait-tall.jpg'

const PHOTO_ALT =
  'A man in an open-collar shirt wearing a heavy gold rope chain, photographed against dark velvet — a Jewelry Aura custom commission.'

// Wash that carries cream type over the lower-left of the frame and
// grounds the bottom edge into the page below it.
const WASH = [
  'linear-gradient(to top right, rgba(5,4,4,0.88) 0%, rgba(5,4,4,0.45) 30%, rgba(5,4,4,0) 62%)',
  'linear-gradient(to top, rgba(10,9,8,0.95) 0%, rgba(10,9,8,0.25) 26%, rgba(10,9,8,0) 55%)',
].join(', ')

export function Hero() {
  const reduced = !!useReducedMotion()

  const stack = {
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 18 },
    animate: { opacity: 1, y: 0 },
  }

  return (
    <section
      aria-label="Jewelry Aura"
      className="velvet-grade relative h-[70svh] max-h-[720px] min-h-[440px] w-full overflow-hidden bg-base"
    >
      <picture className="absolute inset-0 block">
        <source media="(min-width: 768px)" type="image/avif" srcSet={PHOTO_WIDE_AVIF} />
        <source media="(min-width: 768px)" type="image/webp" srcSet={PHOTO_WIDE_WEBP} />
        <source media="(min-width: 768px)" type="image/jpeg" srcSet={PHOTO_WIDE_JPG} />
        <source type="image/avif" srcSet={PHOTO_TALL_AVIF} />
        <source type="image/webp" srcSet={PHOTO_TALL_WEBP} />
        <img
          src={PHOTO_TALL_JPG}
          alt={PHOTO_ALT}
          width={1536}
          height={1024}
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover"
          style={{ objectPosition: '62% 42%' }}
        />
      </picture>

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: WASH }}
      />

      {/* Type stack — lower-left, on the washed side of the frame. */}
      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="mx-auto max-w-[1440px] px-4 pb-8 md:px-8 md:pb-12">
          <div className="max-w-[36rem]">
            <motion.p
              initial={stack.initial}
              animate={stack.animate}
              transition={{ duration: DURATION.content, ease: easeOutExpo }}
              className="text-[11px] label-wide text-champagne"
            >
              Custom · Iced · One of one
            </motion.p>

            <SplitText
              as="h1"
              delay={0.12}
              className="mt-3 font-display text-cream"
            >
              Chains and custom work, made at our bench.
            </SplitText>

            <motion.p
              initial={stack.initial}
              animate={stack.animate}
              transition={{
                duration: DURATION.content,
                ease: easeOutExpo,
                delay: 0.32,
              }}
              className="mt-4 max-w-[46ch] text-[14px] leading-relaxed text-cream-muted md:text-[15px]"
            >
              Solid gold and certified stones, hand-set in Norridge. Free
              shipping over $150 and a lifetime warranty on everything we make.
            </motion.p>

            <motion.div
              initial={stack.initial}
              animate={stack.animate}
              transition={{
                duration: DURATION.content,
                ease: easeOutExpo,
                delay: 0.42,
              }}
              className="mt-6 flex flex-wrap items-center gap-3"
            >
              <a
                href="/collections/chains"
                className="group inline-flex items-center gap-2 bg-brand px-6 py-3.5 text-[11px] label text-cream transition-colors duration-hover ease-apple hover:bg-brand-hover md:text-[12px]"
              >
                Shop chains
                <ArrowRight
                  aria-hidden
                  size={14}
                  strokeWidth={1.5}
                  className="transition-transform duration-hover ease-apple group-hover:translate-x-0.5"
                />
              </a>
              <a
                href="/collections/pendants"
                className="inline-flex items-center gap-2 border border-cream/60 px-6 py-3.5 text-[11px] label text-cream transition-colors duration-hover ease-apple hover:bg-cream hover:text-base md:text-[12px]"
              >
                Shop pendants
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Headline scale — set here so the SplitText h1 lands on the
          commerce scale rather than the display scale it would inherit
          from a global heading rule. */}
      <style>{`
        section[aria-label="Jewelry Aura"] h1 {
          font-weight: 400;
          font-size: clamp(2rem, 4.6vw, 3.5rem);
          line-height: 1.02;
          letter-spacing: -0.025em;
          font-variation-settings: "opsz" 72;
          max-width: 16ch;
        }
      `}</style>
    </section>
  )
}
