"use client"

import { motion } from 'framer-motion'
import { useRef } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

export default function HowItWorksSection() {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.firstElementChild?.clientWidth || 300
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' })
    }
  }

  const steps = [
    {
      number: "1",
      title: "Créez le projet de votre client",
      description: "Un dossier dédié par chantier : regroupez devis, factures et documents d'un même client. Tout est centralisé.",
      screenshotNote: "Page /dashboard/projects avec quelques cartes projets"
    },
    {
      number: "2",
      title: "Rédigez votre devis en temps réel",
      description: "Éditeur avec aperçu live : totaux et TVA se calculent seuls pendant que vous saisissez. Cinq modèles pros prêts à imprimer.",
      screenshotNote: "L'éditeur de devis avec preview à droite"
    },
    {
      number: "3",
      title: "Envoyez et suivez en direct",
      description: "Le client reçoit un lien privé par email : suivez en direct l'ouverture, la consultation et l'acceptation de votre devis.",
      screenshotNote: "Page détail devis avec statuts \"Consulté\", \"Accepté\""
    },
    {
      number: "4",
      title: "La facture naît automatiquement",
      description: "Dès l'acceptation du devis, la facture est générée seule avec la même numérotation et les mêmes infos. Zéro double saisie.",
      screenshotNote: "Page détail facture avec le lien vers le devis parent"
    },
    {
      number: "5",
      title: "Échelonnez le paiement",
      description: "Acompte 30 %, mi-parcours 40 %, solde 30 % : chaque facture est générée à la date prévue, sans que vous ayez à y penser.",
      screenshotNote: "Timeline échéancier avec les 3 tranches"
    },
    {
      number: "6",
      title: "Encaissez sans relancer",
      description: "Retards détectés seuls, alertes avant échéance et vue des encaissements : Sharaco suit tout, jusqu'au dernier centime.",
      screenshotNote: ""
    }
  ]

  return (
    <section className="relative bg-white dark:bg-slate-950 pt-40 pb-32 overflow-hidden">
      {/* Seamless Gradient Transition from FeaturesGrid */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-[#92C7FE] to-white dark:from-[#0B172E] dark:to-slate-950 pointer-events-none" />

      {/* Background Decorative Mesh (Subtle) */}
      <div className="absolute inset-0 hidden dark:block -z-10 opacity-30">
        <div className="absolute top-[40%] right-[10%] w-[30%] h-[30%] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="max-w-3xl mb-16 md:mb-24">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6"
          >
            Comment ça marche
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg md:text-xl text-slate-600 dark:text-slate-400"
          >
            Du projet à l'encaissement, <span className="text-blue-600 dark:text-blue-500 font-semibold">en 6 étapes </span>
             Un workflow complet qui s'adapte à votre façon de travailler.
          </motion.p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Scrollable area */}
          <div 
            ref={scrollRef}
            className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-0 pb-8"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {steps.map((step, idx) => (
              <div 
                key={idx} 
                className="snap-start shrink-0 w-[85vw] md:w-[50vw] lg:w-[25%] flex flex-col pr-8 md:pr-16 relative group"
              >
                {/* Vertical Separator */}
                {idx !== steps.length - 1 && (
                  <div className="hidden md:block absolute right-4 md:right-8 top-6 bottom-4 w-px bg-slate-200 dark:bg-slate-800 transition-colors" />
                )}

                {/* Big Number */}
                <div className="text-[3rem] md:text-[5rem] leading-none font-medium text-[#c6d2f5]/70 mb-6 font-sans tracking-tighter">
                  {step.number}
                </div>
                
                {/* Title */}
                <h3 className="text-xl md:text-xl font-bold text-[#0B172E] dark:text-white mb-4">
                  {step.title}
                </h3>
                
                {/* Description */}
                <p className="text-slate-600 dark:text-slate-400 text-base md:text-md leading-relaxed flex-grow">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center justify-end gap-3 mt-8">
            <button 
              onClick={() => scroll('left')}
              className="p-3 rounded-full border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all"
              aria-label="Précédent"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-3 rounded-full border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800 transition-all"
              aria-label="Suivant"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

      </div>

      {/* Global styles for hiding scrollbar */}
      <style dangerouslySetInnerHTML={{__html: `
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}} />
    </section>
  )
}
