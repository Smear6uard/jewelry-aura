/**
 * components/shop/CatalogFallback.tsx — shared full-page state for
 * catalog 404s and load errors. Five route fallbacks render this shell;
 * only the copy differs.
 */

import { Header } from '~/components/layout/Header'
import { PillLink } from '~/components/shop/PillLink'

interface CatalogFallbackProps {
  eyebrow: string
  headline: string
  ctaHref?: string
  ctaLabel?: string
}

export function CatalogFallback({
  eyebrow,
  headline,
  ctaHref = '/shop',
  ctaLabel = 'Shop all pieces',
}: CatalogFallbackProps) {
  return (
    <div className="grain-overlay">
      <Header solid />
      <main className="flex min-h-[100dvh] items-center bg-forest text-cream">
        <div className="mx-auto max-w-xl px-6 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-cream-muted">
            {eyebrow}
          </p>
          <h1 className="mt-6 font-display text-3xl italic leading-snug text-cream md:text-4xl">
            {headline}
          </h1>
          <div className="mt-10">
            <PillLink href={ctaHref}>{ctaLabel}</PillLink>
          </div>
        </div>
      </main>
    </div>
  )
}
