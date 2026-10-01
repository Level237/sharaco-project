"use client"

import { Search, LayoutGrid, Clock, AlertCircle, CheckCircle2 } from "lucide-react"
import { motion } from "framer-motion"

interface InvoiceHeaderProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    statusFilter: string;
    onStatusChange: (status: string) => void;
}

const statuses = [
    { id: "ALL", label: "CA total", icon: LayoutGrid, color: "text-slate-300", bg: "bg-white/50/10" },
    { id: "PENDING", label: "En Attente", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
    { id: "OVERDUE", label: "En retard", icon: AlertCircle, color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-500/10" },
    { id: "PAID", label: "Payé", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10" }
]

export function InvoiceHeader({ searchQuery, onSearchChange, statusFilter, onStatusChange }: InvoiceHeaderProps) {
    return (
        <div className="relative overflow-hidden max-sm:p-2 p-8 md:p-14 flex flex-col items-center justify-center text-center shadow-sm w-full min-w-0">

            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[50%] -left-[10%] w-[50%] h-[150%] bg-blue-400/10 blur-[100px] rounded-full mix-blend-overlay" />
                <div className="absolute -bottom-[50%] -right-[10%] w-[50%] h-[150%] bg-purple-400/20 dark:bg-purple-400/10 blur-[100px] rounded-full mix-blend-overlay" />
            </div>

            <div className="relative z-10 w-full min-w-0 max-w-3xl flex flex-col items-center">


                <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-4xl max-sm:text-3xl md:text-5xl font-black tracking-tight text-white mb-10"
                >
                    Toutes vos Factures
                </motion.h2>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full flex flex-col sm:flex-row gap-4 items-center"
                >
                    <div className="relative flex-1 w-full group">
                        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        </div>
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            placeholder="Recherchez des factures, des clients ou des dossiers..."
                            className="w-full h-[60px] pl-14 max-sm:pl-3 max-sm:pr-2 max-sm:text-sm pr-6 bg-[#0a0a0a]/90 backdrop-blur-xl border border-white/10 rounded-lg shadow-[0_8px_30px_rgba(0,0,0,0.2)] focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-white placeholder:text-slate-500 font-medium text-base"
                        />
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-nowrap md:flex-wrap items-center justify-start md:justify-center gap-2 sm:gap-3 overflow-x-auto md:overflow-visible snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full min-w-0 mt-5 sm:mt-6 md:mt-8 relative px-6 md:px-0 pb-2 md:pb-0"
                >
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
                                className={`group flex items-center max-sm:text-xs gap-2.5 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 shrink-0 snap-center whitespace-nowrap ${
                                    isActive 
                                    ? `bg-[#0a0a0a] shadow-[0_8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] ${status.color} ring-1 ring-black/5 dark:ring-white/10` 
                                    : 'text-slate-400 hover:bg-[#111113]/60 dark:hover:bg-[#111113]/5 hover:text-slate-800 dark:hover:text-slate-200'
                                }`}
                            >
                                <div className={`p-1.5 rounded-xl transition-colors duration-300 ${isActive ? status.bg : 'bg-transparent group-hover:bg-slate-100 dark:group-hover:bg-[#111113]/5'}`}>
                                    <Icon className={`w-4 h-4 ${isActive ? status.color : ''}`} />
                                </div>
                                {status.label}
                            </button>
                        )
                    })}
                </motion.div>
            </div>
        </div>
    )
}
