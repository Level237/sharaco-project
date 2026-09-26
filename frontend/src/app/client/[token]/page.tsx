// app/client/[token]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import {
    Loader2, AlertCircle, CheckCircle2, XCircle, PenTool,
    MessageSquare, Shield, Sparkles, ArrowRight, FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/features/quotes/lib/formatCurrency";
import { templatesApi } from "@/features/templates/api/templatesApi";
import type { DocumentPreviewRequest } from "@/features/templates/types";
import { cn } from "@/lib/utils";
import { MilestonePreview } from "@/features/quotes/types";

interface ClientDocument {
    id: string;
    type: "DEVIS" | "FACTURE";
    status: string;
    number?: string;
    created_at: string;
    due_date?: string;
    layout_style?: string;
    notes?: string;
    items: any[];
    subtotal_cents: number;
    tax_total_cents: number;
    grand_total_cents: number;
    primary_color: string;
    background_color?: string;
    text_color?: string;
    company_name?: string;
    client_name?: string;
    client_email?: string;
    client_address?: string;
    can_validate: boolean;
    accepted_at?: string;
    refused_at?: string;
    refusal_reason?: string;
    signature_name?: string;
    payment_schedule?: MilestonePreview[] | null;
}

export default function ClientDocumentPage() {
    const params = useParams();
    const token = params.token as string;
    const { toast } = useToast();



    const [document, setDocument] = useState<ClientDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [previewHtml, setPreviewHtml] = useState<string>("");

    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [showRefuseModal, setShowRefuseModal] = useState(false);
    const [signatureName, setSignatureName] = useState("");
    const [refusalReason, setRefusalReason] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [actionCompleted, setActionCompleted] = useState(false);

useEffect(() => {
    let cancelled = false;
    const fetchDocument = async () => {
        try {
            const data = await api.get<ClientDocument>(`/api/v1/documents/client/${token}`);
            console.log(data)
            if (cancelled) return;
            setDocument(data);

            // ✅ Helper pour détecter l'échéancier valide
            const hasValidSchedule = 
                data.payment_schedule && 
                data.payment_schedule.length > 0 &&
                !(data.payment_schedule.length === 1 && data.payment_schedule[0].percent === 100);

            // Fetch HTML preview
            const requestData: DocumentPreviewRequest = {
                type: data.type,
                client_name: data.client_name || "Client Exemple",
                client_email: data.client_email || "",
                client_address: data.client_address || "",
                client_phone: "",
                items: data.items.map((item) => ({
                    description: item.description,
                    quantity: item.quantity,
                    unit_price_cents: item.unit_price_cents,
                    tax_rate: item.tax_rate || 0,
                })),
                template_id: null,
                layout_style: data.layout_style || "classic",
                primary_color: data.primary_color || "#2563EB",
                secondary_color: "#1E40AF",  // ✅ Corrigé : valeur par défaut
                accent_color: "#DBEAFE",      // ✅ Corrigé : valeur par défaut
                text_color: "#1F2937",         // ✅ Corrigé
                background_color: "#FFFFFF",   // ✅ Corrigé
                font_family: "Inter",
                header_text: null,
                footer_text: null,
                show_bank_details: true,
                show_tax_id: true,
                notes: data.notes || null,
                reference: data.number || null,
                
                // ✅ AJOUTÉ : échéancier de paiement
                payment_schedule: hasValidSchedule
                    ? data.payment_schedule!.map((ms, idx) => ({
                        sequence: ms.sequence || (idx + 1),
                        title: ms.title || `Échéance ${idx + 1}`,
                        percent: ms.percent,
                        description: ms.description || null,
                        trigger_date: ms.trigger_date || null,
                    }))
                    : null,
            };

             const html = await templatesApi.previewDocumentByClientToken(token);
            setPreviewHtml(html);
            if (!cancelled) {
                setPreviewHtml(html);
            }
        } catch (err: any) {
            if (!cancelled) {
                setError(err.response?.data?.detail || "Document introuvable");
            }
        } finally {
            if (!cancelled) {
                setLoading(false);
            }
        }
    };

    if (token) fetchDocument();
    return () => { cancelled = true; };
}, [token]);


    const handleAccept = async () => {
        if (document?.type === "FACTURE") return;
        if (!signatureName.trim()) {
            toast({
                title: "Nom requis",
                description: "Veuillez entrer votre nom pour valider",
                variant: "destructive",
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await api.post<{ already_accepted?: boolean }>(`/api/v1/documents/client/${token}/accept`, {
                signature_name: signatureName,
            });

            // ✅ Gérer le cas "déjà accepté"
            if (response.already_accepted) {
                toast({
                    title: "ℹ️ Déjà accepté",
                    description: "Ce devis a déjà été accepté.",
                });
            } else {
                toast({
                    title: "✅ Devis accepté !",
                    description: "Le prestataire a été notifié.",
                });
            }

            // ✅ Rafraîchir les données et masquer les boutons
            const data = await api.get<ClientDocument>(`/api/v1/documents/client/${token}`);
            setDocument(data);
            setShowAcceptModal(false);
            setSignatureName("");
            setActionCompleted(true); // ✅ Marquer comme terminé

        } catch (err: any) {
            toast({
                title: "Erreur",
                description: err.response?.data?.detail || "Impossible d'accepter",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRefuse = async () => {
        if (document?.type === "FACTURE") return;
        setIsSubmitting(true);
        try {
            const response = await api.post<{ already_refused?: boolean }>(`/api/v1/documents/client/${token}/refuse`, {
                reason: refusalReason || null,
            });

            // ✅ Gérer le cas "déjà refusé"
            if (response.already_refused) {
                toast({
                    title: "ℹ️ Déjà refusé",
                    description: "Ce devis a déjà été refusé.",
                });
            } else {
                toast({
                    title: "Devis refusé",
                    description: "Votre retour a été enregistré.",
                });
            }

            const data = await api.get<ClientDocument>(`/api/v1/documents/client/${token}`);
            setDocument(data);
            setShowRefuseModal(false);
            setRefusalReason("");
            setActionCompleted(true); // ✅ Marquer comme terminé

        } catch (err: any) {
            toast({
                title: "Erreur",
                description: err.response?.data?.detail || "Impossible de refuser",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };


    // Loading state
    if (loading && !previewHtml) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black">
                <div className="h-16 w-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                    <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
                </div>
                <span className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em] animate-pulse">
                    Chargement sécurisé...
                </span>
            </div>
        );
    }

    // Error state
    if (error || !document) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black p-4">
                <div className="max-w-md w-full bg-zinc-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 text-center border border-white/5">
                    <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="h-8 w-8 text-rose-500" />
                    </div>
                    <h1 className="text-xl font-black text-white mb-2">Document inaccessible</h1>
                    <p className="text-zinc-500 font-medium text-sm">
                        {error || "Ce document n'existe pas ou a été supprimé."}
                    </p>
                </div>
            </div>
        );
    }


    const showActions = document.can_validate && !actionCompleted;
    return (
        <div className="min-h-screen bg-black text-zinc-100 font-sans pb-32 selection:bg-violet-500/30">
            {/* Top Action Bar */}
            <div className="sticky top-0 z-50 bg-black/60 backdrop-blur-2xl border-b border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)]">
                <div className="max-w-[1000px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img src="/img/logo.png" alt="Sharaco Logo" className="h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
                        <div className="h-6 w-px bg-white/10" />
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/5">
                            <Shield className="h-3.5 w-3.5 text-emerald-400" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                Espace sécurisé
                            </span>
                        </div>
                    </div>

                    {/* Actions ou Indicateur de statut en haut à droite */}
                    <div className="flex items-center gap-3">
                        {document.type === "DEVIS" ? (
                            document.can_validate && document.status !== "ACCEPTED" && document.status !== "REFUSED" ? (
                                <>
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowRefuseModal(true)}
                                        className="border-white/10 bg-white/5 hover:bg-rose-500/10 hover:border-rose-500/30 text-white hover:text-rose-300 h-10 rounded-xl transition-all"
                                    >
                                        <XCircle className="mr-2 h-4 w-4" />
                                        Refuser
                                    </Button>
                                    <Button
                                        onClick={() => setShowAcceptModal(true)}
                                        className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold h-10 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all"
                                    >
                                        <CheckCircle2 className="mr-2 h-4 w-4" />
                                        Accepter le devis
                                    </Button>
                                </>
                            ) : (
                                <>
                                    {document.status === "ACCEPTED" && (
                                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                            <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                                                Devis Accepté
                                            </span>
                                        </div>
                                    )}
                                    {document.status === "REFUSED" && (
                                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                                            <XCircle className="h-4 w-4 text-rose-400" />
                                            <span className="text-xs font-black uppercase tracking-wider text-rose-400">
                                                Devis Refusé
                                            </span>
                                        </div>
                                    )}
                                    {document.status === "VIEWED" && (
                                        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                                            <div className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                                            <span className="text-xs font-black uppercase tracking-wider text-amber-400">
                                                En attente
                                            </span>
                                        </div>
                                    )}
                                </>
                            )
                        ) : (
                            /* Pour les factures : statut + CTA Essayez Sharaco */
                            <div className="flex items-center gap-3">
                                {document.status === "PAID" ? (
                                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                        <span className="text-xs font-black uppercase tracking-wider text-emerald-400">
                                            Facture Payée
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20">
                                        <FileText className="h-3.5 w-3.5 text-sky-400" />
                                        <span className="text-xs font-semibold tracking-wide text-sky-400">
                                            Facture {document.number || ""}
                                        </span>
                                    </div>
                                )}
                                <Link
                                    href="/signup"
                                    className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-md shadow-sky-500/20 hover:scale-[1.02] active:scale-[0.98]"
                                >
                                    <Sparkles className="h-3.5 w-3.5" />
                                    Essayez Sharaco
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-[1000px] w-full mx-auto mt-10 px-4 sm:px-6">

                {/* Bandeau statut détaillé */}
                {document.type === "DEVIS" && document.status === "ACCEPTED" && (
                    <div className="mb-10 relative overflow-hidden bg-emerald-950/20 border border-emerald-500/20 rounded-3xl p-8 text-center backdrop-blur-xl">
                        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent" />
                        <div className="relative z-10">
                            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-emerald-500/10 mb-4 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-2">Félicitations, devis accepté !</h2>
                            <p className="text-zinc-400 text-lg">
                                Validé avec succès par <strong className="text-emerald-400">{document.signature_name}</strong>
                                {document.accepted_at && (
                                    <span> le {new Date(document.accepted_at).toLocaleDateString("fr-FR")}</span>
                                )}
                            </p>
                        </div>
                    </div>
                )}

                {document.type === "DEVIS" && document.status === "REFUSED" && (
                    <div className="mb-10 relative overflow-hidden bg-rose-950/20 border border-rose-500/20 rounded-3xl p-8 text-center backdrop-blur-xl">
                        <div className="absolute inset-0 bg-gradient-to-b from-rose-500/5 to-transparent" />
                        <div className="relative z-10">
                            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-rose-500/10 mb-4 shadow-[0_0_40px_rgba(244,63,94,0.2)]">
                                <XCircle className="h-10 w-10 text-rose-400" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-2">Devis refusé</h2>
                            {document.refusal_reason && (
                                <p className="text-zinc-400 text-lg italic max-w-2xl mx-auto">
                                    "{document.refusal_reason}"
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {document.type === "FACTURE" && document.status === "PAID" && (
                    <div className="mb-10 relative overflow-hidden bg-emerald-950/20 border border-emerald-500/20 rounded-3xl p-8 text-center backdrop-blur-xl">
                        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent" />
                        <div className="relative z-10">
                            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-emerald-500/10 mb-4 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
                                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-2">Facture réglée</h2>
                            <p className="text-zinc-400 text-lg">
                                Cette facture est marquée comme payée. Merci pour votre règlement !
                            </p>
                        </div>
                    </div>
                )}

                {/* Contenu du document */}
                <div className="bg-white/5 shadow-[0_30px_100px_-15px_rgba(0,0,0,0.7)] overflow-hidden border border-white/10 rounded-2xl relative mb-12 ring-1 ring-white/5 print:shadow-none print:border-none print:rounded-none">
                    {previewHtml ? (
                        <iframe
                            srcDoc={previewHtml}
                            className="w-full h-[120vh] border-0 bg-white"
                            title="Aperçu du document"
                            sandbox="allow-same-origin"
                        />
                    ) : (
                        <div className={cn(
                            "flex flex-col h-[120vh] items-center justify-center bg-zinc-900/50 backdrop-blur-md overflow-hidden relative"
                        )}>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                            <div className="flex flex-col items-center gap-5 relative z-10">
                                <div className="h-16 w-16 rounded-3xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                                    <Loader2 className="h-8 w-8 text-violet-400 animate-spin" />
                                </div>
                                <span className="text-zinc-400 text-xs font-bold uppercase tracking-[0.3em]">
                                    Génération du document...
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* ✅ Actions de validation supprimées d'ici, déplacées dans le header */}

                {/* Message si le devis est déjà traité */}
                {document.type === "DEVIS" && (document.status === "ACCEPTED" || document.status === "REFUSED") && (
                    <div className="bg-zinc-900/30 border border-white/5 rounded-3xl p-8 text-center mt-8">
                        <p className="text-zinc-500 text-base">
                            Ce document est verrouillé car il a déjà été traité.
                        </p>
                    </div>
                )}

               
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* MODAL ACCEPTER (DEVIS UNIQUEMENT) */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {document.type === "DEVIS" && (
                <Dialog open={showAcceptModal} onOpenChange={setShowAcceptModal}>
                    <DialogContent className="sm:max-w-[500px] bg-zinc-950/90 backdrop-blur-3xl border-white/10 text-white shadow-[0_0_100px_rgba(16,185,129,0.15)] rounded-[2rem] p-0 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400/0 via-emerald-400 to-emerald-400/0 opacity-50" />

                        <div className="p-8">
                            <DialogHeader className="mb-6">
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="h-16 w-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                                        <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-2xl font-black text-white">
                                            Validation finale
                                        </DialogTitle>
                                        <DialogDescription className="text-zinc-400 mt-2 text-base">
                                            Vous êtes sur le point d'accepter le devis <strong className="text-white">{document.number}</strong>
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-6">
                                {/* Résumé du devis */}
                                <div className="p-5 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-zinc-400">Montant total TTC</span>
                                        <span className="text-2xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                                            {formatCurrency(document.grand_total_cents)}
                                        </span>
                                    </div>
                                </div>

                                {/* Signature */}
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                                        <PenTool className="h-4 w-4 text-emerald-400" />
                                        Signature électronique
                                    </label>
                                    <Input
                                        placeholder="Prénom et Nom"
                                        value={signatureName}
                                        onChange={(e) => setSignatureName(e.target.value)}
                                        className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:ring-emerald-500/20 h-14 text-lg rounded-xl transition-all"
                                        disabled={isSubmitting}
                                        autoFocus
                                    />
                                    <p className="text-xs text-zinc-500">
                                        En signant, vous acceptez les conditions de cette proposition commerciale.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowAcceptModal(false)}
                                    disabled={isSubmitting}
                                    className="flex-1 border-white/10 bg-transparent text-zinc-400 hover:bg-white/5 hover:text-white h-14 rounded-xl text-base"
                                >
                                    Annuler
                                </Button>
                                <Button
                                    onClick={handleAccept}
                                    disabled={!signatureName.trim() || isSubmitting}
                                    className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50 disabled:shadow-none h-14 rounded-xl text-base transition-all"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Signature...
                                        </>
                                    ) : (
                                        <>Signer le devis</>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* MODAL REFUSER (DEVIS UNIQUEMENT) */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {document.type === "DEVIS" && (
                <Dialog open={showRefuseModal} onOpenChange={setShowRefuseModal}>
                    <DialogContent className="sm:max-w-[500px] bg-zinc-950/90 backdrop-blur-3xl border-white/10 text-white shadow-[0_0_100px_rgba(244,63,94,0.15)] rounded-[2rem] p-0 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-500/0 via-rose-500 to-rose-500/0 opacity-50" />

                        <div className="p-8">
                            <DialogHeader className="mb-6">
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className="h-16 w-16 rounded-3xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                                        <XCircle className="h-8 w-8 text-rose-400" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-2xl font-black text-white">
                                            Refuser ou Modifier
                                        </DialogTitle>
                                        <DialogDescription className="text-zinc-400 mt-2 text-base">
                                            Aidez le prestataire à mieux comprendre vos attentes
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-6">
                                {/* Motif */}
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                                        <MessageSquare className="h-4 w-4 text-rose-400" />
                                        Laissez un commentaire (optionnel)
                                    </label>
                                    <Textarea
                                        placeholder="Ex: Le budget dépasse notre enveloppe, j'aimerais ajuster certaines lignes..."
                                        value={refusalReason}
                                        onChange={(e) => setRefusalReason(e.target.value)}
                                        rows={4}
                                        disabled={isSubmitting}
                                        className="bg-black/50 border-white/10 text-white placeholder:text-zinc-600 focus:border-rose-500/50 focus:ring-rose-500/20 resize-none rounded-xl p-4 text-base transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 mt-8">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowRefuseModal(false)}
                                    disabled={isSubmitting}
                                    className="flex-1 border-white/10 bg-transparent text-zinc-400 hover:bg-white/5 hover:text-white h-14 rounded-xl text-base"
                                >
                                    Annuler
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={handleRefuse}
                                    disabled={isSubmitting}
                                    className="flex-1 bg-rose-500 hover:bg-rose-400 text-black font-bold shadow-[0_0_30px_rgba(244,63,94,0.3)] h-14 rounded-xl text-base transition-all"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            Envoi...
                                        </>
                                    ) : (
                                        "Envoyer le retour"
                                    )}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    );
}