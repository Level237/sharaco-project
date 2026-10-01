// features/projects/components/ProjectStatsCards.tsx
"use client";

import { Wallet, TrendingUp, FileText } from "lucide-react";
import { formatCurrency } from "@/features/quotes/lib/formatCurrency";

import { cn } from "@/lib/utils";
import { ProjectTreeSummary } from "../types";

interface ProjectStatsCardsProps {
    summary: ProjectTreeSummary;
}

export function ProjectStatsCards({ summary }: ProjectStatsCardsProps) {
    const cards = [
        {
            label: "Total devisé",
            value: formatCurrency(summary.total_quoted),
            sublabel: `${summary.quote_count} devis`,
            icon: FileText,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            label: "Total facturé",
            value: formatCurrency(summary.total_invoiced),
            sublabel: `${summary.invoice_count} factures • ${summary.invoicing_rate}%`,
            icon: TrendingUp,
            color: "text-blue-500",
            bgColor: "bg-blue-500/10",
        },
        {
            label: "Total encaissé",
            value: formatCurrency(summary.total_paid),
            sublabel: `${summary.paid_invoice_count} payées • ${summary.collection_rate}%`,
            icon: Wallet,
            color: "text-emerald-500",
            bgColor: "bg-emerald-500/10",
        },
        {
            label: "En retard",
            value: formatCurrency(summary.total_overdue),
            sublabel: `${summary.overdue_invoice_count} facture(s) en retard`,
            icon: null,
            color: "text-rose-500",
            bgColor: "bg-rose-500/10",
            highlight: summary.overdue_invoice_count > 0,
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card) => {
                const Icon = card.icon;
                return (
                    <div
                        key={card.label}
                        className={cn(
                            "relative p-5 rounded-xl border bg-white dark:bg-[#111111] transition-all",
                            card.highlight
                                ? "border-rose-200 dark:border-rose-500/30 shadow-[0_0_20px_rgba(244,63,94,0.1)]"
                                : "border-slate-200 dark:border-slate-800"
                        )}
                    >
                        <div className="flex items-start justify-between mb-3">
                            <span className="text-xs font-semibold text-slate-400 tracking-widest uppercase">
                                {card.label}
                            </span>
                          
                        </div>
                        <div className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
                            {card.value}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                            {card.sublabel}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}