// features/quotes/components/DocumentsStats.tsx
"use client";

import { useRef, useState } from "react";
import { useDocumentsStats } from "../hooks/useDocumentsStats";
import {
    Wallet, Clock, Target, TrendingUp,
    FileEdit
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatCurrency } from "../lib/formatCurrency";

interface DocumentsStatsProps {
    onFilterByStatus?: (status: string | null) => void;
    currentFilter?: string | null;
}

export function DocumentsStats({ onFilterByStatus, currentFilter }: DocumentsStatsProps) {
    const { data: stats, isLoading } = useDocumentsStats();
    const scrollRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    // ═══════════════════════════════════════════════════════════════
    // SCROLL HANDLING (mobile uniquement)
    // ═══════════════════════════════════════════════════════════════
    const handleScroll = () => {
        const el = scrollRef.current;
        if (!el || el.children.length === 0) return;
        const first = el.children[0] as HTMLElement;
        const gap = 16; // gap-4 sur mobile
        const cardWidth = first.offsetWidth + gap;
        if (cardWidth > 0) {
            setActiveIndex(Math.round(el.scrollLeft / cardWidth));
        }
    };

    const scrollToIndex = (index: number) => {
        const el = scrollRef.current;
        if (!el || el.children.length === 0) return;
        const first = el.children[0] as HTMLElement;
        const gap = 16;
        el.scrollTo({
            left: index * (first.offsetWidth + gap),
            behavior: "smooth",
        });
    };

    // Classes du conteneur : carousel mobile / grille desktop
    const containerClasses = cn(
        // Mobile : défilement horizontal avec snap
        "flex gap-4 overflow-x-auto pb-2 -mx-4 px-4",
        "snap-x snap-mandatory",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        // Desktop : grille classique
        "md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-6",
        "md:overflow-visible md:snap-none md:mx-0 md:px-0 md:pb-0"
    );

    if (isLoading || !stats) {
        return (
            <div>
                <div className={containerClasses}>
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="w-[78vw] sm:w-[320px] md:w-auto shrink-0 snap-center bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-xl border border-slate-200/50 dark:border-white/5 rounded-2xl p-6 md:p-8 flex flex-col justify-between h-44"
                        >
                            <div className="flex justify-between items-center">
                                <div className="h-3 w-24 bg-slate-200 dark:bg-white/10 rounded-full" />
                                <div className="h-10 w-10 bg-slate-200 dark:bg-white/10 rounded-2xl" />
                            </div>
                            <div>
                                <div className="h-10 w-20 bg-slate-200 dark:bg-white/10 rounded-xl mb-3" />
                                <div className="h-3 w-24 bg-slate-200 dark:bg-white/10 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const metricCards = [
        {
            key: "REVENUE",
            label: "Chiffre d'affaires",
            sublabel: "Encaissé",
            icon: Wallet,
            color: "emerald",
            value: formatCurrency(stats.revenue_cents),
            count: stats.paid_invoices_count,
            countLabel: "factures payées",
            glow: true,
        },
        {
            key: "RECEIVABLES",
            label: "En attente",
            sublabel: "Créances clients",
            icon: Clock,
            color: "amber",
            value: formatCurrency(stats.receivables_cents),
            count: stats.receivables_count,
            countLabel: "factures à encaisser",
        },
        {
            key: "DRAFTS",
            label: "Brouillons",
            sublabel: "À envoyer",
            icon: FileEdit,
            color: "slate",
            value: formatCurrency(stats.drafts_cents),
            count: stats.drafts_count,
            countLabel: "factures en préparation",
        },
        {
            key: "COLLECTION",
            label: "Encaissement",
            sublabel: "Taux de paiement",
            icon: TrendingUp,
            color: "violet",
            value: `${stats.collection_rate}%`,
            count: stats.conversion_rate,
            countLabel: `% conversion devis`,
            isPercentage: true,
        },
    ];

    const colorMap: Record<string, { text: string; icon: string; glow: string; bar: string; ring: string }> = {
        emerald: {
            text: "text-emerald-600 dark:text-emerald-400",
            icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
            glow: "from-emerald-500/20 via-transparent to-transparent",
            bar: "bg-emerald-500",
            ring: "ring-emerald-500 shadow-emerald-500/20",
        },
        amber: {
            text: "text-amber-600 dark:text-amber-400",
            icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
            glow: "from-amber-500/20 via-transparent to-transparent",
            bar: "bg-amber-500",
            ring: "ring-amber-500 shadow-amber-500/20",
        },
        sky: {
            text: "text-sky-600 dark:text-sky-400",
            icon: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
            glow: "from-sky-500/20 via-transparent to-transparent",
            bar: "bg-sky-500",
            ring: "ring-sky-500 shadow-sky-500/20",
        },
        violet: {
            text: "text-violet-600 dark:text-violet-400",
            icon: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
            glow: "from-violet-500/20 via-transparent to-transparent",
            bar: "bg-violet-500",
            ring: "ring-violet-500 shadow-violet-500/20",
        },
        slate: {
            text: "text-slate-600 dark:text-slate-400",
            icon: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
            glow: "from-slate-500/20 via-transparent to-transparent",
            bar: "bg-slate-500",
            ring: "ring-slate-500 shadow-slate-500/20",
        },
    };

    return (
        <div>
            <div className="relative">
                {/* ═══════════ Fondus latéraux (mobile uniquement) ═══════════ */}
                <div className="pointer-events-none absolute inset-y-0 left-0 w-6 z-10 bg-gradient-to-r from-[#FAFAFA] dark:from-[#0A0A0A] to-transparent md:hidden" />
                <div className="pointer-events-none absolute inset-y-0 right-0 w-6 z-10 bg-gradient-to-l from-[#FAFAFA] dark:from-[#0A0A0A] to-transparent md:hidden" />

                {/* ═══════════ Conteneur : carousel mobile / grille desktop ═══════════ */}
                <div
                    ref={scrollRef}
                    onScroll={handleScroll}
                    className={containerClasses}
                >
                    {metricCards.map((card, index) => {
                        const colors = colorMap[card.color];
                        const Icon = card.icon;
                        const isActive = currentFilter === card.key;
                        const isClickable = !!onFilterByStatus;

                        return (
                            <button
                                key={card.key}
                                
                                onClick={() => {
                                    if (isClickable) onFilterByStatus(isActive ? null : card.key);
                                }}
                                disabled={!isClickable}
                                className={cn(
                                    // ✅ Mobile : largeur fixe + snap pour le carousel
                                    "w-[78vw] sm:w-[320px] shrink-0 snap-center",
                                    // ✅ Desktop : largeur auto dans la grille
                                    "md:w-auto md:shrink md:snap-none",
                                    "relative group overflow-hidden text-left rounded-2xl",
                                    "bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-xl border",
                                    isClickable ? "cursor-pointer" : "cursor-default",
                                    isActive
                                        ? "border-transparent shadow-lg scale-[1.02] ring-1 ring-offset-2 ring-offset-white dark:ring-offset-[#0a0a0a]"
                                        : "border-slate-200/50 dark:border-white/5 shadow-sm",
                                    !isActive && isClickable && "hover:border-slate-300 dark:hover:border-white/10 hover:scale-[1.02]",
                                    isActive && colors.ring
                                )}
                            >
                                {/* Background subtle glow */}
                                <div className={cn(
                                    "absolute inset-0 opacity-0 transition-opacity duration-500 bg-gradient-to-br",
                                    colors?.glow,
                                    isClickable && "group-hover:opacity-100",
                                    card.glow && "opacity-100"
                                )} />

                                {isActive && (
                                    <div className={cn(
                                        "absolute inset-0 opacity-20 bg-gradient-to-br",
                                        colors.glow
                                    )} />
                                )}

                                <div className="relative z-10 p-5 md:p-6 flex flex-col h-full justify-between gap-4">
                                    {/* Header */}
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-zinc-500 block">
                                                {card.label}
                                            </span>
                                            <span className="text-[10px] text-slate-400 dark:text-zinc-600 mt-0.5 block">
                                                {card.sublabel}
                                            </span>
                                        </div>
                                        <div className={cn(
                                            "h-10 w-10 rounded-xl flex items-center justify-center transition-transform duration-500",
                                            colors?.icon,
                                            isClickable && "group-hover:scale-110",
                                            isActive && "scale-110"
                                        )}>
                                            <Icon className="h-5 w-5" />
                                        </div>
                                    </div>

                                    {/* Valeur principale */}
                                    <div>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className={cn(
                                                "text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter transition-colors duration-500",
                                                isActive ? colors.text : "text-slate-900 dark:text-white",
                                                isClickable && !isActive && `group-hover:${colors.text}`
                                            )}>
                                                {card.value}
                                            </span>
                                        </div>

                                        {/* Sous-info */}
                                        {!card.isPercentage && (
                                            <div className="flex items-center gap-2 mt-2">
                                                <div className={cn("h-1.5 w-1.5 rounded-full", colors?.bar)} />
                                                <p className="text-xs font-semibold text-slate-600 dark:text-zinc-400 truncate">
                                                    {card.count} {card.countLabel}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Barre de progression pour les pourcentages */}
                                    {card.isPercentage && (
                                        <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-1.5 mt-2 overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${card.count}%` }}
                                                transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                                                className={cn("h-full rounded-full", colors.bar)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ═══════════ Indicateurs de scroll (mobile uniquement) ═══════════ */}
            <div className="flex justify-center gap-1.5 mt-3 md:hidden">
                {metricCards.map((card, i) => (
                    <button
                        key={card.key}
                        onClick={() => scrollToIndex(i)}
                        aria-label={`Aller à ${card.label}`}
                        className={cn(
                            "h-1.5 rounded-full  duration-300",
                            i === activeIndex
                                ? "w-6 bg-slate-900 dark:bg-white"
                                : "w-1.5 bg-slate-300 dark:bg-white/20"
                        )}
                    />
                ))}
            </div>
        </div>
    );
}