import { useRef, useCallback } from 'react'
import { motion, useScroll, useTransform, useMotionValue, useSpring } from 'framer-motion'
import { Sparkles, ArrowRight, ChevronDown } from 'lucide-react'

// ═══════════════════════════════════════════
// SHARED UI
// ═══════════════════════════════════════════

export function MagneticButton({
  children,
  className = '',
  as: Tag = 'button',
  ...props
}: {
  children: React.ReactNode
  className?: string
  as?: 'button' | 'a'
  [key: string]: any
}) {
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

// Deterministic particle positions to avoid SSR hydration mismatch
const PARTICLE_DATA = [
  { x: 5, y: 12, size: 2, dur: 9, del: 0.5 },
  { x: 15, y: 68, size: 1.5, dur: 11, del: 1.2 },
  { x: 23, y: 35, size: 3, dur: 7, del: 0.8 },
  { x: 32, y: 88, size: 1.2, dur: 13, del: 2.1 },
  { x: 41, y: 22, size: 2.5, dur: 8, del: 0.3 },
  { x: 48, y: 55, size: 1.8, dur: 10, del: 1.7 },
  { x: 56, y: 78, size: 2.2, dur: 12, del: 3.0 },
  { x: 63, y: 15, size: 1.3, dur: 9, del: 0.9 },
  { x: 72, y: 42, size: 2.8, dur: 7, del: 2.5 },
  { x: 78, y: 91, size: 1.6, dur: 11, del: 1.4 },
  { x: 85, y: 28, size: 2.1, dur: 14, del: 3.5 },
  { x: 91, y: 65, size: 1.4, dur: 8, del: 0.6 },
  { x: 8, y: 48, size: 2.6, dur: 10, del: 2.8 },
  { x: 37, y: 72, size: 1.1, dur: 12, del: 1.0 },
  { x: 68, y: 8, size: 3.2, dur: 9, del: 3.8 },
  { x: 52, y: 95, size: 1.7, dur: 11, del: 0.2 },
]

export function GoldParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-[5]">
      {PARTICLE_DATA.map((p, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-[#D4AF37]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: [0, -60, -20, -80, 0],
            x: [0, 15, -10, 20, 0],
            opacity: [0, 0.6, 0.3, 0.7, 0],
          }}
          transition={{
            duration: p.dur,
            delay: p.del,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

// ═══════════════════════════════════════════
// HERO COMPONENT
// ═══════════════════════════════════════════

export function Hero() {
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 800], [0, 150])
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0])
  const imageScale = useTransform(scrollY, [0, 800], [1, 1.15])

  return (
    <section className="relative h-svh min-h-[700px] flex items-center overflow-hidden">
      {/* Background Video with parallax */}
      <motion.div
        style={{ y: heroY, scale: imageScale }}
        className="absolute inset-0 z-0"
      >
        <video
          autoPlay
          loop
          muted
          playsInline
          src="/Landing_Page_Video_Generation.mp4"
          className="w-full h-full object-cover opacity-60"
        />
      </motion.div>

      {/* Layered gradients for depth */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/85 to-[#0A0A0A]/40 z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-[#0A0A0A]/30 z-[2]" />

      {/* Gold particles */}
      <GoldParticles />

      {/* Decorative gold line — left edge */}
      <div className="hidden lg:block absolute left-12 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/30 to-transparent z-10" />

      {/* Main content */}
      <motion.div
        style={{ opacity: heroOpacity }}
        className="container mx-auto px-5 md:px-12 relative z-20"
      >
        <div className="max-w-3xl backdrop-blur-md bg-[#0A0A0A]/40 border border-[#D4AF37]/20 p-8 md:p-12 rounded-3xl shadow-2xl">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="hero-accent-bar w-8 h-[1px] bg-[#D4AF37]" />
            <span className="text-[#D4AF37] uppercase tracking-[0.35em] text-[11px] md:text-xs font-sans font-semibold">
              Our Studio
            </span>
          </motion.div>

          {/* Headline — staggered word reveal */}
          <h1 className="text-[clamp(3rem,8vw,6rem)] font-serif leading-[1.05] mb-8 font-medium">
            <motion.span
              initial={{ opacity: 0, y: 40, clipPath: 'inset(100% 0 0 0)' }}
              animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' }}
              transition={{
                duration: 1,
                delay: 0.5,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="block"
            >
              Crafting
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40, clipPath: 'inset(100% 0 0 0)' }}
              animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' }}
              transition={{
                duration: 1,
                delay: 0.7,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="block italic text-[#D4AF37] drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]"
            >
              Elegance.
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 40, clipPath: 'inset(100% 0 0 0)' }}
              animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)' }}
              transition={{
                duration: 1,
                delay: 0.9,
                ease: [0.25, 0.46, 0.45, 0.94],
              }}
              className="block"
            >
              Defining You.
            </motion.span>
          </h1>

          {/* Subtext */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2, delay: 1.3 }}
            className="text-gray-300 max-w-md text-sm md:text-base tracking-wide leading-relaxed font-sans mb-12"
          >
            Experience affordable luxury. Discover exclusive custom pendants,
            masterful repairs, and brilliant diamonds — right in your community.
          </motion.p>

          {/* CTA row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.6 }}
            className="flex flex-col sm:flex-row items-start gap-4"
          >
            <MagneticButton
              as="a"
              href="#contact"
              className="relative overflow-hidden bg-gradient-to-r from-[#D4AF37] to-[#F9E29C] text-[#0A0A0A] px-10 py-4 rounded-full font-bold uppercase font-sans tracking-[0.18em] text-xs flex items-center gap-3 group cursor-pointer hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all duration-500"
            >
              {/* Subtle metallic shine overlay on hover */}
              <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
              <span className="z-10 relative">Start Your Custom Piece</span>
            </MagneticButton>
            <MagneticButton
              as="a"
              href="#gallery"
              className="border border-white/20 text-white px-10 py-4 rounded-full font-semibold uppercase font-sans tracking-[0.18em] text-xs flex items-center gap-3 group cursor-pointer hover:border-[#D4AF37]/60 hover:text-[#D4AF37] transition-all duration-300 bg-white/5 backdrop-blur-sm"
            >
              <span>View Gallery</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </MagneticButton>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] uppercase tracking-[0.3em] font-sans text-gray-400">
          Scroll
        </span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown className="w-4 h-4 text-[#D4AF37]" />
        </motion.div>
      </motion.div>
    </section>
  )
}
