"use client"

import { motion, type Variants } from "framer-motion"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FileText, FileCheck, Eye, CreditCard, Ban, Trash2, MoreVertical, Folder, Pencil, FileDown } from "lucide-react"
import { DocumentPreview } from "@/features/quotes/components/DocumentPreview"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/features/quotes/lib/formatCurrency"

import { quotesApi } from "@/features/quotes/api/quotesApi"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { ProjectTreeQuote } from "../types"

interface QuoteCardWithInvoicesProps {
    quote: ProjectTreeQuote;
    variants?: Variants;
    onExpand: () => void;
    onRefresh?: () => void;
}

const statusConfig: Record<string, { label: string; icon: typeof FileText; color: string }> = {
    ACCEPTED: { label: "Accepté", icon: CreditCard, color: "text-emerald-500" },
    REFUSED: { label: "Refusé", icon: Ban, color: "text-rose-500" },
    SENT: { label: "Envoyé", icon: FileCheck, color: "text-blue-500" },
    VIEWED: { label: "Consulté", icon: Eye, color: "text-amber-500" },
    DRAFT: { label: "Brouillon", icon: FileText, color: "text-slate-500" },
    PAID: { label: "Payé", icon: CreditCard, color: "text-emerald-500" },
}

export function QuoteCardWithInvoices({ quote, variants, onExpand, onRefresh }: QuoteCardWithInvoicesProps) {
    const config = statusConfig[quote.status] || statusConfig.DRAFT;
    const StatusIcon = config.icon;

    const handleDelete = async () => {
        if (!window.confirm(`Supprimer le devis « ${quote.number || ""} » ?`)) return;
        await quotesApi.delete(quote.id);
        onRefresh?.();
    };

    const handleDownloadPdf = async () => {
        await quotesApi.downloadPdf(quote.id, `${quote.number || "devis"}.pdf`);
    };

    const invoiceCount = quote.invoices.length;
    const hasOverdue = quote.invoices.some((inv) => inv.status === "OVERDUE");
    const paidCount = quote.invoices.filter((inv) => inv.status === "PAID").length;

    return (
        <motion.div
            variants={variants}
            initial="hidden"
            animate="show"
            layout
            className="group flex flex-col"
        >
            <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-lg border border-white/5 bg-white/[0.02] p-1.5 transition-transform duration-300 group-hover:-translate-y-1">
                <Link href={`/dashboard/quotes/${quote.id}`} className="relative block h-full w-full overflow-hidden rounded-md bg-slate-950/50 shadow-sm">
                    <DocumentPreview documentId={quote.id} layoutStyle="modern" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
                            <Eye className="h-5 w-5" />
                        </div>
                    </div>
                </Link>

                {invoiceCount > 0 && (
                    <button
                        type="button"
                        onClick={(event) => {
                            event.stopPropagation();
                            onExpand();
                        }}
                        className={cn(
                            "absolute bottom-3 left-3 z-20 flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-bold shadow-lg backdrop-blur-md",
                            hasOverdue ? "bg-rose-500/90 text-white" : "border border-white/20 bg-slate-900/90 text-white"
                        )}
                    >
                        <Folder className="h-3 w-3" />
                        {invoiceCount} facture{invoiceCount > 1 ? "s" : ""}
                        {paidCount === invoiceCount && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
                    </button>
                )}

                <div className="absolute right-2 top-2 z-20">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-10 w-10 rounded-md border border-white/10 bg-black/40 text-slate-200 shadow-lg backdrop-blur-md hover:bg-black/60"
                            >
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 border-white/10 bg-[#111113] p-2 text-slate-200">
                            <DropdownMenuItem asChild className="cursor-pointer">
                                <Link href={`/dashboard/quotes/${quote.id}`}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    Visualiser
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild className="cursor-pointer">
                                <Link href={`/dashboard/quotes/create/${quote.id}`}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Modifier
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={handleDownloadPdf}>
                                <FileDown className="mr-2 h-4 w-4 text-blue-500" />
                                Télécharger PDF
                            </DropdownMenuItem>
                            {quote.status === "DRAFT" && (
                                <DropdownMenuItem className="cursor-pointer text-rose-400 focus:text-rose-300" onClick={handleDelete}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Supprimer le devis
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="mt-3 w-full min-w-0 px-1">
                <h4 className="truncate text-sm font-bold text-white">
                    {quote.number || "Devis sans numéro"}
                </h4>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-1.5 text-[11px] font-medium text-slate-400">
                    <div className="flex items-center gap-1">
                        <div className={cn("rounded-md border border-white/10 bg-white/5 p-0.5", config.color)}>
                            <StatusIcon className="h-3 w-3" />
                        </div>
                        <span>{config.label}</span>
                    </div>
                    <span className="hidden text-slate-600 sm:inline">•</span>
                    <span className="font-bold text-slate-300">{formatCurrency(quote.amount_cents)}</span>
                </div>
            </div>
        </motion.div>
    );
}
