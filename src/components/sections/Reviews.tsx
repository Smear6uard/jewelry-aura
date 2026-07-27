/**
 * components/sections/Reviews.tsx — customer quotes.
 *
 * Raised cards on the base canvas, champagne stars, name and piece
 * under each quote. Naming the piece is what separates a review from a
 * testimonial: it tells the reader which part of the catalog the
 * opinion applies to.
 *
 * The quotes currently shipped are placeholders. While
 * REVIEWS_ARE_PLACEHOLDER is true the section carries a visible marker
 * saying so, and no review structured data is emitted anywhere on the
 * site — marking up invented reviews would be a Google spam-policy
 * violation on top of being untrue. See lib/placeholder-content.ts.
 */

import { StarRating } from '~/components/commerce/StarRating'
import { SectionHeader } from '~/components/commerce/SectionHeader'
import {
  PLACEHOLDER_REVIEWS,
  REVIEWS_ARE_PLACEHOLDER,
  SHOW_REVIEWS,
} from '~/lib/placeholder-content'

export function Reviews() {
  if (!SHOW_REVIEWS || PLACEHOLDER_REVIEWS.length === 0) return null

  return (
    <section
      aria-label="Customer reviews"
      className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16"
    >
      <SectionHeader
        title="What people say"
        eyebrow={REVIEWS_ARE_PLACEHOLDER ? 'Sample content — replace' : undefined}
      />

      <ul className="mt-6 grid gap-2 md:mt-8 md:grid-cols-2 md:gap-3 lg:grid-cols-4">
        {PLACEHOLDER_REVIEWS.map((review, index) => (
          <li key={index}>
            {/* figure/blockquote/figcaption is the markup for an
                attributed quotation. A bare <footer> inside the <li>
                would associate with the page's own footer. */}
            <figure className="flex h-full flex-col border border-hairline bg-raised p-5">
              <StarRating value={review.stars} size={13} />
              <blockquote className="mt-3 flex-1 text-[14px] leading-relaxed text-cream-muted">
                {review.quote}
              </blockquote>
              <figcaption className="mt-4 border-t border-hairline pt-3">
                <span className="block text-[12px] font-medium text-cream">
                  {review.name}
                </span>
                <span className="mt-0.5 block text-[11px] text-cream-subtle">
                  {review.piece}
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  )
}
