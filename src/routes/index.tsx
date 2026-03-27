import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState, useCallback } from 'react'
import {
  motion,
  useScroll,
  useTransform,
  useInView,
  AnimatePresence,
  useMotionValue,
  useSpring,
} from 'framer-motion'
import {
  MapPin,
  Phone,
  Camera,
  ArrowRight,
  Clock,
  ShieldCheck,
  Diamond,
  Wrench,
  Menu,
  X,
  Star,
  ChevronDown,
} from 'lucide-react'
import Lenis from 'lenis'

import { Hero, MagneticButton } from '../components/Hero'
import { BentoGrid } from '../components/BentoGrid'

// ═══════════════════════════════════════════
// ROUTE CONFIG + SEO
// ═══════════════════════════════════════════

export const Route = createFileRoute('/')({
  component: LandingPage,
  head: () => ({
    meta: [
      { title: 'Jewelry Aura | Affordable Luxury in Norridge' },
      {
        name: 'description',
        content:
          'Experience affordable luxury at Jewelry Aura in Norridge, IL. Custom pendants, expert jewelry repair, watch repair, and high-end gold & diamonds.',
      },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'JewelryStore',
          name: 'Jewelry Aura',
          telephone: '630-965-6464',
          address: {
            '@type': 'PostalAddress',
            streetAddress: '4104 N Harlem Ave',
            addressLocality: 'Norridge',
            addressRegion: 'IL',
            postalCode: '60706',
            addressCountry: 'US',
          },
          openingHoursSpecification: [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
              ],
              opens: '10:00',
              closes: '18:00',
            },
          ],
          sameAs: ['https://instagram.com/Jewelryaura01'],
        }),
      },
    ],
  }),
})

// ═══════════════════════════════════════════
// ANIMATION VARIANTS
// ═══════════════════════════════════════════

const EASE_OUT: [number, number, number, number] = [0.25, 0.46, 0.45, 0.94]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: EASE_OUT },
  }),
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.7, delay, ease: EASE_OUT },
  }),
}

// ═══════════════════════════════════════════
// ANIMATED SECTION HEADING
// ═══════════════════════════════════════════

function SectionHeading({
  eyebrow,
  children,
  className = '',
}: {
  eyebrow: string
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <div ref={ref} className={`text-center mb-20 ${className}`}>
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6 }}
        className="text-[#D4AF37] text-xs uppercase tracking-[0.4em] font-sans font-semibold block mb-5"
      >
        {eyebrow}
      </motion.span>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="text-4xl md:text-5xl lg:text-6xl font-serif"
      >
        {children}
      </motion.h2>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={isInView ? { scaleX: 1 } : {}}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="gold-divider w-20 mx-auto mt-8"
      />
    </div>
  )
}

// ═══════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════

function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileOpen])

  const navLinks = [
    { label: 'Services', href: '#services' },
    { label: 'Aura Feed', href: '#aura' },
    { label: 'Visit', href: '#visit' },
  ]

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={`fixed top-0 w-full z-50 transition-all duration-700 ease-out ${
          scrolled
            ? 'bg-[#0A0A0A]/85 backdrop-blur-xl border-b border-[#D4AF37]/15 py-3'
            : 'bg-transparent py-5 md:py-6'
        }`}
      >
        <div className="container mx-auto px-5 md:px-12 flex justify-between items-center">
          {/* Logo */}
          <a href="#" className="flex items-center gap-1.5 group">
            <span className="text-xl md:text-2xl font-serif font-bold tracking-wider">
              Jewelry
            </span>
            <span className="text-xl md:text-2xl font-serif font-bold tracking-wider text-[#D4AF37]">
              Aura
            </span>
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="luxury-link text-xs tracking-[0.2em] uppercase font-medium text-gray-300 hover:text-[#D4AF37] transition-colors duration-300"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <MagneticButton className="gold-shimmer bg-[#D4AF37] text-[#0A0A0A] px-7 py-2.5 rounded-full font-semibold uppercase tracking-[0.15em] text-[11px] hover:bg-white transition-colors duration-300 flex items-center gap-2 group cursor-pointer">
              <span>Visit Shop</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </MagneticButton>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 text-white"
            aria-label="Open menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </motion.header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] mobile-menu-overlay"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="absolute right-0 top-0 h-full w-full max-w-sm bg-[#0A0A0A] border-l border-[#D4AF37]/15 flex flex-col"
            >
              <div className="flex justify-between items-center p-6 border-b border-white/5">
                <span className="font-serif text-lg tracking-wider">
                  Jewelry <span className="text-[#D4AF37]">Aura</span>
                </span>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2"
                  aria-label="Close menu"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
              <nav className="flex flex-col p-8 gap-1">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.label}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 + i * 0.08 }}
                    className="text-2xl font-serif py-4 border-b border-white/5 hover:text-[#D4AF37] transition-colors"
                  >
                    {link.label}
                  </motion.a>
                ))}
              </nav>
              <div className="mt-auto p-8 space-y-4">
                <a
                  href="tel:6309656464"
                  className="flex items-center gap-3 text-gray-400 hover:text-[#D4AF37] transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  <span className="text-sm tracking-wider">630-965-6464</span>
                </a>
                <a
                  href="https://instagram.com/Jewelryaura01"
                  className="flex items-center gap-3 text-gray-400 hover:text-[#D4AF37] transition-colors"
                >
                  <Camera className="w-4 h-4" />
                  <span className="text-sm tracking-wider">@Jewelryaura01</span>
                </a>
                <div className="flex items-start gap-3 text-gray-400 pt-2">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="text-sm tracking-wider leading-relaxed">
                    4104 N Harlem Ave
                    <br />
                    Norridge, IL 60706
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ═══════════════════════════════════════════
// SERVICES SECTION
// ═══════════════════════════════════════════

const services = [
  {
    title: 'Custom Pendants',
    desc: 'The centerpiece of expression. Masterfully crafted to your exact specifications with meticulous attention to every facet.',
    icon: Diamond,
    accent: 'from-[#D4AF37]/20 to-transparent',
  },
  {
    title: 'Jewelry Repair',
    desc: 'Trust-focused restoration. Breathing brilliant new life into your cherished heirlooms with master-level precision.',
    icon: Wrench,
    accent: 'from-[#D4AF37]/15 to-transparent',
  },
  {
    title: 'Watch Repair',
    desc: 'Precision-focused care. Expert servicing for modern, vintage, and luxury timepieces by certified horologists.',
    icon: Clock,
    accent: 'from-[#D4AF37]/15 to-transparent',
  },
  {
    title: 'Gold & Diamonds',
    desc: 'Luxury-focused selection. Highly curated, premium quality rings, chains, and loose stones at unmatched value.',
    icon: ShieldCheck,
    accent: 'from-[#D4AF37]/20 to-transparent',
  },
]

function Services() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section
      id="services"
      ref={ref}
      className="relative py-28 md:py-36 bg-[#0A0A0A] gold-radial"
    >
      {/* Subtle corner decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-[#D4AF37]/10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b border-r border-[#D4AF37]/10 pointer-events-none" />

      <div className="container mx-auto px-5 md:px-12 relative z-10">
        <SectionHeading eyebrow="Our Expertise">Services</SectionHeading>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 md:gap-6"
        >
          {services.map((service, idx) => {
            const Icon = service.icon
            return (
              <motion.div
                key={idx}
                variants={staggerItem}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="glass-panel glass-panel-hover service-card-glow p-7 md:p-8 rounded-2xl flex flex-col items-start group cursor-default"
              >
                {/* Icon with gradient bg */}
                <div
                  className={`bg-gradient-to-br ${service.accent} p-4 rounded-xl mb-7 border border-[#D4AF37]/10 group-hover:border-[#D4AF37]/30 transition-colors duration-500`}
                >
                  <Icon className="w-7 h-7 text-[#D4AF37]" />
                </div>
                <h3 className="text-lg md:text-xl font-serif mb-3 text-white tracking-wide">
                  {service.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed tracking-wide flex-1">
                  {service.desc}
                </p>
                <div className="mt-8 flex items-center text-[#D4AF37] text-[11px] uppercase tracking-[0.2em] font-semibold opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-1 group-hover:translate-y-0">
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════
// TRUST BANNER
// ═══════════════════════════════════════════

function TrustBanner() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-60px' })

  const stats = [
    { value: '15+', label: 'Years of Craft' },
    { value: '5,000+', label: 'Pieces Restored' },
    { value: '4.9', label: 'Google Rating', icon: Star },
    { value: '100%', label: 'Satisfaction' },
  ]

  return (
    <section ref={ref} className="py-16 md:py-20 bg-black/50 border-y border-white/5">
      <div className="container mx-auto px-5 md:px-12">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12"
        >
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              variants={staggerItem}
              className="text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-3xl md:text-4xl font-serif text-white">
                  {stat.value}
                </span>
                {stat.icon && (
                  <stat.icon className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]" />
                )}
              </div>
              <span className="text-[11px] uppercase tracking-[0.25em] text-gray-500 font-medium">
                {stat.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ═══════════════════════════════════════════


// ═══════════════════════════════════════════
// FOOTER / VISIT SECTION
// ═══════════════════════════════════════════

function Footer() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <footer
      id="visit"
      ref={ref}
      className="relative bg-[#0A0A0A] pt-28 md:pt-36 pb-10 overflow-hidden"
    >
      {/* Gold radial glow — top right */}
      <div className="absolute -top-40 -right-40 w-[700px] h-[700px] bg-[#D4AF37]/[0.03] rounded-full blur-[120px] pointer-events-none" />
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      <div className="container mx-auto px-5 md:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-24">
          {/* Left — CTA + Info */}
          <div>
            <motion.span
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={0}
              className="text-[#D4AF37] text-xs uppercase tracking-[0.4em] font-sans font-semibold block mb-5"
            >
              Visit Us
            </motion.span>
            <motion.h2
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={0.1}
              className="text-4xl md:text-6xl lg:text-7xl font-serif mb-8 leading-[1.1]"
            >
              Elevate Your
              <br />
              <span className="text-[#D4AF37] italic text-shadow-gold">
                Presence.
              </span>
            </motion.h2>
            <motion.p
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={0.2}
              className="text-gray-500 max-w-md text-base md:text-lg tracking-wide mb-12 leading-relaxed"
            >
              Visit our boutique in Norridge for a personalized consultation,
              completely tailored to your unique style.
            </motion.p>

            {/* Contact details */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              className="space-y-6 mb-12"
            >
              <motion.div
                variants={staggerItem}
                className="flex items-start gap-4 group"
              >
                <div className="w-10 h-10 rounded-full border border-[#D4AF37]/20 flex items-center justify-center shrink-0 group-hover:border-[#D4AF37]/50 transition-colors">
                  <MapPin className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="font-semibold text-white tracking-wider text-sm mb-1">
                    Our Location
                  </h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    4104 N Harlem Ave
                    <br />
                    Norridge, IL 60706
                  </p>
                </div>
              </motion.div>
              <motion.div
                variants={staggerItem}
                className="flex items-start gap-4 group"
              >
                <div className="w-10 h-10 rounded-full border border-[#D4AF37]/20 flex items-center justify-center shrink-0 group-hover:border-[#D4AF37]/50 transition-colors">
                  <Clock className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div>
                  <h4 className="font-semibold text-white tracking-wider text-sm mb-1">
                    Store Hours
                  </h4>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Mon – Sat: 10:00 AM – 6:00 PM
                    <br />
                    Sun: Closed
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* Call Now CTA */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate={isInView ? 'visible' : 'hidden'}
              custom={0.5}
            >
              <MagneticButton
                as="a"
                href="tel:6309656464"
                className="gold-shimmer inline-flex bg-[#D4AF37] text-[#0A0A0A] px-10 py-5 rounded-full font-bold uppercase tracking-[0.18em] text-xs items-center gap-3 hover:bg-white transition-colors duration-300 cursor-pointer animate-glow"
              >
                <Phone className="w-5 h-5" />
                <span>Call Now: 630-965-6464</span>
              </MagneticButton>
            </motion.div>
          </div>

          {/* Right — Map */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate={isInView ? 'visible' : 'hidden'}
            custom={0.3}
            className="h-[350px] md:h-[450px] lg:h-[580px] w-full rounded-2xl md:rounded-3xl overflow-hidden glass-panel relative group lg:mt-8"
          >
            <div className="absolute inset-0 bg-[#0A0A0A]/10 pointer-events-none z-10 group-hover:opacity-0 transition-opacity duration-700" />
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2966.86016187766!2d-87.809403823481!3d41.95992956030999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880fcb1ab8f51ab1%3A0xe5a3c0a52df2ed3b!2s4104%20N%20Harlem%20Ave%2C%20Norridge%2C%20IL%2060706!5e0!3m2!1sen!2sus!4v1700000000000!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{
                border: 0,
                filter:
                  'grayscale(100%) invert(92%) contrast(83%)',
              }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Jewelry Aura Location Map"
            />
            {/* Gold border accent on hover */}
            <div className="absolute inset-0 rounded-2xl md:rounded-3xl border border-[#D4AF37]/0 group-hover:border-[#D4AF37]/20 transition-all duration-700 pointer-events-none z-20" />
          </motion.div>
        </div>

        {/* Footer bottom */}
        <div className="gold-divider mb-8" />
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-[11px] text-gray-600 tracking-[0.15em] uppercase">
          <p>&copy; {new Date().getFullYear()} Jewelry Aura. All rights reserved.</p>
          <div className="flex items-center gap-8">
            <a href="#" className="luxury-link hover:text-gray-300 transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="luxury-link hover:text-gray-300 transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ═══════════════════════════════════════════
// LANDING PAGE — MAIN COMPOSITION
// ═══════════════════════════════════════════

function LandingPage() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.8,
      touchMultiplier: 1.5,
    })

    function raf(time: number) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }
    requestAnimationFrame(raf)

    return () => lenis.destroy()
  }, [])

  return (
    <div className="grain-overlay">
      <main className="bg-[#0A0A0A] text-white">
        <Navigation />
        <Hero />
        <BentoGrid />
        <Services />
        <TrustBanner />
        <Footer />
      </main>
    </div>
  )
}
