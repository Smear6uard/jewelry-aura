/**
 * components/sections/WomensShelf.tsx — the women's floor, on the
 * homepage.
 *
 * Five doors and one photograph. The doors are deliberately not five
 * photographs: the category tiles above this section are photo tiles
 * because a photo tile is a promise about what is behind it, and the
 * women's cases have no photography of their own yet. Borrowing the men's
 * chain shot for "Women's chains" would be the exact broken promise the
 * tile rules exist to prevent.
 *
 * So the doors read as an index — one bone panel divided by hairlines —
 * and the photograph sits beside them as a single vitrine rather than
 * five. It is one piece from this floor, given the same treatment every
 * other photograph on the site gets: edge to edge inside a hairline
 * frame, no filter, no scrim, unmasking out of its own frame on the way
 * in. A bare link list beside a section header was the one place on this
 * page where a shopper was asked to imagine the merchandise.
 *
 * Reading as an index rather than a grid also keeps the doors distinct
 * from the tiles above them — two link sections on one page have to look
 * like two different kinds of thing, or the page reads as a template
 * repeating itself.
 *
 * THE PHOTOGRAPH IS A SLOT. `womens-piece.{avif,webp,jpg}`. Replacing
 * those three files replaces the vitrine; the alt text describes the
 * piece, so a new photograph means a new PIECE_ALT too.
 */

import { ArrowRight } from 'lucide-react'
import { SectionHeader } from '~/components/commerce/SectionHeader'
import { Reveal } from '~/components/motion/Reveal'
import { Unmask } from '~/components/motion/Unmask'
import { WOMENS } from '~/lib/catalog'

const PIECE = '/womens-piece'
const PIECE_ALT =
  'A gold rope chain and pavé butterfly pendant worn over a white tee.'

export function WomensShelf() {
  return (
    <section
      aria-label="Women’s"
      className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16"
    >
      <SectionHeader
        title={WOMENS.label}
        eyebrow="For her"
        link={{ href: WOMENS.href, label: 'All women’s' }}
      />

      <div className="mt-5 grid gap-4 md:mt-6 md:grid-cols-12 md:gap-6">
        <Unmask className="aspect-[4/5] w-full border border-hairline-light bg-bone md:col-span-5 md:aspect-[4/5]">
          <picture className="block h-full w-full">
            <source type="image/avif" srcSet={`${PIECE}.avif`} />
            <source type="image/webp" srcSet={`${PIECE}.webp`} />
            <img
              src={`${PIECE}.jpg`}
              alt={PIECE_ALT}
              width={1086}
              height={1448}
              loading="lazy"
              decoding="async"
              sizes="(min-width: 768px) 40vw, 100vw"
              className="h-full w-full object-cover"
              style={{ objectPosition: '50% 42%' }}
            />
          </picture>
        </Unmask>

        <Reveal className="md:col-span-7 md:flex md:flex-col md:justify-center">
          <p className="max-w-[52ch] text-[15px] leading-relaxed text-ink">
            {WOMENS.blurb}
          </p>

          <ul className="mt-5 grid overflow-hidden border border-hairline-light bg-bone md:mt-6">
            {WOMENS.links.map((link, index) => (
              <li
                key={link.href}
                className={index > 0 ? 'border-t border-hairline-light' : ''}
              >
                <a
                  href={link.href}
                  className="group/door flex min-h-[56px] items-center justify-between gap-3 px-5 py-4 transition-colors duration-hover ease-apple hover:bg-paper md:min-h-[60px] md:px-6 motion-reduce:transition-none"
                >
                  <span className="display text-[19px] leading-none text-ink md:text-[22px]">
                    {link.label}
                  </span>
                  <ArrowRight
                    aria-hidden
                    size={16}
                    strokeWidth={1.6}
                    className="shrink-0 text-ink transition-transform duration-hover ease-apple group-hover/door:translate-x-0.5 motion-reduce:transition-none"
                  />
                </a>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}
