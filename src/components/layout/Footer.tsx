/**
 * components/layout/Footer.tsx — the sunken foot of every page.
 *
 * Four columns of real links, a newsletter row, payment methods and the
 * legal line. Link density is a store signal in itself: a two-line
 * footer with a logo and a copyright reads as a landing page no matter
 * what sits above it, because landing pages have nowhere else to send
 * you and stores always do.
 */

import { useState } from 'react'
import { ArrowRight, Phone } from 'lucide-react'
import { InstagramIcon } from '~/components/ui/InstagramIcon'
import {
  FOOTER_SERVICE_LINKS,
  FOOTER_SHOP_LINKS,
  FOOTER_SUPPORT_LINKS,
  STORE,
} from '~/lib/catalog'
import { subscribeEmail } from '~/lib/forms'

export function Footer() {
  return (
    <footer className="border-t border-hairline bg-sunken">
      <div className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
        <Newsletter />

        <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-hairline pt-10 md:grid-cols-4 md:gap-x-8">
          <Column title="Shop" links={FOOTER_SHOP_LINKS} />
          <Column title="Services" links={FOOTER_SERVICE_LINKS} />
          <Column title="Support" links={FOOTER_SUPPORT_LINKS} />
          <Visit />
        </div>

        <div className="mt-12 flex flex-col gap-6 border-t border-hairline pt-6 md:flex-row md:items-center md:justify-between">
          <PaymentMethods />

          <div className="flex items-center gap-5">
            <a
              href={STORE.instagram}
              className="inline-flex items-center gap-2 text-[12px] text-cream-muted transition-colors duration-hover ease-apple hover:text-cream"
            >
              <InstagramIcon size={15} />
              {STORE.instagramHandle}
            </a>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 text-[11px] text-cream-subtle md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} Jewelry Aura. All rights reserved.</p>
          <p>
            {STORE.city} · Serving {STORE.region}
          </p>
        </div>
      </div>
    </footer>
  )
}

function Column({
  title,
  links,
}: {
  title: string
  links: ReadonlyArray<{ label: string; href: string }>
}) {
  return (
    <nav aria-label={title}>
      <h2 className="mb-4 text-[11px] label-wide text-cream">{title}</h2>
      <ul className="flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.href}>
            <a
              href={link.href}
              className="text-[13px] text-cream-muted transition-colors duration-hover ease-apple hover:text-cream"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function Visit() {
  return (
    <div>
      <h2 className="mb-4 text-[11px] label-wide text-cream">Visit</h2>
      <address className="flex flex-col gap-2.5 text-[13px] not-italic text-cream-muted">
        <span>
          {STORE.street && (
            <>
              {STORE.street}
              <br />
            </>
          )}
          {STORE.city}
        </span>
        {STORE.hours.map((entry) => (
          <span key={entry.days}>
            {entry.days} · {entry.time}
          </span>
        ))}
        <a
          href={STORE.phoneHref}
          className="inline-flex items-center gap-2 text-cream transition-colors duration-hover ease-apple hover:text-champagne"
        >
          <Phone aria-hidden size={14} strokeWidth={1.5} />
          {STORE.phone}
        </a>
        <a
          href={`https://maps.google.com/?q=${encodeURIComponent(
            ['Jewelry Aura', STORE.street, STORE.city].filter(Boolean).join(', '),
          )}`}
          className="text-champagne underline decoration-champagne/40 underline-offset-4 transition-colors duration-hover ease-apple hover:text-cream"
        >
          Get directions
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
        <h2 className="font-display text-[24px] leading-tight tracking-tight text-cream md:text-[28px]">
          New pieces, before they hit the case
        </h2>
        <p className="mt-2 max-w-[42ch] text-[13px] text-cream-muted">
          A short email when something is finished on the bench. No more than
          twice a month.
        </p>
      </div>

      <form onSubmit={onSubmit} className="md:col-span-7 md:justify-self-end md:w-full md:max-w-[460px]">
        <div className="flex">
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
            className="w-full border border-hairline border-r-0 bg-transparent px-4 py-3 text-[14px] text-cream placeholder:text-cream-subtle focus:border-cream-subtle focus:outline-none"
          />
          <button
            type="submit"
            disabled={pending}
            className="inline-flex shrink-0 items-center gap-2 bg-brand px-5 py-3 text-[11px] label text-cream transition-colors duration-hover ease-apple hover:bg-brand-hover disabled:opacity-70"
          >
            {pending ? 'Sending' : 'Sign up'}
            <ArrowRight aria-hidden size={13} strokeWidth={1.5} />
          </button>
        </div>
        {state && (
          <p
            role="status"
            className={`mt-2 text-[12px] ${state.ok ? 'text-champagne' : 'text-cream-muted'}`}
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
          className="border border-hairline px-2.5 py-1.5 text-[10px] label-wide text-cream-subtle"
        >
          {method}
        </li>
      ))}
    </ul>
  )
}
