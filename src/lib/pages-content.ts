/**
 * lib/pages-content.ts — copy for the static /pages/:handle routes.
 *
 * Shipping, returns, warranty, sizing, FAQ, about, and the three
 * service pages the footer and nav link to. Content lives here as typed
 * data rather than in the route so the route stays a renderer and a new
 * page is one entry, not one file.
 *
 * The policy terms stated here (free shipping over $150, 30-day
 * returns, lifetime warranty) are the ones quoted in the announcement
 * bar and trust band. Change them in one place and change them in
 * both — they are the store's promise, and a mismatch between the band
 * and the policy page is the kind of thing customers screenshot.
 */

import { FREE_SHIPPING_THRESHOLD, STORE } from './catalog'

export interface ContentBlock {
  heading?: string
  /** Paragraphs, rendered in order. */
  body?: string[]
  /** Bulleted items, rendered after the paragraphs. */
  list?: string[]
}

export interface ContentPage {
  handle: string
  title: string
  /** One-line summary under the title; also the meta description. */
  summary: string
  blocks: ContentBlock[]
}

const PAGES: ContentPage[] = [
  {
    handle: 'shipping',
    title: 'Shipping',
    summary: `Free insured shipping on U.S. orders over $${FREE_SHIPPING_THRESHOLD}. Most in-stock pieces leave the bench within two business days.`,
    blocks: [
      {
        heading: 'Rates and timing',
        body: [
          `Orders over $${FREE_SHIPPING_THRESHOLD} ship free anywhere in the United States. Below that, shipping is calculated at checkout by weight and destination.`,
          'In-stock pieces ship within two business days. Made-to-order and custom work ships when it is finished — we give you a date before any work starts, and we call you if that date moves.',
        ],
      },
      {
        heading: 'Insurance and signature',
        body: [
          'Every shipment is insured for its full value and requires a signature on delivery. We cannot release a package to a location without one — it protects you more than it inconveniences you.',
        ],
      },
      {
        heading: 'Local pickup',
        body: [
          `Pickup at the shop is free. Choose it at checkout and we hold the piece at our ${STORE.city} counter — we send the exact address and a pickup window when it is ready. Bring the order confirmation and a photo ID.`,
        ],
      },
    ],
  },
  {
    handle: 'returns',
    title: 'Returns',
    summary:
      '30 days to return an unworn stock piece for a refund. Custom work is made to your specification and is final sale.',
    blocks: [
      {
        heading: 'Stock pieces',
        body: [
          'Return any unworn stock piece within 30 days of delivery for a full refund to the original payment method. The piece must come back in its original condition with all packaging and any certificates it shipped with.',
          `Start a return by calling ${STORE.phone}. We send a prepaid insured label — do not ship jewelry uninsured.`,
        ],
      },
      {
        heading: 'Custom and made-to-order work',
        body: [
          'A custom piece is built to a specification you approve before we cut metal, so it cannot be resold and is final sale. That is also why we take the approval step seriously: you see renderings and stone selections, and nothing goes to the bench until you sign off.',
          'If a finished custom piece does not match the approved specification, that is our error and we make it right at no cost.',
        ],
      },
      {
        heading: 'Sizing',
        body: [
          'First resize on a ring or chain purchased here is free within 60 days, whether or not you are returning anything else.',
        ],
      },
    ],
  },
  {
    handle: 'warranty',
    title: 'Lifetime warranty',
    summary:
      'Every piece we make is covered against manufacturing and setting defects for as long as you own it.',
    blocks: [
      {
        heading: 'What is covered',
        body: [
          'For the life of your ownership, we repair any failure in our workmanship at no charge.',
        ],
        list: [
          'Stones lost from a setting we made',
          'Clasps, jump rings and solder joints that fail in normal wear',
          'Prongs, bezels and channels that loosen',
          'Plating and finish defects within the first year',
        ],
      },
      {
        heading: 'What is not covered',
        body: [
          'Damage from impact, chemicals, or wear beyond what a piece is designed for — a chain caught in a car door, a ring worn at the gym, a stone chipped on concrete. We still repair all of it, at a quoted price, usually cheaper than you expect.',
        ],
      },
      {
        heading: 'Free maintenance',
        body: [
          'Bring anything you bought from us in for cleaning, polishing and a prong check any time. There is no charge and no appointment needed.',
        ],
      },
    ],
  },
  {
    handle: 'sizing',
    title: 'Sizing guide',
    summary:
      'How to measure for a chain, a bracelet and a ring before you order — and what to do if you get it wrong.',
    blocks: [
      {
        heading: 'Chains',
        body: [
          'Chain length is measured end to end including the clasp. If you are unsure, measure a chain you already wear and match it.',
        ],
        list: [
          '18" — sits at the collarbone',
          '20" — just below the collarbone, the most common men’s length',
          '22" — mid-chest, the standard length for a pendant',
          '24" — below a crew neckline',
          '26"–30" — over a shirt, pairs with a larger plate',
        ],
      },
      {
        heading: 'Bracelets',
        body: [
          'Measure your wrist snugly with a tape, then add half an inch for a fitted feel or a full inch for a relaxed drape. A heavier Cuban link wants the extra half inch — weight pulls it down.',
        ],
      },
      {
        heading: 'Rings',
        body: [
          'The most reliable method is having a ring you already wear measured on a mandrel. We will do it free, in about a minute, no appointment.',
          'If you are measuring at home, wrap a strip of paper around the base of the finger, mark where it overlaps, and measure the length in millimetres — that is the circumference. Measure at the end of the day when fingers are largest, and check that it clears the knuckle.',
        ],
      },
      {
        heading: 'If it does not fit',
        body: [
          'First resize on anything bought here is free within 60 days.',
        ],
      },
    ],
  },
  {
    handle: 'faq',
    title: 'Questions',
    summary:
      'Moissanite versus natural stone, custom timelines, repairs, and how the shop actually works.',
    blocks: [
      {
        heading: 'How long does a custom piece take?',
        body: [
          'Three to five weeks for most pendants and rings, depending on stone sourcing. We give you a date before any work starts and call you if it moves.',
        ],
      },
      {
        heading: 'Is moissanite worth it?',
        body: [
          'It depends what you want from the stone. Moissanite is harder to scratch than almost anything except diamond, throws more colour in direct light, and costs a fraction as much — so it buys size. A natural diamond holds resale value that moissanite does not. We will tell you which one fits what you are trying to do, including when the answer is the cheaper one.',
        ],
      },
      {
        heading: 'Do you repair pieces I did not buy here?',
        body: [
          'Yes, and it is a large part of what the bench does. Broken clasps, retipped prongs, lost stones, cracked shanks, restringing, watch movements. Bring it in for a free quote.',
        ],
      },
      {
        heading: 'Do I need an appointment?',
        body: [
          `Not for repairs, sizing or browsing. For a custom consultation, call ${STORE.phone} first so we can set aside the time and have stones ready to look at.`,
        ],
      },
      {
        heading: 'Is the gold real?',
        body: [
          'Every gold piece we sell is solid karat gold, stamped, never plated over base metal. If a piece is gold-filled or plated it says so in the title and the description.',
        ],
      },
    ],
  },
  {
    handle: 'about',
    title: 'About the shop',
    summary: `A working jewelry bench in ${STORE.city}, serving ${STORE.region}.`,
    blocks: [
      {
        body: [
          'Jewelry Aura is a bench, a case and a small team. We design and set custom pieces, sell gold and stones we would wear ourselves, and repair whatever comes through the door — including work nobody else wants to take on.',
          'Almost everything you see on this site was made a few feet from where it is photographed. When you call, you are talking to the person who will do the work.',
        ],
      },
      {
        heading: 'Where we are',
        body: [
          `We are based in ${STORE.city} and serve ${STORE.region}. Visits are by appointment — call ${STORE.phone} and we will confirm a time and send directions.`,
        ],
      },
    ],
  },
  {
    handle: 'orders',
    title: 'Orders and account',
    summary:
      'Track an order, change one, or get a copy of a receipt — all by phone or from your confirmation email.',
    blocks: [
      {
        heading: 'Tracking an order',
        body: [
          'Your order confirmation email carries a tracking link that updates as the shipment moves. Shipping confirmations go out the moment a label is created, not when the package is scanned, so give it a day before worrying about a quiet tracking page.',
        ],
      },
      {
        heading: 'Changing or cancelling',
        body: [
          `Call ${STORE.phone}. If a stock piece has not shipped we can change or cancel it on the spot. Custom work can change right up until the approved specification goes to the bench.`,
        ],
      },
      {
        heading: 'Receipts and appraisals',
        body: [
          'We can re-send any receipt, and prepare a written appraisal for anything bought here. Both usually take a few minutes over the phone.',
        ],
      },
    ],
  },
  {
    handle: 'repair',
    title: 'Jewelry repair',
    summary:
      'Free quotes on any repair, on any piece, whether or not it came from us.',
    blocks: [
      {
        body: [
          'Most repairs are quoted the moment you walk in and finished within the week. Bring the piece in — no appointment, no charge to look at it.',
        ],
        list: [
          'Clasp replacement and chain soldering',
          'Prong retipping and rebuilding',
          'Stone replacement and resetting, including matched sourcing',
          'Ring sizing up or down, shank replacement',
          'Pearl and bead restringing',
          'Rhodium plating and full refinishing',
          'Engraving, hand and machine',
        ],
      },
      {
        heading: 'Restoration',
        body: [
          'Inherited and antique pieces get a longer conversation before anything is touched. Sometimes the right answer is to stabilise a piece and leave the wear on it — we will say so.',
        ],
      },
    ],
  },
  {
    handle: 'watch-service',
    title: 'Watch service',
    summary:
      'Movement service, battery and crystal replacement, refinishing, and band sizing for modern, vintage and luxury timepieces.',
    blocks: [
      {
        body: [
          'Watches are serviced by certified watchmakers. Batteries, crystals and band sizing are usually same-day. Full movement service on a mechanical piece takes two to four weeks and comes back regulated and tested.',
        ],
        list: [
          'Battery and gasket replacement, pressure tested',
          'Crystal replacement and polishing',
          'Full movement service and regulation',
          'Case and bracelet refinishing',
          'Band sizing and strap fitting',
        ],
      },
      {
        heading: 'Before you bring a watch in',
        body: [
          `Call ${STORE.phone} if the piece is high-value or vintage, so a watchmaker is on site when you arrive rather than the counter taking it in.`,
        ],
      },
    ],
  },
  {
    handle: 'appraisal',
    title: 'Appraisal',
    summary:
      'Written appraisals for insurance, estate and resale, prepared on site.',
    blocks: [
      {
        body: [
          'We prepare written appraisals with photographs, measurements, stone grading and a replacement value your insurer will accept. Most are completed while you wait; complex estate pieces take a few days.',
          `Call ${STORE.phone} to confirm timing before you come in with a large group of pieces.`,
        ],
      },
    ],
  },
]

const PAGES_BY_HANDLE = new Map(PAGES.map((page) => [page.handle, page]))

export function findPage(handle: string): ContentPage | undefined {
  return PAGES_BY_HANDLE.get(handle)
}

export const PAGE_HANDLES: string[] = PAGES.map((page) => page.handle)
