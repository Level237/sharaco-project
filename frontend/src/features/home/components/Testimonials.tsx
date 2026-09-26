"use client"

export default function Testimonials() {
  return (
    <section className=" md:py-24 max-w-5xl mx-auto px-4 relative z-10">
      <div className="relative flex flex-col md:flex-row items-center justify-center min-h-[460px] gap-8 md:gap-0">
        {/* Left Card (Tilted Left) */}
        <div className="w-full max-w-sm md:w-[340px] md:absolute md:-left-4 lg:left-8 md:top-8 z-10 transform md:-rotate-6 transition-all duration-500 hover:md:-rotate-2 hover:scale-105 hover:z-30">
          <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center h-full">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-bold text-white shadow-lg shadow-emerald-500/20 mb-6">
              TL
            </div>
            <p className="text-slate-200 font-medium text-lg leading-relaxed mb-6">
              "Je gagne 5 heures par semaine sur mes devis. Sharaco a totalement transformé notre process de vente."
            </p>
            <div className="mt-auto pt-4 border-t border-white/10 w-full flex items-center justify-between text-xs text-slate-400 font-medium">
              <span className="font-bold text-slate-200">Thomas L.</span>
              <span className="text-emerald-400 font-semibold">CEO @ WebTech</span>
            </div>
          </div>
        </div>

        {/* Center Card (Front & Center) */}
        <div className="w-full max-w-sm md:w-[360px] relative z-20 transform md:scale-105 transition-all duration-500 hover:scale-110">
          <div className="absolute -inset-2 bg-gradient-to-r from-sky-500/30 to-indigo-500/30 rounded-3xl blur-xl opacity-60 -z-10" />
          <div className="bg-[#0f0f11]/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center h-full">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-sky-500/30 mb-6">
              MD
            </div>
            <p className="text-white font-medium text-xl leading-relaxed mb-6">
              "Une interface d'une fluidité incroyable. Nos clients sont bluffés par le design interactif de nos devis."
            </p>
            <div className="mt-auto pt-4 border-t border-white/10 w-full flex items-center justify-between text-xs text-slate-400 font-medium">
              <span className="font-bold text-white">Marc D.</span>
              <span className="text-sky-400 font-semibold">Directeur Commercial</span>
            </div>
          </div>
        </div>

        {/* Right Card (Tilted Right) */}
        <div className="w-full max-w-sm md:w-[340px] md:absolute md:-right-4 lg:right-8 md:top-8 z-10 transform md:rotate-6 transition-all duration-500 hover:md:rotate-2 hover:scale-105 hover:z-30">
          <div className="bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center h-full">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center font-bold text-white shadow-lg shadow-amber-500/20 mb-6">
              SM
            </div>
            <p className="text-slate-200 font-medium text-lg leading-relaxed mb-6">
              "Mon taux de conversion a bondi de 30% en deux mois grâce aux relances automatiques."
            </p>
            <div className="mt-auto pt-4 border-t border-white/10 w-full flex items-center justify-between text-xs text-slate-400 font-medium">
              <span className="font-bold text-slate-200">Sarah M.</span>
              <span className="text-amber-400 font-semibold">Consultante Freelance</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
