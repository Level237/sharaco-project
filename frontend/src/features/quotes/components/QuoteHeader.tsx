// features/quotes/components/QuoteHeader.tsx
"use client"

import { Plus, Search, Sparkles, CreditCard, Ban, FileCheck, Eye, FileText, LayoutGrid } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface QuoteHeaderProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusChange: (status: string) => void;
}

const statuses = [
    { id: "ALL", label: "Tous", icon: LayoutGrid, color: "text-slate-300", bg: "bg-slate-500/10" },
    { id: "ACCEPTED", label: "Accepté", icon: CreditCard, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { id: "REFUSED", label: "Refusé", icon: Ban, color: "text-rose-400", bg: "bg-rose-500/10" },
    { id: "SENT", label: "Envoyé", icon: FileCheck, color: "text-blue-400", bg: "bg-blue-500/10" },
    { id: "VIEWED", label: "Consulté", icon: Eye, color: "text-amber-400", bg: "bg-amber-500/10" },
    { id: "DRAFT", label: "Brouillon", icon: FileText, color: "text-slate-400", bg: "bg-slate-500/10" }
]

export function QuoteHeader({ searchQuery, onSearchChange, statusFilter, onStatusChange }: QuoteHeaderProps) {
    return (
        <div className="relative overflow-hidden p-4 sm:p-8 md:p-10 lg:p-14 flex flex-col items-center justify-center text-center shadow-sm w-full min-w-0">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[50%] -left-[10%] w-[50%] h-[150%] bg-blue-400/20 dark:bg-blue-400/10 blur-[100px] rounded-full mix-blend-overlay" />
                <div className="absolute -bottom-[50%] -right-[10%] w-[50%] h-[150%] bg-purple-400/20 dark:bg-purple-400/10 blur-[100px] rounded-full mix-blend-overlay" />
            </div>

            <div className="relative z-10 w-full min-w-0 max-w-3xl flex flex-col items-center">
                {/* ═══════════ TITRE ═══════════ */}
                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white mb-6 sm:mb-8 md:mb-10"
                >
                    Tous vos Devis
                </motion.h2>

                {/* ═══════════ BARRE DE RECHERCHE ═══════════ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full min-w-0 flex flex-col sm:flex-row gap-4 items-center"
                >
                    <div className="relative flex-1 w-full group">
                        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 md:pl-5 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Recherchez des devis, des clients..."
                            className="w-full h-12 sm:h-14 md:h-[60px] pl-10 sm:pl-12 md:pl-14 pr-4 sm:pr-6 bg-[#0a0a0a]/90 backdrop-blur-xl border border-slate-200/50 dark:border-white/10 rounded-lg sm:rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.2)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder:text-slate-500 font-medium text-sm sm:text-base"
                        />
                    </div>
                </motion.div>

                {/* ═══════════ FILTRES (scrollable mobile) ═══════════ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="w-full min-w-0 mt-5 sm:mt-6 md:mt-8 relative"
                >
                    {/* Fondus latéraux (mobile) */}
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-6 z-10 bg-gradient-to-r from-[#0A0A0A] to-transparent md:hidden" />
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-6 z-10 bg-gradient-to-l from-[#0A0A0A] to-transparent md:hidden" />

                    <div className="flex flex-nowrap md:flex-wrap items-center justify-start md:justify-center gap-2 sm:gap-3 overflow-x-auto md:overflow-visible snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden px-6 md:px-0 pb-2 md:pb-0">
                        {statuses.map((status) => {
                            const Icon = status.icon;
                            const isActive = statusFilter === status.id;
                            return (
                                <button
                                    key={status.id}
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onStatusChange(status.id);
                                    }}
                                    className={cn(
                                        "group flex items-center gap-1.5 sm:gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 shrink-0 snap-center whitespace-nowrap",
                                        isActive
                                            ? `bg-[#0a0a0a] shadow-[0_8px_30px_rgba(0,0,0,0.4)] ${status.color} ring-1 ring-white/10 scale-105`
                                            : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                                    )}
                                >
                                    <div className={cn(
                                        "p-1 sm:p-1.5 rounded-md transition-colors duration-300",
                                        isActive ? status.bg : "bg-transparent group-hover:bg-white/5"
                                    )}>
                                        <Icon className={cn(
                                            "w-3.5 h-3.5 sm:w-4 sm:h-4",
                                            isActive ? status.color : ""
                                        )} />
                                    </div>
                                    <span>{status.label}</span>
                                </button>
                            )
                        })}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}