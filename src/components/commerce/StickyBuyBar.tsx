/**
 * components/commerce/StickyBuyBar.tsx — the PDP's phone buy bar.
 *
 * Pinned to the bottom of the viewport with the price and a full-width
 * ink add-to-cart, clearing the iOS home indicator. It appears only
 * once the inline add-to-cart has scrolled out of view: two identical buy
 * buttons on screen at once makes the shopper decide which one is real.
 *
 * Phones only. On desktop the product detail column is sticky and its
 * inline button never leaves the viewport, so a bar would be furniture
 * with no job.
 *
 * Watching the inline button with an IntersectionObserver rather than a
 * scroll offset means the bar's trigger point stays correct however tall
 * the gallery, the variant chips or the title turn out to be.
 */

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useCart } from '~/components/commerce/CartProvider'
import { DURATION, easeOutExpo, useReducedMotion } from '~/lib/motion'
import type { VariantModel } from '~/lib/shopify/adapters'

interface StickyBuyBarProps {
  variant: VariantModel | null
  soldOut: boolean
  /** Element to watch — the bar shows once this leaves the viewport. */
  anchorRef: React.RefObject<HTMLElement | null>
  title: string
}

export function StickyBuyBar({
  variant,
  soldOut,
  anchorRef,
  title,
}: StickyBuyBarProps) {
  const { add, openCart } = useCart()
  const reduced = !!useReducedMotion()
  const [visible, setVisible] = useState(false)
  const [pending, setPending] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const anchor = anchorRef.current
    if (!anchor) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Visible once the inline control is fully out of view above or
        // below. `boundingClientRect.top < 0` alone would keep the bar up
        // while the shopper scrolls back toward the button.
        setVisible(!entry.isIntersecting)
      },
      { rootMargin: '-8px 0px -8px 0px', threshold: 0 },
    )
    observer.observe(anchor)
    return () => observer.disconnect()
  }, [anchorRef])

  const onClick = async () => {
    if (!variant || pending) return
    setPending(true)
    const result = await add(variant.id, 1)
    setPending(false)
    if (result.ok) openCart(buttonRef.current)
  }

  const unpriced = variant?.unpriced ?? false

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="safe-bottom fixed inset-x-0 bottom-0 z-[60] border-t border-hairline-light bg-bone px-4 pt-3 md:hidden"
          initial={reduced ? { opacity: 0 } : { y: '110%' }}
          animate={reduced ? { opacity: 1 } : { y: 0 }}
          exit={reduced ? { opacity: 0 } : { y: '110%' }}
          transition={{ duration: DURATION.micro, ease: easeOutExpo }}
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0 shrink">
              <p className="truncate text-[12px] text-ink">{title}</p>
              {unpriced ? (
                <p className="text-[15px] font-medium text-ink">Quoted</p>
              ) : (
                <p className="flex items-baseline gap-2">
                  <span className="text-[17px] font-medium text-ink">
                    {variant?.price}
                  </span>
                  {variant?.compareAtPrice && (
                    <s className="text-[13px] text-ink">
                      {variant.compareAtPrice}
                    </s>
                  )}
                </p>
              )}
            </div>

            {unpriced ? (
              <a
                href="/custom"
                className="flex min-h-12 flex-1 items-center justify-center bg-ink px-5 text-[12px] label text-bone"
              >
                Get a price
              </a>
            ) : (
              <button
                ref={buttonRef}
                type="button"
                disabled={soldOut || !variant || pending}
                onClick={onClick}
                className={
                  soldOut || !variant
                    ? 'flex min-h-12 flex-1 cursor-not-allowed items-center justify-center bg-bone px-5 text-[12px] label text-ink'
                    : 'flex min-h-12 flex-1 items-center justify-center bg-ink px-5 text-[12px] label text-bone transition-colors duration-hover ease-apple active:scale-[0.99] disabled:opacity-70 motion-reduce:transition-none'
                }
              >
                {soldOut ? 'Sold out' : pending ? 'Adding…' : 'Add to cart'}
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
