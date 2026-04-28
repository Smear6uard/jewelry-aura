/**
 * lib/motion.ts — Jewelry Aura motion system
 *
 * Single source of truth for every animated surface on the site. No
 * component invents its own easing, duration, or stagger value; everything
 * imports from here so the site has a coherent rhythm.
 *
 * Imported by:
 *   - components/motion/SplitText, Reveal, StaggerGroup (the primitives)
 *   - section components (hero, custom pieces grid, services, process)
 *   - any ad-hoc Framer transition that needs branded timing
 *
 * Design notes:
 *   - Bezier tuples are `readonly`. Framer Motion v12's BezierDefinition is
 *     itself `readonly [number, number, number, number]`, so the tuples
 *     drop straight into a transition without casting.
 *   - Durations are in seconds (Framer convention). The CSS-side mirror of
 *     these values lives in app.css under @theme as ms-suffixed variables.
 *   - All variant exports are individually named for tree-shaking. The
 *     EASE / DURATION / STAGGER objects exist for ergonomic ad-hoc use.
 */

import type { Variants } from 'framer-motion'
import { useReducedMotion as useFramerReducedMotion } from 'framer-motion'

// ─── Easing tokens ───────────────────────────────────────────────────────

export type CubicBezier = readonly [number, number, number, number]

/** Primary content reveal — strong settle, no overshoot. */
export const easeOutExpo: CubicBezier = [0.16, 1, 0.3, 1]

/** UI transitions and hover. The Apple-system curve. */
export const easeApple: CubicBezier = [0.32, 0.72, 0, 1]

/** Fast micro-interactions — acceleration is sharper than easeOutExpo. */
export const easeSharpOut: CubicBezier = [0.4, 0, 0.2, 1]

/** Symmetric two-way transitions. */
export const easeInOut: CubicBezier = [0.65, 0, 0.35, 1]

export const EASE = {
  outExpo: easeOutExpo,
  apple: easeApple,
  sharpOut: easeSharpOut,
  inOut: easeInOut,
} as const

// ─── Duration scale (seconds) ────────────────────────────────────────────

export const DURATION = {
  /** Color/opacity changes the user shouldn't notice timing on. */
  instant: 0.1,
  /** Buttons, links, cards. */
  hover: 0.18,
  /** Small UI shifts: dropdowns, tooltips. */
  micro: 0.3,
  /** Section content reveals. */
  content: 0.6,
  /** Hero element entries, large reveals. */
  hero: 0.9,
  /** Full-page transitions, hero on-load sequence. */
  page: 1.2,
} as const

export type DurationToken = keyof typeof DURATION

// ─── Stagger constants ───────────────────────────────────────────────────

export const STAGGER = {
  /** Letter / word splits. */
  tight: 0.04,
  /** Sibling cards, list items. */
  default: 0.08,
  /** Section-level child reveals. */
  loose: 0.12,
} as const

export type StaggerToken = keyof typeof STAGGER

// ─── Shared variants ─────────────────────────────────────────────────────

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.content, ease: easeOutExpo },
  },
}

export const fadeUpLarge: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.hero, ease: easeOutExpo },
  },
}

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: DURATION.content, ease: easeApple },
  },
}

export const staggerParent: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER.default,
      delayChildren: 0.1,
    },
  },
}

export const staggerParentTight: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER.tight,
      delayChildren: 0,
    },
  },
}

export const scrollReveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: DURATION.content, ease: easeOutExpo },
  },
}

// ─── Split-text variants (signature motion of the brand) ─────────────────

export const splitWordParent: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: STAGGER.tight,
      delayChildren: 0,
    },
  },
}

export const splitWordChild: Variants = {
  hidden: { opacity: 0, y: '100%' },
  visible: {
    opacity: 1,
    y: '0%',
    transition: { duration: DURATION.content, ease: easeOutExpo },
  },
}

// ─── Reduced-motion ──────────────────────────────────────────────────────
// Re-exported so every component imports motion concerns from a single path.

export const useReducedMotion = useFramerReducedMotion
