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
      className={`flex flex-wrap items-end justify-between gap-x-8 gap-y-3 border-b border-hairline pb-4 ${className}`}
    >
      <div>
        {eyebrow && (
          <p className="mb-1.5 text-[11px] label-wide text-champagne">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-[26px] leading-none tracking-tight text-cream md:text-[34px]">
          {title}
        </h2>
      </div>

      {link && (
        <a
          href={link.href}
          className="group inline-flex shrink-0 items-center gap-1.5 pb-1 text-[11px] label text-cream-muted transition-colors duration-hover ease-apple hover:text-cream md:text-[12px]"
        >
          {link.label}
          <ArrowRight
            aria-hidden
            size={13}
            strokeWidth={1.5}
            className="transition-transform duration-hover ease-apple group-hover:translate-x-0.5"
          />
        </a>
      )}
    </div>
  )
}
