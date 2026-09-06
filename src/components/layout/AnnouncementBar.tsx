/**
 * components/layout/AnnouncementBar.tsx — the velvet strip at the very
 * top of every page.
 *
 * The first thing above the paper canvas, and the smallest of the three
 * velvet surfaces. It does not need saturation to work: 36px of near-
 * black at the top of the viewport reads as a shop banner, and it is
 * what tells the eye the paper below is a decision rather than a
 * default. Maroon is deliberately absent — it is the interactive accent,
 * and nothing in this bar is a purchase.
 *
 * Messages rotate on a slow crossfade. Under prefers-reduced-motion the
 * rotation stops and both promises are shown on one line — the content
 * still arrives, it just doesn't move.
 *
 * Dismissal persists for the session. The check runs in an inline
 * script in the document head (see routes/__root.tsx) rather than in a
 * mount effect, so a returning visitor never sees the bar paint and
 * then vanish, and the header never jumps 36px up the page.
 */

import { useEffect, useState } from 'react'
import { AnimatePresence, m as motion } from 'framer-motion'
import { X } from 'lucide-react'
import { DURATION, easeApple, useReducedMotion } from '~/lib/motion'
import { FREE_SHIPPING_THRESHOLD } from '~/lib/catalog'

export const PROMO_DISMISS_KEY = 'ja-promo-dismissed'

const MESSAGES = [
  `Free shipping on orders over $${FREE_SHIPPING_THRESHOLD}`,
  'Lifetime warranty on every piece we make',
  'Free sizing and cleaning, for as long as you own it',
]

const ROTATE_MS = 5200

export function AnnouncementBar() {
  const reduced = !!useReducedMotion()
  const [index, setIndex] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (reduced) return
    const timer = window.setInterval(
      () => setIndex((prev) => (prev + 1) % MESSAGES.length),
      ROTATE_MS,
    )
    return () => window.clearInterval(timer)
  }, [reduced])

  if (dismissed) return null

  const dismiss = () => {
    setDismissed(true)
    try {
      sessionStorage.setItem(PROMO_DISMISS_KEY, '1')
    } catch {
      // Private-mode storage denial is not worth surfacing.
    }
  }

  return (
    <div
      data-announcement
      data-ground="velvet"
      className="relative z-[55] bg-velvet text-bone"
      role="region"
      aria-label="Store announcements"
    >
      <div className="mx-auto flex h-9 max-w-[1440px] items-center justify-center px-12">
        {reduced ? (
          <p className="text-center text-[11px] label-wide">
            {MESSAGES[0]} · {MESSAGES[1]}
          </p>
        ) : (
          <div className="relative h-4 w-full overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={index}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: DURATION.micro, ease: easeApple }}
                className="absolute inset-0 flex items-center justify-center text-center text-[11px] label-wide"
              >
                {MESSAGES[index]}
              </motion.p>
            </AnimatePresence>
          </div>
        )}

        {/* 44px target, achieved with padding — the bar itself stays 36px
            tall because the button overflows it symmetrically. */}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="absolute right-1 flex h-11 w-11 items-center justify-center text-bone transition-colors duration-hover ease-apple hover:text-gold"
        >
          <X aria-hidden size={15} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
