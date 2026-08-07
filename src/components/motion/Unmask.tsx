/**
 * components/motion/Unmask.tsx — the image reveal.
 *
 * A photograph arrives out of its own frame rather than fading up. The
 * window is a static `overflow: hidden` box; the sheet inside it rises
 * from one full height below; the picture inside THAT counter-moves so it
 * lags the window instead of riding it. The pairing is what separates an
 * unmask from a slide — the frame uncovers the picture, and the picture
 * settles into place a beat behind.
 *
 * Two transforms and nothing else. No clip-path: it is not a compositor
 * property in every engine, and the rule for anything scroll-driven on
 * this site is transform and opacity only.
 *
 * The window must have a size of its own — an aspect ratio or a height —
 * because the sheet inside it is translated by a percentage of that
 * height. Pass the ratio through `className`.
 *
 * Reduced motion renders the frame and the picture in their final places
 * with no variants attached at all.
 */

import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { unmaskContent, unmaskSheet, useReducedMotion } from '~/lib/motion'

type UnmaskProps = {
  children: ReactNode
  /** Applied to the window. Give it the aspect ratio or the height. */
  className?: string
  /** Seconds of delay, for staggering an unmask against a headline. */
  delay?: number
  amount?: number
  once?: boolean
}

export function Unmask({
  children,
  className,
  delay = 0,
  amount = 0.15,
  once = false,
}: UnmaskProps) {
  const reduced = useReducedMotion()

  if (reduced) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      // Framer serialises the hidden variant into the SSR markup, so
      // without this the photograph ships translated off its own frame
      // and stays there when JavaScript is off. See NO_JS_REVEAL_CSS in
      // routes/__root.tsx.
      data-reveal
      className={className}
      style={{ overflow: 'hidden' }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount, margin: '-10%' }}
      transition={{ delayChildren: delay }}
    >
      {/*
       * The sheet clips too, and that is not belt-and-braces: the
       * picture inside it counter-moves by a fraction of a height, so a
       * sheet that did not clip would let that fraction of the picture
       * poke back into the window before its turn. The sheet's own box
       * is what guarantees "not yet".
       */}
      <motion.div
        variants={unmaskSheet}
        style={{ height: '100%', overflow: 'hidden', willChange: 'transform' }}
      >
        <motion.div
          variants={unmaskContent}
          style={{ height: '100%', willChange: 'transform' }}
        >
          {children}
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
