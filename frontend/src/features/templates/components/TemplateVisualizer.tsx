"use client"

import { useRouter } from "next/navigation"
import { ArrowLeft, Monitor, Smartphone, Tablet, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { LayoutPreview } from "./LayoutPreview"
import { useLayouts } from "../hooks/useTemplates"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
interface TemplateVisualizerProps {
    layoutId: string
    onSelect: (id: string) => void
}

export function TemplateVisualizer({ layoutId, onSelect }: TemplateVisualizerProps) {
    const router = useRouter()
    const { data: layouts } = useLayouts()
    const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop")

    const currentLayout = layouts?.find(l => l.id === layoutId)

    if (!currentLayout) return null

    const viewWidths = {
        desktop: "1000px",
        tablet: "768px",
        mobile: "375px"
    }

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[100] bg-slate-950 flex flex-col overflow-hidden mesh-gradient"
        >
            {/* Premium Glass Toolbar */}
            <div className="h-24 bg-white/5 backdrop-blur-3xl border-b border-white/5 flex items-center justify-between px-8 shrink-0 relative z-10">
                <div className="flex items-center gap-6">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => router.back()}
                        className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-white/10 active:scale-90 transition-all"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-500 mb-1">Previewing Mode</span>
                        <h1 className="text-xl font-black tracking-tighter text-white leading-none">{currentLayout.name}</h1>
                    </div>
                </div>

                {/* Intelligent View Switcher */}
                <div className="hidden md:flex items-center bg-black/40 rounded-2xl p-1.5 border border-white/10 shadow-2xl backdrop-blur-xl">
                    {(["desktop", "tablet", "mobile"] as const).map((mode) => (
                        <Button
                            key={mode}
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewMode(mode)}
                            className={cn(
                                "h-10 px-4 rounded-xl transition-all duration-300 font-bold text-xs",
                                viewMode === mode 
                                    ? "bg-white text-black shadow-lg" 
                                    : "text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {mode === "desktop" && <Monitor className="h-4 w-4 mr-2" />}
                            {mode === "tablet" && <Tablet className="h-4 w-4 mr-2" />}
                            {mode === "mobile" && <Smartphone className="h-4 w-4 mr-2" />}
                            <span className="capitalize">{mode}</span>
                        </Button>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <Button 
                        onClick={() => onSelect(layoutId)}
                        className="h-12 px-8 bg-sky-600 hover:bg-sky-500 text-white font-black rounded-2xl shadow-lg shadow-sky-500/30 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Check className="h-4 w-4" /> 
                        <span>Utiliser ce modèle</span>
                    </Button>
                </div>
            </div>

            {/* Cinematic Preview Area */}
            <div className="flex-1 overflow-auto p-12 md:p-20 flex justify-center items-start custom-scrollbar">
                <motion.div 
                    layout
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    style={{ 
                        width: viewWidths[viewMode],
                        aspectRatio: "1 / 1.414"
                    }}
                    className="relative"
                >
                    {/* Floating shadow effect */}
                    <div className="absolute inset-4 -bottom-12 bg-black/40 blur-[80px] rounded-full opacity-50" />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative h-full w-full bg-white shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] rounded-sm overflow-hidden border border-white/20"
                    >
                        <LayoutPreview 
                            layoutId={layoutId as any} 
                            className="w-full h-full cover border-0" 
                        />
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    )
}
