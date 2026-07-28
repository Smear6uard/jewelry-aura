/**
 * components/sections/WomensShelf.tsx — the women's floor, on the
 * homepage.
 *
 * Five doors, and deliberately not five photographs. The category tiles
 * above this section are photo tiles because a photo tile is a promise
 * about what is behind it — and the women's cases have no photographs
 * yet. Borrowing the men's chain shot for "Women's chains" would be the
 * exact broken promise the tile rules exist to prevent.
 *
 * So this is a directory, not a gallery: one white panel on the cream
 * canvas, divided by hairlines into five doors. Reading as an index
 * rather than a grid also keeps it distinct from the tiles above and the
 * price bands below — three link sections on one page have to look like
 * three different kinds of thing, or the page reads as a template
 * repeating itself.
 *
 * The names are set in the display serif, which is the one flourish
 * here. Everything else is a hairline and a maroon arrow.
 */

import { ArrowRight } from 'lucide-react'
import { SectionHeader } from '~/components/commerce/SectionHeader'
import { Reveal } from '~/components/motion/Reveal'
import { WOMENS } from '~/lib/catalog'

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

      <Reveal>
        <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-ink-muted md:mt-6">
          {WOMENS.blurb}
        </p>

        <ul className="mt-5 grid overflow-hidden bg-raised shadow-sm md:mt-6 md:grid-cols-5">
          {WOMENS.links.map((link, index) => (
            <li
              key={link.href}
              className={
                index > 0 ? 'border-t border-hairline md:border-l md:border-t-0' : ''
              }
            >
              <a
                href={link.href}
                className="group/door flex min-h-[56px] items-center justify-between gap-3 px-5 py-4 transition-colors duration-hover ease-apple hover:bg-sunken md:min-h-[132px] md:flex-col md:items-start md:justify-between md:px-6 md:py-7 motion-reduce:transition-none"
              >
                <span className="display text-[19px] leading-none text-ink md:text-[22px]">
                  {link.label}
                </span>
                <ArrowRight
                  aria-hidden
                  size={16}
                  strokeWidth={1.6}
                  className="shrink-0 text-brand transition-transform duration-hover ease-apple group-hover/door:translate-x-0.5 motion-reduce:transition-none"
                />
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}
