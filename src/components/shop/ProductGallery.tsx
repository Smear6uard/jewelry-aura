/**
 * components/shop/ProductGallery.tsx — PDP image gallery.
 *
 * Owner-approved interaction model: desktop shows a vertical thumbnail
 * rail beside the main image; mobile is an edge-to-edge scroll-snap
 * swipe track with dot indicators; tapping/clicking the main image opens
 * a full-screen zoom view (Escape or click closes, focus returns).
 * The first image is the LCP candidate — eager + high priority; the
 * rest lazy-load (R21).
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import type { GalleryImage } from '~/lib/shopify/adapters'

interface ProductGalleryProps {
  images: GalleryImage[]
  title: string
}

export function ProductGallery({ images, title }: ProductGalleryProps) {
  const [active, setActive] = useState(0)
  const [zoomed, setZoomed] = useState(false)
  const zoomTriggerRef = useRef<HTMLButtonElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const closeZoom = useCallback(() => {
    setZoomed(false)
    zoomTriggerRef.current?.focus()
  }, [])

  useEffect(() => {
    if (!zoomed) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeZoom()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [zoomed, closeZoom])

  // Keep the dot indicators in sync with manual swipes on mobile.
  const onTrackScroll = () => {
    const track = trackRef.current
    if (!track) return
    const index = Math.round(track.scrollLeft / track.clientWidth)
    setActive((prev) => (prev === index ? prev : index))
  }

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/5] w-full items-center justify-center bg-forest-surface">
        <span className="font-display text-5xl italic text-cream-muted/30">
          JA
        </span>
      </div>
    )
  }

  const activeImage = images[Math.min(active, images.length - 1)]

  return (
    <div>
      {/* Mobile: scroll-snap swipe track */}
      <div className="md:hidden">
        <div
          ref={trackRef}
          onScroll={onTrackScroll}
          className="-mx-6 flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={`${title} images`}
        >
          {images.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => {
                setActive(index)
                setZoomed(true)
              }}
              className="w-full shrink-0 snap-center px-6"
              aria-label={`Zoom image ${index + 1} of ${images.length}`}
            >
              <img
                src={image.src}
                srcSet={image.srcSet}
                sizes="100vw"
                alt={image.alt}
                width={image.width}
                height={image.height}
                loading={index === 0 ? 'eager' : 'lazy'}
                fetchPriority={index === 0 ? 'high' : undefined}
                className="aspect-[4/5] w-full bg-forest-surface object-cover"
              />
            </button>
          ))}
        </div>
        {images.length > 1 && (
          <div className="mt-4 flex justify-center gap-2" aria-hidden>
            {images.map((image, index) => (
              <span
                key={image.src}
                className={`h-1 rounded-full transition-all duration-micro ease-apple ${
                  index === active ? 'w-6 bg-champagne' : 'w-1.5 bg-cream-muted/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: thumbnail rail + main image */}
      <div className="hidden gap-4 md:flex">
        {images.length > 1 && (
          <div className="flex w-20 shrink-0 flex-col gap-3">
            {images.map((image, index) => (
              <button
                key={image.src}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show image ${index + 1} of ${images.length}`}
                aria-current={index === active}
                className={`aspect-square overflow-hidden bg-forest-surface transition-opacity duration-hover ease-apple ${
                  index === active
                    ? 'opacity-100 ring-1 ring-champagne'
                    : 'opacity-50 hover:opacity-90'
                }`}
              >
                <img
                  src={image.thumb}
                  alt=""
                  width={160}
                  height={160}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
        <button
          ref={zoomTriggerRef}
          type="button"
          onClick={() => setZoomed(true)}
          className="group relative flex-1 cursor-zoom-in overflow-hidden bg-forest-surface"
          aria-label="Zoom image"
        >
          <img
            src={activeImage.src}
            srcSet={activeImage.srcSet}
            sizes="(min-width: 768px) 50vw, 100vw"
            alt={activeImage.alt}
            width={activeImage.width}
            height={activeImage.height}
            loading="eager"
            fetchPriority="high"
            className="aspect-[4/5] h-full w-full object-cover transition-transform duration-page ease-out-expo group-hover:scale-[1.03]"
          />
          <span className="pointer-events-none absolute bottom-4 right-4 font-mono text-[10px] uppercase tracking-[0.22em] text-cream/70 opacity-0 transition-opacity duration-hover ease-apple group-hover:opacity-100">
            Zoom
          </span>
        </button>
      </div>

      {/* Zoom overlay */}
      {zoomed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — zoomed image`}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-forest/95 backdrop-blur-sm"
          onClick={closeZoom}
        >
          <img
            src={activeImage.src}
            srcSet={activeImage.srcSet}
            sizes="100vw"
            alt={activeImage.alt}
            className="max-h-[92dvh] max-w-[94vw] object-contain"
          />
          <button
            type="button"
            onClick={closeZoom}
            autoFocus
            className="absolute right-6 top-6 rounded-full border border-cream-muted/40 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-cream transition-colors duration-hover ease-apple hover:border-champagne hover:text-champagne"
            style={{ borderWidth: '0.5px' }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  )
}
