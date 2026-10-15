"use client"

import { motion } from 'framer-motion'
import { Sparkles, CheckCircle2, Zap, ArrowRight } from 'lucide-react'

export default function VideoShowcaseSection() {
  const highlights = [
    {
      icon: <Zap className="w-4.5 h-4.5 text-blue-500" />,
      title: "Création ultra-rapide",
      description: "Saisissez vos prestations ou laissez notre assistant structurer votre devis en quelques secondes."
    },
    {
      icon: <CheckCircle2 className="w-4.5 h-4.5 text-indigo-500" />,
      title: "Calculs automatiques sans erreur",
      description: "Totaux HT, TVA, réductions et calcul des acomptes gérés dynamiquement."
    },
    {
      icon: <Sparkles className="w-4.5 h-4.5 text-sky-500" />,
      title: "Design professionnel & sur-mesure",
      description: "Appliquez vos couleurs de marque, votre logo et choisissez parmi nos modèles modernes."
    }
  ]

  return (
    <section id="demo" className="relative bg-slate-950 py-20 md:py-32 overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 bg-blue-500/10 dark:bg-blue-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Video Container */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, type: "spring", damping: 25 }}
            className="w-full h-full flex flex-col justify-center"
          >
            <div className="relative hidden bg-slate-900/80 p-4 sm:p-6 md:p-7 rounded-xl border border-slate-800 shadow-2xl shadow-blue-500/5 group h-full flex-col justify-center sm:flex">
              {/* Decorative Corner Glow */}
              <div className="absolute -top-12 -left-12 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

              {/* Video Wrapper */}
              <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-lg sm:aspect-[16/11]">
                <video 
                  src="/video/video.mp4"
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover"
                />

                {/* Floating Live Badge */}
               
              </div>
            </div>
          </motion.div>

          {/* Right Column: Text & Features Content */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2, type: "spring", damping: 25 }}
            className="w-full flex flex-col justify-center py-2"
          >
            {/* Top Badge */}
            <div className="mb-5 inline-flex items-center gap-2 self-start rounded-full border border-blue-500/20 bg-blue-500/15 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-400">
              
              Génération Intelligente
            </div>

            {/* Headline */}
            <h2 className="mb-4 text-2xl font-extrabold leading-[1.18] tracking-tight text-white md:text-4xl lg:text-[2.5rem]">
              Passez de l&apos;idée au devis parfait en un instant.
            </h2>
            <div className="relative flex bg-slate-900/80 p-4 sm:p-6 md:p-7 rounded-xl border border-slate-800 shadow-2xl shadow-blue-500/5 group h-full flex-col justify-center sm:hidden">
              {/* Decorative Corner Glow */}
              <div className="absolute -top-12 -left-12 w-40 h-40 bg-blue-400/20 rounded-full blur-2xl pointer-events-none" />

              {/* Video Wrapper */}
              <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-lg sm:aspect-[16/11]">
                <video 
                  src="/video/video.mp4"
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover"
                />

                {/* Floating Live Badge */}
               
              </div>
            </div>
            {/* Subtext */}
            <p className="mb-6 text-base leading-relaxed text-slate-300">
              Transformez vos devis et factures en une expérience visuelle captivante. Donnez confiance à vos clients dès la première seconde.
            </p>

            {/* Highlights List */}
            <div className="space-y-4 mb-8">
             
            </div>

            {/* Call To Action Button */}
            <div className="flex items-center gap-4">
              <button className="px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold text-sm transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2 hover:gap-3 group">
                <span>Commencez gratuitement</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>

          </motion.div>

        </div>
      </div>
    </section>
  )
}
