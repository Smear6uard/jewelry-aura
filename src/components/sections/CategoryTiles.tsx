/**
 * components/sections/CategoryTiles.tsx — the "I can shop here" moment.
 *
 * Sits immediately under the hero, above every rail. Five doors into
 * the catalog, close enough to the fold that a visitor sees them
 * without committing to a scroll.
 *
 * Photography note: the workshop's shot list covers chains, pendants
 * and custom work. It does not yet cover bracelets or rings, so those
 * two tiles render as typographic tiles rather than borrowing a pendant
 * photograph and labelling it "Rings" — a category tile is a promise
 * about what is behind it. Drop a file at the path named in the data
 * below and the tile becomes a photo tile with no code change.
 */

import { ArrowRight } from 'lucide-react'

interface Tile {
  label: string
  href: string
  /** Base path without extension; avif/webp/jpg are all expected. */
  image?: string
  alt?: string
  /** Shown on the typographic tiles in place of a photograph. */
  note?: string
}

const TILES: Tile[] = [
  {
    label: 'Chains',
    href: '/collections/chains',
    image: '/JA-image5',
    alt: 'Custom HRG plate pendant reading “Hustle Russell The God”, fully set in white gold with a diamond globe bail.',
  },
  {
    label: 'Pendants',
    href: '/collections/pendants',
    image: '/JA-image1',
    alt: 'A custom white gold plate pendant set with baguette diamonds.',
  },
  {
    label: 'Bracelets',
    href: '/collections/bracelets',
    note: 'Cuban, tennis and rope',
  },
  {
    label: 'Rings',
    href: '/collections/rings',
    note: 'Engagement, bands and signets',
  },
  {
    label: 'Custom',
    href: '/custom',
    image: '/JA-image2',
    alt: 'A custom monogram pendant in white gold, fully set with round and baguette stones.',
  },
]

export function CategoryTiles() {
  return (
    <section
      aria-label="Shop by category"
      className="mx-auto max-w-[1440px] px-4 pt-8 md:px-8 md:pt-10"
    >
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-5 md:gap-3">
        {TILES.map((tile) => (
          <li key={tile.href} className={tile.label === 'Custom' ? 'col-span-2 md:col-span-1' : ''}>
            <a
              href={tile.href}
              className={`group relative flex aspect-[4/5] flex-col justify-end overflow-hidden bg-raised tile-frame md:aspect-[3/4] ${
                tile.image ? 'velvet-grade' : ''
              }`}
            >
              {tile.image ? (
                <>
                  <picture>
                    <source type="image/avif" srcSet={`${tile.image}.avif`} />
                    <source type="image/webp" srcSet={`${tile.image}.webp`} />
                    <img
                      src={`${tile.image}.jpg`}
                      alt={tile.alt ?? ''}
                      loading="lazy"
                      decoding="async"
                      sizes="(min-width: 768px) 19vw, 48vw"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-content ease-out-expo group-hover:scale-[1.04] motion-reduce:transition-none"
                    />
                  </picture>
                  {/* Base scrim for label contrast, plus a maroon scrim
                      that lifts in on hover — the tile's only colour. */}
                  <span
                    aria-hidden
                    className="absolute inset-0"
                    style={{
                      background:
                        'linear-gradient(to top, rgba(5,4,4,0.85) 0%, rgba(5,4,4,0.15) 45%, rgba(5,4,4,0) 70%)',
                    }}
                  />
                  <span
                    aria-hidden
                    className="absolute inset-0 opacity-0 transition-opacity duration-micro ease-apple group-hover:opacity-100 motion-reduce:transition-none"
                    style={{
                      background:
                        'linear-gradient(to top, rgba(61,15,22,0.85) 0%, rgba(61,15,22,0.25) 55%, rgba(61,15,22,0) 100%)',
                    }}
                  />
                </>
              ) : (
                <span
                  aria-hidden
                  className="absolute inset-0 transition-colors duration-micro ease-apple group-hover:bg-brand/25"
                  style={{
                    background:
                      'radial-gradient(ellipse 90% 70% at 50% 100%, rgba(196,168,117,0.09) 0%, rgba(20,17,16,0) 65%)',
                  }}
                />
              )}

              <span className="relative z-10 flex items-end justify-between gap-2 p-3 md:p-4">
                <span>
                  <span className="block text-[13px] label text-cream md:text-[14px]">
                    {tile.label}
                  </span>
                  {tile.note && (
                    <span className="mt-1 block text-[11px] text-cream-subtle">
                      {tile.note}
                    </span>
                  )}
                </span>
                <ArrowRight
                  aria-hidden
                  size={15}
                  strokeWidth={1.5}
                  className="shrink-0 text-cream transition-transform duration-hover ease-apple group-hover:translate-x-0.5"
                />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
