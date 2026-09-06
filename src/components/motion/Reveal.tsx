/**
 * components/motion/Reveal.tsx
 *
 * Generic scroll-triggered reveal for body copy, images, callouts — any
 * non-headline content that should come in as the user scrolls into it.
 * Headlines should use SplitText instead.
 *
 * Imports the `scrollReveal` variant from ~/lib/motion. Reduced-motion
 * collapses to an instant-visible state with no transform.
 */

import type { JSX, ReactNode } from 'react'
import { m as motion, type Variants } from 'framer-motion'
import {
  DURATION,
  easeOutExpo,
  scrollReveal,
  useReducedMotion,
} from '~/lib/motion'

type IntrinsicTag = keyof JSX.IntrinsicElements

type RevealProps = {
  children: ReactNode
  className?: string
  delay?: number
  as?: IntrinsicTag
  amount?: number
  /**
   * Play forward only. The default is reversible — see the viewport note
   * below — and this exists for the rare block that must not move again
   * once it has been read.
   */
  once?: boolean
}

// Reduced-motion variant — visible immediately, no transform.
const reducedVariants: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
}

export function Reveal({
  children,
  className,
  delay = 0,
  as = 'div',
  // 0.15 rather than 0.3 because the reveal now plays in both directions:
  // a section taller than three viewports can never show 30% of itself at
  // once, and a threshold it cannot meet is a section that never arrives.
  amount = 0.15,
  once = false,
}: RevealProps) {
  const reduced = useReducedMotion()

  // Merge per-instance delay into the shared variant. Re-creating the
  // variant object is cheap; doing it inline keeps the API ergonomic.
  const variants: Variants = reduced
    ? reducedVariants
    : {
        hidden: scrollReveal.hidden,
        visible: {
          ...(scrollReveal.visible as object),
          transition: {
            duration: DURATION.reveal,
            ease: easeOutExpo,
            delay,
          },
        },
      }

  // Framer's motion proxy is typed as having every HTML element. We index
  // it dynamically here; the cast is contained to a single line.
  const MotionTag = motion[as as 'div'] as typeof motion.div

  return (
    <MotionTag
      className={className}
      // Framer writes the hidden variant into the SSR markup, so without
      // this hook the section ships as opacity:0 and never comes back when
      // JavaScript is off. See NO_JS_REVEAL_CSS in routes/__root.tsx.
      data-reveal
      variants={variants}
      initial="hidden"
      whileInView="visible"
      // ONCE PER DIRECTION, REVERSIBLE. Leaving the viewport returns the
      // block to its start state, so scrolling back up plays the reveal
      // backwards instead of leaving a trail of already-spent sections.
      // The page reads the same travelling in either direction, which is
      // the same property the scrubbed scenes have by construction.
      viewport={{ once, amount, margin: '-10%' }}
    >
      {children}
    </MotionTag>
  )
}
