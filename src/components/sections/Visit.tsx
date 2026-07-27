/**
 * components/sections/Visit.tsx — the local-business close.
 *
 * Condensed to roughly a third of the height the previous build gave
 * it: a two-column band with the map on one side and hours, phone and
 * service links on the other. The old version was a full-viewport
 * closing statement, which is what a brand site ends on. A store ends
 * on its footer, and Visit is the last shelf before it.
 *
 * The shop's street address is not published (see STORE in
 * lib/catalog.ts). The map is a city-level embed and the phone call is
 * the funnel — directions follow a confirmed appointment. Set
 * STORE.street and this section will show the line and point the map at
 * it without further changes.
 */

import { Clock, Phone } from 'lucide-react'
import { InstagramIcon } from '~/components/ui/InstagramIcon'
import { SectionHeader } from '~/components/commerce/SectionHeader'
import { STORE } from '~/lib/catalog'

const MAP_QUERY = encodeURIComponent(
  ['Jewelry Aura', STORE.street, STORE.city].filter(Boolean).join(', '),
)

export function Visit() {
  return (
    <section
      id="visit"
      aria-label="Visit the shop"
      className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16"
    >
      <SectionHeader
        title="Visit the shop"
        eyebrow={STORE.city}
        link={{ href: '/pages/about', label: 'About us' }}
      />

      <div className="mt-6 grid gap-3 md:mt-8 md:grid-cols-2">
        <div className="relative aspect-[16/10] overflow-hidden border border-hairline bg-raised md:aspect-auto md:min-h-[280px]">
          <iframe
            title={`Map showing Jewelry Aura in ${STORE.city}`}
            src={`https://maps.google.com/maps?q=${MAP_QUERY}&z=13&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="map-dark-filter h-full w-full border-0"
          />
        </div>

        <div className="flex flex-col justify-between gap-6 border border-hairline p-5 md:p-7">
          <div>
            <h3 className="font-display text-[22px] leading-tight tracking-tight text-cream md:text-[26px]">
              Come see it in person
            </h3>
            <p className="mt-2 max-w-[44ch] text-[14px] leading-relaxed text-cream-muted">
              Repairs, sizing and browsing need no appointment. For custom work,
              call first so we can set aside the time and have stones out to
              look at.
            </p>
          </div>

          <dl className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <Clock
                aria-hidden
                size={15}
                strokeWidth={1.5}
                className="mt-0.5 shrink-0 text-champagne"
              />
              <div>
                <dt className="sr-only">Hours</dt>
                {STORE.hours.map((entry) => (
                  <dd key={entry.days} className="text-[13px] text-cream-muted">
                    <span className="text-cream">{entry.days}</span> · {entry.time}
                  </dd>
                ))}
              </div>
            </div>

            {STORE.street && (
              <div className="flex items-start gap-3">
                <dt className="sr-only">Address</dt>
                <dd className="text-[13px] text-cream-muted">
                  {STORE.street}, {STORE.city}
                </dd>
              </div>
            )}
          </dl>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={STORE.phoneHref}
              className="inline-flex items-center gap-2 bg-brand px-6 py-3.5 text-[11px] label text-cream transition-colors duration-hover ease-apple hover:bg-brand-hover"
            >
              <Phone aria-hidden size={14} strokeWidth={1.5} />
              Call {STORE.phone}
            </a>
            <a
              href={STORE.instagram}
              className="inline-flex items-center gap-2 border border-hairline px-5 py-3.5 text-[11px] label text-cream-muted transition-colors duration-hover ease-apple hover:border-cream-subtle hover:text-cream"
            >
              <InstagramIcon size={14} />
              Instagram
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
