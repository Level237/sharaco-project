"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function CosmicCtaSection() {
  return (
    <section 
      className="relative w-full min-h-[550px] md:min-h-[990px] bg-cover bg-center bg-no-repeat   flex flex-col items-center justify-start text-center overflow-hidden"
      style={{ backgroundImage: "url('/img/bg.png')" }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-slate-950/20 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center pt-6 md:pt-12">
        {/* Title */}
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-8 max-w-4xl leading-tight drop-shadow-md"
        >
          Donnez une nouvelle dimension à vos devis &amp; factures.
        </motion.h2>

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <Link
            href="/register"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-white hover:bg-slate-100 text-slate-900 text-sm font-semibold rounded-full shadow-lg transition-colors"
          >
            Commencez gratuitement
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

