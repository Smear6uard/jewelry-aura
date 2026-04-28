/**
 * components/motion/SplitText.tsx
 *
 * Signature display-text reveal: each word (or character) rises from a
 * clip-mask on a tight stagger. Used on every display headline across the
 * site — hero, section headers, custom-piece titles, process step labels.
 *
 * Imports tokens from ~/lib/motion. Do not duplicate easing or duration
 * values inside this file.
 *
 * Accessibility:
 *   - The full readable string is exposed once via aria-label on the
 *     wrapper element. Individual word/char spans are aria-hidden so
 *     screen readers read the sentence, not a stream of fragments.
 *   - prefers-reduced-motion collapses the per-word reveal to a single
 *     opacity fade with no transform.
 */

import { Fragment, createElement, useMemo, type JSX, type ReactElement } from 'react'
import { motion, type Variants } from 'framer-motion'
import {
  DURATION,
  STAGGER,
  easeOutExpo,
  splitWordChild,
  useReducedMotion,
} from '~/lib/motion'

// JSX.IntrinsicElements lookup — typed loosely on purpose; the wrapper
// just inherits the styling of whichever heading tag the consumer picks.
type IntrinsicTag = keyof JSX.IntrinsicElements

type SplitTextProps = {
  children: string
  as?: IntrinsicTag
  className?: string
  delay?: number
  splitBy?: 'word' | 'char'
  triggerOnce?: boolean
  viewport?: 'load' | 'scroll'
}

export function SplitText({
  children,
  as = 'h1',
  className,
  delay = 0,
  splitBy = 'word',
  triggerOnce = true,
  viewport = 'load',
}: SplitTextProps): ReactElement {
  const reduced = useReducedMotion()

  // Re-derive parent variants per-instance so `delay` propagates as
  // `delayChildren`. Cheaper than pulling in a context just for this.
  const parentVariants = useMemo<Variants>(
    () => ({
      hidden: {},
      visible: {
        transition: {
          staggerChildren: splitBy === 'char' ? STAGGER.tight / 2 : STAGGER.tight,
          delayChildren: delay,
        },
      },
    }),
    [delay, splitBy],
  )

  // ─── Reduced-motion fallback ──────────────────────────────────────────
  if (reduced) {
    return createElement(
      as,
      { className },
      <motion.span
        initial={{ opacity: 0 }}
        animate={viewport === 'load' ? { opacity: 1 } : undefined}
        whileInView={viewport === 'scroll' ? { opacity: 1 } : undefined}
        viewport={
          viewport === 'scroll' ? { once: triggerOnce, margin: '-10%' } : undefined
        }
        transition={{ duration: DURATION.micro, delay, ease: easeOutExpo }}
      >
        {children}
      </motion.span>,
    )
  }

  // ─── Split into renderable segments ───────────────────────────────────
  const segments: Array<{ text: string; isSpace: boolean }> =
    splitBy === 'word'
      ? children.split(/(\s+)/).map((piece) => ({
          text: piece,
          isSpace: /^\s+$/.test(piece),
        }))
      : Array.from(children).map((char) => ({
          text: char,
          isSpace: char === ' ',
        }))

  const motionProps =
    viewport === 'load'
      ? { initial: 'hidden' as const, animate: 'visible' as const }
      : {
          initial: 'hidden' as const,
          whileInView: 'visible' as const,
          viewport: { once: triggerOnce, margin: '-10%' },
        }

  const inner = (
    <motion.span
      aria-hidden
      variants={parentVariants}
      style={{ display: 'inline' }}
      {...motionProps}
    >
      {segments.map((seg, i) => {
        if (seg.isSpace) {
          // Preserve whitespace as a plain inline node so the browser can
          // line-wrap naturally. Wrapping spaces breaks justified flow.
          return <Fragment key={i}>{seg.text}</Fragment>
        }
        return (
          <span
            key={i}
            style={{
              display: 'inline-block',
              overflow: 'hidden',
              verticalAlign: 'bottom',
              lineHeight: 'inherit',
            }}
          >
            <motion.span
              variants={splitWordChild}
              style={{ display: 'inline-block', willChange: 'transform' }}
            >
              {seg.text}
            </motion.span>
          </span>
        )
      })}
    </motion.span>
  )

  return createElement(as, { className, 'aria-label': children }, inner)
}
