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

import { useSyncExternalStore } from 'react'

// One browser listener per query, shared by all consumers. The server
// snapshot is also used during hydration so responsive markup matches.
const stores = new Map<string, ReturnType<typeof createMediaStore>>()
const serverSnapshot = () => false

function createMediaStore(query: string) {
  let media: MediaQueryList | undefined
  const listeners = new Set<() => void>()
  const getMedia = () => (media ??= window.matchMedia(query))
  const notify = () => listeners.forEach((listener) => listener())

  return {
    getSnapshot: () => getMedia().matches,
    subscribe(listener: () => void) {
      if (listeners.size === 0) getMedia().addEventListener('change', notify)
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
        if (listeners.size === 0) getMedia().removeEventListener('change', notify)
      }
    },
  }
}

export function useMediaQuery(query: string): boolean {
  let store = stores.get(query)
  if (!store) {
    store = createMediaStore(query)
    stores.set(query, store)
  }
  return useSyncExternalStore(store.subscribe, store.getSnapshot, serverSnapshot)
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
