"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
const features = [
  {
    title: "Devis en quelques minutes",
    description:
      "Créez des devis professionnels avec l'éditeur en temps réel. Choisissez un modèle, personnalisez vos couleurs, envoyez en un clic.",
    image: "/img/illustration1.png",
  },
  {
    title: "Facturation automatique",
    description:
      "Devis accepté ? La facture est générée toute seule. Numérotation suivie, TVA calculée, zéro double saisie.",
    image: "/img/illustration2.png",
  },
  {
    title: "Échéanciers de paiement",
    description:
      "Divisez en tranches (30/40/30, 50/50…). Chaque échéance génère sa facture à la date prévue.",
    image: "/img/illustration4.png",
  },
  {
    title: "Suivi en temps réel",
    description:
      "Voyez quand votre client ouvre, consulte ou accepte votre devis. Relancez au bon moment, pas au hasard.",
    image: "/img/illustration1.png",
  },
  {
    title: "Relances anti-impayés",
    description:
      "Retards détectés automatiquement, alertes J-3 / J-1. Sharaco suit vos impayés pour vous.",
    image: "/img/illustration2.png",
  },
  {
    title: "Tableau de bord financier",
    description:
      "CA encaissé, encours, taux de conversion : pilotez votre trésorerie projet par projet.",
    image: "/img/illustration1.png",
  }
];

export default function FeaturesGrid() {
  return (
    <section id="fonctionnalites" className="relative py-24 mt-24 sm:py-32 bg-slate-50 dark:bg-[#0c0c0f] overflow-hidden transition-colors duration-300">
      {/* Gradient bleed top: blend from Hero (white) into this section */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white dark:from-[#0a0a0a] to-transparent pointer-events-none" />
      {/* Gradient bleed bottom: blend into HowItWorks (white) */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white dark:from-slate-950 to-transparent pointer-events-none" />


      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="mb-16 text-center max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Tout ce qu'il vous faut pour facturer sereinement
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            De la création du devis jusqu'au paiement final, on s'occupe de la paperasse. Vous vous concentrez sur votre métier.
          </p>
        </div>
        {/* 6 Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1, 
                type: "spring", 
                stiffness: 80, 
                damping: 20 
              }}
              className="group relative flex flex-col sm:flex-row items-center gap-8 p-8 sm:p-10 bg-white dark:bg-[#111113] rounded-xl border border-slate-100 dark:border-white/5 transition-colors duration-300"
            >
              {/* Liquid Glass Refraction Effect (Dark Mode only) */}
              <div className="absolute inset-0 rounded-xl border border-white/5 opacity-0 dark:opacity-100 pointer-events-none shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]" />

              {/* Image Container */}
              <div className="w-full sm:w-[45%] flex-shrink-0 relative aspect-[4/3] rounded-xl overflow-hidden  border border-slate-100 dark:border-white/5 flex items-center justify-center shadow-inner">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover sm:object-contain p-2  transition-transform duration-700 ease-out"
                />
              </div>

              {/* Text Content */}
              <div className="w-full sm:w-[55%] flex flex-col justify-center text-center sm:text-left relative z-10">
                <h3 className="text-[1.35rem] font-extrabold text-[#051945] dark:text-white tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-3 text-[1rem] leading-relaxed text-slate-600 dark:text-[#A1A1AA]">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
          
        </div>
      </div>
    </section>
  );
}
