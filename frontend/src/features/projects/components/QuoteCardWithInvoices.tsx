// features/projects/components/QuoteCardWithInvoices.tsx
"use client"

import { motion, type Variants } from "framer-motion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, FileCheck, Eye, CreditCard, Ban, Trash2, MoreVertical, Folder, Unlink } from "lucide-react"
import { DocumentPreview } from "@/features/quotes/components/DocumentPreview"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/features/quotes/lib/formatCurrency"

import { useDeleteDocument } from "@/features/quotes/hooks/useDeleteDocument"
import { quotesApi } from "@/features/quotes/api/quotesApi"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ProjectTreeQuote } from "../types"

interface QuoteCardWithInvoicesProps {
    quote: ProjectTreeQuote;
    variants?: Variants;
    onExpand: () => void;
}

const statusConfig: Record<string, { label: string; icon: any; color: string }> = {
    ACCEPTED: { label: "Accepté", icon: CreditCard, color: "text-emerald-500" },
    REFUSED: { label: "Refusé", icon: Ban, color: "text-rose-500" },
    SENT: { label: "Envoyé", icon: FileCheck, color: "text-sky-500" },
    VIEWED: { label: "Consulté", icon: Eye, color: "text-amber-500" },
    DRAFT: { label: "Brouillon", icon: FileText, color: "text-slate-500" },
    PAID: { label: "Payé", icon: CreditCard, color: "text-emerald-500" },
}

export function QuoteCardWithInvoices({ quote, variants, onExpand }: QuoteCardWithInvoicesProps) {
    const config = statusConfig[quote.status] || statusConfig.DRAFT;
    const StatusIcon = config.icon;

    const { deleteDocument } = useDeleteDocument({});

    const handleDelete = async () => {
        if (confirm("Supprimer ce devis ?")) {
            await deleteDocument(quote.id, quote.number || "");
        }
    };

    const handleDownloadPdf = async () => {
        try {
            await quotesApi.downloadPdf(quote.id, `${quote.number || 'devis'}.pdf`);
        } catch (error) {
            console.error('Erreur téléchargement PDF:', error);
        }
    };

    const invoiceCount = quote.invoices.length;
    const hasOverdue = quote.invoices.some(inv => inv.status === "OVERDUE");
    const paidCount = quote.invoices.filter(inv => inv.status === "PAID").length;

    return (
        <motion.div
            variants={variants}
            initial="hidden"
            animate="show"
            layout
            className="group flex flex-col"
        >
            <div className="relative w-full aspect-[4/5] rounded-2xl bg-slate-100/50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 overflow-hidden group-hover:-translate-y-1 transition-transform duration-300 p-2 flex items-center justify-center">
                {/* Preview */}
                <div className="w-full h-full rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-950/50 relative">
                    <DocumentPreview
                        documentId={quote.id}
                        layoutStyle="modern"
                    />
                </div>

                {/* Badge factures (en bas à gauche) */}
                {invoiceCount > 0 && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onExpand();
                        }}
                        className={cn(
                            "absolute bottom-4 left-4 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-bold shadow-lg backdrop-blur-md transition-all hover:scale-105",
                            hasOverdue
                                ? "bg-rose-500/90 text-white"
                                : "bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white border border-white/20"
                        )}
                    >
                        <Folder className="h-3 w-3" />
                        <span>{invoiceCount} facture{invoiceCount > 1 ? 's' : ''}</span>
                        {paidCount === invoiceCount && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        )}
                    </button>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                    <Link href={`/dashboard/quotes/${quote.id}`}>
                        <Button size="icon" className="h-10 w-10 rounded-full bg-white text-slate-900 hover:bg-slate-100 shadow-lg hover:scale-110 transition-transform">
                            <Eye className="h-4 w-4" />
                        </Button>
                    </Link>

                    {invoiceCount > 0 && (
                        <Button
                            onClick={onExpand}
                            size="icon"
                            className="h-10 w-10 rounded-full bg-[#2563EB] text-white hover:bg-[#1d4ed8] shadow-lg hover:scale-110 transition-transform"
                            title="Voir les factures"
                        >
                            <Folder className="h-4 w-4" />
                        </Button>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" className="h-10 w-10 rounded-full bg-white text-slate-900 hover:bg-slate-100 shadow-lg hover:scale-110 transition-transform">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-2xl p-2 w-56 bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/10 shadow-2xl">
                            <DropdownMenuItem onClick={handleDownloadPdf} className="cursor-pointer rounded-xl py-2.5 px-3 font-medium">
                                <FileText className="mr-2.5 h-4 w-4 text-sky-500" />
                                Télécharger PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={handleDelete} className="cursor-pointer rounded-xl py-2.5 px-3 text-rose-600 dark:text-rose-500 focus:text-rose-700 font-medium">
                                <Trash2 className="mr-2.5 h-4 w-4" />
                                Supprimer devis
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Text Details */}
            <div className="mt-3 px-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {quote.number || "Devis sans numéro"}
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1.5 truncate">
                    <div className={cn("p-0.5 rounded-md bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10", config.color)}>
                        <StatusIcon className="w-3 h-3" />
                    </div>
                    <span>{config.label}</span>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                        {formatCurrency(quote.amount_cents)}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}