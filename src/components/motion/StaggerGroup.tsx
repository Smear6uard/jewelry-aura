/**
 * components/motion/StaggerGroup.tsx
 *
 * Parent wrapper that orchestrates a stagger over its motion children on
 * viewport entry. Used for service cards, custom-pieces grid, stat blocks
 * — anywhere a series of siblings should reveal in rhythm.
 *
 * Children should be motion components (motion.div, motion.li, etc.)
 * declaring `variants={fadeUp}` (or any variant with `hidden`/`visible`
 * states). This parent dictates the timing; children dictate the motion.
 *
 * Reduced-motion collapses the stagger to zero so children appear together
 * without any sequencing delay.
 */

import type { ReactNode } from 'react'
import { m as motion, type Variants } from 'framer-motion'
import { STAGGER, useReducedMotion } from '~/lib/motion'

type StaggerGroupProps = {
  children: ReactNode
  className?: string
  stagger?: 'tight' | 'default' | 'loose'
  delay?: number
}

export function StaggerGroup({
  children,
  className,
  stagger = 'default',
  delay = 0,
}: StaggerGroupProps) {
  const reduced = useReducedMotion()

  const variants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: reduced ? 0 : STAGGER[stagger],
        delayChildren: reduced ? 0 : delay,
      },
    },
  }

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2, margin: '-10%' }}
    >
      {children}
    </motion.div>
  )
}
