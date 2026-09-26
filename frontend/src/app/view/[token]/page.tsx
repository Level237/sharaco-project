// app/view/[token]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { Loader2, AlertCircle, Download, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { templatesApi } from "@/features/templates/api/templatesApi";
import type { DocumentPreviewRequest } from "@/features/templates/types";
import { cn } from "@/lib/utils";

interface SharedDocument {
    id: string;
    type: "DEVIS" | "FACTURE";
    number?: string;
    created_at: string;
    due_date?: string;
    layout_style: string;
    notes?: string;
    items: Array<{
        description: string;
        quantity: number;
        unit_price_cents: number;
        tax_rate: number;
    }>;
    subtotal_cents: number;
    tax_total_cents: number;
    grand_total_cents: number;
    primary_color: string;
    background_color: string;
    text_color: string;
    company_name?: string;
    company_email?: string;
    company_phone?: string;
    company_address?: string;
    client_name?: string;
    client_email?: string;
    client_address?: string;
}

export default function SharedDocumentPage() {
    const params = useParams();
    const token = params.token as string;

    const [document, setDocument] = useState<SharedDocument | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [previewHtml, setPreviewHtml] = useState<string>("");

    useEffect(() => {
        let cancelled = false;
        const fetchDocument = async () => {
            try {
                const data = await api.get<SharedDocument>(`/api/v1/documents/shared/${token}`);
                if (cancelled) return;
                setDocument(data);

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
                        tax_rate: item.tax_rate,
                    })),
                    template_id: null,
                    layout_style: data.layout_style || "classic",
                    primary_color: data.primary_color || "#2563EB",
                    secondary_color: data.background_color || "#1E40AF",
                    accent_color: data.text_color || "#DBEAFE",
                    text_color: data.text_color || "#1F2937",
                    background_color: data.background_color || "#FFFFFF",
                    font_family: "Inter",
                    header_text: null,
                    footer_text: null,
                    show_bank_details: true,
                    show_tax_id: true,
                    notes: data.notes || null,
                    reference: data.number || null,
                };

                const html = await templatesApi.previewDocument(requestData);
                if (!cancelled) {
                    setPreviewHtml(html);
                }
            } catch (err: any) {
                if (!cancelled) {
                    setError(err.response?.data?.detail || err.message || "Document introuvable ou lien expiré");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        if (token) {
            fetchDocument();
        }
        return () => { cancelled = true; };
    }, [token]);

    if (loading && !previewHtml) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black">
                <div className="h-16 w-16 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-4">
                    <Loader2 className="h-8 w-8 text-violet-500 animate-spin" />
                </div>
                <span className="text-zinc-500 text-xs font-black uppercase tracking-[0.2em] animate-pulse">Chargement sécurisé...</span>
            </div>
        );
    }

    if (error || !document) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black p-4">
                <div className="max-w-md w-full bg-zinc-900 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] p-8 text-center border border-white/5">
                    <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="h-8 w-8 text-rose-500" />
                    </div>
                    <h1 className="text-xl font-black text-white mb-2">Document inaccessible</h1>
                    <p className="text-zinc-500 font-medium text-sm">{error || "Ce document n'existe pas ou a été supprimé."}</p>
                </div>
            </div>
        );
    }

    const doc = document;
    const primaryColor = doc.primary_color || "#0ea5e9";

    const handleDownload = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-black print:bg-white text-zinc-100 font-sans pb-24">
            {/* Top Action Bar (hidden when printing) */}
            <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-2xl border-b border-white/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] print:hidden">
                <div className="max-w-[1000px] mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img src="/img/logo.png" alt="Sharaco Logo" className="h-12 w-auto object-contain" />
                        <div className="h-6 w-px bg-white/10" />

                    </div>

                </div>
            </div>

            {/* Document Container */}
            <div className="max-w-[1000px] w-full mx-auto mt-8 px-4 sm:px-6 print:mt-0 print:px-0">
                <div className="bg-green-400 shadow-[0_30px_100px_-15px_rgba(0,0,0,0.5)] overflow-hidden border border-white/5 print:shadow-none print:border-none print:rounded-none relative">
                    {previewHtml ? (
                        <iframe
                            srcDoc={previewHtml}
                            className="w-full h-[120vh] border-0 bg-transparent"
                            title="Aperçu du document"
                            sandbox="allow-same-origin"
                        />
                    ) : (
                        <div className={cn(
                            "flex flex-col h-[120vh] items-center justify-center bg-zinc-50 overflow-hidden relative"
                        )}>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                            <div className="flex flex-col items-center gap-4 relative z-10">
                                <div className="h-12 w-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                                    <Loader2 className="h-6 w-6 text-sky-500 animate-spin" />
                                </div>
                                <span className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">Chargement du document...</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}