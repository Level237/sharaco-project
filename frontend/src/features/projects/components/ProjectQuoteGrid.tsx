"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ProjectTreeResponse } from "../types"
import { QuoteCardWithInvoices } from "./QuoteCardWithInvoices"
import { FolderCard } from "./FolderCard"
import { InvoiceGrid } from "./InvoiceGrid"
import { NewDocumentMenu } from "./NewDocumentMenu"
import { ContractCard } from "./ContractCard"

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
                className="grid grid-cols-2 min-[500px]:grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3 sm:gap-4 md:gap-6"
            >
                <motion.div variants={cardVariants} className="h-full">
                    <NewDocumentMenu projectId={projectId} variant="card" />
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
                                    onRefresh={onRefresh}
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

                <AnimatePresence mode="popLayout">
                    {(tree.contracts || []).map((contract) => (
                        <ContractCard
                            key={contract.id}
                            contract={contract}
                            variants={cardVariants}
                            onRefresh={onRefresh}
                            clientEmail={tree.client_email}
                            clientName={tree.client_name}
                        />
                    ))}
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
                    
                    <div className="grid grid-cols-2 min-[500px]:grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] gap-3 sm:gap-4 md:gap-6">
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