// features/home/components/PainPointsSection.tsx
// Server component : aucune interactivité requise → pas de "use client" (perf ⚡)

import Link from 'next/link'
import { Clock, BellOff, EyeOff, FileWarning, ArrowDown, TrendingDown, AlertTriangle } from 'lucide-react'

interface PainPoint {
  icon: typeof Clock
  title: string
  description: string
  cost: string
}

// ⚠️ Vérifie/ajuste le "48%" avec une source solide (études BTP/services le citent souvent).
// Un chiffre citable > un chiffre rond.
const PAIN_POINTS: PainPoint[] = [
  {
    icon: Clock,
    title: '2 heures perdues par devis',
    description: 'Mise en page, alignements, totaux recalculés à la main… pour un document identique à 90 % au précédent.',
    cost: '≈ 100 € de temps non facturé',
  },
  {
    icon: BellOff,
    title: 'Et les relances ? On oublie.',
    description: 'Le devis parti, on enchaîne sur le dossier suivant. Sans relance, vos propositions dorment dans les boîtes mail.',
    cost: '48 % des devis ne sont jamais relancés',
  },
  {
    icon: EyeOff,
    title: "Zéro visibilité après l'envoi",
    description: 'A-t-il ouvert ? A-t-il transféré à son associé ? Aucune donnée, aucune alerte. Vous relancez à l’aveugle, au pire moment.',
    cost: '0 suivi natif dans un e-mail',
  },
  {
    icon: FileWarning,
    title: 'devis_final_V7_corrigé(2).docx',
    description: 'Les versions se multiplient, les remises se mélangent, et le client finit par recevoir… l’ancienne version.',
    cost: '1 erreur de version = confiance entamée',
  },
]

export default function PainPointsSection() {
  return (
    <section id="pain" className="relative py-24 lg:py-32">
      {/* Fond en rupture douce avec le hero */}
      <div className="absolute inset-0 -z-10 bg-slate-50/60 dark:bg-slate-900/40" />
      <div className="absolute inset-x-0 top-0 -z-10 h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-slate-800 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
       <div className="mx-auto max-w-3xl text-center">
  <p className="text-xs font-bold uppercase tracking-[0.2em] text-rose-500 dark:text-rose-400">
    Le constat
  </p>
  <h2 className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white">
    Le vrai coût de vos devis
  </h2>
  <p className="mt-6 text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
    Le devis lui-même ? 15 minutes. Mais entre les mises en page, les relances
    oubliées et les versions perdues, c&apos;est tout le reste qui vous coûte
    de l&apos;argent. Vous vivez probablement l&apos;un de ces quatre scénarios.
  </p>
</div>

        {/* Grille des douleurs */}
        <div className="mt-16 grid gap-6 sm:grid-cols-4">
          {PAIN_POINTS.map((pain) => (
            <article
              key={pain.title}
              className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-7 sm:p-8 transition-all duration-300 hover:-translate-y-1 hover:border-rose-300 dark:hover:border-rose-500/40 hover:shadow-xl hover:shadow-rose-500/5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 dark:text-rose-400">
                <pain.icon className="h-5.5 w-5.5" strokeWidth={1.8} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-slate-900 dark:text-white break-words">
                {pain.title}
              </h3>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
                {pain.description}
              </p>

              {/* Le coût — c'est LUI qui pique */}
              <div className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-3 py-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-3.5 w-3.5" />
                {pain.cost}
              </div>
            </article>
          ))}
        </div>

        {/* Agitation finale : le calcul qui fait mal */}
        <div className="mt-16 overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 dark:bg-black/60 p-8 sm:p-12 shadow-2xl">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8 lg:gap-12">
            <div className="flex-1">
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-rose-400">
                <TrendingDown className="h-4 w-4" />
                Le calcul qui fait mal
              </p>
              <p className="mt-4 text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-snug">
                10 devis/mois × 2 heures ={' '}
                <span className="text-rose-400">20 heures perdues</span>.
                <span className="block mt-2 text-slate-300 text-lg sm:text-xl">
                  Soit <span className="font-bold text-white">6 semaines de chiffre d&apos;affaires</span> évaporées sur une année.
                </span>
              </p>
            </div>

            {/* Pivot vers la solution */}
            <div className="shrink-0">
              <a
                href="#solution"
                className="group inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-base font-bold text-slate-900 transition-all hover:scale-[1.03] active:scale-95 shadow-xl"
              >
                Et si on réglait ça ?
                <ArrowDown className="h-5 w-5 group-hover:translate-y-1 transition-transform" />
              </a>
              <p className="mt-3 text-center text-xs text-slate-400 font-medium lg:text-left">
                La réponse tient en 2 minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}