"use client"

import { useInvoice, useUpdateInvoiceStatus } from "../hooks/useInvoices"
import { DocumentPreview } from "@/features/quotes/components/DocumentPreview"
import { Button } from "@/components/ui/button"
import { invoicesApi } from "../api/invoicesApi"
import { formatCurrency } from "@/features/quotes/lib/formatCurrency"
import { 
    Mail, Check, Download, Bell, ArrowLeft, Loader2, 
    FileText, CheckCircle2, Send, Copy, CheckCheck
} from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useState } from "react"

import { cn } from "@/lib/utils"
import { SendEmailModal } from "@/features/quotes/components/sendEmailModal"

export function InvoiceDetail({ invoiceId }: { invoiceId: string }) {
    const { data: invoice, isLoading, error, refetch } = useInvoice(invoiceId)
    const updateStatus = useUpdateInvoiceStatus()
    const { toast } = useToast()
    
    // États locaux
    const [isSending, setIsSending] = useState(false)
    const [isReminding, setIsReminding] = useState(false)
    const [isMarkingPaid, setIsMarkingPaid] = useState(false)
    const [copied, setCopied] = useState(false)
    
    // ✅ NOUVEAU : Modal d'envoi
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)

    if (isLoading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[100dvh]">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
        )
    }

    if (error || !invoice) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[100dvh]">
                <FileText className="h-8 w-8 text-slate-300 mb-4" />
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Facture introuvable</h2>
                <p className="text-sm text-slate-500 mb-6">Le document demandé n'est pas disponible.</p>
                <Link href="/dashboard/invoices">
                    <Button variant="outline" className="rounded-md">Retour aux factures</Button>
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
                title: "✅ Facture payée",
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

    const [isDownloading, setIsDownloading] = useState(false);

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

    const handleRemind = async () => {
        setIsReminding(true)
        setTimeout(() => {
            setIsReminding(false)
            toast({
                title: "Relance effectuée",
                description: "Le client a été notifié.",
            })
        }, 800)
    }

    const handleCopyLink = async () => {
        if (!invoice.client_token && !invoice.share_token) {
            toast({
                title: "Lien non disponible",
                description: "Envoyez d'abord la facture pour générer le lien.",
                variant: "destructive",
            })
            return
        }
        const url = `${window.location.origin}/view/${invoice.share_token}`
        await navigator.clipboard.writeText(url)
        setCopied(true)
        toast({
            title: "Lien copié !",
            description: "Le lien partageable est dans votre presse-papiers.",
        })
        setTimeout(() => setCopied(false), 2000)
    }

    // ═══════════════════════════════════════════════════════════════
    // Statut d'affichage
    // ═══════════════════════════════════════════════════════════════
    const statusConfig = {
        DRAFT: { label: "Brouillon", color: "text-slate-500", dot: "bg-slate-400" },
        SENT: { label: "Envoyée", color: "text-sky-500", dot: "bg-sky-500" },
        VIEWED: { label: "Consultée", color: "text-blue-500", dot: "bg-blue-500" },
        PAID: { label: "Payée", color: "text-emerald-500", dot: "bg-emerald-500" },
        OVERDUE: { label: "En retard", color: "text-rose-500", dot: "bg-rose-500" },
        REFUSED: { label: "Refusée", color: "text-rose-500", dot: "bg-rose-500" },
        ACCEPTED: { label: "Acceptée", color: "text-emerald-500", dot: "bg-emerald-500" },
    }[invoice.status] || { label: invoice.status, color: "text-slate-500", dot: "bg-slate-400" }

    return (
        <>
            <div className="min-h-[100dvh] bg-[#FAFAFA] dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
                <header className="sticky top-0 z-30 w-full bg-[#FAFAFA]/90 dark:bg-[#0A0A0A]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                    <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link href="/dashboard/invoices" className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-200">
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <div className="flex items-baseline gap-3">
                                <h1 className="text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                                    Facture {invoice.number || "Sans numéro"}
                                </h1>
                                <span className="text-sm text-slate-500">
                                    {invoice.client?.name || "Client inconnu"}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className={cn("flex items-center gap-2 text-xs font-medium", statusConfig.color)}>
                                <span className="relative flex h-2 w-2">
                                    <span className={cn(
                                        "relative inline-flex rounded-full h-2 w-2",
                                        statusConfig.dot,
                                        (invoice.status === "SENT" || invoice.status === "OVERDUE") && "animate-pulse"
                                    )}></span>
                                </span>
                                {statusConfig.label}
                            </div>
                            
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="h-8 gap-1.5 text-xs rounded-md border-slate-200 dark:border-slate-800"
                            >
                                {isDownloading ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <Download className="h-3.5 w-3.5" />
                                )}
                                <span>PDF</span>
                            </Button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 flex flex-col lg:flex-row gap-12 lg:gap-24">
                    
                    {/* Left Column: Preview */}
                    <div className="flex-1 w-full flex items-start justify-center lg:justify-end">
                        <div className="w-full max-w-[650px] bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 p-2 shadow-sm">
                            <DocumentPreview 
                                documentId={invoiceId} 
                                layoutStyle={invoice.layout_style || "modern"} 
                            />
                        </div>
                    </div>

                    {/* Right Column: Details & Actions */}
                    <div className="w-full lg:w-[320px] flex flex-col shrink-0 lg:pt-2">

                        <div className="flex items-center gap-5 mb-8 justify-center">
                                        <Button 
                                    onClick={handleOpenEmailModal} 
                                    disabled={isPaid}
                                    variant="default"
                                    className={cn(
                                        "w-full  rounded-md font-medium justify-between px-4 transition-colors duration-200",
                                        isPaid 
                                            ? "bg-[#2563EB] text-slate-500 cursor-not-allowed dark:bg-slate-800 "
                                            : "bg-[#2563EB] cursor-pointer  text-white "
                                    )}
                                >
                                    <span>{isSent ? "Renvoyer par email" : "Envoyer une relance"}</span>
                                    
                                </Button>

                                 {!isPaid && (
                                    <Button 
                                        onClick={handleMarkAsPaid}
                                        disabled={isMarkingPaid}
                                        variant="outline"
                                        className="w-full h-10 cursor-pointer rounded-md border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-900 dark:text-slate-100 font-medium justify-between px-4 transition-colors duration-200"
                                    >
                                        <span>Marquer comme payée</span>
                                        
                                    </Button>
                                )}
                        </div>
                        
                        {/* Montants */}
                        <div className="mb-12">
                            <h3 className="text-xs font-semibold text-slate-400 tracking-widest uppercase mb-6">
                                Montants
                            </h3>
                            
                            <div className="space-y-0 text-sm">
                                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 py-3">
                                    <span className="text-slate-500">Sous-total</span>
                                    <span className="font-medium text-slate-900 dark:text-slate-100">
                                        {formatCurrency(invoice.subtotal_cents || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 py-3">
                                    <span className="text-slate-500">TVA</span>
                                    <span className="font-medium text-slate-900 dark:text-slate-100">
                                        {formatCurrency(invoice.tax_total_cents || 0)}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-4">
                                    <span className="font-semibold text-slate-900 dark:text-slate-100">Total</span>
                                    <span className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-100">
                                        {formatCurrency(invoice.total_cents || invoice.grand_total_cents || 0)}
                                    </span>
                                </div>
                            </div>

                            {invoice.due_date && (
                                <div className="mt-4 p-3 rounded-md bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                                    <div className="text-xs text-slate-500 mb-1">Échéance</div>
                                    <div className={cn(
                                        "text-sm font-semibold",
                                        isOverdue ? "text-rose-500" : "text-slate-900 dark:text-slate-100"
                                    )}>
                                        {new Date(invoice.due_date).toLocaleDateString('fr-FR', {
                                            day: '2-digit',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                        {isOverdue && " ⚠️"}
                                    </div>
                                </div>
                            )}
                        </div>

                      

                        {/* Infos client */}
                        <div>
                            <h3 className="text-xs font-semibold text-slate-400 tracking-widest uppercase mb-4">
                                Client
                            </h3>
                            <div className="p-4 rounded-md bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800">
                                <div className="font-semibold text-sm text-slate-900 dark:text-slate-100 mb-1">
                                    {invoice.client?.name || "Client"}
                                </div>
                                <div className="text-xs text-slate-500 space-y-1">
                                    {invoice.client?.email && (
                                        <div className="flex items-center gap-1.5">
                                            <Mail className="h-3 w-3" />
                                            <span>{invoice.client.email}</span>
                                        </div>
                                    )}
                                    {invoice.client?.phone && (
                                        <div>{invoice.client.phone}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </main>
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