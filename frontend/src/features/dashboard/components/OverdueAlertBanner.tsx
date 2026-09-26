// components/dashboard/OverdueAlertBanner.tsx
"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { formatCurrency } from "@/features/quotes/lib/formatCurrency";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface AlertData {
    overdue_count: number;
    overdue_cents: number;
    due_soon_count: number;  // expire dans les 3 jours
    due_soon_cents: number;
    oldest_days_late: number;
}

export function OverdueAlertBanner() {
    const [data, setData] = useState<AlertData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const response = await api.get<AlertData>("/api/v1/dashboard/overdue-alert");
                setData(response);
                console.log("Overdue alert data:", response);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    if (loading || !data) return null;
    if (data.overdue_count === 0 && data.due_soon_count === 0) return null;

    const hasOverdue = data.overdue_count > 0;
    const hasDueSoon = data.due_soon_count > 0;

    // Déterminer le niveau d'urgence
    const config = hasOverdue
        ? {
            bg: "bg-gradient-to-r from-rose-500/10 via-rose-500/5 to-transparent",
            border: "border-rose-500/30",
            icon: AlertTriangle,
            iconColor: "text-rose-400",
            titleColor: "text-rose-400",
            glow: "shadow-[0_0_40px_rgba(244,63,94,0.15)]",
        }
        : {
            bg: "bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent",
            border: "border-amber-500/30",
            icon: Clock,
            iconColor: "text-amber-400",
            titleColor: "text-amber-400",
            glow: "shadow-[0_0_40px_rgba(245,158,11,0.15)]",
        };

    const Icon = config.icon;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="mb-6"
            >
                <div className={cn(
                    "relative overflow-hidden rounded-2xl border p-5 backdrop-blur-xl",
                    config.bg, config.border, config.glow
                )}>
                    {/* Glow background */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl opacity-50" />

                    <div className="relative flex items-center justify-between gap-4 flex-wrap">
                        {/* Left: Info */}
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0",
                                "bg-white/5 border border-white/10"
                            )}>
                                <Icon className={cn("h-6 w-6", config.iconColor)} />
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className={cn("font-black text-base mb-1", config.titleColor)}>
                                    {hasOverdue ? (
                                        <>
                                            Vous avez {data.overdue_count} facture{data.overdue_count > 1 ? 's' : ''} en retard
                                        </>
                                    ) : (
                                        <>
                                            {data.due_soon_count} facture{data.due_soon_count > 1 ? 's' : ''} à régler bientôt
                                        </>
                                    )}
                                </div>
                                <div className="text-sm text-zinc-400 flex items-center gap-2 flex-wrap">
                                    <span>
                                        Total : <strong className="text-white">{formatCurrency(data.overdue_cents + data.due_soon_cents)}</strong>
                                    </span>
                                    {hasOverdue && data.oldest_days_late > 0 && (
                                        <>
                                            <span className="text-zinc-600">•</span>
                                            <span>
                                                Retard max : <strong className="text-rose-400">{data.oldest_days_late} jour{data.oldest_days_late > 1 ? 's' : ''}</strong>
                                            </span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right: Actions */}
                        <div className="flex items-center gap-2">
                            <Link
                                href={hasOverdue 
                                    ? "/dashboard/invoices?filter=overdue" 
                                    : "/dashboard/invoices?filter=due_soon"
                                }
                                className={cn(
                                    "inline-flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all",
                                    hasOverdue
                                        ? "bg-rose-500 hover:bg-rose-400 text-white shadow-[0_0_20px_rgba(244,63,94,0.3)]"
                                        : "bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_20px_rgba(245,158,11,0.3)]"
                                )}
                            >
                                Consulter les factures
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Détails par type si les deux */}
                    {hasOverdue && hasDueSoon && (
                        <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-4 text-xs flex-wrap">
                            <div className="flex items-center gap-2 text-rose-400">
                                <AlertTriangle className="h-3.5 w-3.5" />
                                <span>
                                    <strong>{data.overdue_count}</strong> en retard ({formatCurrency(data.overdue_cents)})
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-amber-400">
                                <Clock className="h-3.5 w-3.5" />
                                <span>
                                    <strong>{data.due_soon_count}</strong> à régler bientôt ({formatCurrency(data.due_soon_cents)})
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
}