/**
 * lib/ui.ts — the storefront's three button shapes, written once.
 *
 * These are class strings rather than CSS component classes on purpose.
 * A `.btn-primary` defined in `@layer utilities` competes with Tailwind's
 * own utilities for specificity, so a one-off `px-8` at a call site
 * silently loses. Composing strings keeps every override predictable and
 * keeps the button vocabulary in one file.
 *
 * Every button clears a 44px tap target through padding, not font size.
 * On a light canvas a filled button gets its lift from a shadow on
 * hover, never from a border.
 */

/** Shared geometry: 44px minimum, centred content, uppercase label. */
const SHAPE =
  'inline-flex min-h-[44px] items-center justify-center gap-2 px-6 text-[12px] label ' +
  'transition-[background-color,color,box-shadow] duration-hover ease-apple ' +
  'motion-reduce:transition-none'

/**
 * Primary — maroon fill, cream text. The only button shape allowed to
 * carry the brand colour, and the only one used for add-to-cart and
 * checkout.
 */
export const BTN_PRIMARY = `${SHAPE} bg-brand text-cream hover:bg-brand-hover hover:shadow-sm active:scale-[0.99] disabled:opacity-70`

/**
 * Secondary — transparent with a near-black hairline, inverting to a
 * near-black fill on hover. Never a cream or white fill: on a cream
 * canvas that is an invisible button.
 */
export const BTN_SECONDARY = `${SHAPE} border border-ink text-ink hover:bg-ink hover:text-cream`

/** Tertiary — a maroon text link with an underline that draws in. */
export const BTN_TERTIARY =
  'group/link inline-flex items-center gap-1.5 text-[12px] label text-brand ' +
  'transition-colors duration-hover ease-apple hover:text-brand-hover'

/** The animated rule under a tertiary link. Render inside the anchor. */
export const LINK_UNDERLINE =
  'pointer-events-none absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current ' +
  'transition-transform duration-hover ease-apple group-hover/link:scale-x-100 ' +
  'motion-reduce:transition-none'

/** Full-width variants — the default on phones for any purchase action. */
export const BTN_PRIMARY_BLOCK = `${BTN_PRIMARY} w-full`
export const BTN_SECONDARY_BLOCK = `${BTN_SECONDARY} w-full`

/**
 * A field on the cream canvas: sunken fill, hairline, 16px type so iOS
 * does not zoom on focus.
 */
export const FIELD =
  'w-full border border-hairline bg-sunken px-3.5 py-3 text-[16px] text-ink ' +
  'placeholder:text-ink-muted focus:border-ink-muted focus:bg-raised focus:outline-none ' +
  'transition-colors duration-hover ease-apple motion-reduce:transition-none'

/** The same field on a maroon band (the footer newsletter) — white fill. */
export const FIELD_ON_BRAND =
  'w-full border border-transparent bg-raised px-4 py-3 text-[16px] text-ink ' +
  'placeholder:text-ink-muted focus:outline-none'

/** A tappable choice chip: 44px tall, hairline at rest, ink fill when on. */
export const CHIP =
  'inline-flex min-h-[44px] min-w-[3.25rem] items-center justify-center px-4 text-[14px] ' +
  'transition-colors duration-hover ease-apple motion-reduce:transition-none'
export const CHIP_OFF = `${CHIP} border border-hairline bg-raised text-ink hover:border-ink-muted`
export const CHIP_ON = `${CHIP} border border-ink bg-ink text-cream`
export const CHIP_DISABLED = `${CHIP} cursor-not-allowed border border-hairline bg-base text-ink-subtle line-through`
