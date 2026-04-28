/**
 * lib/lenis.ts — Lenis ↔ Framer Motion smooth-scroll integration
 *
 * ┌─ INSTALLATION ─────────────────────────────────────────────────────┐
 * │ Wrap the app at the root with <LenisProvider>. Recommended path:   │
 * │   src/routes/__root.tsx                                            │
 * │     import { LenisProvider } from '~/lib/lenis'                    │
 * │     ...                                                            │
 * │     <LenisProvider>                                                │
 * │       <Outlet />                                                   │
 * │     </LenisProvider>                                               │
 * │ Without this provider, scroll-bound animations downstream will     │
 * │ stutter — Framer Motion will be reading native scrollY while       │
 * │ Lenis is in the middle of smoothing it.                            │
 * └────────────────────────────────────────────────────────────────────┘
 *
 * Why Lenis exists alongside Framer:
 *   - Lenis intercepts wheel events and applies a smoothed scroll
 *     position to the window via requestAnimationFrame.
 *   - Framer Motion's `useScroll` reads `window.scrollY`, which IS the
 *     smoothed value — but the read happens on Framer's own RAF tick,
 *     which can land between Lenis ticks. The result is a 1-frame jitter
 *     on every scroll-bound animation.
 *   - Solution: subscribe directly to Lenis's `scroll` event and pipe
 *     the smoothed values into Framer motionValues. Components consume
 *     those motionValues with `useTransform` instead of `useScroll`.
 *
 * Why `syncTouch: false` (the Lenis default):
 *   - Touch devices already have native momentum scrolling that users
 *     are calibrated to. Layering Lenis's interpolation on top of that
 *     produces a draggy, double-smoothed feel. Stick with native on
 *     touch; smooth only the wheel.
 */

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import Lenis from 'lenis'
import { useMotionValue, type MotionValue } from 'framer-motion'

type LenisContextValue = {
  lenis: Lenis | null
  /** Smoothed scroll progress 0..1 across the full document. */
  scrollProgress: MotionValue<number>
}

const LenisContext = createContext<LenisContextValue | null>(null)

// Tuned exponential ease — drops to ~0 at t=1 with no overshoot. The
// constant 1.001 nudges the asymptote so the curve actually reaches 1.
const lenisEasing = (t: number): number => Math.min(1, 1.001 - Math.pow(2, -10 * t))

export function LenisProvider({ children }: { children: ReactNode }) {
  const scrollProgress = useMotionValue(0)
  const [lenis, setLenis] = useState<Lenis | null>(null)

  useEffect(() => {
    const instance = new Lenis({
      duration: 1.2,
      easing: lenisEasing,
      smoothWheel: true,
      // syncTouch defaults to false — see file header for the why.
    })

    const onScroll = ({ progress }: { progress: number }) => {
      scrollProgress.set(progress)
    }
    instance.on('scroll', onScroll)

    let frameId = 0
    const raf = (time: number) => {
      instance.raf(time)
      frameId = requestAnimationFrame(raf)
    }
    frameId = requestAnimationFrame(raf)

    setLenis(instance)

    return () => {
      cancelAnimationFrame(frameId)
      instance.off('scroll', onScroll)
      instance.destroy()
      setLenis(null)
    }
  }, [scrollProgress])

  const value = useMemo<LenisContextValue>(
    () => ({ lenis, scrollProgress }),
    [lenis, scrollProgress],
  )

  return createElement(LenisContext.Provider, { value }, children)
}

/** Returns the active Lenis instance, or null before mount / outside the provider. */
export function useLenis(): Lenis | null {
  const ctx = useContext(LenisContext)
  return ctx?.lenis ?? null
}

/**
 * Returns a Framer motionValue tracking Lenis's smoothed scroll progress
 * (0..1). Pass through `useTransform` to drive parallax, opacity fades,
 * scale tweens — anything previously driven by Framer's `useScroll`.
 *
 * Falls back to a static motionValue at 0 outside the provider so
 * components don't crash during SSR / before mount.
 */
export function useScrollProgress(): MotionValue<number> {
  const ctx = useContext(LenisContext)
  const fallback = useMotionValue(0)
  return ctx?.scrollProgress ?? fallback
}
