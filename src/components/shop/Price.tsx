/**
 * components/shop/Price.tsx — variant price line for the PDP.
 * Mono champagne price, muted strikethrough compare-at, sold-out note.
 */

interface PriceProps {
  price: string
  compareAtPrice?: string | null
  availableForSale: boolean
}

export function Price({ price, compareAtPrice, availableForSale }: PriceProps) {
  return (
    <p className="flex items-baseline gap-3">
      <span className="font-mono text-lg tracking-[0.06em] text-champagne">
        {price}
      </span>
      {compareAtPrice && (
        <s className="font-mono text-[13px] tracking-[0.06em] text-cream-muted/70">
          {compareAtPrice}
        </s>
      )}
      {!availableForSale && (
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-cream-muted">
          Sold out
        </span>
      )}
    </p>
  )
}
