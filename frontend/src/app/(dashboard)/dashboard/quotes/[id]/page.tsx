// app/dashboard/quotes/[id]/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { quotesApi } from "@/features/quotes/api/quotesApi";
import { DocumentPreview } from "@/features/quotes/components/DocumentPreview";
import { PaymentTimeline } from "@/features/quotes/components/PaymentTimeline";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/features/quotes/lib/formatCurrency";
import { useDeleteDocument } from "@/features/quotes/hooks/useDeleteDocument";
import { Mail, Edit, Download, Trash2, ArrowLeft, Loader2, FileText, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { SendEmailModal } from "@/features/quotes/components/sendEmailModal";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface QuoteDetail {
    id?: string;
    number?: string;
    status?: string;
    client?: { name?: string };
    client_name?: string;
    client_email?: string;
    layout_style?: string;
    subtotal_cents?: number;
    tax_total_cents?: number;
    total_cents?: number;
    grand_total_cents?: number;
    payment_schedule?: Array<{
        id?: string;
        sequence?: number;
        title?: string;
        percent?: number;
        amount_cents?: number;
        status?: string;
    }>;
}

export default function QuoteDetailPage() {
    const params = useParams();
    const router = useRouter();
    const quoteId = params.id as string;

    const [quote, setQuote] = useState<QuoteDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const { toast } = useToast();

    const { deleteDocument, isDeleting } = useDeleteDocument({
        onSuccess: () => router.push("/dashboard/quotes")
    });

    const loadQuote = useCallback(async () => {
        try {
            const data = await quotesApi.getById(quoteId);
            setQuote(data as QuoteDetail);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [quoteId]);

    useEffect(() => {
        if (quoteId) loadQuote();
    }, [quoteId, loadQuote]);

    const handleDownload = async () => {
        setIsDownloading(true);
        try {
            await quotesApi.downloadPdf(quoteId, `${quote?.number || 'devis'}.pdf`);
            toast({
                title: "Succès",
                description: "Le téléchargement du devis a démarré.",
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

    const handleSendEmail = () => {
        setIsEmailModalOpen(true);
    };

    const handleEmailSent = () => {
        setIsEmailModalOpen(false);
    };

    const handleDelete = () => {
        if (quote?.status !== "DRAFT") return;
        deleteDocument(quoteId, quote?.number);
    };

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[100dvh]">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
        );
    }

    if (!quote) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[100dvh] px-4">
                <FileText className="h-8 w-8 text-slate-300 mb-4" />
                <h2 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Devis introuvable</h2>
                <p className="text-sm text-slate-500 mb-6 text-center">Le document demandé n&apos;est pas disponible.</p>
                <Link href="/dashboard/quotes">
                    <Button variant="outline" className="rounded-md">Retour aux devis</Button>
                </Link>
            </div>
        );
    }

    const isAccepted = quote.status === "ACCEPTED";
    const sortedMilestones = [...(quote.payment_schedule || [])].sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));
    const getNextFacturableMilestone = () => {
        for (const milestone of sortedMilestones) {
            if (milestone.status === "PENDING") {
                const prevIndex = (milestone.sequence ?? 1) - 2;
                if (prevIndex >= 0) {
                    const prev = sortedMilestones[prevIndex];
                    if (prev?.status !== "PAID") return null;
                }
                return milestone;
            }
        }
        return null;
    };
    const nextMilestone = getNextFacturableMilestone();
    const hasSchedule = quote.payment_schedule && quote.payment_schedule.length > 0 &&
        !(quote.payment_schedule.length === 1 && quote.payment_schedule[0].percent === 100);

    const handleGenerateNext = async () => {
        if (!nextMilestone) return;

        setIsGenerating(true);
        try {
            const result = await quotesApi.generateNextInvoice(quoteId);
            toast({
                title: "✅ Facture créée",
                description: `${result.invoice_number} — ${result.milestone_title} (${result.milestone_percent}%)`,
            });
            await loadQuote();
            setTimeout(() => {
                router.push(`/dashboard/invoices/${result.invoice_id}`);
            }, 600);
        } catch (err: any) {
            toast({
                title: "Erreur",
                description: err.message || "Impossible de générer la facture",
                variant: "destructive",
            });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="min-h-[100dvh] bg-[#FAFAFA] dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100 flex flex-col font-sans">
            {/* ═══════════════════════════════════════════════════════════
                HEADER (sticky)
            ═══════════════════════════════════════════════════════════ */}
            <header className="sticky top-0 z-30 w-full bg-[#FAFAFA]/90 dark:bg-[#0A0A0A]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 h-14 sm:h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                        <Link
                            href="/dashboard/quotes"
                            className="text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors duration-200 shrink-0"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="flex items-baseline gap-1.5 sm:gap-3 min-w-0">
                            <h1 className="text-xs sm:text-sm font-semibold tracking-tight text-slate-900 dark:text-slate-100 truncate">
                                Devis {quote.number || "Sans numéro"}
                            </h1>
                            <span className="hidden sm:inline text-sm text-slate-500 truncate">
                                {quote.client?.name || quote.client_name || "Client inconnu"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                        {isAccepted ? (
                            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium text-slate-500">
                                <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-500" />
                                <span className=" sm:inline">Accepté</span>
                            </div>
                        ) : quote.status === "SENT" ? (
                            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium text-sky-500">
                                <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                <span className=" sm:inline">Envoyé</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs font-medium text-slate-500">
                                <span className="relative flex h-2 w-2">
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-400"></span>
                                </span>
                                <span className="sm:inline">Brouillon</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ═══════════════════════════════════════════════════════════
                MAIN CONTENT
            ═══════════════════════════════════════════════════════════ */}
            <main className="relative flex-1 w-full max-w-[1700px] mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 lg:px-8 xl:px-10 flex flex-col xl:flex-row gap-4 sm:gap-6 xl:gap-8">

                {/* ═══════════ PREVIEW COLUMN ═══════════ */}
                <div className="flex-1 w-full flex flex-col items-center xl:items-start">
                    <div className="w-full max-w-[900px] xl:max-w-none bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 p-1.5 sm:p-2 shadow-sm mb-4 sm:mb-8">
                        <DocumentPreview
                            documentId={quoteId}
                            layoutStyle={quote.layout_style || "modern"}
                        />
                    </div>
                </div>

                {/* ═══════════ ACTIONS COLUMN ═══════════ */}
                <div className="w-full xl:w-[400px] 2xl:w-[580px] flex flex-col shrink-0 xl:pt-2 gap-4 sm:gap-6">

                    {/* ═══════════ MONTANTS CARD ═══════════ */}
                    <div className="rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-950/60 p-4 sm:p-5 shadow-[0_1px_0_rgba(15,23,42,0.03),0_8px_20px_rgba(15,23,42,0.04)] backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h3 className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-[0.14em] uppercase">
                                Récapitulatif
                            </h3>
                        </div>

                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-slate-500 dark:text-slate-400">Sous-total</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                    {formatCurrency(quote.subtotal_cents || 0)}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-slate-500 dark:text-slate-400">TVA</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">
                                    {formatCurrency(quote.tax_total_cents || 0)}
                                </span>
                            </div>

                            <div className="h-px w-full bg-slate-100 dark:bg-slate-800 my-2" />

                            <div className="flex justify-between items-center pt-2 pb-1">
                                <span className="font-semibold text-slate-900 dark:text-slate-100">Total TTC</span>
                                <span className="text-lg sm:text-xl font-bold tracking-tight text-[#2563EB] dark:text-blue-400">
                                    {formatCurrency(quote.total_cents || quote.grand_total_cents || 0)}
                                </span>
                            </div>
                        </div>

                        {isAccepted && nextMilestone && (
                            <div className="mt-5 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-100 dark:border-slate-800">
                                <Button
                                    onClick={handleGenerateNext}
                                    disabled={isGenerating}
                                    className="w-full h-11 sm:h-12 rounded-lg sm:rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-medium shadow-[0_4px_14px_0_rgba(37,99,235,0.39)] transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
                                >
                                    {isGenerating ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            <span>Génération...</span>
                                        </>
                                    ) : (
                                        <>
                                            <FileText className="h-4 w-4" />
                                            <span>Générer la facture suivante</span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* ═══════════ ACTIONS CARD ═══════════ */}
                    <div className="rounded-xl sm:rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-950/60 p-4 sm:p-5 shadow-[0_1px_0_rgba(15,23,42,0.03),0_8px_20px_rgba(15,23,42,0.04)] backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h3 className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 tracking-[0.14em] uppercase">
                                Actions rapides
                            </h3>
                        </div>

                        {/* 2 boutons principaux (grille) */}
                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            <Button
                                onClick={handleSendEmail}
                                className="group h-12 sm:h-14 cursor-pointer flex flex-col justify-center items-center gap-0.5 sm:gap-1 rounded-md sm:rounded-lg bg-[#2563EB] text-white hover:bg-[#2563EB]/80 transition-all duration-200 shadow-sm text-xs sm:text-sm"
                            >
                                
                                <span>Envoyer au client</span>
                            </Button>

                            <Button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                variant="outline"
                                className="group h-12 sm:h-14 flex flex-col justify-center items-center gap-0.5 sm:gap-1 rounded-md sm:rounded-lg border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 shadow-sm transition-all duration-200 text-xs sm:text-sm disabled:opacity-60 cursor-pointer"
                            >
                                {isDownloading ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-[#2563EB]" />
                                ) : (
                                    <Download className="h-4 w-4 text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white transition-colors" />
                                )}
                                <span>{isDownloading ? "Téléchargement..." : "Télécharger PDF"}</span>
                            </Button>
                        </div>

                        {/* Modifier + Supprimer (stack mobile, horizontal desktop) */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full mt-3 sm:mt-4">
                            <Button
                                onClick={() => router.push(`/dashboard/quotes/create/${quoteId}`)}
                                variant="outline"
                                className="flex-1 h-11 sm:h-12 gap-2 rounded-md border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 shadow-sm transition-all duration-200 text-xs sm:text-sm"
                            >
                                
                                <span>Modifier le devis</span>
                            </Button>

                            {quote.status === "DRAFT" && (
                                <Button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    variant="ghost"
                                    className="flex-1 h-11 sm:h-12 justify-center gap-2 rounded-md text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300 disabled:opacity-60 transition-all duration-200 text-xs sm:text-sm"
                                >
                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                                    <span className="font-medium">Supprimer le devis</span>
                                </Button>
                            )}
                        </div>
                    </div>

                    <SendEmailModal
                        open={isEmailModalOpen}
                        onOpenChange={setIsEmailModalOpen}
                        documentId={quoteId}
                        documentNumber={quote.number || ""}
                        clientEmail={quote.client_email || ""}
                        clientName={quote.client?.name || quote.client_name || "Client"}
                        onSent={handleEmailSent}
                        documentLabel="devis"
                    />

                    {/* ═══════════ ÉCHÉANCIER ═══════════ */}
                    {isAccepted && hasSchedule && (
                        <div className="mt-1 sm:mt-2">
                            <PaymentTimeline
                                quoteId={quoteId}
                                quoteNumber={quote.number || ""}
                                milestones={quote.payment_schedule || []}
                                quoteStatus={quote.status}
                                onUpdate={loadQuote}
                            />
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}