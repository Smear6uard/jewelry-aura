/**
 * components/ui/BottomSheet.tsx — the phone modal.
 *
 * Slides up from the bottom edge, white on a dimmed canvas at
 * a hairline at its top edge, with a drag handle at the top and the confirming action
 * fixed at the foot. Used by the PLP's Filter and Sort controls.
 *
 * Why a sheet rather than the side drawer this replaced: a phone's
 * reachable area is the bottom two thirds of the screen. A left-hand
 * slide-over puts its apply button at the bottom of a full-height panel
 * and its close button at the top-left corner — the single furthest
 * point from a right thumb. A sheet that occupies the lower 85% puts
 * every control in the thumb zone and leaves the page visible above it,
 * so the shopper keeps their place.
 *
 * The handle is decorative; dismissal is the scrim, the close button and
 * Escape. A drag-to-dismiss gesture competes with the sheet's own
 * scrolling content, and losing a set of filters to an accidental
 * downward flick is worse than needing one deliberate tap.
 *
 * Accessibility contract matches CartDrawer: role="dialog" + aria-modal,
 * focus into the panel on open and trapped while open, Escape closes,
 * body scroll locked, focus returned to the trigger by the caller.
 *
 * PORTALLED TO <body>, and that is load-bearing rather than tidiness.
 * The PLP's Filter and Sort triggers live inside a sticky toolbar that
 * carries its own z-index, which makes it a stacking context: a
 * `position: fixed` sheet rendered inside it would be trapped in that
 * context and paint UNDER the header, whose z-index is higher than the
 * toolbar's. Any ancestor with a filter, backdrop-filter or transform
 * would additionally re-anchor `fixed` to that ancestor's box and shrink
 * the sheet to the toolbar's footprint. Portalling makes the sheet
 * independent of wherever its trigger happens to sit.
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { DURATION, easeApple, easeOutExpo } from '~/lib/motion'

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  /** The confirming action, pinned above the home indicator. */
  footer?: ReactNode
}

export function BottomSheet({
  open,
  onClose,
  title,
  children,
  footer,
}: BottomSheetProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  // The sheet is never open during SSR, so rendering nothing until mount
  // costs no markup and gives createPortal a document to target.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    panel?.focus()
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panel) return
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((el) => el.offsetParent !== null)
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const active = document.activeElement as HTMLElement | null
      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[72]">
          <motion.button
            type="button"
            aria-label={`Close ${title.toLowerCase()}`}
            tabIndex={-1}
            className="absolute inset-0 h-full w-full cursor-default bg-velvet/40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.micro, ease: easeApple }}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className="absolute inset-x-0 bottom-0 flex max-h-[85dvh] flex-col border-t border-hairline-light bg-bone outline-none"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: DURATION.content, ease: easeOutExpo }}
          >
            <div className="relative flex items-center justify-between border-b border-hairline-light pl-5 pr-1">
              <span
                aria-hidden
                className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-hairline-light"
              />
              <h2 className="py-4 text-[12px] label text-ink">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={`Close ${title.toLowerCase()}`}
                className="flex h-11 w-11 items-center justify-center text-ink transition-colors duration-hover ease-apple hover:bg-paper"
              >
                <X aria-hidden size={19} strokeWidth={1.5} />
              </button>
            </div>

            <div
              className="flex-1 overflow-y-auto overscroll-contain px-5 py-5"
              data-lenis-prevent
            >
              {children}
            </div>

            {footer && (
              <div className="safe-bottom border-t border-hairline-light px-5 pt-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
