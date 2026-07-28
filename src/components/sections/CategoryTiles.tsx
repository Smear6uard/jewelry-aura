/**
 * components/sections/CategoryTiles.tsx — the "I can shop here" moment.
 *
 * Sits immediately under the hero, above the shelf. Two across on
 * phones, and on desktop as many columns as there are doors, close
 * enough to the fold that a visitor sees them without committing to a
 * scroll.
 *
 * EVERY TILE HAS A CORRECT IMAGE OR IT DOES NOT RENDER.
 *
 * A category tile is a promise about what is behind it, so the previous
 * build's two failures were both real bugs: Bracelets and Rings rendered
 * as empty typographic panels, and the Chains tile used a photograph of
 * a pendant. The image for a tile now resolves in one order:
 *
 *   1. A dedicated asset, where the workshop's shot list covers the
 *      category (see Category.tileImage in lib/catalog.ts).
 *   2. The category's first in-stock product image, resolved by the
 *      route. By definition a correct picture of the category.
 *   3. Nothing — and the tile is dropped from the list entirely.
 *
 * The grid's desktop column count follows the number of tiles that
 * survived, so three real doors read as three deliberate doors rather
 * than five slots with two holes in them.
 */

import { ArrowRight } from 'lucide-react'
import { CATEGORIES } from '~/lib/catalog'

/** A product image the route resolved as a category's fallback. */
export interface TileFallbackImage {
  src: string
  srcSet: string
  alt: string
}

/** Fallbacks by collection handle, supplied by the homepage loader. */
export type TileFallbacks = Record<string, TileFallbackImage | null>

interface ResolvedTile {
  key: string
  label: string
  href: string
  /** Local asset base path (no extension) — takes precedence. */
  asset?: string
  /** Shopify-hosted fallback, used when there is no local asset. */
  remote?: TileFallbackImage
  alt: string
}

/**
 * Custom work is a door into the catalog like any other, and the one the
 * workshop most wants opened — so it sits in the row rather than in a
 * separate band. Its asset is a real commission from the bench.
 */
const CUSTOM_TILE = {
  key: 'custom',
  label: 'Custom',
  href: '/custom',
  asset: '/JA-image2',
  alt: 'A custom monogram pendant in white gold, fully set with round and baguette stones.',
}

/** Desktop column counts, keyed by surviving tile count. Static strings
 *  because Tailwind cannot see a computed class name. Six doors set as
 *  two rows of three rather than a six-across ribbon — at 1440px, six
 *  across gives each tile less width than a phone does. */
const COLUMNS: Record<number, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-3',
}

/**
 * Custom is pinned last and never dropped, so the five categories get
 * the first five slots and the row tops out at six. Slicing the whole
 * list instead would quietly delete Bracelets — the last category — on
 * the day the workshop finally photographs all five.
 */
export function resolveTiles(fallbacks: TileFallbacks): ResolvedTile[] {
  const tiles: ResolvedTile[] = []

  for (const category of CATEGORIES) {
    if (category.tileImage) {
      tiles.push({
        key: category.handle,
        label: category.label,
        href: `/collections/${category.handle}`,
        asset: category.tileImage,
        alt: category.tileAlt ?? `${category.label} from Jewelry Aura.`,
      })
      continue
    }
    const remote = fallbacks[category.handle]
    if (remote) {
      tiles.push({
        key: category.handle,
        label: category.label,
        href: `/collections/${category.handle}`,
        remote,
        alt: remote.alt,
      })
    }
    // No asset and no in-stock product: the tile is dropped.
  }

  return [...tiles.slice(0, 5), CUSTOM_TILE]
}

export function CategoryTiles({ fallbacks }: { fallbacks: TileFallbacks }) {
  const tiles = resolveTiles(fallbacks)

  // One lone door is not a category row; two is a complete phone row.
  if (tiles.length < 2) return null

  return (
    <section
      aria-label="Shop by category"
      className="mx-auto max-w-[1440px] px-4 pt-8 md:px-8 md:pt-12"
    >
      <ul
        className={`grid grid-cols-2 gap-2 md:gap-3 ${COLUMNS[tiles.length] ?? 'md:grid-cols-3'}`}
      >
        {tiles.map((tile) => (
          <li key={tile.key}>
            <a
              href={tile.href}
              className="group/tile relative flex aspect-[4/5] flex-col justify-end overflow-hidden bg-raised shadow-sm transition-shadow duration-hover ease-apple hover:shadow-md md:aspect-[3/4] motion-reduce:transition-none"
            >
              {tile.asset ? (
                <picture>
                  <source type="image/avif" srcSet={`${tile.asset}.avif`} />
                  <source type="image/webp" srcSet={`${tile.asset}.webp`} />
                  <img
                    src={`${tile.asset}.jpg`}
                    alt={tile.alt}
                    width={1122}
                    height={1402}
                    loading="lazy"
                    decoding="async"
                    sizes="(min-width: 768px) 19vw, 48vw"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-content ease-out-expo group-hover/tile:scale-[1.03] motion-reduce:transition-none"
                  />
                </picture>
              ) : (
                <img
                  src={tile.remote!.src}
                  srcSet={tile.remote!.srcSet}
                  alt={tile.alt}
                  width={1200}
                  height={1500}
                  loading="lazy"
                  decoding="async"
                  sizes="(min-width: 768px) 19vw, 48vw"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-content ease-out-expo group-hover/tile:scale-[1.03] motion-reduce:transition-none"
                />
              )}

              {/* The label sits in a solid cream plate at the foot of the
                  tile rather than reversed out of a scrim over the
                  photograph. Nothing translucent and no filter touches the
                  image — on cream, dark velvet separates on its own. */}
              <span className="relative z-10 m-2 flex items-center justify-between gap-2 bg-base px-3 py-2.5 md:m-2.5 md:px-3.5">
                <span className="text-[13px] label text-ink md:text-[14px]">
                  {tile.label}
                </span>
                <ArrowRight
                  aria-hidden
                  size={15}
                  strokeWidth={1.6}
                  className="shrink-0 text-brand transition-transform duration-hover ease-apple group-hover/tile:translate-x-0.5 motion-reduce:transition-none"
                />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  )
}
