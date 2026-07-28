/**
 * components/sections/Reviews.tsx — customer quotes.
 *
 * White cards on the cream canvas, maroon stars, name and piece under
 * each quote. Naming the piece is what separates a review from a
 * testimonial: it tells the reader which part of the catalog the opinion
 * applies to.
 *
 * The section renders only when at least three real reviews exist (see
 * lib/reviews.ts) and it currently renders nothing, because the store
 * has none published. That is deliberate. The previous build shipped
 * four invented quotes to production behind a visible "Sample content —
 * replace" label and attributions reading "Sample review — replace",
 * which told every visitor the store was unfinished. An absent section
 * is neutral; a labelled placeholder is a confession.
 *
 * No review structured data is emitted anywhere on the site. Add
 * AggregateRating only once these are real — marking up invented reviews
 * is a Google spam-policy violation on top of being untrue.
 */

import { StarRating } from '~/components/commerce/StarRating'
import { SectionHeader } from '~/components/commerce/SectionHeader'
import { Reveal } from '~/components/motion/Reveal'
import { REVIEWS, hasEnoughReviews } from '~/lib/reviews'

export function Reviews() {
  if (!hasEnoughReviews(REVIEWS)) return null

  return (
    <section
      aria-label="Customer reviews"
      className="mx-auto max-w-[1440px] px-4 py-12 md:px-8 md:py-16"
    >
      <SectionHeader title="What people say" />

      <Reveal>
        <ul className="mt-6 grid gap-2 md:mt-8 md:grid-cols-2 md:gap-3 lg:grid-cols-4">
          {REVIEWS.map((review, index) => (
            <li key={index}>
              {/* figure/blockquote/figcaption is the markup for an
                  attributed quotation. A bare <footer> inside the <li>
                  would associate with the page's own footer. */}
              <figure className="flex h-full flex-col bg-raised p-5 shadow-sm">
                <StarRating value={review.stars} size={14} />
                <blockquote className="mt-3 flex-1 text-[14px] leading-relaxed text-ink-muted">
                  {review.quote}
                </blockquote>
                <figcaption className="mt-4 border-t border-hairline pt-3">
                  <span className="block text-[13px] font-medium text-ink">
                    {review.name}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-ink-muted">
                    {review.piece}
                  </span>
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  )
}
