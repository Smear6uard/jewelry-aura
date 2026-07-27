/**
 * ███  PLACEHOLDER CONTENT — REPLACE BEFORE THIS REACHES CUSTOMERS  ███
 *
 * The reviews below are NOT real customer feedback. They exist so the
 * Reviews section has something to render and so the owner can see the
 * shape of the copy they need to supply. Every quote, name and piece is
 * invented.
 *
 * While REVIEWS_ARE_PLACEHOLDER is true the section renders with a
 * visible "sample content" marker and every attribution reads "Sample
 * review — replace", so nobody — owner or shopper — can mistake these
 * for real customer feedback.
 *
 * To go live, do one of two things:
 *   1. Replace the quotes and names with real, attributable reviews
 *      (with permission) and set REVIEWS_ARE_PLACEHOLDER to false, or
 *   2. Set SHOW_REVIEWS to false — the homepage Reviews section then
 *      renders nothing at all.
 *
 * Nothing here is wired to structured data. Review JSON-LD is
 * deliberately absent: marking up invented reviews would be a Google
 * spam-policy violation as well as a lie. Add AggregateRating only once
 * these are real.
 */

export interface Review {
  quote: string
  name: string
  /** Piece the reviewer bought — grounds the quote in a real purchase. */
  piece: string
  /** 1–5. */
  stars: number
}

/** Flip to false to hide the Reviews section entirely. */
export const SHOW_REVIEWS = true

/**
 * True while the quotes below are invented. Drives the visible sample
 * marker on the section. Shipping unlabelled placeholder testimonials
 * to customers is a deliberate act, so clearing this is a deliberate
 * switch rather than something that happens by forgetting.
 */
export const REVIEWS_ARE_PLACEHOLDER = true

export const PLACEHOLDER_REVIEWS: Review[] = [
  {
    quote:
      'Brought in a sketch on a napkin and walked out three weeks later with exactly what I had in my head. The plate is heavier than I expected, in a good way.',
    name: 'Sample review — replace',
    piece: 'Custom name plate',
    stars: 5,
  },
  {
    quote:
      'Second chain from them. They sized it while I waited and cleaned the first one for free. That is the reason I keep coming back instead of ordering online.',
    name: 'Sample review — replace',
    piece: '14K Cuban link, 22"',
    stars: 5,
  },
  {
    quote:
      'My grandmother’s ring had a cracked shank and two missing stones. It came back looking like it did in her wedding photos.',
    name: 'Sample review — replace',
    piece: 'Restoration',
    stars: 5,
  },
  {
    quote:
      'Straight answers about moissanite versus natural, no pressure either way. Ended up spending less than I planned to.',
    name: 'Sample review — replace',
    piece: 'Moissanite solitaire',
    stars: 4,
  },
]
