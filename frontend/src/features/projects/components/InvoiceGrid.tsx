// features/projects/components/InvoiceGrid.tsx
"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronLeft, CheckCircle2, AlertTriangle, Clock, FileText, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/features/quotes/lib/formatCurrency"
import { ProjectTreeQuote, ProjectTreeInvoice } from "../types"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface InvoiceGridProps {
    quote: ProjectTreeQuote;
    onBack: () => void;
    onRefresh?: () => void;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: any }> = {
    DRAFT: { label: "Brouillon", color: "text-slate-500", bg: "bg-slate-500/10", icon: FileText },
    SENT: { label: "Envoyée", color: "text-sky-500", bg: "bg-sky-500/10", icon: Clock },
    VIEWED: { label: "Consultée", color: "text-blue-500", bg: "bg-blue-500/10", icon: Clock },
    PAID: { label: "Payée", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: CheckCircle2 },
    OVERDUE: { label: "En retard", color: "text-rose-500", bg: "bg-rose-500/10", icon: AlertTriangle },
}

type FilterType = "all" | "paid" | "overdue" | "pending";

export function InvoiceGrid({ quote, onBack, onRefresh }: InvoiceGridProps) {
    const [filter, setFilter] = useState<FilterType>("all");

    const filteredInvoices = quote.invoices.filter(inv => {
        if (filter === "all") return true;
        if (filter === "paid") return inv.status === "PAID";
        if (filter === "overdue") return inv.status === "OVERDUE" || (inv.days_late && inv.days_late > 0);
        if (filter === "pending") return ["SENT", "VIEWED", "DRAFT"].includes(inv.status);
        return true;
    });

    // Stats rapides
    const paidCount = quote.invoices.filter(i => i.status === "PAID").length;
    const overdueCount = quote.invoices.filter(i => i.status === "OVERDUE" || (i.days_late && i.days_late > 0)).length;

    const filterButtons: Array<{
        key: FilterType;
        label: string;
        count: number;
        color?: string;
    }> = [
        { key: "all", label: "Toutes", count: quote.invoices.length },
        { key: "paid", label: "Payées", count: paidCount },
        { key: "overdue", label: "En retard", count: overdueCount, color: "text-rose-500" },
        { key: "pending", label: "En attente", count: quote.invoices.length - paidCount - overdueCount },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            {/* Header : Retour + info devis */}
            <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
                <Button
                    onClick={onBack}
                    variant="ghost"
                    size="sm"
                    className="gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Retour aux devis
                </Button>

                <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

                <div>
                    <div className="text-xs text-slate-500">Factures du devis</div>
                    <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {quote.number || "Sans numéro"} • {formatCurrency(quote.amount_cents)}
                    </div>
                </div>

                <div className="ml-auto flex items-center gap-2 text-xs">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        
                        <span className="font-bold">{paidCount}</span>
                        <span>payées</span>
                    </div>
                    {overdueCount > 0 && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-rose-500/10 text-rose-600 dark:text-rose-400">
                            
                            <span className="font-bold">{overdueCount}</span>
                            <span>en retard</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Filtres */}
            <div className="flex items-center gap-2 flex-wrap">
                {filterButtons.map(btn => (
                    <button
                        key={btn.key}
                        onClick={() => setFilter(btn.key)}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border",
                            filter === btn.key
                                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white"
                                : "bg-white dark:bg-[#111111] text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-400"
                        )}
                    >
                        <span className={btn.color}>{btn.label}</span>
                        <span className="ml-1.5 opacity-60">({btn.count})</span>
                    </button>
                ))}
            </div>

            {/* Grille factures */}
            {filteredInvoices.length === 0 ? (
                <div className="py-16 text-center">
                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">Aucune facture pour ce filtre</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
                    {filteredInvoices.map((invoice) => (
                        <InvoiceMiniCard key={invoice.id} invoice={invoice} />
                    ))}
                </div>
            )}
        </motion.div>
    );
}

// Sous-composant : mini-carte facture
function InvoiceMiniCard({ invoice }: { invoice: ProjectTreeInvoice }) {
    const config = statusConfig[invoice.status] || statusConfig.DRAFT;
    const Icon = config.icon;
    const isOverdue = invoice.status === "OVERDUE" || (invoice.days_late && invoice.days_late > 0);

    return (
        <Link
            href={`/dashboard/invoices/${invoice.id}`}
            className={cn(
                "group block rounded-xl border overflow-hidden",
                isOverdue
                    ? "border-rose-500/30 bg-rose-500/5 hover:border-rose-500/60"
                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111111] hover:border-slate-400"
            )}
        >
            <div className="p-4">
                {/* Header : statut */}
                <div className="flex items-start justify-between mb-3">
                    
                    {invoice.invoice_type && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 rounded uppercase">
                            {invoice.invoice_type}
                        </span>
                    )}
                </div>

                {/* Numéro */}
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate mb-1">
                    {invoice.number || "Sans numéro"}
                </div>

                {/* Titre milestone */}
                {invoice.milestone_title && (
                    <div className="text-[10px] text-slate-500 truncate mb-2">
                        {invoice.milestone_title}
                    </div>
                )}

                {/* Échéance */}
                {invoice.due_date && invoice.status !== "PAID" && (
                    <div className="text-[10px] text-slate-500 mb-3">
                        Éch. {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                        {invoice.days_late && invoice.days_late > 0 && (
                            <span className="ml-1 text-rose-500 font-bold">
                                (+{invoice.days_late}j)
                            </span>
                        )}
                    </div>
                )}

                {/* Montant + statut */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                        {formatCurrency(invoice.amount_cents)}
                    </span>
                    <span className={cn("text-[10px] font-bold uppercase", config.color)}>
                        {config.label}
                    </span>
                </div>
            </div>
        </Link>
    );
}