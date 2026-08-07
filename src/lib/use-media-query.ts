/**
 * lib/use-media-query.ts — breakpoint reads for components whose SHAPE,
 * not just styling, changes between phone and desktop.
 *
 * Only reach for this when CSS cannot express the difference. The cart
 * drawer is the case that justifies it: on a phone it is a bottom sheet
 * that animates on translateY, on a desktop it is a right-hand panel
 * that animates on translateX, and a Framer transform target cannot be
 * swapped by a media query.
 *
 * Returns false on the server and on the first client render, then
 * settles after mount. Every consumer is a dialog that can only open
 * after mount, so the initial false is never rendered.
 */

import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const list = window.matchMedia(query)
    setMatches(list.matches)
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches)
    list.addEventListener('change', onChange)
    return () => list.removeEventListener('change', onChange)
  }, [query])

  return matches
}

/** True from Tailwind's `md` breakpoint up — where drawers gain a side. */
export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 768px)')
}

/**
 * True from Tailwind's `lg` breakpoint up — where the homepage's scenes
 * are allowed to pin.
 *
 * A pinned, scroll-scrubbed scene needs a viewport tall enough to hold
 * poster type over a photograph and a pointer device's scroll resolution
 * to scrub with. Below this the same markup renders as a stacked band,
 * and the components skip the scrubbed styles entirely — see the
 * CHOREOGRAPHY blocks in app.css, which collapse the stage to match.
 *
 * Returns false on the server and on the first client render. Both scenes
 * that read this are far below the fold, and both ship their start state
 * in CSS, so the settle is never a visible frame.
 */
export function useIsWide(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}
