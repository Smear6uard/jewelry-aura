/**
 * components/sections/CustomWork.tsx — the commission gallery.
 *
 * The previous build's pinned horizontal strip, restyled to the
 * storefront palette and reframed as one shelf among many rather than
 * the centrepiece of the page. The section header now reads like every
 * other header on the homepage — left-aligned, with the commission link
 * on the right — and sits in normal flow above the strip instead of
 * riding along inside the track.
 *
 * Pin range shortened from 360svh to 200svh: the panel pins for one
 * viewport of scroll and releases. The old range made a visitor scroll
 * three screens to get past five photographs, which is a fine length
 * for a portfolio and far too long for a store.
 *
 * Desktop pins and translates the track on a Lenis-coupled motionValue
 * (the same architecture the old hero used). Phones get a native
 * snap-x carousel — horizontal-on-vertical does not work under a
 * thumb. Reduced motion collapses the desktop pin to a static grid.
 */

import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useReducedMotion } from '~/lib/motion'
import { useLenis } from '~/lib/lenis'
import { SectionHeader } from '~/components/commerce/SectionHeader'

type Piece = {
  id: string
  name: string
  meta: string
  /** Base path without extension; avif/webp/jpg all exist. */
  image: string
  width: number
  height: number
  alt: string
  focus?: string
}

const PIECES: Piece[] = [
  {
    id: '01',
    name: 'Twenty-Three',
    meta: 'White gold · Praying-hands plate',
    image: '/JA-image1',
    width: 1122,
    height: 1402,
    alt: 'Custom 23 plate pendant with praying-hands cap, set in white gold and baguette diamonds.',
    focus: '52% 50%',
  },
  {
    id: '02',
    name: 'Kemo',
    meta: 'White gold · Custom monogram',
    image: '/JA-image2',
    width: 1122,
    height: 1402,
    alt: 'Custom KEMO monogram pendant in white gold, fully iced with round and baguette stones.',
    focus: '52% 50%',
  },
  {
    id: '03',
    name: 'Queen',
    meta: 'Yellow gold · Heart drop · Two-tone',
    image: '/JA-image3',
    width: 1122,
    height: 1402,
    alt: 'Custom Queen script pendant with heart drop, in yellow gold and pavé diamonds.',
    focus: '50% 50%',
  },
  {
    id: '04',
    name: 'ATDB',
    meta: 'Two-tone · Hand-engraved plate',
    image: '/JA-image4',
    width: 1122,
    height: 1402,
    alt: 'Custom ATDB block pendant in two-tone gold with engraved tagline and hand-set diamonds.',
    focus: '52% 50%',
  },
  {
    id: '05',
    name: 'HRG',
    meta: 'White gold · Diamond globe bail',
    image: '/JA-image5',
    width: 1086,
    height: 1448,
    alt: 'Custom HRG plate pendant reading “Hustle Russell The God”, fully set in white gold with a diamond globe bail.',
    focus: '48% 45%',
  },
]

export function CustomWork() {
  const reduced = !!useReducedMotion()

  return (
    <section
      id="custom-work"
      data-section="custom-work"
      aria-label="Custom work"
      className="bg-base"
    >
      <div className="mx-auto max-w-[1440px] px-4 pt-12 md:px-8 md:pt-16">
        <SectionHeader
          title="One of one"
          eyebrow="Custom work"
          link={{ href: '/custom', label: 'Start a custom piece' }}
        />
      </div>

      <div className="hidden lg:block">
        {reduced ? <StaticStrip /> : <PinnedStrip />}
      </div>
      <div className="lg:hidden">
        <MobileStrip />
      </div>
    </section>
  )
}

// ─── Desktop: pinned horizontal strip ────────────────────────────────

function PinnedStrip() {
  const lenis = useLenis()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const pinY = useMotionValue(0)
  const progress = useMotionValue(0)
  const [maxX, setMaxX] = useState(0)

  const trackX = useTransform(progress, [0, 1], [0, -maxX])
  const progressWidth = useTransform(progress, [0, 1], ['0%', '100%'])

  useEffect(() => {
    if (!trackRef.current) return
    const measure = () => {
      const track = trackRef.current
      if (!track) return
      // The track must clear the viewport plus the right-hand gutter.
      setMaxX(Math.max(0, track.scrollWidth - window.innerWidth + 32))
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(trackRef.current)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [])

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
    lenis.on('scroll', update)
    window.addEventListener('resize', update)
    return () => {
      lenis.off('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [lenis, pinY, progress])

  return (
    // 200svh wrapper → exactly one viewport of pin. The old 360svh
    // made this section a third of the homepage's scroll depth.
    <div ref={wrapperRef} className="relative h-[200svh] w-full">
      <motion.div
        style={{ y: pinY }}
        className="absolute left-0 top-0 flex h-[100svh] w-full flex-col justify-center overflow-hidden will-change-transform"
      >
        <motion.div
          ref={trackRef}
          style={{ x: trackX }}
          className="flex items-center gap-4 pl-8 will-change-transform"
        >
          {PIECES.map((piece) => (
            <PieceCard key={piece.id} piece={piece} />
          ))}
          <CommissionCard />
        </motion.div>

        <div className="pointer-events-none absolute inset-x-8 bottom-8 flex items-center gap-4">
          <span className="text-[10px] label-wide text-cream-subtle">
            Scroll
          </span>
          <span className="relative h-px flex-1 overflow-hidden bg-hairline">
            <motion.span
              className="absolute left-0 top-0 block h-full bg-champagne"
              style={{ width: progressWidth }}
            />
          </span>
        </div>
      </motion.div>
    </div>
  )
}

// ─── The card ────────────────────────────────────────────────────────

function PieceCard({ piece }: { piece: Piece }) {
  return (
    <figure className="group relative flex h-[56svh] w-[calc(56svh*0.72)] shrink-0 flex-col">
      <div className="velvet-grade relative h-[86%] w-full overflow-hidden bg-raised tile-frame">
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
            className="h-full w-full object-cover transition-transform duration-content ease-out-expo group-hover:scale-[1.03] motion-reduce:transition-none"
            style={{ objectPosition: piece.focus ?? '50% 50%' }}
          />
        </picture>

        <span
          className="absolute left-0 top-0 px-2 py-1 text-[10px] label-wide text-champagne"
          style={{
            boxShadow: 'inset 0 0 0 1px rgba(196,168,117,0.5)',
            backgroundColor: 'rgba(10,9,8,0.72)',
          }}
        >
          No. {piece.id}
        </span>
      </div>

      <figcaption className="flex items-baseline justify-between gap-3 pt-3">
        <h3 className="text-[14px] font-medium text-cream">{piece.name}</h3>
        <span className="shrink-0 text-[11px] text-cream-subtle">
          {piece.meta}
        </span>
      </figcaption>
    </figure>
  )
}

function CommissionCard() {
  return (
    <a
      href="/custom"
      className="group relative flex h-[56svh] w-[calc(56svh*0.72)] shrink-0 flex-col"
    >
      <div className="relative flex h-[86%] w-full flex-col items-center justify-center overflow-hidden border border-hairline bg-raised px-6 text-center transition-colors duration-hover ease-apple group-hover:border-brand-hover">
        <span className="text-[10px] label-wide text-champagne">
          No. {String(PIECES.length + 1).padStart(2, '0')}
        </span>
        <h3 className="mt-4 font-display text-[26px] leading-tight tracking-tight text-cream">
          Commission yours
        </h3>
        <p className="mt-3 max-w-[26ch] text-[13px] leading-relaxed text-cream-muted">
          Bring a sketch, a reference or a name. We design and set the rest.
        </p>
        <span className="mt-6 inline-flex items-center bg-brand px-5 py-3 text-[11px] label text-cream transition-colors duration-hover ease-apple group-hover:bg-brand-hover">
          Start a piece
        </span>
      </div>
      <div className="flex items-baseline justify-between gap-3 pt-3">
        <span className="text-[14px] font-medium text-cream">Yours, next</span>
        <span className="shrink-0 text-[11px] text-cream-subtle">
          By consultation
        </span>
      </div>
    </a>
  )
}

// ─── Phones: native snap carousel ────────────────────────────────────

function MobileStrip() {
  return (
    <div className="py-8">
      <div
        data-scroller
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-4 pb-2"
        style={{ touchAction: 'pan-x' }}
      >
        {PIECES.map((piece) => (
          <div
            key={piece.id}
            className="w-[70vw] max-w-[22rem] shrink-0 snap-center"
          >
            <MobilePieceCard piece={piece} />
          </div>
        ))}
        <div className="w-[70vw] max-w-[22rem] shrink-0 snap-center">
          <MobileCommissionCard />
        </div>
      </div>
    </div>
  )
}

function MobilePieceCard({ piece }: { piece: Piece }) {
  return (
    <figure>
      <div className="velvet-grade relative aspect-[3/4] overflow-hidden bg-raised tile-frame">
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
            sizes="70vw"
            className="h-full w-full object-cover"
            style={{ objectPosition: piece.focus ?? '50% 50%' }}
          />
        </picture>
        <span
          className="absolute left-0 top-0 px-2 py-1 text-[10px] label-wide text-champagne"
          style={{
            boxShadow: 'inset 0 0 0 1px rgba(196,168,117,0.5)',
            backgroundColor: 'rgba(10,9,8,0.72)',
          }}
        >
          No. {piece.id}
        </span>
      </div>
      <figcaption className="pt-2.5">
        <h3 className="text-[13px] font-medium text-cream">{piece.name}</h3>
        <p className="mt-0.5 text-[11px] text-cream-subtle">{piece.meta}</p>
      </figcaption>
    </figure>
  )
}

function MobileCommissionCard() {
  return (
    <a href="/custom" className="block">
      <div className="flex aspect-[3/4] flex-col items-center justify-center border border-hairline bg-raised px-5 text-center">
        <h3 className="font-display text-[22px] leading-tight tracking-tight text-cream">
          Commission yours
        </h3>
        <p className="mt-3 text-[13px] leading-relaxed text-cream-muted">
          Bring a sketch, a reference or a name.
        </p>
        <span className="mt-5 inline-flex items-center bg-brand px-5 py-3 text-[11px] label text-cream">
          Start a piece
        </span>
      </div>
      <p className="pt-2.5 text-[13px] font-medium text-cream">Yours, next</p>
    </a>
  )
}

// ─── Reduced motion: no pin, no travel ───────────────────────────────

function StaticStrip() {
  return (
    <div className="mx-auto max-w-[1440px] px-8 py-12">
      <div className="grid grid-cols-3 gap-4">
        {PIECES.map((piece) => (
          <figure key={piece.id}>
            <div className="velvet-grade relative aspect-[3/4] overflow-hidden bg-raised tile-frame">
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
                  sizes="30vw"
                  className="h-full w-full object-cover"
                  style={{ objectPosition: piece.focus ?? '50% 50%' }}
                />
              </picture>
              <span
                className="absolute left-0 top-0 px-2 py-1 text-[10px] label-wide text-champagne"
                style={{
                  boxShadow: 'inset 0 0 0 1px rgba(196,168,117,0.5)',
                  backgroundColor: 'rgba(10,9,8,0.72)',
                }}
              >
                No. {piece.id}
              </span>
            </div>
            <figcaption className="flex items-baseline justify-between gap-3 pt-3">
              <h3 className="text-[14px] font-medium text-cream">
                {piece.name}
              </h3>
              <span className="shrink-0 text-[11px] text-cream-subtle">
                {piece.meta}
              </span>
            </figcaption>
          </figure>
        ))}
      </div>
      <a
        href="/custom"
        className="mt-8 inline-flex items-center bg-brand px-6 py-3.5 text-[11px] label text-cream transition-colors duration-hover ease-apple hover:bg-brand-hover"
      >
        Start a custom piece
      </a>
    </div>
  )
}
