// features/activity/components/ActivityFeed.tsx
"use client";

import { useActivity, ActivityItem } from "../hooks/useActivity";
import {
    Folder, File, CheckCircle2, XCircle, Send, Eye,
    Loader2, Search, Banknote, CreditCard, Wallet
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { DocumentPreview } from "@/features/quotes/components/DocumentPreview";
import { formatCurrency } from "@/features/quotes/lib/formatCurrency";

interface ActivityFeedProps {
    limit?: number;
    compact?: boolean;
}

const iconMap: Record<string, any> = {
    folder: Folder,
    file: File,
    "check-circle": CheckCircle2,
    "x-circle": XCircle,
    send: Send,
    eye: Eye,
    banknote: Banknote,
    "credit-card": CreditCard,
    wallet: Wallet,
};

const colorMap: Record<string, { icon: string; text: string; glow: string; border: string; badge?: string }> = {
    blue: { icon: "bg-blue-500/10 text-blue-600 dark:text-blue-400", text: "text-blue-600 dark:text-blue-400", glow: "from-blue-500/20 via-transparent to-transparent", border: "group-hover:border-blue-500/30" },
    emerald: { icon: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", text: "text-emerald-600 dark:text-emerald-400", glow: "from-emerald-500/20 via-transparent to-transparent", border: "group-hover:border-emerald-500/30", badge: "bg-emerald-500" },
    rose: { icon: "bg-rose-500/10 text-rose-600 dark:text-rose-400", text: "text-rose-600 dark:text-rose-400", glow: "from-rose-500/20 via-transparent to-transparent", border: "group-hover:border-rose-500/30" },
    amber: { icon: "bg-amber-500/10 text-amber-600 dark:text-amber-400", text: "text-amber-600 dark:text-amber-400", glow: "from-amber-500/20 via-transparent to-transparent", border: "group-hover:border-amber-500/30" },
    sky: { icon: "bg-sky-500/10 text-sky-600 dark:text-sky-400", text: "text-sky-600 dark:text-sky-400", glow: "from-sky-500/20 via-transparent to-transparent", border: "group-hover:border-sky-500/30" },
    slate: { icon: "bg-slate-500/10 text-slate-600 dark:text-slate-400", text: "text-slate-600 dark:text-slate-400", glow: "from-slate-500/20 via-transparent to-transparent", border: "group-hover:border-slate-500/30" },
};

function formatTimestamp(timestamp: string): { group: string; time: string } {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    let group: string;
    if (diffHours < 24 && date.getDate() === now.getDate()) {
        group = "Aujourd'hui";
    } else if (diffHours < 48 && date.getDate() === now.getDate() - 1) {
        group = "Hier";
    } else if (diffDays < 7) {
        group = "Cette semaine";
    } else {
        group = date.toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    }

    const time = date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
    });

    return { group, time };
}

export function ActivityFeed({ limit = 20, compact = false }: ActivityFeedProps) {
    const [typeFilter, setTypeFilter] = useState<string>("all");
    const [actionFilter, setActionFilter] = useState<string>("all");

    const { data: activities = [], isLoading } = useActivity({
        limit,
        type_filter: typeFilter === "all" ? undefined : typeFilter as any,
        action_filter: actionFilter === "all" ? undefined : actionFilter,
    });

    const groupedActivities = activities.reduce((acc, activity) => {
        const { group } = formatTimestamp(activity.timestamp);
        if (!acc[group]) acc[group] = [];
        acc[group].push(activity);
        return acc;
    }, {} as Record<string, ActivityItem[]>);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="h-10 w-10 text-[#2563EB] animate-spin opacity-80" />
            </div>
        );
    }

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.05 } }
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* ═══════════════════════════════════════════════════════════
                FILTRES
            ═══════════════════════════════════════════════════════════ */}
            {!compact && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    {/* Type filters (Segmented control) */}
                    <div className="flex items-center gap-1 bg-zinc-900/80 p-1 rounded-xl border border-white/5 self-start">
                        {[
                            { id: "all", label: "Tous" },
                            { id: "PROJECT", label: "Projets" },
                            { id: "DOCUMENT", label: "Documents" },
                        ].map((type) => (
                            <button
                                key={type.id}
                                type="button"
                                onClick={() => setTypeFilter(type.id)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap",
                                    typeFilter === type.id
                                        ? "bg-[#2563EB] text-white shadow-sm"
                                        : "text-zinc-400 hover:text-white"
                                )}
                            >
                                {type.label}
                            </button>
                        ))}
                    </div>

                    {/* Action filters (Pills bar, responsive scroll on mobile) */}
                    <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        <div className="flex items-center gap-1.5 py-0.5">
                            {[
                                { id: "all", label: "Toutes" },
                                { id: "CREATED", label: "Création" },
                                { id: "UPDATED", label: "Modif." },
                                { id: "SENT", label: "Envoi" },
                                { id: "ACCEPTED", label: "Accepté" },
                                { id: "PAID", label: "Payé" },
                                { id: "REFUSED", label: "Refusé" }
                            ].map((action) => (
                                <button
                                    key={action.id}
                                    type="button"
                                    onClick={() => setActionFilter(action.id)}
                                    className={cn(
                                        "px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0",
                                        actionFilter === action.id
                                            ? action.id === "PAID"
                                                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                                : "bg-[#2563EB]/15 text-blue-400 border border-[#2563EB]/30"
                                            : "text-zinc-400 hover:text-white bg-zinc-900/40 border border-white/5 hover:border-white/10"
                                    )}
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════
                TIMELINE / LISTE
            ═══════════════════════════════════════════════════════════ */}
            {Object.keys(groupedActivities).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
                    <Search className="h-10 w-10 sm:h-12 sm:w-12 text-zinc-700 mb-4" />
                    <h4 className="text-lg sm:text-xl font-black text-white">
                        Aucune activité récente
                    </h4>
                    <p className="text-sm sm:text-base text-zinc-400 mt-2 font-medium">
                        Modifiez vos filtres ou revenez plus tard.
                    </p>
                </div>
            ) : (
                <div className="space-y-6 sm:space-y-8">
                    {Object.entries(groupedActivities).map(([group, items]) => (
                        <div key={group}>
                            <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 mb-3 sm:mb-4 px-1 flex items-center gap-3">
                                <span>{group}</span>
                                <div className="h-px flex-1 bg-white/5" />
                            </h3>

                            <motion.div
                                variants={containerVariants}
                                initial="hidden"
                                animate="show"
                                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4"
                            >
                                <AnimatePresence mode="popLayout">
                                    {items.map((activity) => {
                                        const Icon = iconMap[activity.icon] || File;
                                        const colors = colorMap[activity.color] || colorMap.slate;
                                        const { time } = formatTimestamp(activity.timestamp);

                                        const isDocument = activity.type === 'DOCUMENT';
                                        const isProjet = activity.type === "PROJECT";
                                        const isPaid = activity.action === 'PAID';
                                        const isInvoice = activity.metadata?.document_type === "FACTURE";
                                        const docId = activity.link ? activity.link.split('/').pop() : undefined;
                                        const amountCents = activity.metadata?.amount_cents || 0;

                                        return (
                                            <motion.div
                                                key={`${activity.id}-${activity.action}`}
                                                layout
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95 }}
                                                transition={{ duration: 0.3 }}
                                            >
                                                <Link
                                                    href={activity.link || "#"}
                                                    className={cn(
                                                        "group relative flex items-start gap-3 p-3 sm:p-3.5 rounded-xl transition-all duration-200",
                                                        "bg-zinc-900/40 border border-white/5 hover:border-white/10 hover:bg-zinc-900/80"
                                                    )}
                                                >
                                                    {/* ═══════════ VISUAL / THUMBNAIL ═══════════ */}
                                                    <div className="relative flex-shrink-0">
                                                        {isDocument && docId && (
                                                            <div className="relative w-12 sm:w-14 aspect-[4/5] rounded-md overflow-hidden border border-white/10 shadow-sm bg-zinc-950 group-hover:shadow-md group-hover:-translate-y-0.5 transition-all duration-200">
                                                                <div className="w-full h-full relative pointer-events-none">
                                                                    <DocumentPreview
                                                                        documentId={docId}
                                                                        layoutStyle={activity.metadata?.layout_style || "modern"}
                                                                    />
                                                                </div>
                                                            </div>
                                                        )}
                                                        {isProjet && (
                                                            <div className={cn(
                                                                "relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center border shadow-sm group-hover:shadow-md group-hover:-translate-y-0.5 transition-all duration-200",
                                                                colors.icon,
                                                                "border-white/10",
                                                                colors.border
                                                            )}>
                                                                <Icon className="w-5 h-5 sm:w-6 sm:h-6 opacity-80" strokeWidth={1.5} />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* ═══════════ CONTENT ═══════════ */}
                                                    <div className="flex-1 min-w-0 pt-0.5">
                                                        <div className="flex items-start justify-between gap-1.5">
                                                            <h4 className="font-bold text-xs sm:text-sm transition-colors line-clamp-1 text-white group-hover:text-blue-400">
                                                                {activity.title}
                                                            </h4>
                                                            <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap text-zinc-400 bg-white/5 shrink-0">
                                                                {time}
                                                            </span>
                                                        </div>

                                                        {activity.subtitle && (
                                                            <p className="text-[11px] sm:text-xs font-medium text-zinc-400 mt-0.5 line-clamp-1 leading-relaxed">
                                                                {activity.subtitle}
                                                            </p>
                                                        )}

                                                        {/* ═══════════ BADGES ═══════════ */}
                                                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-2 sm:mt-3">
                                                            {/* Badge PAID (montant encaissé) */}
                                                            {isPaid && amountCents > 0 && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 10 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ delay: 0.1 }}
                                                                    className="inline-flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg border border-emerald-500/30 bg-emerald-500/5"
                                                                >
                                                                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                                                    <span className="text-[10px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                                                        +{formatCurrency(amountCents)}
                                                                    </span>
                                                                    <span className="hidden sm:inline text-[10px] text-emerald-500/70 font-bold uppercase tracking-wider">
                                                                        encaissé
                                                                    </span>
                                                                </motion.div>
                                                            )}

                                                            {/* Badge Facture (non payée) */}
                                                            {isInvoice && !isPaid && (
                                                                <div className="inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2 py-1 rounded-md bg-violet-500/10 border border-violet-500/20">
                                                                    <CreditCard className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-violet-500" />
                                                                    <span className="text-[9px] sm:text-[10px] font-bold text-violet-500 uppercase tracking-wider">
                                                                        Facture
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </motion.div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}