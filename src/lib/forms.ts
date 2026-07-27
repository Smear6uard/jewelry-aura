/**
 * lib/forms.ts — the two forms on the storefront that send something.
 *
 * Both post to a webhook URL read from the environment
 * (INQUIRY_WEBHOOK_URL / NEWSLETTER_WEBHOOK_URL — a Zapier catch hook,
 * a Make scenario, a Shopify Flow trigger, an email relay; anything
 * that accepts JSON). Until one is configured the handler says so
 * plainly and the form surfaces the phone number instead.
 *
 * A form that swallows a lead and shows a checkmark is worse than no
 * form. Neither of these returns success it did not earn.
 */

import { createServerFn } from '@tanstack/react-start'

export interface FormOutcome {
  ok: boolean
  message: string
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Trim and cap a field so a hostile client cannot post a novel. */
function clean(value: unknown, max: number): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

const UNCONFIGURED =
  'Email isn’t connected to this form yet. Call 630-965-6464 and we’ll take it from there.'

const FAILED =
  'That didn’t send. Call 630-965-6464 or message us on Instagram and we’ll pick it up.'

async function post(url: string | undefined, payload: unknown): Promise<FormOutcome> {
  if (!url) {
    console.warn('[forms] no webhook configured; payload not delivered')
    return { ok: false, message: UNCONFIGURED }
  }
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!response.ok) {
      console.warn(`[forms] webhook responded ${response.status}`)
      return { ok: false, message: FAILED }
    }
    return { ok: true, message: '' }
  } catch (error) {
    console.warn(`[forms] webhook threw: ${String(error)}`)
    return { ok: false, message: FAILED }
  }
}

export interface InquiryInput {
  name: string
  email: string
  phone: string
  /** What they want made. */
  project: string
  budget: string
  message: string
}

export const submitInquiry = createServerFn({ method: 'POST' })
  .inputValidator((input: InquiryInput) => ({
    name: clean(input?.name, 80),
    email: clean(input?.email, 120),
    phone: clean(input?.phone, 40),
    project: clean(input?.project, 60),
    budget: clean(input?.budget, 40),
    message: clean(input?.message, 2000),
  }))
  .handler(async ({ data }): Promise<FormOutcome> => {
    if (data.name.length < 2) {
      return { ok: false, message: 'Add your name so we know who to call.' }
    }
    if (!EMAIL_PATTERN.test(data.email) && data.phone.length < 7) {
      return {
        ok: false,
        message: 'Add an email or a phone number so we can reply.',
      }
    }
    if (data.message.length < 10) {
      return {
        ok: false,
        message: 'Tell us a little more about the piece — even one sentence.',
      }
    }

    const result = await post(process.env.INQUIRY_WEBHOOK_URL, {
      type: 'custom-inquiry',
      ...data,
    })
    return result.ok
      ? {
          ok: true,
          message: 'Got it. We’ll be in touch within one business day.',
        }
      : result
  })

export const subscribeEmail = createServerFn({ method: 'POST' })
  .inputValidator((input: { email: string }) => ({
    email: clean(input?.email, 120),
  }))
  .handler(async ({ data }): Promise<FormOutcome> => {
    if (!EMAIL_PATTERN.test(data.email)) {
      return { ok: false, message: 'That email address doesn’t look right.' }
    }

    const result = await post(process.env.NEWSLETTER_WEBHOOK_URL, {
      type: 'newsletter',
      email: data.email,
    })
    return result.ok
      ? { ok: true, message: 'You’re on the list.' }
      : result
  })
