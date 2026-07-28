/**
 * components/commerce/VariantSelector.tsx — option controls for the PDP.
 *
 * Tappable chips at 44px, never a native <select>. A length or ring size
 * is the last decision before a purchase, and a picker that hides the
 * other options behind a wheel makes the shopper commit blind — they
 * cannot see that 22" exists, or that it is the one that is sold out.
 * Colour options render as 44px swatch dots.
 *
 * Selecting a value navigates to the same route with updated search
 * params, so every variant state is a shareable, SSR'd URL.
 *
 * Unavailable values render disabled and struck rather than
 * disappearing. Hiding them makes the option list change shape as you
 * tap through it, and hides the useful fact that the length you want
 * exists but is out of stock.
 */

import { CHIP_DISABLED, CHIP_OFF, CHIP_ON } from '~/lib/ui'
import type { OptionModel } from '~/lib/shopify/adapters'

interface VariantSelectorProps {
  options: OptionModel[]
  onSelect: (search: Record<string, string>) => void
}

export function VariantSelector({ options, onSelect }: VariantSelectorProps) {
  if (options.length === 0) return null

  return (
    <div className="flex flex-col gap-6">
      {options.map((option) => (
        <fieldset key={option.name}>
          <legend className="text-[11px] label text-ink-muted">
            {option.name}
            <span className="ml-2 normal-case tracking-normal text-ink">
              {option.values.find((v) => v.selected)?.name}
            </span>
          </legend>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {option.values.map((value) =>
              option.isColor && value.swatchColor ? (
                <button
                  key={value.name}
                  type="button"
                  disabled={!value.available}
                  aria-pressed={value.selected}
                  aria-label={`${option.name}: ${value.name}${
                    value.available ? '' : ' (unavailable)'
                  }`}
                  title={value.name}
                  onClick={() => onSelect(value.search)}
                  className={`relative flex h-11 w-11 items-center justify-center rounded-full transition-shadow duration-hover ease-apple motion-reduce:transition-none ${
                    value.selected
                      ? 'ring-2 ring-brand ring-offset-2 ring-offset-base'
                      : 'ring-1 ring-hairline hover:ring-ink-muted'
                  } ${
                    value.available
                      ? 'active:scale-[0.94]'
                      : 'cursor-not-allowed opacity-40'
                  }`}
                >
                  <span
                    aria-hidden
                    className="h-8 w-8 rounded-full"
                    style={{ backgroundColor: value.swatchColor }}
                  />
                  {!value.available && (
                    <span
                      aria-hidden
                      className="absolute h-px w-7 rotate-45 bg-ink"
                    />
                  )}
                </button>
              ) : (
                <button
                  key={value.name}
                  type="button"
                  disabled={!value.available}
                  aria-pressed={value.selected}
                  onClick={() => onSelect(value.search)}
                  className={
                    value.selected
                      ? CHIP_ON
                      : value.available
                        ? `${CHIP_OFF} active:scale-[0.98]`
                        : CHIP_DISABLED
                  }
                >
                  {value.name}
                </button>
              ),
            )}
          </div>
        </fieldset>
      ))}
    </div>
  )
}
