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
import { motion, type Variants } from 'framer-motion'
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
  amount = 0.3,
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
            duration: DURATION.content,
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
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount, margin: '-10%' }}
    >
      {children}
    </MotionTag>
  )
}
