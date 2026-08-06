/**
 * components/commerce/ProductGallery.tsx — PDP imagery.
 *
 * Phones: an edge-to-edge scroll-snap track with dot indicators, tap to
 * zoom. Desktop: a vertical thumbnail rail beside the main image, click
 * to zoom. The first image is the LCP candidate — eager and high
 * priority; the rest lazy-load, all with locked dimensions.
 *
 * No plate, no filter. On the paper canvas a dark-velvet product shot
 * separates on its own and a white-ground catalog shot melts into the
 * bone tile — the previous build's warm plate and brightness cut existed
 * only to stop white cut-outs glaring against a near-black page.
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
      <div className="flex aspect-[4/5] w-full items-center justify-center bg-bone border border-hairline-light">
        <span className="display text-4xl text-hairline-light">JA</span>
      </div>
    )
  }

  const activeImage = images[Math.min(active, images.length - 1)]

  return (
    <div>
      {/* Phones: snap track, bleeding to both viewport edges. */}
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
              className="w-full shrink-0 snap-center bg-bone"
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
                className={`h-1 transition-all duration-micro ease-apple motion-reduce:transition-none ${
                  index === active ? 'w-6 bg-maroon' : 'w-1.5 bg-hairline-light'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Desktop: thumbnail rail + main image */}
      <div className="hidden gap-3 md:flex">
        {images.length > 1 && (
          <div className="flex w-[76px] shrink-0 flex-col gap-2">
            {images.map((image, index) => (
              <button
                key={image.src}
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Show image ${index + 1} of ${images.length}`}
                aria-current={index === active}
                className={`aspect-square overflow-hidden bg-bone transition-opacity duration-hover ease-apple motion-reduce:transition-none ${
                  index === active
                    ? 'opacity-100 ring-1 ring-maroon'
                    : 'opacity-70 border border-hairline-light hover:opacity-100'
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
          className="group/zoom relative flex-1 cursor-zoom-in overflow-hidden bg-bone border border-hairline-light"
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
            className="aspect-[4/5] h-full w-full object-cover transition-transform duration-content ease-out-expo group-hover/zoom:scale-[1.03] motion-reduce:transition-none"
          />
          <span className="pointer-events-none absolute bottom-3 right-3 bg-paper px-2 py-1 text-[10px] label-wide text-ink opacity-0 transition-opacity duration-hover ease-apple group-hover/zoom:opacity-100 motion-reduce:transition-none">
            Zoom
          </span>
        </button>
      </div>

      {zoomed && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title} — zoomed image`}
          data-ground="velvet"
          className="fixed inset-0 z-[80] flex items-center justify-center bg-velvet/95"
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
            className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center text-bone transition-colors duration-hover ease-apple hover:text-gold motion-reduce:transition-none"
          >
            <X aria-hidden size={21} strokeWidth={1.5} />
          </button>
        </div>
      )}
    </div>
  )
}
