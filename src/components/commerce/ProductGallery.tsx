/**
 * components/commerce/ProductGallery.tsx — PDP imagery.
 *
 * Desktop: a vertical thumbnail rail beside the main image, click to
 * zoom. Phones: an edge-to-edge scroll-snap track with dot indicators,
 * tap to zoom. The first image is the LCP candidate — eager and high
 * priority; the rest lazy-load (R21).
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
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

  // Keep the dot indicators in sync with manual swipes on phones.
  const onTrackScroll = () => {
    const track = trackRef.current
    if (!track) return
    const index = Math.round(track.scrollLeft / track.clientWidth)
    setActive((prev) => (prev === index ? prev : index))
  }

  if (images.length === 0) {
    return (
      <div className="case-plate flex aspect-[4/5] w-full items-center justify-center tile-frame">
        <span className="font-display text-4xl text-base/25">JA</span>
      </div>
    )
  }

  const activeImage = images[Math.min(active, images.length - 1)]

  return (
    <div>
      {/* Phones: snap track */}
      <div className="md:hidden">
        <div
          ref={trackRef}
          onScroll={onTrackScroll}
          className="no-scrollbar -mx-4 flex snap-x snap-mandatory overflow-x-auto"
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
              className="case-plate w-full shrink-0 snap-center"
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
                className="aspect-[4/5] w-full object-cover"
              />
            </button>
          ))}
        </div>
        {images.length > 1 && (
          <div className="mt-3 flex justify-center gap-1.5" aria-hidden>
            {images.map((image, index) => (
              <span
                key={image.src}
                className={`h-1 transition-all duration-micro ease-apple ${
                  index === active ? 'w-6 bg-champagne' : 'w-1.5 bg-hairline'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: thumbnail rail + main image */}
      <div className="hidden gap-3 md:flex">
        {images.length > 1 && (
          <div className="flex w-[72px] shrink-0 flex-col gap-2">
            {images.map((image, index) => (
              <button
                key={image.src}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show image ${index + 1} of ${images.length}`}
                aria-current={index === active}
                className={`case-plate aspect-square overflow-hidden transition-opacity duration-hover ease-apple ${
                  index === active
                    ? 'opacity-100 ring-1 ring-champagne'
                    : 'opacity-55 hover:opacity-90'
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
          className="case-plate group relative flex-1 cursor-zoom-in overflow-hidden tile-frame"
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
            className="aspect-[4/5] h-full w-full object-cover transition-transform duration-content ease-out-expo group-hover:scale-[1.03] motion-reduce:transition-none"
          />
          <span className="pointer-events-none absolute bottom-3 right-3 text-[10px] label-wide text-cream/70 opacity-0 transition-opacity duration-hover ease-apple group-hover:opacity-100">
            Zoom
          </span>
        </button>
      </div>

      {zoomed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — zoomed image`}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-sunken/95"
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
            aria-label="Close zoom"
            className="absolute right-5 top-5 p-2 text-cream-muted transition-colors duration-hover ease-apple hover:text-cream"
          >
            <X aria-hidden size={20} strokeWidth={1.4} />
          </button>
        </div>
      )}
    </div>
  )
}
