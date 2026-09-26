"use client"

import * as React from "react"
import { Eye, Check, X, Sparkles, Layout as LayoutIcon, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useLayouts } from "@/features/templates/hooks/useTemplates"

import { useRouter } from "next/navigation"

interface TemplateSelectorProps {
    onSelect: (layoutId: string) => void
    onClose?: () => void
}

/**
 * Isolated Client Component for the Template Card to ensure high performance
 * and perpetual micro-interactions without parent re-renders.
 */
const TemplateCard = React.memo(({
    layout,
    onSelect,
    index
}: {
    layout: any
    onSelect: (id: string) => void
    index: number
}) => {
    const router = useRouter()

    return (
        <div
            
            className="group relative flex flex-col gap-3 sm:gap-4 md:gap-6"
        >
            {/* Visual Label (Above the card for Bento 2.0 style) */}
            <div className="flex items-center justify-between px-1 sm:px-2">
                <div className="flex flex-col min-w-0">
                    <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-sky-500 mb-0.5 sm:mb-1">
                        Layout Style
                    </span>
                    <h3 className="text-base sm:text-lg md:text-xl font-black tracking-tighter text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors duration-300 truncate">
                        {layout.name}
                    </h3>
                </div>
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl sm:rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center border border-slate-200/50 dark:border-white/5 shrink-0">
                    <LayoutIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 group-hover:text-sky-500 transition-colors" />
                </div>
            </div>

            {/* Premium Container Area */}
            <div className="relative w-full aspect-[3/4] rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-slate-200/50 dark:border-white/5 bg-white dark:bg-slate-950 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] dark:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] group-hover:shadow-2xl transition-all duration-500">
                {/* Perpetual Motion Background Glow */}
                <div
                    
                    className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-indigo-500/10 pointer-events-none"
                />

                <div className="absolute inset-2 sm:inset-3 md:inset-4 overflow-hidden border border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-black/20">
    <img
        src={`http://localhost:8000/api/v1/templates/${layout.id}/preview.png`}
        alt={`Template ${layout.name}`}
        className="w-full h-full object-cover"
        sizes="(max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1200px) 30vw, 22vw"
        // ✅ AJOUTS CLÉS
        loading={index < 2 ? "eager" : "lazy"}  // 2 premières prioritaires
        decoding="async"                         // ne bloque pas le main thread
        fetchPriority={index < 2 ? "high" : "low"}
    />
</div>

                {/* ✅ Hover Reveal Interface - responsive + touch-friendly */}
                <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-md opacity-0 group-hover:opacity-100 md:group-hover:opacity-100 transition-all duration-500 flex flex-col items-center justify-center p-3 sm:p-6 md:p-8 gap-2 sm:gap-3 md:gap-4 translate-y-4 group-hover:translate-y-0">
                    <div className="p-2.5 sm:p-3 md:p-4 rounded-full bg-white/10 border border-white/20 mb-1 sm:mb-2">
                        <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-sky-400" />
                    </div>

                    <p className="text-white text-center text-[11px] sm:text-sm font-medium max-w-[180px] sm:max-w-[200px] mb-2 sm:mb-4 line-clamp-2 sm:line-clamp-none">
                        {layout.description}
                    </p>

                    <div className="flex flex-col w-full gap-2 sm:gap-3">
                        <Button
                            onClick={() => onSelect(layout.id)}
                            className="w-full h-9 sm:h-10 md:h-12 bg-sky-500 hover:bg-sky-400 text-white text-xs sm:text-sm font-black rounded-xl sm:rounded-2xl shadow-lg shadow-sky-500/30 transition-all active:scale-95 group/btn"
                        >
                            <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
                            <span>Sélectionner</span>
                            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 ml-auto opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
                        </Button>
                        <Button
                            onClick={() => router.push(`/dashboard/templates/preview/${layout.id}`)}
                            variant="ghost"
                            className="w-full h-9 sm:h-10 md:h-12 text-white text-xs sm:text-sm hover:bg-white/10 font-bold rounded-xl sm:rounded-2xl transition-all"
                        >
                            <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" /> Preview
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
})

TemplateCard.displayName = "TemplateCard"

export function TemplateSelector({ onSelect, onClose }: TemplateSelectorProps) {
    const { data: layouts, isLoading, error } = useLayouts()

    return (
        <div className="fixed inset-0 z-[60] flex justify-center bg-slate-950/50 backdrop-blur-sm">
            {/* Main Scrollable Container */}
            <div className="w-full h-[100vh] overflow-y-auto overflow-x-hidden py-8 sm:py-12 md:py-24 px-3 sm:px-4 md:px-8">
                {/* ✅ Close Button - repositionné sur mobile */}
                {onClose && (
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        size="icon"
                        className="fixed top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 z-[70] h-10 w-10 sm:h-11 sm:w-11 md:h-12 md:w-12 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 transition-all active:scale-90"
                    >
                        <X className="h-5 w-5 sm:h-6 sm:w-6" />
                    </Button>
                )}

                {/* ✅ Container avec max-width au lieu de mx-44 */}
                <div className="mx-auto max-w-7xl flex flex-col gap-10 sm:gap-12 md:gap-16">
                    {/* Title Section - Responsive Typography */}
                    <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4 px-2">
                        <h2
                           
                            className="text-3xl sm:text-4xl md:text-3xl lg:text-4xl xl:text-6xl font-black tracking-tighter text-slate-900 dark:text-white leading-none max-w-4xl"
                        >
                            Choisissez votre <span className="text-sky-500">modèle.</span>
                        </h2>

                        <p
                            
                            className="text-slate-500 dark:text-slate-400 text-sm sm:text-base md:text-lg lg:text-md font-medium tracking-tight max-w-2xl"
                        >
                            Survolez un document pour le prévisualiser ou le sélectionner. Tous nos modèles sont optimisés pour l'impression.
                        </p>
                    </div>

                    {/* ✅ Grid - Responsive breakpoints */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6 md:gap-8 lg:gap-10 xl:gap-12">
                        {isLoading ? (
                            [...Array(8)].map((_, i) => (
                                <div key={i} className="space-y-3 sm:space-y-4 md:space-y-6">
                                    <div className="space-y-2">
                                        <Skeleton className="h-3 w-20 rounded-full" />
                                        <Skeleton className="h-6 sm:h-8 w-48 rounded-xl" />
                                    </div>
                                    <Skeleton className="w-full aspect-[3/4] rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem]" />
                                </div>
                            ))
                        ) : error ? (
                            <div
                               
                                className="col-span-full flex flex-col items-center justify-center py-12 sm:py-24 text-center gap-4 sm:gap-6 glass-dark rounded-2xl sm:rounded-[2rem] md:rounded-[3rem] p-6 sm:p-8 md:p-12"
                            >
                                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-2xl sm:rounded-3xl bg-rose-500/10 flex items-center justify-center">
                                    <X className="h-6 w-6 sm:h-8 sm:w-8 text-rose-500" />
                                </div>
                                <div className="space-y-2">
                                    <p className="text-white font-black text-xl sm:text-2xl tracking-tighter">Échec de la récupération</p>
                                    <p className="text-slate-400 font-medium text-sm sm:text-base">Nous n'avons pas pu charger les modèles de documents.</p>
                                </div>
                                <Button
                                    onClick={() => window.location.reload()}
                                    className="h-11 sm:h-12 px-6 sm:px-8 rounded-xl sm:rounded-2xl bg-white text-black font-black hover:bg-slate-200 transition-all active:scale-95"
                                >
                                    Réessayer
                                </Button>
                            </div>
                        ) : (
                            <div
                                initial="hidden"
                                animate="show"
                                variants={{
                                    show: {
                                        transition: {
                                            staggerChildren: 0.1
                                        }
                                    }
                                }}
                                className="contents"
                            >
                                {layouts?.map((layout, index) => (
                                    <TemplateCard
                                        key={layout.id}
                                        layout={layout}
                                        onSelect={onSelect}
                                        index={index}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Footer Tip */}
                    <div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="flex items-center justify-center gap-3 pt-6 sm:pt-8 pb-8 sm:pb-12"
                    >
                        <div className="h-px w-8 sm:w-12 bg-slate-200 dark:bg-white/10" />
                        <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-600">
                            Design Engine v2.0
                        </p>
                        <div className="h-px w-8 sm:w-12 bg-slate-200 dark:bg-white/10" />
                    </div>
                </div>
            </div>
        </div>
    )
}