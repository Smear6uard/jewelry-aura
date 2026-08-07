/**
 * components/sections/CommissionGrid.tsx — finished commissions, on the
 * page where somebody asked to see them.
 *
 * The five photographs, as a plain responsive grid on /custom. No pin, no
 * scroll-coupled track, no progress bar, no numbered captions — a visitor
 * on the commission page has already opted into looking at work, so the
 * job is to show it and get out of the way. The homepage is where the
 * same five get the scrubbed sequence (see sections/CommissionedWork).
 *
 * Two across on phones (a single-column stack of five portraits is a
 * five-screen scroll), three from md up.
 */

import { COMMISSIONS } from '~/lib/commissions'

export function CommissionGrid() {
  return (
    <ul className="grid grid-cols-2 gap-2 md:grid-cols-3 md:gap-3">
      {COMMISSIONS.map((piece) => (
        <li key={piece.image}>
          <figure className="h-full bg-bone border border-hairline-light">
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
                  style={{ objectPosition: piece.focus }}
                />
              </picture>
            </div>
            <figcaption className="px-3 py-3 md:px-4">
              <h3 className="text-[14px] font-medium text-ink">{piece.name}</h3>
              <p className="mt-0.5 text-[12px] text-ink">{piece.spec}</p>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  )
}
