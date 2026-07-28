/**
 * lib/reviews.ts — real customer reviews for the homepage section.
 *
 * This file replaces the previous placeholder-content.ts, which shipped
 * four invented quotes attributed to "Sample review — replace" and put
 * that string in front of live customers. There is no labelled-sample
 * mode any more: the section renders real reviews or it renders nothing.
 *
 * TO POPULATE
 * -----------
 * Add entries below with the customer's real words and their permission
 * to publish. The section needs THREE before it renders — two quotes
 * read as the only two the shop could find, which is worse than a page
 * that never claims to have reviews at all.
 *
 * Review structured data is still deliberately absent. Add
 * AggregateRating only when these are real and verifiable; marking up
 * invented reviews is a Google spam-policy violation on top of a lie.
 */

export interface Review {
  quote: string
  name: string
  /** Piece the reviewer bought — grounds the quote in a real purchase. */
  piece: string
  /** 1–5. */
  stars: number
}

/** The minimum count that makes a reviews section read as evidence. */
export const MIN_REVIEWS = 3

/**
 * Real, attributable reviews. Empty until the owner supplies them, which
 * means the homepage currently renders no reviews section at all — the
 * correct state for a store with no published reviews.
 */
export const REVIEWS: Review[] = []

/** True when there are enough real reviews to render the section. */
export function hasEnoughReviews(reviews: ReadonlyArray<Review>): boolean {
  return reviews.length >= MIN_REVIEWS
}
