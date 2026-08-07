/**
 * components/sections/TheBench.tsx — the four promises, stamped.
 *
 * The last thing before the footer, and the third of the page's hallmark
 * scenes: the featured exhibit sets the stamp at wall scale, each
 * commission carries it at the size it is on the metal, and here it is
 * applied to the business rather than to a piece. One mono line, ruled by
 * gold hairlines, along the bottom of a full-bleed photograph.
 *
 * The four claims used to be a velvet strip of four link cells directly
 * under the shelf — correct, and completely unread, because a row of
 * uppercase promises with rules between them is the most template-shaped
 * object on the internet. They are the same four claims and the same four
 * links; what changed is that they now sit on a photograph of the work,
 * which is the only argument that makes a warranty worth reading.
 *
 * A slim version of the rail stays higher up the page, where a shopper
 * who has just met the shelf wants the terms before they scroll. See
 * sections/TrustBar.
 *
 * THE PHOTOGRAPH IS A SLOT. `bench-band.{avif,webp,jpg}` — a wide crop
 * of the campaign frame today, and the moment the workshop photographs
 * the bench itself, replacing those three files replaces this scene.
 */

import { FREE_SHIPPING_THRESHOLD } from '~/lib/catalog'
import { Reveal } from '~/components/motion/Reveal'

const PHOTO = '/bench-band'
const PHOTO_ALT =
  'A heavy gold rope chain worn open-collar against a deep red curtain, lit from the side.'

/**
 * The same four promises the trust rail carries and every policy page
 * states. If this line and the page it links to ever disagree, the line
 * is marketing rather than information.
 */
const PROMISES = [
  { label: `Insured shipping over $${FREE_SHIPPING_THRESHOLD}`, href: '/pages/shipping' },
  { label: 'Lifetime warranty', href: '/pages/warranty' },
  { label: '30-day returns', href: '/pages/returns' },
  { label: 'Hand-set to order', href: '/pages/about' },
]

export function TheBench() {
  return (
    <section
      aria-label="How we work"
      data-ground="velvet"
      className="bench bg-velvet"
    >
      <picture className="absolute inset-0 block h-full w-full">
        <source type="image/avif" srcSet={`${PHOTO}.avif`} />
        <source type="image/webp" srcSet={`${PHOTO}.webp`} />
        <img
          src={`${PHOTO}.jpg`}
          alt={PHOTO_ALT}
          width={1672}
          height={717}
          loading="lazy"
          decoding="async"
          sizes="100vw"
          className="h-full w-full object-cover"
          style={{ objectPosition: '58% 50%' }}
        />
      </picture>

      <div aria-hidden className="bench-scrim" />

      <Reveal className="absolute inset-x-0 bottom-0">
        <ul className="mx-auto grid max-w-[1440px] grid-cols-2 gap-x-6 gap-y-1 px-4 pb-7 md:flex md:items-center md:gap-0 md:px-8 md:pb-9">
          {PROMISES.map((promise, index) => (
            <li
              key={promise.href}
              className={
                // Gold hairlines rule the line, which is the one job gold
                // has that is not type. No maroon in this component for
                // it to sit beside.
                index > 0
                  ? 'md:border-l md:border-gold md:pl-5 xl:pl-7'
                  : ''
              }
            >
              <a
                href={promise.href}
                className="spec flex min-h-11 items-center text-[10px] uppercase tracking-[0.12em] text-bone transition-colors duration-hover ease-apple hover:text-gold md:pr-5 md:text-[11px] xl:pr-7 motion-reduce:transition-none"
              >
                {promise.label}
              </a>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}
