"use client"

import Image from "next/image"
import { useRef, useState } from "react"

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
  },
]

export default function FeaturesGrid() {
  const scroller = useRef<HTMLDivElement>(null)
  const frame = useRef(0)
  const [active, setActive] = useState(0)

  const syncActive = () => {
    const el = scroller.current
    if (!el || el.clientWidth >= el.scrollWidth - 8) return
    const cards = el.querySelectorAll<HTMLElement>("[data-feature]")
    const center = el.scrollLeft + el.clientWidth / 2
    let next = 0
    let best = Number.POSITIVE_INFINITY
    cards.forEach((card, index) => {
      const mid = card.offsetLeft + card.offsetWidth / 2
      const distance = Math.abs(mid - center)
      if (distance < best) {
        best = distance
        next = index
      }
    })
    setActive(next)
  }

  const onScroll = () => {
    cancelAnimationFrame(frame.current)
    frame.current = requestAnimationFrame(syncActive)
  }

  const goTo = (index: number) => {
    const el = scroller.current
    const card = el?.querySelectorAll<HTMLElement>("[data-feature]")[index]
    if (!el || !card) return
    const left = card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2
    el.scrollTo({ left, behavior: "smooth" })
  }

  return (
    <section id="fonctionnalites" className="relative overflow-hidden bg-[#0c0c0f] py-16 sm:py-24">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0a0a0a] to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-slate-950 to-transparent" />

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-12">
          <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-4xl">
            Tout ce qu&apos;il vous faut pour facturer sereinement
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate-400 sm:text-base">
            De la création du devis jusqu&apos;au paiement final, on s&apos;occupe de la paperasse.
          </p>
        </div>

        <div
          ref={scroller}
          onScroll={onScroll}
          className="hide-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto px-4 pb-1 sm:gap-4 lg:mx-0 lg:grid lg:grid-cols-2 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0"
        >
          {features.map((feature) => (
            <article
              key={feature.title}
              data-feature
              className="flex w-[min(78vw,300px)] shrink-0 snap-center flex-col border border-white/10 bg-[#111113] sm:w-[320px] lg:w-auto lg:flex-row lg:items-center"
            >
              <div className="relative aspect-[16/9] shrink-0 overflow-hidden border-b border-white/5 bg-black/30 lg:aspect-[5/4] lg:w-[42%] lg:border-b-0 lg:border-r">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  sizes="(min-width: 1024px) 280px, 78vw"
                  className="object-contain p-3"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-center px-4 py-3.5 text-left lg:px-5 lg:py-5">
                <h3 className="line-clamp-2 text-base font-semibold leading-snug tracking-tight text-white">
                  {feature.title}
                </h3>
                <p className="mt-1.5 line-clamp-3 text-sm leading-relaxed text-slate-400 lg:line-clamp-4">
                  {feature.description}
                </p>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-center gap-1.5 lg:hidden" role="tablist" aria-label="Fonctionnalités">
          {features.map((feature, index) => (
            <button
              key={feature.title}
              type="button"
              role="tab"
              aria-selected={index === active}
              aria-label={feature.title}
              onClick={() => goTo(index)}
              className={`h-1 transition-[width,background-color] duration-200 ease-out ${
                index === active ? "w-6 bg-[#2563EB]" : "w-1.5 bg-white/25"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
