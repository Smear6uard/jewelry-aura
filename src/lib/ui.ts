/**
 * lib/ui.ts — the storefront's button, field and chip shapes, written
 * once.
 *
 * These are class strings rather than CSS component classes on purpose.
 * A `.btn-primary` defined in `@layer utilities` competes with Tailwind's
 * own utilities for specificity, so a one-off `px-8` at a call site
 * silently loses. Composing strings keeps every override predictable and
 * keeps the button vocabulary in one file.
 *
 * Every button clears a 44px tap target through padding, not font size.
 *
 * There are two grounds and each has its own set. On PAPER a filled
 * button is maroon; inside a VELVET scene maroon may not appear at all,
 * so the fill inverts to bone. Nothing here lifts on a shadow — the
 * palette has no shadow scale, and a button's affordance is its fill.
 */

/** Shared geometry: 44px minimum, centred content, uppercase label. */
const SHAPE =
  'inline-flex min-h-[44px] items-center justify-center gap-2 px-6 text-[12px] label ' +
  'transition-[background-color,color,border-color] duration-hover ease-apple ' +
  'motion-reduce:transition-none'

/**
 * Primary — maroon fill, bone text. THE one maroon element allowed in a
 * viewport, and the reason the rest of the site gave maroon up: a single
 * saturated block reads as the thing to press only while nothing else on
 * screen is competing for that read.
 *
 * Use it for the one action a page is asking for — add to cart, check
 * out, start a commission — and nowhere else. Anything that repeats
 * (quick-adds, card buttons, newsletter submit) takes BTN_INK.
 *
 * Hover darkens to ink rather than to a lighter maroon: there is exactly
 * one maroon in this palette, so the hover state has to move to a
 * different token instead of a second tint of the same one.
 */
export const BTN_PRIMARY = `${SHAPE} bg-maroon text-bone hover:bg-ink active:scale-[0.99] disabled:opacity-70`

/**
 * The filled button for everything that repeats. Same weight as primary,
 * no brand colour — an ink fill states "this is the action here" without
 * spending the one maroon a viewport is allowed.
 *
 * Hover draws a gold hairline rather than shifting the fill; there is no
 * darker ink to move to.
 */
export const BTN_INK = `${SHAPE} bg-ink text-bone hover:ring-1 hover:ring-gold active:scale-[0.99] disabled:opacity-70`

/**
 * Secondary — the hairline ghost. When two calls to action share a row
 * the second one is always this: an outline, never a second fill, so the
 * maroon beside it stays the only place the eye lands first.
 */
export const BTN_SECONDARY = `${SHAPE} border border-ink text-ink hover:bg-ink hover:text-bone`

/** Tertiary — an ink text link; the gold hairline draws in on hover. */
export const BTN_TERTIARY =
  'group/link inline-flex items-center gap-1.5 text-[12px] label text-ink link-hover'

/**
 * The same two shapes inside a velvet scene. Maroon may not touch
 * velvet, so the filled button inverts to bone-on-velvet and the
 * outlined one draws its hairline in bone.
 */
export const BTN_PRIMARY_ON_VELVET = `${SHAPE} bg-bone text-velvet hover:bg-gold active:scale-[0.99] disabled:opacity-70`
export const BTN_SECONDARY_ON_VELVET = `${SHAPE} border border-bone text-bone hover:bg-bone hover:text-velvet`

/** The animated rule under a tertiary link. Render inside the anchor. */
export const LINK_UNDERLINE =
  'pointer-events-none absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current ' +
  'transition-transform duration-hover ease-apple group-hover/link:scale-x-100 ' +
  'motion-reduce:transition-none'

/** Full-width variants — the default on phones for any purchase action. */
export const BTN_PRIMARY_BLOCK = `${BTN_PRIMARY} w-full`
export const BTN_SECONDARY_BLOCK = `${BTN_SECONDARY} w-full`

/**
 * A field on the paper canvas: bone fill, hairline, 16px type so iOS
 * does not zoom on focus.
 *
 * The placeholder is set in ink, the same colour as a typed value,
 * because there is no muted ink to drop it into. `placeholder:italic`
 * (set once in app.css) is what separates hint from value instead — a
 * change of shape rather than an invented shade.
 */
export const FIELD =
  'w-full border border-hairline-light bg-bone px-3.5 py-3 text-[16px] text-ink ' +
  'placeholder:text-ink focus:border-ink focus:bg-paper focus:outline-none ' +
  'transition-colors duration-hover ease-apple motion-reduce:transition-none'

/**
 * The same field inside a velvet scene (the footer newsletter). It
 * inverts to a bone fill rather than staying dark: a velvet input on a
 * velvet band has no edge a shopper can see, and a hairline alone is not
 * enough affordance for something you are meant to type into.
 */
export const FIELD_ON_VELVET =
  'w-full border border-transparent bg-bone px-4 py-3 text-[16px] text-ink ' +
  'placeholder:text-ink focus:outline-none'

/**
 * A tappable choice chip: 44px tall, hairline at rest, maroon fill when
 * on. A selected variant is a selected state, which is the one thing
 * maroon exists for.
 */
export const CHIP =
  'inline-flex min-h-[44px] min-w-[3.25rem] items-center justify-center px-4 text-[14px] ' +
  'transition-colors duration-hover ease-apple motion-reduce:transition-none'
export const CHIP_OFF = `${CHIP} border border-hairline-light bg-bone text-ink hover:border-ink`
export const CHIP_ON = `${CHIP} border border-ink bg-ink text-bone`
export const CHIP_DISABLED = `${CHIP} cursor-not-allowed border border-hairline-light bg-paper text-ink opacity-40 line-through`
