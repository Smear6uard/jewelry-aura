/**
 * components/commerce/StarRating.tsx — maroon star row.
 *
 * Used on product cards, on the PDP, and in the Reviews section. Renders
 * a filled star per whole point and a partial star for a fraction — no
 * rounding up, because a 4.5 shown as 5 is a small lie repeated on every
 * card.
 *
 * Only ever rendered when real rating data exists. There is no zero
 * state: five empty outlines with "(0)" beside them is a worse signal
 * than a card that says nothing about reviews at all.
 */

interface StarRatingProps {
  /** 0–5. */
  value: number
  /** Star edge length in px. Cards use 12, reviews use 14. */
  size?: number
  className?: string
}

const STAR_PATH =
  'M8 1.4l1.9 4 4.4.6-3.2 3 .8 4.3L8 11.3 3.9 13.4l.8-4.3-3.2-3 4.4-.6z'

/**
 * Read from the token rather than hard-coded, so a retune of the brand
 * accent reaches the stars too. Custom properties resolve in inline SVG
 * presentation attributes.
 */
const MAROON = 'var(--color-maroon)'

export function StarRating({ value, size = 12, className }: StarRatingProps) {
  const clamped = Math.max(0, Math.min(5, value))

  return (
    <span
      className={`inline-flex items-center gap-[2px] ${className ?? ''}`}
      role="img"
      aria-label={`${clamped} out of 5 stars`}
    >
      {[0, 1, 2, 3, 4].map((index) => {
        // Portion of this star that is filled, 0–1.
        const fill = Math.max(0, Math.min(1, clamped - index))
        const gradientId = `star-${index}-${Math.round(fill * 100)}`
        return (
          <svg
            key={index}
            aria-hidden
            width={size}
            height={size}
            viewBox="0 0 16 16"
            className="shrink-0"
          >
            <defs>
              <linearGradient id={gradientId}>
                <stop offset={`${fill * 100}%`} stopColor={MAROON} />
                <stop offset={`${fill * 100}%`} stopColor="transparent" />
              </linearGradient>
            </defs>
            <path
              d={STAR_PATH}
              fill={`url(#${gradientId})`}
              stroke={MAROON}
              strokeWidth="0.9"
              strokeLinejoin="round"
              opacity={fill > 0 ? 1 : 0.3}
            />
          </svg>
        )
      })}
    </span>
  )
}
