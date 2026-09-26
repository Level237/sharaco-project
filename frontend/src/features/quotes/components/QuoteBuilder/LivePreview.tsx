// features/quotes/components/LivePreview.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { templatesApi } from "@/features/templates/api/templatesApi";
import type { QuoteDraft } from "../../types/QuoteBuilder";
import { DocumentPreviewRequest } from "@/features/templates/types";
import { Loader2, AlertCircle, FileText } from "lucide-react";
import { cn } from "@/lib/utils"

interface LivePreviewProps {
    draft: QuoteDraft;
    layoutStyle?: string;
    templateId?: string | null;
}

// ═══════════════════════════════════════════════════════════════
// DIMENSIONS A4 EN PIXELS (96 DPI)
// 210mm ≈ 794px + 40px de padding (body @media screen) = 834px
// → 860px pour avoir une petite marge confortable (zéro scrollbar)
// ═══════════════════════════════════════════════════════════════
const PREVIEW_WIDTH = 860;
const DEFAULT_HEIGHT = 1200;

function draftToPreviewRequest(
    draft: QuoteDraft,
    layoutStyle: string,
    templateId?: string | null
): DocumentPreviewRequest {
    const hasValidSchedule =
        draft.paymentMilestones &&
        draft.paymentMilestones.length > 0 &&
        !(draft.paymentMilestones.length === 1 && draft.paymentMilestones[0].percent === 100);

    return {
        type: "DEVIS",
        client_name: draft.clientName || "Client Exemple",
        client_email: draft.clientEmail || "",
        client_address: draft.clientAddress || "",
        client_phone: draft.clientPhone || "",
        items: draft.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unit_price_cents: item.unitPrice,
            tax_rate: draft.hasVat ? draft.vatRate : 0,
        })),
        template_id: templateId || null,
        layout_style: layoutStyle,
        primary_color: draft.brandColor || "#2563EB",
        secondary_color: "#1E40AF",
        accent_color: "#DBEAFE",
        text_color: "#1F2937",
        background_color: "#FFFFFF",
        font_family: "Inter",
        header_text: null,
        footer_text: null,
        show_bank_details: true,
        show_tax_id: true,
        notes: draft.notes || null,
        reference: draft.reference || null,
        payment_schedule: hasValidSchedule
            ? draft.paymentMilestones!.map((ms, idx) => ({
                sequence: idx + 1,
                title: ms.title || `Échéance ${idx + 1}`,
                percent: ms.percent,
                description: ms.description || null,
                trigger_date: ms.trigger_date || null,
            }))
            : null,
    };
}

export function LivePreview({ draft, layoutStyle = "classic", templateId }: LivePreviewProps) {
    const [previewHtml, setPreviewHtml] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const containerRef = useRef<HTMLDivElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [scale, setScale] = useState(1);
    const [contentHeight, setContentHeight] = useState(DEFAULT_HEIGHT);

    const debouncedDraft = useDebouncedValue(draft, 500);

    // ═══════════ CALCUL DU SCALE SELON LE CONTENEUR ═══════════
    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;

        const updateScale = () => {
            const width = el.getBoundingClientRect().width;
            setScale(Math.min(1, width / PREVIEW_WIDTH));
        };

        updateScale();
        const observer = new ResizeObserver(updateScale);
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    // ═══════════ MESURE DE LA HAUTEUR RÉELLE (multi-pages) ═══════════
    const measureHeight = useCallback(() => {
        const iframe = iframeRef.current;
        if (!iframe) return;
        try {
            const doc = iframe.contentDocument;
            if (doc && doc.body) {
                const h = Math.max(
                    doc.documentElement.scrollHeight,
                    doc.body.scrollHeight
                );
                if (h > 100) setContentHeight(h);
            }
        } catch (e) {
            // ignore
        }
    }, []);

    const handleIframeLoad = useCallback(() => {
        measureHeight();
        setTimeout(measureHeight, 300);
        setTimeout(measureHeight, 1000);
    }, [measureHeight]);

    // ═══════════ FETCH PREVIEW ═══════════
    useEffect(() => {
        let cancelled = false;

        async function fetchPreview() {
            setIsLoading(true);
            setError(null);

            try {
                const requestData = draftToPreviewRequest(
                    debouncedDraft,
                    layoutStyle,
                    templateId
                );

                const html = await templatesApi.previewDocument(requestData);

                if (!cancelled) {
                    setPreviewHtml(html);
                }
            } catch (err: any) {
                if (!cancelled) {
                    setError(err.message || "Erreur aperçu");
                }
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        fetchPreview();

        return () => {
            cancelled = true;
        };
    }, [debouncedDraft, layoutStyle, templateId]);

    // Dimensions finales après scale
    const scaledWidth = PREVIEW_WIDTH * scale;
    const scaledHeight = contentHeight * scale;

    return (
        <div ref={containerRef} className="relative w-full">
            {/* ═══════════ LOADING BADGE ═══════════ */}
            {isLoading && (
                <div className="absolute top-2 right-2 z-10 px-2.5 sm:px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 backdrop-blur-sm">
                    <span className="text-[9px] sm:text-[10px] font-bold text-sky-500 uppercase tracking-widest animate-pulse flex items-center gap-1.5">
                        <Loader2 className="h-2.5 w-2.5 animate-spin" />
                        <span className="hidden sm:inline">Mise à jour...</span>
                    </span>
                </div>
            )}

            {/* ═══════════ ERROR STATE ═══════════ */}
            {error && (
                <div className="w-full aspect-[210/297] flex items-center justify-center bg-red-50 dark:bg-red-950/20 rounded-sm">
                    <div className="text-center p-4 sm:p-6 max-w-sm">
                        <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
                            <AlertCircle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
                        </div>
                        <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                            Erreur aperçu
                        </p>
                        <p className="text-xs text-red-500/70 mt-1 line-clamp-2">{error}</p>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════
                PREVIEW — CENTRÉE + SCALE-TO-FIT
                - Le wrapper interne a une largeur = scaledWidth
                - flex justify-center → centré sur desktop, plein sur mobile
            ═══════════════════════════════════════════════════════ */}
            {previewHtml && (
                <div className="w-full flex justify-center">
                    <div
                        className="relative overflow-hidden bg-white shadow-2xl shadow-slate-900/10 dark:shadow-black/40 rounded-sm"
                        style={{ width: scaledWidth, height: scaledHeight }}
                    >
                        <iframe
                            ref={iframeRef}
                            srcDoc={previewHtml}
                            onLoad={handleIframeLoad}
                            className="border-0 bg-white block absolute top-0 left-0"
                            style={{
                                width: PREVIEW_WIDTH,
                                height: contentHeight,
                                transform: `scale(${scale})`,
                                transformOrigin: "top left",
                            }}
                            title="Aperçu du document"
                            sandbox="allow-same-origin"
                        />
                    </div>
                </div>
            )}

            {/* ═══════════ SKELETON (ratio A4, centré) ═══════════ */}
            {!previewHtml && !error && (
                <div className="w-full flex justify-center">
                    <div className={cn(
                        "w-full max-w-[860px] aspect-[210/297] flex flex-col items-center justify-center",
                        "bg-slate-50 dark:bg-slate-900 overflow-hidden relative rounded-sm shadow-xl"
                    )}>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                        <div className="flex flex-col items-center gap-3 sm:gap-4 relative z-10 px-6">
                            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-sky-500" />
                            </div>
                            <div className="text-center">
                                <span className="text-slate-400 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] block">
                                    Engine Rendering
                                </span>
                                <span className="text-slate-500 text-[10px] sm:text-xs mt-1 block">
                                    Génération de l'aperçu...
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}