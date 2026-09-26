"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus } from "lucide-react"
import Link from "next/link"
import { ProjectTreeResponse } from "../types"
import { QuoteCardWithInvoices } from "./QuoteCardWithInvoices"
import { FolderCard } from "./FolderCard"
import { InvoiceGrid } from "./InvoiceGrid"

interface ProjectQuoteGridProps {
    tree: ProjectTreeResponse;
    projectId: string;
    onRefresh?: () => void;
}

import type { Variants } from "framer-motion";

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
}

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: { 
        opacity: 1, 
        y: 0, 
        scale: 1, 
        transition: { type: "spring", stiffness: 120, damping: 20 } 
    }
}

export function ProjectQuoteGrid({ tree, projectId, onRefresh }: ProjectQuoteGridProps) {
    const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>(null);

    const expandedQuote = tree.quotes.find(q => q.id === expandedQuoteId);

    if (expandedQuote) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 150, damping: 25 }}
            >
                <InvoiceGrid
                    quote={expandedQuote}
                    onBack={() => setExpandedQuoteId(null)}
                    onRefresh={onRefresh}
                />
            </motion.div>
        );
    }

    return (
        <div className="space-y-12">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-5 gap-y-8"
            >
                {/* ═══════════ Nouveau Devis Card ═══════════ */}
                <motion.div variants={cardVariants} className="h-full">
                    <Link
                        href={`/dashboard/quotes/create?project_id=${projectId}`}
                        className="group flex flex-col h-full w-full outline-none"
                    >
                        <div className="w-full aspect-[4/5] rounded-2xl bg-white/40 dark:bg-transparent border border-dashed border-slate-300 dark:border-white/20 flex flex-col items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:bg-white dark:group-hover:bg-white/5 group-hover:border-solid group-hover:border-slate-400 dark:group-hover:border-white/30 group-hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] group-hover:-translate-y-1">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-500 dark:text-slate-300 mb-3 transition-transform duration-500 group-hover:scale-110 group-hover:bg-slate-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-slate-900">
                                <Plus  className="w-4 h-4" />
                            </div>
                        </div>
                        {/* Invisible alignment text to match other cards structure */}
                        <div className="mt-4 px-1 opacity-0 pointer-events-none select-none">
                            <h4 className="text-[13px] font-semibold">X</h4>
                            <div className="text-[11px] mt-1">X</div>
                        </div>
                    </Link>
                </motion.div>

                {/* ═══════════ Devis + Dossiers Factures ═══════════ */}
                <AnimatePresence mode="popLayout">
                    {tree.quotes.map((quote) => {
                        const paidCount = quote.invoices.filter(i => i.status === "PAID").length;
                        const overdueCount = quote.invoices.filter(
                            i => i.status === "OVERDUE" || (i.days_late && i.days_late > 0)
                        ).length;

                        return (
                            <div key={quote.id} className="contents">
                                <QuoteCardWithInvoices
                                    quote={quote}
                                    variants={cardVariants}
                                    onExpand={() => setExpandedQuoteId(quote.id)}
                                />

                                {quote.invoices.length > 0 && (
                                    <FolderCard
                                        title={`Factures ${quote.number || ""}`}
                                        subtitle={tree.client_name || "Client"}
                                        invoiceCount={quote.invoices.length}
                                        paidCount={paidCount}
                                        overdueCount={overdueCount}
                                        onClick={() => setExpandedQuoteId(quote.id)}
                                        variants={cardVariants}
                                    />
                                )}
                            </div>
                        );
                    })}
                </AnimatePresence>
            </motion.div>

            {/* ═══════════ Factures standalone ═══════════ */}
            {tree.standalone_invoices.length > 0 && (
                <div className="pt-8 border-t border-slate-200/60 dark:border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-px bg-slate-200 dark:bg-white/10 flex-1" />
                        <div className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">
                            Hors devis ({tree.standalone_invoices.length})
                        </div>
                        <div className="h-px bg-slate-200 dark:bg-white/10 flex-1" />
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-5 gap-y-8">
                        <FolderCard
                            title="Factures isolées"
                            subtitle="Sans devis parent"
                            invoiceCount={tree.standalone_invoices.length}
                            paidCount={tree.standalone_invoices.filter(i => i.status === "PAID").length}
                            overdueCount={tree.standalone_invoices.filter(i => i.status === "OVERDUE" || (i.days_late && i.days_late > 0)).length}
                            onClick={() => {}}
                            variants={cardVariants}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}