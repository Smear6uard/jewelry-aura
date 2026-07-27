/**
 * components/commerce/VariantSelector.tsx — option controls for the PDP.
 *
 * Swatch dots for colour options, square-cornered pills otherwise.
 * Selecting a value navigates to the same route with updated search
 * params, so every variant state is a shareable, SSR'd URL.
 *
 * Unavailable values render disabled and struck rather than
 * disappearing. Hiding them makes the option list change shape as you
 * click through it, and hides the useful fact that the length you want
 * exists but is out of stock.
 */

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
          <legend className="text-[11px] label text-cream-subtle">
            {option.name}
            <span className="ml-2 normal-case tracking-normal text-cream">
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
                  className={`relative h-8 w-8 rounded-full transition-transform duration-hover ease-apple ${
                    value.selected
                      ? 'ring-1 ring-champagne ring-offset-2 ring-offset-base'
                      : 'ring-1 ring-hairline hover:ring-cream-subtle'
                  } ${
                    value.available
                      ? 'active:scale-[0.94]'
                      : 'cursor-not-allowed opacity-35'
                  }`}
                  style={{ backgroundColor: value.swatchColor }}
                >
                  {!value.available && (
                    <span
                      aria-hidden
                      className="absolute inset-0 m-auto h-px w-6 rotate-45 bg-cream-muted"
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
                  className={`min-w-[3rem] px-3.5 py-2 text-[13px] transition-colors duration-hover ease-apple ${
                    value.selected
                      ? 'bg-cream text-base'
                      : value.available
                        ? 'border border-hairline text-cream hover:border-cream-subtle active:scale-[0.98]'
                        : 'cursor-not-allowed border border-hairline text-cream-subtle/50 line-through'
                  }`}
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
