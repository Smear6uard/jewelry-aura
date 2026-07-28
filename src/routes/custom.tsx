/**
 * routes/custom.tsx — the commission page.
 *
 * The workshop's differentiator gets its own surface: how the process
 * runs, the gallery of finished commissions, and a real inquiry form
 * next to the phone number.
 *
 * The form posts to a server function that forwards to
 * INQUIRY_WEBHOOK_URL. Until that variable is set the handler says so
 * and the page's phone CTA is the path — see lib/forms.ts. A form that
 * shows a checkmark and drops the lead is the failure mode worth
 * engineering against.
 */

import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { Phone } from 'lucide-react'

import { CommissionGrid } from '~/components/sections/CommissionGrid'
import { SectionHeader } from '~/components/commerce/SectionHeader'
import { STORE } from '~/lib/catalog'
import { useSmoothScrollTo } from '~/lib/scroll-to'
import { submitInquiry, type FormOutcome } from '~/lib/forms'
import { BTN_PRIMARY, BTN_PRIMARY_BLOCK, BTN_SECONDARY, FIELD } from '~/lib/ui'
import {
  HERO_SOCIAL_IMAGE,
  SITE_URL,
  breadcrumbJsonLd,
  jsonLdScript,
  pageMeta,
} from '~/lib/seo'

const TITLE = 'Custom Jewelry & Commissions | Jewelry Aura'
const DESCRIPTION =
  'Commission a one-of-one piece from the Jewelry Aura bench — name plates, pendants, chains and bridal, designed with you and set by hand in Norridge, IL.'

const STEPS = [
  {
    n: '01',
    title: 'Tell us the idea',
    body: 'A sketch, a photo, a name, or just a budget and a direction. Call or send the form — either reaches the same bench.',
  },
  {
    n: '02',
    title: 'We design and quote',
    body: 'You see renderings and stone options with a firm price and a date. Nothing is cut until you approve the specification.',
  },
  {
    n: '03',
    title: 'It gets made',
    body: 'Cast, set and finished in the workshop, usually three to five weeks. We send progress photos at the setting stage.',
  },
  {
    n: '04',
    title: 'Fitted and warrantied',
    body: 'Pick it up or have it shipped insured. Sizing, cleaning and the lifetime warranty start the day it is yours.',
  },
]

const PROJECT_TYPES = [
  'Pendant or name plate',
  'Chain',
  'Ring or bridal',
  'Bracelet',
  'Repair or restoration',
  'Something else',
]

const BUDGETS = ['Under $500', '$500 – $1,500', '$1,500 – $5,000', '$5,000+', 'Not sure yet']

export const Route = createFileRoute('/custom')({
  component: CustomPage,
  headers: () => ({
    'Cache-Control':
      'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
  }),
  head: () => ({
    meta: pageMeta({
      title: TITLE,
      description: DESCRIPTION,
      url: `${SITE_URL}/custom`,
      image: HERO_SOCIAL_IMAGE,
      imageAlt: 'A custom pendant from the Jewelry Aura workshop.',
    }),
    links: [{ rel: 'canonical', href: `${SITE_URL}/custom` }],
    scripts: [
      {
        type: 'application/ld+json',
        children: jsonLdScript(
          breadcrumbJsonLd([
            { name: 'Home', path: '/' },
            { name: 'Custom work', path: '/custom' },
          ]),
        ),
      },
    ],
  }),
})

function CustomPage() {
  // Real anchor, smooth-scrolled through the same Lenis instance the
  // rest of the page reads from. Without JS it still jumps to the form.
  const toInquiry = useSmoothScrollTo('inquiry')

  return (
    <main>
      <section className="mx-auto max-w-[1440px] px-4 pb-4 pt-10 md:px-8 md:pt-14">
        <p className="text-[11px] label-wide text-brand">One of one</p>
        <h1 className="display mt-3 max-w-[18ch] text-[32px] leading-[1.05] text-ink md:text-[48px]">
          Commission a piece nobody else owns
        </h1>
        <p className="mt-4 max-w-[58ch] text-[16px] leading-relaxed text-ink-muted">
          Bring a sketch, a reference or a name. We design it with you, quote it
          firmly, and set it by hand at our bench in {STORE.city}. Most
          commissions take three to five weeks.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a href="#inquiry" onClick={toInquiry} className={BTN_PRIMARY}>
            Start an inquiry
          </a>
          <a href={STORE.phoneHref} className={BTN_SECONDARY}>
            <Phone aria-hidden size={15} strokeWidth={1.6} />
            Call {STORE.phone}
          </a>
        </div>
      </section>

      {/* The commission portfolio. A plain grid: the homepage's pinned,
          scroll-driven version of this was deleted, and a visitor who has
          navigated to /custom has already asked to see the work. */}
      <section className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
        <SectionHeader title="Finished commissions" eyebrow="From the bench" />
        <div className="mt-6 md:mt-8">
          <CommissionGrid />
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16">
        <SectionHeader title="How a commission runs" eyebrow="The process" />
        <ol className="mt-6 grid gap-x-6 gap-y-8 md:mt-8 md:grid-cols-4">
          {STEPS.map((step) => (
            <li key={step.n} className="border-t border-hairline pt-4">
              {/* Numbered because these genuinely happen in order — the
                  quote precedes the build, the build precedes the fit. */}
              <span className="text-[11px] label-wide text-brand">
                {step.n}
              </span>
              <h3 className="mt-2 text-[16px] font-medium text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <InquiryForm />
    </main>
  )
}

function InquiryForm() {
  const [outcome, setOutcome] = useState<FormOutcome | null>(null)
  const [pending, setPending] = useState(false)

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (pending) return
    setPending(true)
    setOutcome(null)

    const form = new FormData(event.currentTarget)
    try {
      const result = await submitInquiry({
        data: {
          name: String(form.get('name') ?? ''),
          email: String(form.get('email') ?? ''),
          phone: String(form.get('phone') ?? ''),
          project: String(form.get('project') ?? ''),
          budget: String(form.get('budget') ?? ''),
          message: String(form.get('message') ?? ''),
        },
      })
      setOutcome(result)
      if (result.ok) event.currentTarget.reset()
    } catch {
      setOutcome({
        ok: false,
        message: `That didn’t send. Call ${STORE.phone} and we’ll take it down over the phone.`,
      })
    }
    setPending(false)
  }

  return (
    <section
      id="inquiry"
      className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16"
    >
      <SectionHeader title="Start a custom piece" eyebrow="Inquiry" />

      <div className="mt-6 grid gap-8 md:mt-8 md:grid-cols-12 md:gap-10">
        <form onSubmit={onSubmit} className="md:col-span-7">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Your name" name="name" required autoComplete="name" />
            <Field
              label="Email"
              name="email"
              type="email"
              autoComplete="email"
            />
            <Field label="Phone" name="phone" type="tel" autoComplete="tel" />
            <Select label="What are you after?" name="project" options={PROJECT_TYPES} />
            <div className="sm:col-span-2">
              <Select label="Budget" name="budget" options={BUDGETS} />
            </div>
            <div className="sm:col-span-2">
              <label
                htmlFor="inquiry-message"
                className="block text-[11px] label text-ink-muted"
              >
                Tell us about the piece
              </label>
              <textarea
                id="inquiry-message"
                name="message"
                rows={5}
                required
                placeholder="Metal, stones, a name or initials, a reference you have seen — whatever you know so far."
                className={`mt-2 ${FIELD}`}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={pending}
            className={`${BTN_PRIMARY_BLOCK} mt-5 sm:w-fit sm:px-8`}
          >
            {pending ? 'Sending…' : 'Send inquiry'}
          </button>

          {outcome && (
            <p
              role="status"
              className={`mt-3 max-w-[52ch] text-[14px] ${
                outcome.ok ? 'font-medium text-brand' : 'text-ink-muted'
              }`}
            >
              {outcome.message}
            </p>
          )}

          <p className="mt-4 max-w-[52ch] text-[13px] text-ink-muted">
            We use what you send here to quote your piece and nothing else.
          </p>
        </form>

        <aside className="md:col-span-5">
          <div className="bg-raised p-5 shadow-sm md:p-6">
            <h3 className="display text-[22px] leading-tight text-ink">
              Rather just talk?
            </h3>
            <p className="mt-2 text-[15px] leading-relaxed text-ink-muted">
              Most commissions start with a five-minute phone call. You will
              reach the person who does the work, not a queue.
            </p>
            <a
              href={STORE.phoneHref}
              className={`${BTN_PRIMARY_BLOCK} mt-5`}
            >
              <Phone aria-hidden size={15} strokeWidth={1.6} />
              Call {STORE.phone}
            </a>

            <dl className="mt-6 border-t border-hairline pt-4">
              {STORE.hours.map((entry) => (
                <div key={entry.days} className="flex justify-between gap-4 py-1">
                  <dt className="text-[14px] text-ink-muted">{entry.days}</dt>
                  <dd className="text-[14px] text-ink">{entry.time}</dd>
                </div>
              ))}
            </dl>

            <a
              href={STORE.instagram}
              className="mt-4 inline-flex min-h-11 items-center text-[14px] text-brand underline decoration-brand/40 underline-offset-4 transition-colors duration-hover ease-apple hover:text-brand-hover motion-reduce:transition-none"
            >
              See finished work on Instagram
            </a>
          </div>
        </aside>
      </div>
    </section>
  )
}

function Field({
  label,
  name,
  type = 'text',
  required = false,
  autoComplete,
}: {
  label: string
  name: string
  type?: string
  required?: boolean
  autoComplete?: string
}) {
  return (
    <div>
      <label
        htmlFor={`inquiry-${name}`}
        className="block text-[11px] label text-ink-muted"
      >
        {label}
      </label>
      <input
        id={`inquiry-${name}`}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className={`mt-2 ${FIELD}`}
      />
    </div>
  )
}

function Select({
  label,
  name,
  options,
}: {
  label: string
  name: string
  options: string[]
}) {
  return (
    <div>
      <label
        htmlFor={`inquiry-${name}`}
        className="block text-[11px] label text-ink-muted"
      >
        {label}
      </label>
      <select
        id={`inquiry-${name}`}
        name={name}
        defaultValue=""
        className={`mt-2 cursor-pointer appearance-none ${FIELD}`}
      >
        <option value="">Choose one</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}
