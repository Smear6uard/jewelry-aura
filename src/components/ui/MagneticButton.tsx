/**
 * components/ui/MagneticButton.tsx
 *
 * Cursor-attracted button used by the legacy footer/CTA surfaces. Lives
 * in `ui/` because it is a primitive — not tied to any one section. The
 * new hero CTAs intentionally do NOT use this; magnetic attraction reads
 * "loud" and the rebuilt hero leans on quieter typographic hierarchy.
 *
 * Extracted from the previous components/Hero.tsx during the hero
 * rebuild so the old Hero file can be deleted without breaking the
 * footer's "Call Now" CTA or the legacy nav (still imported by
 * routes/index.tsx until those surfaces are rebuilt in later prompts).
 */

import { useCallback, useRef } from 'react'
import { m as motion, useMotionValue, useSpring } from 'framer-motion'

type MagneticButtonProps = {
  children: React.ReactNode
  className?: string
  as?: 'button' | 'a'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- legacy passthrough; rebuilt buttons in later prompts will type this strictly.
  [key: string]: any
}

export function MagneticButton({
  children,
  className = '',
  as: Tag = 'button',
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 300, damping: 20 })
  const springY = useSpring(y, { stiffness: 300, damping: 20 })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.25
      const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.25
      x.set(dx)
      y.set(dy)
    },
    [x, y],
  )

  const handleMouseLeave = useCallback(() => {
    x.set(0)
    y.set(0)
  }, [x, y])

  const MotionTag = Tag === 'a' ? motion.a : motion.button

  return (
    <MotionTag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- ref is intentionally typed loosely so the same component can host either element.
      ref={ref as any}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className={className}
      {...props}
    >
      {children}
    </MotionTag>
  )
}
