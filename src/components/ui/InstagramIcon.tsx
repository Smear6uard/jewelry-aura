/**
 * components/ui/InstagramIcon.tsx — thin-stroke Instagram glyph.
 *
 * lucide-react v1 dropped its brand icons, so this is drawn here to the
 * same specification as the functional icons in the chrome: currentColor,
 * 1.4 stroke, no fill. Rounded square, lens, flash dot.
 */

interface InstagramIconProps {
  size?: number
  className?: string
}

export function InstagramIcon({ size = 15, className }: InstagramIconProps) {
  return (
    <svg
      aria-hidden
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2.5" y="2.5" width="19" height="19" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.6" cy="6.4" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  )
}
