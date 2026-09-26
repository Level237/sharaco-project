// features/invoices/components/PaymentScheduleTracker.tsx
"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, AlertCircle, FileText } from "lucide-react";
import { formatCurrency } from "@/features/quotes/lib/formatCurrency";
import { cn } from "@/lib/utils";

interface Milestone {
    sequence: number;
    title: string;
    percent: number;
    amount_cents: number;
    status: "PAID" | "INVOICED" | "PENDING" | "CANCELLED";
    paid_at: string | null;
    trigger_date: string | null;
    is_current: boolean;
}

interface PaymentSchedule {
    milestones: Milestone[];
    total_cents: number;
    paid_cents: number;
    paid_percent: number;
    remaining_cents: number;
    source_quote_number: string;
}

interface PaymentScheduleTrackerProps {
    schedule: PaymentSchedule;
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

export function PaymentScheduleTracker({ schedule }: PaymentScheduleTrackerProps) {
    const {
        milestones,
        paid_percent,
        paid_cents,
        total_cents,
        remaining_cents,
        source_quote_number,
    } = schedule;

    const isFullyPaid = paid_percent >= 100;

    return (
        <div className="bg-white dark:bg-[#0b0b0b] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            {/* ═══════════ HEADER ═══════════ */}
            <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                                Suivi de paiement
                            </h2>
                            {isFullyPaid && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Soldé
                                </span>
                            )}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-500">
                            Devis{" "}
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                                {source_quote_number}
                            </span>{" "}
                            • {milestones.length} tranches
                        </p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                            {paid_percent}%
                        </div>
                        <div className="text-[10px] sm:text-xs text-slate-500 font-medium uppercase tracking-wider">
                            Réglé
                        </div>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="relative h-2 sm:h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${paid_percent}%` }}
                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
                        className={cn(
                            "h-full rounded-full",
                            isFullyPaid
                                ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                                : "bg-gradient-to-r from-sky-400 to-sky-500"
                        )}
                    />
                </div>

                <div className="flex items-center justify-between mt-2 text-xs text-slate-500">
                    <span className="font-medium">
                        <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                            {formatCurrency(paid_cents)}
                        </span>{" "}
                        sur {formatCurrency(total_cents)}
                    </span>
                    {!isFullyPaid && (
                        <span className="font-medium">
                            Reste{" "}
                            <span className="font-bold text-slate-900 dark:text-white tabular-nums">
                                {formatCurrency(remaining_cents)}
                            </span>
                        </span>
                    )}
                </div>
            </div>

            {/* ═══════════ LISTE DES TRANCHES ═══════════ */}
            <div className="p-4 sm:p-6">
                <div className="space-y-2">
                    {milestones.map((m, idx) => {
                        const isPaid = m.status === "PAID";
                        const isCurrent = m.is_current;
                        const isPending = m.status === "PENDING";
                        const isInvoiced = m.status === "INVOICED";

                        return (
                            <motion.div
                                key={m.sequence}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 + idx * 0.08 }}
                                className={cn(
                                    "relative flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border transition-all",
                                    isCurrent && !isPaid
                                        ? "border-sky-500/50 bg-sky-50/50 dark:bg-sky-500/5 dark:border-sky-500/30 shadow-sm"
                                        : isPaid
                                        ? "border-slate-200 dark:border-slate-800 bg-white dark:bg-transparent"
                                        : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-transparent"
                                )}
                            >
                                {/* Icône statut */}
                                <div
                                    className={cn(
                                        "shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 transition-all",
                                        isPaid && "bg-emerald-500 border-emerald-500 text-white",
                                        isCurrent && !isPaid && "bg-sky-500 border-sky-500 text-white",
                                        isInvoiced && "bg-amber-500 border-amber-500 text-white",
                                        isPending && "bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-400"
                                    )}
                                >
                                    {isPaid ? (
                                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
                                    ) : isCurrent ? (
                                        <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                                    ) : isInvoiced ? (
                                        <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                                    ) : (
                                        <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                                    )}
                                </div>

                                {/* Infos */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span
                                            className={cn(
                                                "text-xs font-black uppercase tracking-wider",
                                                isPaid && "text-emerald-600 dark:text-emerald-400",
                                                isCurrent && !isPaid && "text-sky-600 dark:text-sky-400",
                                                !isPaid && !isCurrent && "text-slate-400 dark:text-slate-500"
                                            )}
                                        >
                                            Tranche {m.sequence}
                                        </span>
                                        {isCurrent && (
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-black bg-sky-500 text-white uppercase tracking-widest">
                                                Cette facture
                                            </span>
                                        )}
                                        {isPaid && m.paid_at && (
                                            <span className="text-[10px] text-slate-500 font-medium">
                                                Payée le {formatDate(m.paid_at)}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm sm:text-[15px] font-semibold text-slate-900 dark:text-white truncate mt-0.5">
                                        {m.title}
                                    </div>
                                    {m.trigger_date && !isPaid && (
                                        <div className="text-[11px] text-slate-500 mt-0.5">
                                            Prévue le {formatDate(m.trigger_date)}
                                        </div>
                                    )}
                                </div>

                                {/* Montant */}
                                <div className="text-right shrink-0">
                                    <div
                                        className={cn(
                                            "text-sm sm:text-base font-black tabular-nums",
                                            isPaid
                                                ? "text-emerald-600 dark:text-emerald-400 line-through opacity-70"
                                                : "text-slate-900 dark:text-white"
                                        )}
                                    >
                                        {formatCurrency(m.amount_cents)}
                                    </div>
                                    <div className="text-[10px] sm:text-xs text-slate-500 font-semibold mt-0.5">
                                        {m.percent}%
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* ═══════════ FOOTER ═══════════ */}
            {!isFullyPaid && (
                <div className="px-4 sm:px-6 py-4 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[11px] sm:text-xs text-slate-500 text-center leading-relaxed">
                        💡 Chaque tranche fait l'objet d'une facture distincte. En cas de question
                        sur votre échéancier, contactez votre émetteur.
                    </p>
                </div>
            )}
        </div>
    );
}