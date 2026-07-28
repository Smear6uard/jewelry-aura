/**
 * components/sections/Hero.tsx — the campaign frame.
 *
 * TWO COMPOSITIONS, NOT ONE RESPONSIVE SQUEEZE.
 *
 * Phones (<lg): the photograph occupies the top 55svh full-bleed with NO
 * type on it, and the type block sits below it on the cream canvas. The
 * previous build overlaid the headline on a 4:5 portrait, which covers
 * the face at the top of the frame and the chain at the bottom — there
 * is no position on that crop where a four-line headline does not sit on
 * the subject. Two stacked full-width buttons follow, so the primary
 * action is in the thumb zone rather than at arm's reach.
 *
 * Desktop (≥lg): full-bleed horizontal frame at 70vh with the type stack
 * overlaid in the left third. A cream gradient carries the canvas colour
 * across the left 25% so the type sits on the page rather than floating
 * on the photograph, which means it can be near-black ink like every
 * other heading on the site instead of cream reversed out of a scrim.
 *
 * At both sizes the top of the category tiles is visible or nearly
 * visible without scrolling. A hero that fills the viewport tells the
 * visitor the page is an experience; a hero that leaves the next shelf
 * peeking tells them it is a shop.
 *
 * Motion budget: one fade-up of the type stack, SplitText on the
 * headline. That is the site's entire load choreography — no pin, no
 * sequence. The rest of the budget goes to hover, the menu and the cart,
 * which are the interactions a shopper actually touches.
 *
 * On the photograph: it is a dark-velvet campaign shot, and on a cream
 * canvas that darkness is the feature. It carries no filter, no scrim
 * and no hue grade — the previous build's maroon hue-blend existed only
 * to stop green velvet fighting a near-black page, and on cream the
 * frame reads as a jewel box on its own.
 */

import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { DURATION, easeOutExpo, useReducedMotion } from '~/lib/motion'
import { SplitText } from '~/components/motion/SplitText'
import { BTN_PRIMARY, BTN_SECONDARY } from '~/lib/ui'

const PHOTO_WIDE_AVIF = '/hero-portrait-wide.avif'
const PHOTO_WIDE_WEBP = '/hero-portrait-wide.webp'
const PHOTO_WIDE_JPG = '/hero-portrait-wide.jpg'
const PHOTO_TALL_AVIF = '/hero-portrait-tall.avif'
const PHOTO_TALL_WEBP = '/hero-portrait-tall.webp'
const PHOTO_TALL_JPG = '/hero-portrait-tall.jpg'

const PHOTO_ALT =
  'A man in an open-collar shirt wearing a heavy gold rope chain, photographed against dark velvet — a Jewelry Aura custom commission.'

const EYEBROW = 'Custom · Iced · One of one'
const SUPPORT =
  'Solid gold and certified stones, hand-set in Norridge. Free shipping over $150 and a lifetime warranty on everything we make.'

/**
 * Carries the cream canvas across the left quarter of the desktop frame
 * so the overlaid type sits on page colour, not on the photograph. Two
 * stops rather than one: a solid hold to ~10% keeps the first word off
 * the velvet even on a 2560px screen.
 */
const DESKTOP_WASH =
  'linear-gradient(to right, #F2EDE4 0%, #F2EDE4 10%, rgba(242,237,228,0.72) 18%, rgba(242,237,228,0) 27%)'

export function Hero() {
  const reduced = !!useReducedMotion()

  const fade = {
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
  }

  const picture = (
    <picture className="block h-full w-full">
      <source media="(min-width: 1024px)" type="image/avif" srcSet={PHOTO_WIDE_AVIF} />
      <source media="(min-width: 1024px)" type="image/webp" srcSet={PHOTO_WIDE_WEBP} />
      <source media="(min-width: 1024px)" type="image/jpeg" srcSet={PHOTO_WIDE_JPG} />
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
        style={{ objectPosition: '58% 38%' }}
      />
    </picture>
  )

  const buttons = (
    <>
      <a href="/collections/chains" className={`group/cta ${BTN_PRIMARY}`}>
        Shop chains
        <ArrowRight
          aria-hidden
          size={15}
          strokeWidth={1.6}
          className="transition-transform duration-hover ease-apple group-hover/cta:translate-x-0.5 motion-reduce:transition-none"
        />
      </a>
      <a href="/collections/pendants" className={BTN_SECONDARY}>
        Shop pendants
      </a>
    </>
  )

  return (
    <section aria-label="Jewelry Aura" className="bg-base">
      {/* ─── Phones and tablets: stacked ───────────────────────────── */}
      <div className="lg:hidden">
        <div className="h-[55svh] max-h-[560px] min-h-[320px] w-full overflow-hidden">
          {picture}
        </div>

        {/* data-reveal: the fade-up below ships as inline opacity:0 in the
            SSR markup, and this is what restores it with JavaScript off.
            See NO_JS_REVEAL_CSS in routes/__root.tsx. */}
        <div data-reveal className="px-4 pb-2 pt-7">
          <motion.p
            initial={fade.initial}
            animate={fade.animate}
            transition={{ duration: DURATION.content, ease: easeOutExpo }}
            className="text-[11px] label-wide text-brand"
          >
            {EYEBROW}
          </motion.p>

          <SplitText as="h1" delay={0.1} className="mt-2.5 display text-ink">
            Chains and custom work, made at our bench.
          </SplitText>

          <motion.p
            initial={fade.initial}
            animate={fade.animate}
            transition={{
              duration: DURATION.content,
              ease: easeOutExpo,
              delay: 0.3,
            }}
            className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-ink-muted"
          >
            {SUPPORT}
          </motion.p>

          {/* Stacked, full width, in the thumb zone. */}
          <motion.div
            initial={fade.initial}
            animate={fade.animate}
            transition={{
              duration: DURATION.content,
              ease: easeOutExpo,
              delay: 0.4,
            }}
            className="mt-6 flex flex-col gap-2.5 [&>a]:w-full"
          >
            {buttons}
          </motion.div>
        </div>
      </div>

      {/* ─── Desktop: overlaid on the left third ───────────────────── */}
      <div className="relative hidden h-[70vh] max-h-[720px] min-h-[460px] w-full overflow-hidden lg:block">
        {picture}

        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ background: DESKTOP_WASH }}
        />

        <div className="absolute inset-0 flex items-center">
          <div className="mx-auto w-full max-w-[1440px] px-8">
            <div data-reveal className="max-w-[30rem]">
              <motion.p
                initial={fade.initial}
                animate={fade.animate}
                transition={{ duration: DURATION.content, ease: easeOutExpo }}
                className="text-[11px] label-wide text-brand"
              >
                {EYEBROW}
              </motion.p>

              <SplitText as="h1" delay={0.1} className="mt-3 display text-ink">
                Chains and custom work, made at our bench.
              </SplitText>

              <motion.p
                initial={fade.initial}
                animate={fade.animate}
                transition={{
                  duration: DURATION.content,
                  ease: easeOutExpo,
                  delay: 0.3,
                }}
                className="mt-4 max-w-[42ch] text-[15px] leading-relaxed text-ink-muted"
              >
                {SUPPORT}
              </motion.p>

              <motion.div
                initial={fade.initial}
                animate={fade.animate}
                transition={{
                  duration: DURATION.content,
                  ease: easeOutExpo,
                  delay: 0.4,
                }}
                className="mt-7 flex flex-wrap items-center gap-3"
              >
                {buttons}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Headline scale — set here so the SplitText h1 lands on the
          commerce scale rather than the display scale it would inherit
          from a global heading rule. Weight comes from `.display`, which
          runs lighter than the old dark-canvas setting: the same words
          read heavier once they are near-black on cream. */}
      <style>{`
        section[aria-label="Jewelry Aura"] h1 {
          font-size: clamp(1.9rem, 6.2vw, 2.6rem);
          line-height: 1.04;
          max-width: 20ch;
        }
        @media (min-width: 1024px) {
          section[aria-label="Jewelry Aura"] h1 {
            font-size: clamp(2.4rem, 3.4vw, 3.25rem);
            line-height: 1.02;
            max-width: 17ch;
          }
        }
      `}</style>
    </section>
  )
}
