/**
 * components/layout/Footer.tsx — the solid maroon foot of every page.
 *
 * One of only three full-maroon surfaces on the site (with the
 * announcement bar and the trust band). The deepest maroon closes the
 * page the same way the announcement bar opens it, and it is the one
 * place a big block of brand colour is an asset rather than a shout.
 *
 * Four columns of real links, a newsletter row, payment methods and the
 * legal line. Link density is a store signal in itself: a two-line
 * footer with a logo and a copyright reads as a landing page no matter
 * what sits above it, because landing pages have nowhere else to send
 * you and stores always do.
 *
 * Phones collapse the columns into <details> accordions — four stacked
 * lists of six links is 24 rows of scroll before the legal line, and
 * nobody reads them. Desktop opens the same <details> elements and hides
 * their toggles, so the columns read as plain headed lists.
 *
 * ONE markup tree, not one per breakpoint. Rendering an accordion set and
 * a column set and hiding one with CSS would put every footer link in the
 * HTML twice — page weight a shopper pays for and duplicate anchors a
 * crawler has to reconcile. `open` is driven by a breakpoint read, and
 * because a closed <details> still carries its content in the DOM, the
 * full footer taxonomy is in the SSR payload either way. With JavaScript
 * off the columns stay accordions at every width, which still works.
 *
 * The Studio column replaced a "Visit" column that carried a map link
 * and an hours table. This is a marketplace, not a neighbourhood shop
 * window: city, phone and Instagram are the facts a shopper wants, and
 * the LocalBusiness JSON-LD in the head still carries the hours for
 * search engines.
 */

import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { InstagramIcon } from '~/components/ui/InstagramIcon'
import {
  FOOTER_SERVICE_LINKS,
  FOOTER_SHOP_LINKS,
  FOOTER_SUPPORT_LINKS,
  STORE,
} from '~/lib/catalog'
import { subscribeEmail } from '~/lib/forms'
import { useIsDesktop } from '~/lib/use-media-query'
import { FIELD_ON_BRAND } from '~/lib/ui'

interface LinkColumn {
  title: string
  links: ReadonlyArray<{ label: string; href: string }>
}

const COLUMNS: LinkColumn[] = [
  { title: 'Shop', links: FOOTER_SHOP_LINKS },
  { title: 'Services', links: FOOTER_SERVICE_LINKS },
  { title: 'Support', links: FOOTER_SUPPORT_LINKS },
]

export function Footer() {
  return (
    <footer className="bg-brand-deep text-cream">
      <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
        <Newsletter />

        <div className="mt-10 border-t border-cream/15 md:mt-12 md:grid md:grid-cols-4 md:gap-x-8 md:gap-y-10 md:border-t-0 md:pt-10">
          {COLUMNS.map((column) => (
            <Column key={column.title} {...column} />
          ))}
          <div className="border-b border-cream/15 py-5 md:border-b-0 md:py-0">
            <Studio />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-6 border-t border-cream/15 pt-6 md:mt-12 md:flex-row md:items-center md:justify-between">
          <PaymentMethods />

          <a
            href={STORE.instagram}
            className="inline-flex min-h-11 items-center gap-2 text-[13px] text-cream/80 transition-colors duration-hover ease-apple hover:text-cream"
          >
            <InstagramIcon size={16} />
            {STORE.instagramHandle}
          </a>
        </div>

        <div className="mt-4 flex flex-col gap-2 text-[11px] text-cream/60 md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Jewelry Aura. All rights reserved.</p>
          <p>
            {STORE.city} · Serving {STORE.region}
          </p>
        </div>
      </div>
    </footer>
  )
}

/**
 * An accordion on a phone and a headed list on a desktop, from one
 * <details>. At md up the element is forced open, the toggle glyph is
 * hidden and the summary loses its pointer affordance, so it reads as a
 * column heading rather than a control that does nothing.
 */
function Column({ title, links }: LinkColumn) {
  const open = useIsDesktop()

  return (
    <nav aria-label={title}>
      <details
        open={open}
        className="group border-b border-cream/15 md:border-b-0"
      >
        <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between text-[12px] label-wide text-cream marker:content-none md:mb-2 md:min-h-0 md:cursor-default md:text-[11px] [&::-webkit-details-marker]:hidden">
          {title}
          <span aria-hidden className="relative h-3 w-3 shrink-0 md:hidden">
            <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current" />
            <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current transition-transform duration-hover ease-apple group-open:scale-y-0 motion-reduce:transition-none" />
          </span>
        </summary>
        <ul className="pb-3 md:flex md:flex-col md:gap-2.5 md:pb-0">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="flex min-h-11 items-center text-[14px] text-cream/75 transition-colors duration-hover ease-apple hover:text-cream md:min-h-0 md:text-[13px] motion-reduce:transition-none"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </details>
    </nav>
  )
}

/** City, phone, Instagram. No map, no hours table, no icons. */
function Studio() {
  return (
    <div>
      <h2 className="mb-4 text-[11px] label-wide text-cream">Studio</h2>
      <address className="flex flex-col gap-2.5 text-[13px] not-italic text-cream/75">
        <span>{STORE.city}</span>
        <a
          href={STORE.phoneHref}
          className="text-cream transition-colors duration-hover ease-apple hover:text-cream/80"
        >
          {STORE.phone}
        </a>
        <a
          href={STORE.instagram}
          className="text-cream/75 transition-colors duration-hover ease-apple hover:text-cream"
        >
          {STORE.instagramHandle}
        </a>
      </address>
    </div>
  )
}

function Newsletter() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<{ ok: boolean; message: string } | null>(
    null,
  )
  const [pending, setPending] = useState(false)

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (pending) return
    setPending(true)
    setState(null)
    try {
      const result = await subscribeEmail({ data: { email } })
      setState(result)
      if (result.ok) setEmail('')
    } catch {
      setState({
        ok: false,
        message: `That didn’t send. Call ${STORE.phone} and we’ll add you.`,
      })
    }
    setPending(false)
  }

  return (
    <div className="grid gap-6 md:grid-cols-12 md:items-center md:gap-8">
      <div className="md:col-span-5">
        <h2 className="display text-[26px] leading-tight text-cream md:text-[30px]">
          New pieces, before they hit the case
        </h2>
        <p className="mt-2 max-w-[42ch] text-[14px] text-cream/75">
          A short email when something is finished on the bench. No more than
          twice a month.
        </p>
      </div>

      <form
        onSubmit={onSubmit}
        className="md:col-span-7 md:w-full md:max-w-[460px] md:justify-self-end"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:gap-0">
          <label className="sr-only" htmlFor="newsletter-email">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@email.com"
            autoComplete="email"
            className={FIELD_ON_BRAND}
          />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 bg-brand-hover px-6 text-[12px] label text-cream transition-colors duration-hover ease-apple hover:bg-brand disabled:opacity-70 motion-reduce:transition-none"
          >
            {pending ? 'Sending' : 'Sign up'}
            <ArrowRight aria-hidden size={14} strokeWidth={1.6} />
          </button>
        </div>
        {state && (
          <p
            role="status"
            className={`mt-2 text-[13px] ${state.ok ? 'text-cream' : 'text-cream/75'}`}
          >
            {state.message}
          </p>
        )}
      </form>
    </div>
  )
}

/**
 * Payment methods as hairline wordmarks rather than brand artwork —
 * the information a shopper needs ("my card works here") without
 * shipping six trademarked logo files.
 */
const PAYMENTS = ['Visa', 'Mastercard', 'Amex', 'Discover', 'Apple Pay', 'Shop Pay']

function PaymentMethods() {
  return (
    <ul aria-label="Accepted payment methods" className="flex flex-wrap gap-2">
      {PAYMENTS.map((method) => (
        <li
          key={method}
          className="border border-cream/25 px-2.5 py-1.5 text-[10px] label-wide text-cream/70"
        >
          {method}
        </li>
      ))}
    </ul>
  )
}
