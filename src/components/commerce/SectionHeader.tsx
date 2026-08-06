/**
 * components/commerce/SectionHeader.tsx — the homepage section rubric.
 *
 * Left-aligned title, right-aligned link, hairline underneath. Centred
 * section headers are an editorial idiom: they stop the eye and ask it
 * to admire the heading. A store wants the opposite — the heading names
 * the shelf and the link on the right says "there is more of this",
 * which is why every rail on JAXXON, GLD and every catalog before them
 * is titled this way.
 *
 * The display serif is allowed here. It is one of only three places on
 * the site that gets it (this, the wordmark, the PDP product name).
 */

import { ArrowRight } from 'lucide-react'
import { BTN_TERTIARY, LINK_UNDERLINE } from '~/lib/ui'

interface SectionHeaderProps {
  title: string
  /** Small uppercase line above the title. */
  eyebrow?: string
  link?: { href: string; label: string }
  className?: string
}

export function SectionHeader({
  title,
  eyebrow,
  link,
  className = '',
}: SectionHeaderProps) {
  return (
    <div
      className={`flex flex-wrap items-end justify-between gap-x-8 gap-y-2 border-b border-hairline-light pb-4 ${className}`}
    >
      <div>
        {eyebrow && (
          <p className="mb-1.5 text-[11px] label-wide text-ink">{eyebrow}</p>
        )}
        <h2 className="display text-[26px] leading-none text-ink md:text-[34px]">
          {title}
        </h2>
      </div>

      {/* The site's tertiary button shape: ink text with a gold hairline
          that draws in from the left. The arrow is the store idiom on top
          of it — it says "more of this", where the underline says "this is
          a link". */}
      {link && (
        <a href={link.href} className={`${BTN_TERTIARY} min-h-11 shrink-0`}>
          <span className="relative">
            {link.label}
            <span aria-hidden className={LINK_UNDERLINE} />
          </span>
          <ArrowRight
            aria-hidden
            size={14}
            strokeWidth={1.6}
            className="transition-transform duration-hover ease-apple group-hover/link:translate-x-0.5 motion-reduce:transition-none"
          />
        </a>
      )}
    </div>
  )
}
