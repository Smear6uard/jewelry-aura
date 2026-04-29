/**
 * lib/scroll-to.ts — Lenis-coupled anchor smooth-scroll
 *
 * Centralises the click handler used by every "Start a custom piece" /
 * "Commission" / "Begin" / "Book consultation" CTA on the site. The
 * site has no on-site customisation flow — every commission CTA must
 * route the user to the Visit section, where the phone CTA, store
 * hours, and address all live.
 *
 * Why one helper:
 *   • Anchors must be REAL anchors (`<a href="#visit">`). If JS fails
 *     or is disabled the link still jumps to the section. The smooth
 *     scroll is layered on top as JS enhancement.
 *   • The smooth motion must run through Lenis — the same RAF-coupled
 *     instance the rest of the site reads from. Calling
 *     `element.scrollIntoView({ behavior: 'smooth' })` would bypass
 *     Lenis and the scroll-bound choreography in Hero / CustomPieces
 *     would skip frames mid-animation.
 *   • Easing and duration come from a single token so the motion of
 *     a CTA scroll matches the motion of every wheel scroll.
 *
 * Used by:
 *   - Hero PrimaryCTA               ("Start a custom piece")
 *   - CustomPieces piece-card hover ("Commission similar")
 *   - CustomPieces commission card  ("Start a piece" / "Begin →")
 *   - Header CTA                    ("Book consultation")
 *
 * NOT used by:
 *   - Visit section's own primary "Call …" CTA — that's a tel: link
 *     and is the intentional dial action for users who've reached the
 *     section.
 */

import { useCallback, type MouseEvent } from 'react'
import { useLenis } from './lenis'

// Same easing the LenisProvider configures globally — keeps a CTA
// scroll feeling identical to a wheel scroll.
const SCROLL_EASING = (t: number): number =>
  Math.min(1, 1.001 - Math.pow(2, -10 * t))

// Slightly longer than a wheel tick because the user has just clicked
// — they're committing to the trip, the journey reads better at this
// pace.
const SCROLL_DURATION = 1.4

/**
 * Returns an onClick handler for an `<a href={'#' + targetId}>` link.
 * Smooth-scrolls to the target through Lenis. Falls through to the
 * native anchor jump when:
 *   • Lenis hasn't mounted yet (hydration window)
 *   • The target id isn't in the DOM
 *   • The user modifier-clicks (cmd/ctrl/shift/alt) or middle-clicks —
 *     those gestures expect the browser's native open-in-new-tab
 *     behaviour, never an in-page scroll.
 *
 * Lenis accepts `target` as a number, a CSS selector string, or an
 * HTMLElement. We pass the document offset (number) — the most direct
 * form, immune to ancestor-walk quirks when the calling element lives
 * inside one of the pinned panels in Hero / CustomPieces.
 */
export function useSmoothScrollTo(targetId: string) {
  const lenis = useLenis()

  return useCallback(
    (event: MouseEvent<HTMLAnchorElement>) => {
      if (
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        event.button !== 0
      ) {
        return
      }
      const target = document.getElementById(targetId)
      if (!target || !lenis) return
      event.preventDefault()
      lenis.scrollTo(target.offsetTop, {
        duration: SCROLL_DURATION,
        easing: SCROLL_EASING,
      })
    },
    [lenis, targetId],
  )
}
