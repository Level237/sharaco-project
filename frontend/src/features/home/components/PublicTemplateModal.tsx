"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, ArrowRight, Layout as LayoutIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useLayouts } from "@/features/templates/hooks/useTemplates"

interface PublicTemplateModalProps {
    isOpen: boolean
    onClose: () => void
}

export function PublicTemplateModal({ isOpen, onClose }: PublicTemplateModalProps) {
    const { data: layouts, isLoading } = useLayouts()
    const router = useRouter()
    const [selectedId, setSelectedId] = React.useState<string | null>(null)

    if (!isOpen) return null

    const handleContinue = () => {
        if (selectedId) {
            router.push(`/signup?template=${selectedId}`)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-5xl overflow-hidden rounded-xl bg-white dark:bg-[#111113] shadow-2xl flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="relative z-10 px-6 sm:px-10 pt-8 pb-4 flex items-start justify-between shrink-0">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    Choisissez votre point de départ
                                </h2>
                                <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400 font-medium">
                                    Sélectionnez un modèle pour votre premier devis. Vous pourrez changer plus tard.
                                </p>
                            </div>
                            <button 
                                onClick={onClose}
                                className="h-10 w-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Templates List (Scrollable) */}
                        <div className="relative z-10 flex-1 overflow-y-auto px-6 sm:px-10 py-6">
                            {isLoading ? (
                                <div className="flex justify-center py-20">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-6">
                                    {layouts?.map((layout) => (
                                        <div
                                            key={layout.id}
                                            onClick={() => setSelectedId(layout.id)}
                                            className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                                                selectedId === layout.id 
                                                    ? "border-[#2563EB]" 
                                                    : "border-slate-200 dark:border-white/5 hover:border-[#2563EB]/50"
                                            }`}
                                        >
                                            {/* Preview Image */}
                                            <div className="aspect-[3/4] bg-slate-100 dark:bg-black/20 w-full relative">
                                                <img 
                                                    src={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/templates/${layout.id}/preview.png`}
                                                    alt={layout.name}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            </div>

                                            {/* Card Footer */}
                                            <div className={`absolute bottom-0 inset-x-0 p-4 backdrop-blur-md border-t transition-colors ${
                                                selectedId === layout.id 
                                                    ? "bg-[#2563EB] border-[#2563EB] text-white" 
                                                    : "bg-white/80 dark:bg-black/60 border-slate-200/50 dark:border-white/10 text-slate-900 dark:text-white"
                                            }`}>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h3 className="font-bold text-sm sm:text-base">{layout.name}</h3>
                                                        <p className={`text-xs mt-0.5 line-clamp-1 ${selectedId === layout.id ? 'text-blue-100' : 'text-slate-500 dark:text-slate-400'}`}>
                                                            {layout.description}
                                                        </p>
                                                    </div>
                                                    {selectedId === layout.id && (
                                                        <div className="h-8 w-8 rounded-full bg-white text-[#2563EB] flex items-center justify-center shrink-0">
                                                            <Check className="h-4 w-4 stroke-[3]" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="relative z-10 px-6 sm:px-10 py-5 bg-slate-50 dark:bg-black/20 border-t border-slate-200 dark:border-white/5 flex items-center justify-between shrink-0">
                            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
                                {selectedId ? "Excellent choix ! Passons à la suite." : "Sélectionnez un modèle pour continuer"}
                            </p>
                            <Button 
                                onClick={handleContinue}
                                disabled={!selectedId}
                                className={`w-full sm:w-auto h-12 px-8 rounded-xl font-bold text-base transition-all ${
                                    selectedId 
                                        ? "bg-[#2563EB] hover:bg-blue-700 text-white" 
                                        : "bg-slate-200 dark:bg-white/5 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                                }`}
                            >
                                Continuer avec ce modèle
                                <ArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
