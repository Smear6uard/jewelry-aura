/**
 * components/shop/VariantSelector.tsx — option buttons for the PDP.
 *
 * Options render as buttons — swatch dots when the option is a color,
 * pills otherwise. Selecting a value navigates to the same route with
 * updated search params, so every variant state is a shareable, SSR'd
 * URL. Values with no purchasable variant for the rest of the current
 * selection render disabled (dimmed + struck), not hidden.
 */

import type { OptionModel } from '~/lib/shopify/adapters'

interface VariantSelectorProps {
  options: OptionModel[]
  onSelect: (search: Record<string, string>) => void
}

export function VariantSelector({ options, onSelect }: VariantSelectorProps) {
  if (options.length === 0) return null

  return (
    <div className="flex flex-col gap-7">
      {options.map((option) => (
        <fieldset key={option.name}>
          <legend className="font-mono text-[11px] uppercase tracking-[0.22em] text-cream-muted">
            {option.name}
            <span className="ml-3 normal-case tracking-normal text-cream">
              {option.values.find((v) => v.selected)?.name}
            </span>
          </legend>
          <div className="mt-3 flex flex-wrap items-center gap-2.5">
            {option.values.map((value) =>
              option.isColor && value.swatchColor ? (
                <button
                  key={value.name}
                  type="button"
                  disabled={!value.available}
                  aria-pressed={value.selected}
                  aria-label={`${option.name}: ${value.name}${value.available ? '' : ' (unavailable)'}`}
                  title={value.name}
                  onClick={() => onSelect(value.search)}
                  className={`relative h-9 w-9 rounded-full transition-transform duration-hover ease-apple ${
                    value.selected
                      ? 'ring-1 ring-champagne ring-offset-2 ring-offset-forest'
                      : 'ring-1 ring-cream-muted/25 hover:ring-cream-muted/60'
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
                      className="absolute inset-0 m-auto h-px w-7 rotate-45 bg-cream-muted"
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
                  className={`rounded-full px-4 py-2 font-sans text-[13px] transition-colors duration-hover ease-apple ${
                    value.selected
                      ? 'bg-champagne text-forest'
                      : value.available
                        ? 'border border-champagne/30 text-cream hover:border-champagne/70 active:scale-[0.98]'
                        : 'cursor-not-allowed border border-cream-muted/15 text-cream-muted/40 line-through'
                  }`}
                  style={value.selected ? undefined : { borderWidth: '0.5px' }}
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
