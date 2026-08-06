/**
 * components/sections/CustomPromo.tsx — the custom-work promo band.
 *
 * This replaces a pinned horizontal piece gallery that ran for two
 * viewports of scroll on desktop, driven by a Lenis-coupled motionValue
 * and a scroll-progress bar. That was a brand-site pattern dropped into
 * a storefront: it interrupted shopping to make the visitor watch
 * something, and 200svh of it sat between two product shelves. The pin
 * logic, the progress wiring and the numbered piece cards are gone.
 *
 * What is left is a promotional module: one image, one headline, one
 * line, one button. Phones stack image over copy; desktop splits the
 * band down the middle with the copy on the sunken surface. The full
 * commission portfolio lives at /custom, which is where the button goes
 * and where a visitor who wants a portfolio has asked for one.
 */

import { BTN_PRIMARY } from '~/lib/ui'
import { Reveal } from '~/components/motion/Reveal'

const IMAGE = '/JA-image4'
const IMAGE_ALT =
  'A custom ATDB block pendant in two-tone gold with an engraved tagline and hand-set diamonds, photographed on dark velvet.'

export function CustomPromo() {
  return (
    <section
      aria-label="Custom work"
      className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16"
    >
      <Reveal>
        <div className="grid overflow-hidden border border-hairline-light md:grid-cols-2">
          {/* 4:3 on phones, a full half-band on desktop. Locked ratio on
              both so nothing reflows as the photograph decodes. */}
          <div className="aspect-[4/3] w-full overflow-hidden bg-bone md:aspect-auto md:h-full md:min-h-[380px]">
            <picture>
              <source type="image/avif" srcSet={`${IMAGE}.avif`} />
              <source type="image/webp" srcSet={`${IMAGE}.webp`} />
              <img
                src={`${IMAGE}.jpg`}
                alt={IMAGE_ALT}
                width={1122}
                height={1402}
                loading="lazy"
                decoding="async"
                sizes="(min-width: 768px) 50vw, 100vw"
                className="h-full w-full object-cover"
                style={{ objectPosition: '52% 42%' }}
              />
            </picture>
          </div>

          <div className="flex flex-col justify-center bg-bone px-5 py-8 md:px-10 md:py-12">
            <p className="text-[11px] label-wide text-ink">Custom work</p>
            <h2 className="display mt-2 text-[28px] leading-tight text-ink md:text-[36px]">
              One of one
            </h2>
            <p className="mt-3 max-w-[44ch] text-[15px] leading-relaxed text-ink">
              Bring a sketch, a reference or a name. We design it with you, quote
              it firmly, and set it by hand — most commissions take three to five
              weeks.
            </p>
            <a
              href="/custom"
              className={`${BTN_PRIMARY} mt-6 w-full md:w-fit md:px-8`}
            >
              Start a custom piece
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  )
}
