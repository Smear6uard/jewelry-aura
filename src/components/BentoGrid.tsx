import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { PendantCard } from './PendantCard'

const products = [
  { 
    name: '23 / PRAYING HANDS', 
    image: '/IMG_3783.PNG', 
    spanClass: 'col-span-1 md:col-span-2 row-span-2' 
  },
  { 
    name: 'KBMO', 
    image: '/IMG_3784.PNG', 
    spanClass: 'col-span-1 row-span-1' 
  },
  { 
    name: 'QUEEN', 
    image: '/IMG_3785.PNG', 
    spanClass: 'col-span-1 row-span-1' 
  },
  { 
    name: 'ATDB', 
    image: '/IMG_3786.PNG', 
    spanClass: 'col-span-1 row-span-1' 
  },
  { 
    name: 'HRG', 
    image: '/IMG_3787.PNG', 
    spanClass: 'col-span-1 row-span-1' 
  },
]

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
}

export function BentoGrid() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="gallery" ref={ref} className="py-28 md:py-36 bg-[#0A0A0A] relative z-10">
      <div className="container mx-auto px-5 md:px-12">
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="text-[#D4AF37] text-xs uppercase tracking-[0.4em] font-sans font-semibold block mb-5"
          >
            The Gallery
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15 }}
            className="text-4xl md:text-5xl lg:text-6xl font-serif text-white uppercase tracking-wider"
          >
            Custom Pieces
          </motion.h2>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="gold-divider w-20 mx-auto mt-8 bg-[#D4AF37] h-[1px]"
          />
        </div>
        
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 auto-rows-[300px] md:auto-rows-[350px]"
        >
          {products.map((product, idx) => (
            <PendantCard
              key={idx}
              name={product.name}
              image={product.image}
              spanClass={product.spanClass}
              delay={idx * 0.1}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
