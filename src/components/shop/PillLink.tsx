/**
 * components/shop/PillLink.tsx — the outline pill CTA used across the
 * storefront (fallback pages, empty states, CTA bands). One source for
 * the hairline-border pill so hover/active behavior can't drift between
 * copies.
 */

import type { MouseEventHandler, ReactNode } from 'react'

interface PillLinkProps {
  href: string
  children: ReactNode
  onClick?: MouseEventHandler<HTMLAnchorElement>
}

export function PillLink({ href, children, onClick }: PillLinkProps) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="inline-flex items-center rounded-full border border-champagne/60 px-6 py-3 font-sans text-[12px] font-medium uppercase tracking-[0.18em] text-cream transition-colors duration-hover ease-apple hover:bg-champagne hover:text-forest active:scale-[0.98]"
      style={{ borderWidth: '0.5px' }}
    >
      {children}
    </a>
  )
}
