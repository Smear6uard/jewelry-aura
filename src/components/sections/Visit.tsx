/**
 * components/sections/Visit.tsx — closing section / consultation surface
 *
 * Final section of the page. Every "Start a custom piece" CTA across
 * the site smooth-scrolls here; the user lands with the phone CTA,
 * address, and hours all in view. The atelier has no on-site
 * customisation flow — this section IS the funnel.
 *
 * Brand grammar (mirrors Hero / CustomPieces / Services):
 *   • Forest #14261F canvas, continuous with adjacent sections.
 *   • Champagne #C4A875 reserved for hairlines and small accents —
 *     never bulk fills, never type larger than the eyebrow.
 *   • Cream #F0EBE0 type, no italic-for-emphasis on any word.
 *   • Eyebrow rhythm: 26 × 0.5px champagne hairline + 11px mono caps,
 *     champagne, 0.22em tracking. Same as the Hero's eyebrow.
 *   • Info blocks (Location / Hours): no Lucide pictograms, no
 *     filled-circle badges. Each block opens with the same hairline
 *     rule used at the section eyebrow — small uppercase serif title
 *     beneath, sans body.
 *   • Primary CTA: cream-fill pill matching the Hero's primary CTA.
 *     This is the ONLY CTA on the site that is wired to a tel: link —
 *     the user has reached the section, the dial action is the
 *     intentional next step.
 *   • Map: champagne 0.5px hairline frame, dark filter on the embed.
 *
 * The section's outer container carries `id="visit"` so the
 * scroll-to helper (`lib/scroll-to.ts`) can target it from every
 * commission CTA on the site.
 */

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { DURATION, easeApple, easeOutExpo } from '~/lib/motion'

// ─── Palette ────────────────────────────────────────────────────────
const FOREST = '#14261F'
const CREAM = '#F0EBE0'
const CREAM_MUTED = '#C0B8A6'
const CHAMPAGNE = '#C4A875'
const SAGE = '#9FB6A6'

// Same hand-tuned grain as Hero / CustomPieces — keeps the section on
// the same printed sheet of film as everything above it.
const GRAIN_SVG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.45'/></svg>\")"

const PHONE = '630-965-6464'
const PHONE_HREF = 'tel:6309656464'
const MAP_SRC =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2966.86016187766!2d-87.809403823481!3d41.95992956030999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880fcb1ab8f51ab1%3A0xe5a3c0a52df2ed3b!2s4104%20N%20Harlem%20Ave%2C%20Norridge%2C%20IL%2060706!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus'

export function Visit() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: '-15%' })

  return (
    <section
      id="visit"
      ref={ref}
      data-section="visit"
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: FOREST }}
    >
      {/* Top edge — soft fade carries continuity from the section above. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-24"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0))',
        }}
      />

      {/* Soft velvet pool from the lower-left, mirrors Hero's grammar. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 80% at 8% 90%, rgba(20,38,31,0.55) 0%, rgba(20,38,31,0) 60%)',
        }}
      />

      {/* Grain — same printed sheet as the rest of the site. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 mix-blend-overlay"
        style={{
          opacity: 0.12,
          backgroundImage: GRAIN_SVG,
          backgroundSize: '220px 220px',
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1440px] px-6 pb-12 pt-24 md:px-12 md:pt-32 lg:pt-36">
        <div className="grid grid-cols-1 items-start gap-14 lg:grid-cols-2 lg:gap-20">
          {/* ─── Left column — eyebrow / headline / info / CTA ───── */}
          <div>
            <Eyebrow inView={inView} />
            <Headline inView={inView} />
            <Body inView={inView} />

            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-10">
              <InfoBlock
                title="Our Location"
                inView={inView}
                delay={0.4}
                lines={['4104 N Harlem Ave', 'Norridge, IL 60706']}
              />
              <InfoBlock
                title="Store Hours"
                inView={inView}
                delay={0.5}
                lines={['Mon–Sat · 10:00 AM – 6:00 PM', 'Sun · Closed']}
              />
            </div>

            <PrimaryCallCTA inView={inView} />
          </div>

          {/* ─── Right column — map ────────────────────────────────── */}
          <MapPanel inView={inView} />
        </div>

        {/* Editorial bottom rule + copyright */}
        <FooterRule />
      </div>
    </section>
  )
}

// ────────────────────────────────────────────────────────────────────
// Header pieces
// ────────────────────────────────────────────────────────────────────

function Eyebrow({ inView }: { inView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
      transition={{ duration: DURATION.content, ease: easeOutExpo }}
      className="mb-7 flex items-center gap-3"
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
        Visit us
      </span>
    </motion.div>
  )
}

function Headline({ inView }: { inView: boolean }) {
  // Two clipped rows so the headline rises in the same grammar the
  // hero uses — "Iced. / Custom. / Yours." up there, "Elevate your /
  // presence." down here. Both lines are identical cream — no
  // italic-for-emphasis, no colour shift on any word.
  const lines = ['Elevate your', 'presence.'] as const

  return (
    <h2
      aria-label="Elevate your presence."
      className="font-display"
      style={{
        color: CREAM,
        fontWeight: 400,
        fontSize: 'clamp(2.4rem, 5.4vw, 5rem)',
        lineHeight: 1.0,
        letterSpacing: '-0.03em',
        fontVariationSettings: '"opsz" 144',
      }}
    >
      {lines.map((text, i) => (
        <span
          key={text}
          aria-hidden
          className="block overflow-hidden"
          style={{ paddingBottom: '0.06em' }}
        >
          <motion.span
            className="block will-change-transform"
            initial={{ y: '110%' }}
            animate={inView ? { y: '0%' } : { y: '110%' }}
            transition={{
              duration: DURATION.hero,
              ease: easeOutExpo,
              delay: 0.08 + i * 0.06,
            }}
          >
            {text}
          </motion.span>
        </span>
      ))}
    </h2>
  )
}

function Body({ inView }: { inView: boolean }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      transition={{
        duration: DURATION.content,
        ease: easeOutExpo,
        delay: 0.28,
      }}
      className="mt-9 max-w-[32ch] font-sans text-[15px] leading-[1.7] md:text-[16px]"
      style={{ color: CREAM_MUTED }}
    >
      Our boutique in Norridge is by walk-in or appointment. Bring a
      sketch, a reference, or a name — we design the rest in person.
    </motion.p>
  )
}

// ────────────────────────────────────────────────────────────────────
// Info block — hairline rule + serif title + sans body
// ────────────────────────────────────────────────────────────────────

function InfoBlock({
  title,
  lines,
  inView,
  delay,
}: {
  title: string
  lines: readonly string[]
  inView: boolean
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      transition={{ duration: DURATION.content, ease: easeOutExpo, delay }}
    >
      {/* Hairline cap — same 26×0.5px champagne rule used at the
          section eyebrow, so the info blocks read as a continuation
          of the same typographic system, not a new component. */}
      <span
        aria-hidden
        className="mb-4 block"
        style={{
          width: 26,
          height: '0.5px',
          backgroundColor: 'rgba(196,168,117,0.7)',
        }}
      />
      <h3
        className="font-display"
        style={{
          color: CREAM,
          fontWeight: 400,
          fontSize: '1.1rem',
          letterSpacing: '-0.005em',
          fontVariationSettings: '"opsz" 72',
        }}
      >
        {title}
      </h3>
      <div className="mt-2 space-y-1">
        {lines.map((line) => (
          <p
            key={line}
            className="font-sans text-[14px] leading-[1.6]"
            style={{ color: CREAM_MUTED }}
          >
            {line}
          </p>
        ))}
      </div>
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────────────────
// Primary CTA — cream-fill pill, tel: link
// ────────────────────────────────────────────────────────────────────

function PrimaryCallCTA({ inView }: { inView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 18 }}
      transition={{
        duration: DURATION.content,
        ease: easeOutExpo,
        delay: 0.62,
      }}
      className="mt-12"
    >
      <motion.a
        href={PHONE_HREF}
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
        <span>Call {PHONE}</span>
        <span aria-hidden style={{ fontSize: 14, lineHeight: 1 }}>
          →
        </span>
      </motion.a>
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────────────────
// Map panel — champagne hairline frame
// ────────────────────────────────────────────────────────────────────

function MapPanel({ inView }: { inView: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
      transition={{
        duration: DURATION.hero,
        ease: easeOutExpo,
        delay: 0.2,
      }}
      className="relative h-[360px] w-full overflow-hidden md:h-[460px] lg:h-[600px]"
      style={{
        boxShadow: 'inset 0 0 0 0.5px rgba(196,168,117,0.45)',
      }}
    >
      <iframe
        src={inView ? MAP_SRC : 'about:blank'}
        width="100%"
        height="100%"
        style={{
          border: 0,
          // Same map-dark filter the previous Visit used — biases
          // toward our forest world without losing legibility.
          filter: 'grayscale(100%) invert(92%) contrast(83%)',
        }}
        allowFullScreen={false}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Jewelry Aura — 4104 N Harlem Ave, Norridge IL"
      />
      {/* Address card — small, cream on a translucent forest panel,
          champagne hairline cap. Reads against the dark map without
          fighting it. */}
      <div
        className="absolute left-5 top-5 max-w-[18rem] px-5 py-4"
        style={{
          backgroundColor: 'rgba(20,38,31,0.78)',
          backdropFilter: 'blur(10px) saturate(140%)',
          WebkitBackdropFilter: 'blur(10px) saturate(140%)',
          boxShadow: 'inset 0 0 0 0.5px rgba(196,168,117,0.3)',
        }}
      >
        <span
          aria-hidden
          className="mb-3 block"
          style={{
            width: 22,
            height: '0.5px',
            backgroundColor: 'rgba(196,168,117,0.85)',
          }}
        />
        <p
          className="font-mono text-[10px] uppercase"
          style={{ color: CHAMPAGNE, letterSpacing: '0.32em' }}
        >
          The studio
        </p>
        <p
          className="mt-2 font-display"
          style={{
            color: CREAM,
            fontSize: '1rem',
            fontWeight: 400,
            letterSpacing: '-0.005em',
            fontVariationSettings: '"opsz" 72',
          }}
        >
          4104 N Harlem Ave
        </p>
        <p
          className="mt-1 font-sans text-[12px]"
          style={{ color: CREAM_MUTED }}
        >
          Norridge, IL 60706
        </p>
      </div>
    </motion.div>
  )
}

// ────────────────────────────────────────────────────────────────────
// Footer rule — small typographic strip beneath Visit
// ────────────────────────────────────────────────────────────────────

function FooterRule() {
  return (
    <footer className="mt-24 pt-8" style={{ borderTop: '0.5px solid rgba(196,168,117,0.2)' }}>
      <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
        <p
          className="font-mono text-[10px] uppercase"
          style={{ color: SAGE, letterSpacing: '0.28em' }}
        >
          © {new Date().getFullYear()} · Jewelry Aura · Norridge, IL
        </p>
        <div className="flex items-center gap-7">
          <FooterLink href="https://instagram.com/Jewelryaura01">
            Instagram
          </FooterLink>
          <FooterLink href={PHONE_HREF}>{PHONE}</FooterLink>
        </div>
      </div>
    </footer>
  )
}

function FooterLink({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      className="group relative font-mono text-[10px] uppercase"
      style={{ color: CREAM_MUTED, letterSpacing: '0.28em' }}
    >
      {children}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-1 left-0 right-0 origin-left scale-x-0 transition-transform duration-hover ease-apple group-hover:scale-x-100"
        style={{ height: '0.5px', backgroundColor: CHAMPAGNE }}
      />
    </a>
  )
}
