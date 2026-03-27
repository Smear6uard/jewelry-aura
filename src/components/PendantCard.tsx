import { motion } from 'framer-motion'

interface PendantCardProps {
  name: string
  image: string
  spanClass: string
  delay?: number
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] as const },
  }),
}

export function PendantCard({ name, image, spanClass, delay = 0 }: PendantCardProps) {
  return (
    <motion.div
      variants={fadeUp}
      custom={delay}
      className={`relative overflow-hidden rounded-2xl md:rounded-3xl group ${spanClass} bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] border border-white/5 shadow-2xl`}
    >
      {/* Subtle interior gradient lighting mimicking a display case */}
      <div className="absolute inset-0 bg-radial-gradient from-white/5 to-transparent opacity-50 pointer-events-none" />

      {/* The isolated pendant image with CSS Filter to remove red background */}
      <img
        src={image}
        alt={name}
        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-105 mix-blend-lighten"
        style={{
          filter: 'grayscale(100%) contrast(1.2) brightness(0.9) drop-shadow(0 0 20px rgba(0,0,0,0.8))',
        }}
        loading="lazy"
      />

      {/* Shimmer Overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 group-hover:-translate-x-full transition-all duration-700 ease-in-out pointer-events-none transform translate-x-full mix-blend-overlay" />

      {/* Bottom gradient fade for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />

      {/* Text Area */}
      <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
        <div className="flex justify-between items-end w-full">
          <div>
            <h3 className="text-sm md:text-base font-sans text-white tracking-[0.2em] uppercase font-bold mb-1 opacity-90 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300 group-hover:text-[#D4AF37]">
              {name}
            </h3>
            <div className="w-0 h-0.5 bg-[#D4AF37] group-hover:w-8 transition-all duration-500 ease-out" />
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500 border border-white/10">
            {/* Thin industrial line icon replacing generic sparkle */}
            <svg
              className="w-4 h-4 text-[#D4AF37]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M12 4v16m8-8H4" />
            </svg>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
