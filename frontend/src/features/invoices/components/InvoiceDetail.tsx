"use client"

import { useInvoice } from "../hooks/useInvoices"
import { DocumentPreview } from "@/features/quotes/components/DocumentPreview"
import { Button } from "@/components/ui/button"
import { invoicesApi } from "../api/invoicesApi"
import { formatCurrency } from "@/features/quotes/lib/formatCurrency"
import {
    Mail, Download, ArrowLeft, Loader2, FileText,
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"

import { cn } from "@/lib/utils"
import { SendEmailModal } from "@/features/quotes/components/sendEmailModal"

export function InvoiceDetail({ invoiceId }: { invoiceId: string }) {
    const [isMounted, setIsMounted] = useState(false)
    const { data: invoice, isLoading, error, refetch } = useInvoice(invoiceId)
    const { toast } = useToast()

    const [isMarkingPaid, setIsMarkingPaid] = useState(false)
    
    // ✅ NOUVEAU : Modal d'envoi
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)

    useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted || isLoading) {
        return (
            <div className="flex min-h-[50dvh] items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-[#2563EB]" />
            </div>
        )
    }

    if (error || !invoice) {
        return (
            <div className="flex min-h-[50dvh] flex-col items-center justify-center px-4 text-center">
                <FileText className="mb-4 h-8 w-8 text-slate-500" />
                <h2 className="mb-2 text-lg font-medium text-slate-100">Facture introuvable</h2>
                <p className="mb-6 text-sm text-slate-400">Le document demandé n'est pas disponible.</p>
                <Link href="/dashboard/invoices">
                    <Button variant="outline" className="rounded-xl border-white/10">Retour aux factures</Button>
                </Link>
            </div>
        )
    }

    const isPaid = invoice.status === "PAID"
    const isSent = invoice.status === "SENT" || invoice.status === "VIEWED"
    const isOverdue = invoice.status === "OVERDUE"

    // ═══════════════════════════════════════════════════════════════
    // HANDLERS
    // ═══════════════════════════════════════════════════════════════
    
    const handleMarkAsPaid = async () => {
        if (!confirm("Confirmer que cette facture a été payée ?")) return;
        
        setIsMarkingPaid(true);
        try {
            const result = await invoicesApi.markAsPaid(invoiceId);
            toast({
                title: "Facture payée",
                description: result.message + (result.milestone_updated ? " (milestone mise à jour)" : ""),
            });
            refetch();
        } catch (err: any) {
            toast({
                title: "Erreur",
                description: err.message,
                variant: "destructive",
            });
        } finally {
            setIsMarkingPaid(false);
        }
    }

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            await invoicesApi.downloadPdf(invoiceId, `${invoice?.number || 'facture'}.pdf`);
            toast({
                title: "Succès",
                description: "Le téléchargement de la facture a démarré.",
            });
        } catch (err: any) {
            toast({
                title: "Erreur",
                description: err.message || "Impossible de télécharger le PDF.",
                variant: "destructive",
            });
        } finally {
            setIsDownloading(false);
        }
    };

    // ✅ NOUVEAU : Ouvre juste le modal, l'envoi réel est dans le modal
    const handleOpenEmailModal = () => {
        setIsEmailModalOpen(true)
    }

    // ✅ Callback après envoi réussi depuis le modal
    const handleEmailSent = () => {
        refetch() // Recharger pour voir le nouveau statut SENT
    }

    // ═══════════════════════════════════════════════════════════════
    // Statut d'affichage
    // ═══════════════════════════════════════════════════════════════
    const statusConfig = {
        DRAFT: { label: "Brouillon", color: "text-slate-500", dot: "bg-slate-400" },
        SENT: { label: "Envoyée", color: "text-[#2563EB]", dot: "bg-[#2563EB]" },
        VIEWED: { label: "Consultée", color: "text-blue-500", dot: "bg-blue-500" },
        PAID: { label: "Payée", color: "text-emerald-500", dot: "bg-emerald-500" },
        OVERDUE: { label: "En retard", color: "text-rose-500", dot: "bg-rose-500" },
        REFUSED: { label: "Refusée", color: "text-rose-500", dot: "bg-rose-500" },
        ACCEPTED: { label: "Acceptée", color: "text-emerald-500", dot: "bg-emerald-500" },
    }[invoice.status] || { label: invoice.status, color: "text-slate-500", dot: "bg-slate-400" }

    return (
        <>
            <div className="min-w-0 text-slate-100">
                <header className="flex flex-col gap-4 border-b border-white/10 pb-5">
                    <div className="flex items-start gap-3">
                        <Link
                            href="/dashboard/invoices"
                            aria-label="Retour aux factures"
                            className="grid size-10 shrink-0 place-items-center rounded-xl border border-white/10 text-slate-300 transition-transform duration-200 ease-out hover:bg-white/5 active:scale-[0.96]"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                <h1 className="min-w-0 truncate text-base font-semibold tracking-tight sm:text-lg">
                                    Facture {invoice.number || "Sans numéro"}
                                </h1>
                                <span className={cn("inline-flex shrink-0 items-center gap-2 text-xs font-medium", statusConfig.color)}>
                                    <span className={cn(
                                        "inline-flex h-2 w-2 rounded-full",
                                        statusConfig.dot,
                                        (invoice.status === "SENT" || invoice.status === "OVERDUE") && "animate-pulse"
                                    )} />
                                    {statusConfig.label}
                                </span>
                            </div>
                            <p className="mt-0.5 truncate text-sm text-slate-400">
                                {invoice.client?.name || "Client inconnu"}
                            </p>
                        </div>
                    </div>

                    <div className={cn("grid grid-cols-1 gap-2 sm:grid-cols-2", !isPaid && "lg:grid-cols-3")}>
                        <Button
                            onClick={handleOpenEmailModal}
                            disabled={isPaid}
                            className={cn(
                                "h-11 w-full rounded-xl font-medium active:scale-[0.98]",
                                isPaid
                                    ? "bg-slate-800 text-slate-500"
                                    : "bg-[#2563EB] text-white hover:bg-[#1d4ed8]"
                            )}
                        >
                            <Mail className="h-4 w-4" />
                            {isSent ? "Renvoyer par email" : "Envoyer une relance"}
                        </Button>

                        {!isPaid && (
                            <Button
                                onClick={handleMarkAsPaid}
                                disabled={isMarkingPaid}
                                variant="outline"
                                className="h-11 w-full rounded-xl border-white/10 bg-transparent font-medium text-slate-100 hover:bg-white/5 active:scale-[0.98]"
                            >
                                {isMarkingPaid ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-[#2563EB]" />
                                ) : null}
                                Marquer comme payée
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className={cn(
                                "h-11 w-full rounded-xl border-white/10 bg-transparent font-medium text-slate-100 hover:bg-white/5 active:scale-[0.98]",
                                !isPaid && "sm:col-span-2 lg:col-span-1"
                            )}
                        >
                            {isDownloading ? (
                                <Loader2 className="h-4 w-4 animate-spin text-[#2563EB]" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                            Télécharger le PDF
                        </Button>
                    </div>
                </header>

                <div className="mt-6 grid min-w-0 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10">
                    <div className="min-w-0">
                        <div className="mx-auto w-full max-w-[650px] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 p-1.5 sm:p-2">
                            <DocumentPreview
                                documentId={invoiceId}
                                layoutStyle={invoice.layout_style || "modern"}
                            />
                        </div>
                    </div>

                    <aside className="flex min-w-0 flex-col gap-8">
                        <section>
                            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Montants
                            </h2>
                            <div className="text-sm">
                                <div className="flex items-baseline justify-between gap-4 border-b border-white/10 py-3">
                                    <span className="text-slate-400">Sous-total</span>
                                    <span suppressHydrationWarning className="shrink-0 tabular-nums font-medium">
                                        {formatCurrency(invoice.subtotal_cents || 0)}
                                    </span>
                                </div>
                                <div className="flex items-baseline justify-between gap-4 border-b border-white/10 py-3">
                                    <span className="text-slate-400">TVA</span>
                                    <span suppressHydrationWarning className="shrink-0 tabular-nums font-medium">
                                        {formatCurrency(invoice.tax_total_cents || 0)}
                                    </span>
                                </div>
                                <div className="flex items-baseline justify-between gap-4 pt-4">
                                    <span className="font-semibold">Total</span>
                                    <span suppressHydrationWarning className="shrink-0 text-lg font-semibold tabular-nums tracking-tight">
                                        {formatCurrency(invoice.total_cents || invoice.grand_total_cents || 0)}
                                    </span>
                                </div>
                            </div>

                            {invoice.due_date && (
                                <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                                    <div className="mb-1 text-xs text-slate-500">Échéance</div>
                                    <div
                                        suppressHydrationWarning
                                        className={cn(
                                            "text-sm font-semibold",
                                            isOverdue ? "text-rose-400" : "text-slate-100"
                                        )}
                                    >
                                        {new Date(invoice.due_date).toLocaleDateString('fr-FR', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                        {isOverdue && (
                                            <span className="mt-1 block text-xs font-medium text-rose-400">En retard</span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>

                        <section>
                            <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                Client
                            </h2>
                            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                                <div className="mb-1 truncate text-sm font-semibold">
                                    {invoice.client?.name || "Client"}
                                </div>
                                <div className="space-y-1.5 text-xs text-slate-400">
                                    {invoice.client?.email && (
                                        <div className="flex min-w-0 items-start gap-2">
                                            <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                                            <span className="min-w-0 break-all">{invoice.client.email}</span>
                                        </div>
                                    )}
                                    {invoice.client?.phone && (
                                        <div className="break-all">{invoice.client.phone}</div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </aside>
                </div>
            </div>

            {/* ✅ MODAL D'ENVOI */}
            <SendEmailModal
                open={isEmailModalOpen}
                onOpenChange={setIsEmailModalOpen}
                documentId={invoiceId}
                documentNumber={invoice.number || ""}
                clientEmail={invoice.client?.email || ""}
                clientName={invoice.client?.name || ""}
                documentLabel="facture"  
                onSent={handleEmailSent}
            />
        </>
    )
}