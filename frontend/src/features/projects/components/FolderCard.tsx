// features/projects/components/FolderCard.tsx
"use client"

import { motion, type Variants } from "framer-motion"
import { FileText, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface FolderCardProps {
    title: string;
    subtitle: string;
    invoiceCount: number;
    paidCount: number;
    overdueCount: number;
    onClick: () => void;
    variants?: Variants;
}

export function FolderCard({
    title,
    subtitle,
    invoiceCount,
    paidCount,
    overdueCount,
    onClick,
    variants,
}: FolderCardProps) {
    const hasOverdue = overdueCount > 0;
    const allPaid = paidCount === invoiceCount && invoiceCount > 0;

    return (
        <motion.div
            variants={variants}
            initial="hidden"
            animate="show"
            layout
            className="group flex flex-col cursor-pointer"
            onClick={onClick}
        >
            {/* ═══════════════════════════════════════════════════
                FORME DU DOSSIER (onglet + corps)
            ═══════════════════════════════════════════════════ */}
            <div className="relative w-full aspect-[4/5] flex flex-col justify-end">
                {/* Onglet du dossier (haut gauche) */}
                <div className={cn(
                    "absolute top-0 left-3 w-28 h-10 rounded-t-md transition-colors",
                    hasOverdue
                        ? "bg-rose-500/20 group-hover:bg-rose-500/30"
                        : "bg-slate-700/40 group-hover:bg-slate-600/50"
                )} />

                {/* Corps du dossier */}
                <div className={cn(
                    "relative mt-4 flex-1 rounded-lg border transition-all duration-300",
                    "flex flex-col items-center justify-center gap-3",
                    "group-hover:-translate-y-1 group-hover:shadow-xl",
                    hasOverdue
                        ? "bg-rose-500/10 border-rose-500/20 group-hover:border-rose-500/40 group-hover:shadow-rose-500/10"
                        : "bg-[#1e242c] border-white/5 group-hover:border-white/15 group-hover:shadow-black/40"
                )}>
                    {/* Icône dossier */}
                    <div className={cn(
                        "relative",
                        hasOverdue ? "text-rose-400" : "text-slate-300"
                    )}>
                        <svg
                            width="48"
                            height="48"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="transition-transform "
                        >
                            <path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" />
                        </svg>

                        {/* Badge compteur */}
                        <div className={cn(
                            "absolute -top-2 -right-3 min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center text-[10px] font-black",
                            hasOverdue
                                ? "bg-rose-500 text-white"
                                : allPaid
                                    ? "bg-emerald-500 text-white"
                                    : "bg-[#2563EB] text-white"
                        )}>
                            {invoiceCount}
                        </div>
                    </div>

                    {/* Indicateurs de statut */}
                    <div className="flex items-center gap-2">
                        {hasOverdue && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-400">
                                
                                {overdueCount} retard{overdueCount > 1 ? 's' : ''}
                            </span>
                        )}
                        {allPaid && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                                <CheckCircle2 className="h-3 w-3" />
                                Tout payé
                            </span>
                        )}
                        {!hasOverdue && !allPaid && (
                            <span className="text-[10px] font-medium text-slate-400">
                                {paidCount}/{invoiceCount} payée{invoiceCount > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ═══════════════════════════════════════════════════
                TEXTE SOUS LE DOSSIER
            ═══════════════════════════════════════════════════ */}
            <div className="mt-3 px-1 w-full min-w-0">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate transition-colors">
                    {title}
                </h4>
                <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1.5 min-w-0">
                    <span className="truncate max-w-full">{subtitle}</span>
                    <span className="text-slate-300 dark:text-slate-600 shrink-0 hidden sm:inline">•</span>
                    <div className="flex items-center gap-1 shrink-0">
                        <FileText className="h-3 w-3 flex-shrink-0" />
                        <span className="font-bold text-slate-700 dark:text-slate-300">
                            {invoiceCount}
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}