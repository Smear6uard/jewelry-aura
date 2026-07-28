/**
 * components/sections/CommissionGrid.tsx — finished commissions, on the
 * page where somebody asked to see them.
 *
 * The five photographs the deleted homepage gallery used to pin and
 * translate, rendered as a plain responsive grid on /custom. No pin, no
 * scroll-coupled track, no progress bar, no numbered captions — a
 * visitor on the commission page has already opted into looking at work,
 * so the job is to show it and get out of the way.
 *
 * Two across on phones (a single-column stack of five portraits is a
 * five-screen scroll), three from md up.
 */

type Piece = {
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
    name: 'Twenty-Three',
    meta: 'White gold · Praying-hands plate',
    image: '/JA-image1',
    width: 1122,
    height: 1402,
    alt: 'Custom 23 plate pendant with praying-hands cap, set in white gold and baguette diamonds.',
    focus: '52% 50%',
  },
  {
    name: 'Kemo',
    meta: 'White gold · Custom monogram',
    image: '/JA-image2',
    width: 1122,
    height: 1402,
    alt: 'Custom KEMO monogram pendant in white gold, fully iced with round and baguette stones.',
    focus: '52% 50%',
  },
  {
    name: 'Queen',
    meta: 'Yellow gold · Heart drop · Two-tone',
    image: '/JA-image3',
    width: 1122,
    height: 1402,
    alt: 'Custom Queen script pendant with heart drop, in yellow gold and pavé diamonds.',
    focus: '50% 50%',
  },
  {
    name: 'ATDB',
    meta: 'Two-tone · Hand-engraved plate',
    image: '/JA-image4',
    width: 1122,
    height: 1402,
    alt: 'Custom ATDB block pendant in two-tone gold with engraved tagline and hand-set diamonds.',
    focus: '52% 50%',
  },
  {
    name: 'HRG',
    meta: 'White gold · Diamond globe bail',
    image: '/JA-image5',
    width: 1086,
    height: 1448,
    alt: 'Custom HRG plate pendant reading “Hustle Russell The God”, fully set in white gold with a diamond globe bail.',
    focus: '48% 45%',
  },
]

export function CommissionGrid() {
  return (
    <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
      {PIECES.map((piece) => (
        <li key={piece.image}>
          <figure className="h-full bg-raised shadow-sm">
            <div className="aspect-[3/4] w-full overflow-hidden">
              <picture>
                <source type="image/avif" srcSet={`${piece.image}.avif`} />
                <source type="image/webp" srcSet={`${piece.image}.webp`} />
                <img
                  src={`${piece.image}.jpg`}
                  alt={piece.alt}
                  width={piece.width}
                  height={piece.height}
                  loading="lazy"
                  decoding="async"
                  sizes="(min-width: 768px) 31vw, 48vw"
                  className="h-full w-full object-cover"
                  style={{ objectPosition: piece.focus ?? '50% 50%' }}
                />
              </picture>
            </div>
            <figcaption className="px-3 py-3 md:px-4">
              <h3 className="text-[14px] font-medium text-ink">{piece.name}</h3>
              <p className="mt-0.5 text-[12px] text-ink-muted">{piece.meta}</p>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  )
}
