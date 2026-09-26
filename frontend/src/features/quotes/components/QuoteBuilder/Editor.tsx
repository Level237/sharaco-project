// features/quotes/components/Editor.tsx
"use client"

import { useCallback, useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { QuoteDraft, QuoteLineItem } from "../../types/QuoteBuilder";
import { EditorPanel } from "./EditorPanel";
import { LivePreview } from "./LivePreview";
import { EditorHeader } from "./EditorHeader";

import { useToast } from "@/hooks/use-toast";
import { useDownloadPdf } from "@/features/templates/hooks/useDownloadPdf";
import { quotesApi } from "@/features/quotes/api/quotesApi";
import { clientsApi } from "@/features/clients/api/clientsApi";
import { useRouter } from "next/navigation";
import { useAutoSave } from "../../hooks/useAutoSave";
import { useDocumentUpdate } from "../../hooks/useDocumentUpdate";
import { useBeforeUnload } from "../../hooks/useBeforeUnload";
import { DownloadLoader } from "../DownloadLoader";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2, X, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EditorProps {
    templateId?: string | null;
    documentId?: string;
}

export function Editor({ templateId, documentId }: EditorProps) {
    const router = useRouter();
    const { downloadPdf, isDownloading } = useDownloadPdf();
    const { toast } = useToast();

    const [isLoading, setIsLoading] = useState(!!documentId);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // ✅ État du drawer mobile
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    const isEditMode = !!documentId;

    const [draft, setDraft] = useState<QuoteDraft>({
        id: null,
        clientId: "",
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        clientAddress: "",
        reference: `DEV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
        date: new Date().toISOString().split('T')[0],
        validityDays: 30,
        hasVat: false,
        vatRate: 20,
        isTaxExempt: false,
        discountRate: 0,
        items: [
            {
                id: uuidv4(),
                description: "Design UI/UX - Mobile App",
                quantity: 1,
                unitPrice: 1500,
                tax_rate: 0
            }
        ],
        paymentMode: 'simple',
        paymentMilestones: [
            {
                id: uuidv4(),
                title: 'Paiement intégral',
                percent: 100,
                description: '',
                trigger_date: ''
            }
        ],
        notes: "Merci pour votre confiance.",
        internalNotes: "",
        logoUrl: null,
        brandColor: "#0ea5e9",
        isSaved: false,
        templateId: templateId || null,
        layoutStyle: templateId || "classic"
    });

    const {
        isSaving,
        lastSavedAt,
        saveStatus,
        documentId: savedDocumentId,
        isSaved,
        markAsChanged,
    } = useAutoSave({
        draft,
        enabled: !isEditMode,
    });

    const {
        isUpdating,
        lastUpdatedAt,
        updateStatus,
        updateDocument,
    } = useDocumentUpdate({
        draft,
        documentId: documentId || '',
        onUpdateSuccess: () => {
            setHasUnsavedChanges(false);
        },
    });

    useBeforeUnload(hasUnsavedChanges);

    // Fermer le drawer avec Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isDrawerOpen) {
                setIsDrawerOpen(false);
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isDrawerOpen]);

    // Scroll lock quand le drawer est ouvert
    useEffect(() => {
        if (isDrawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isDrawerOpen]);

    useEffect(() => {
        if (!documentId) {
            setIsLoading(false);
            return;
        }

        const loadDocument = async () => {
            try {
                setIsLoading(true);
                setLoadError(null);

                const doc = await quotesApi.getById(documentId);

                let clientData = { name: "", email: "", phone: "", address: "" };
                try {
                    const client = await clientsApi.getById(doc.client_id);
                    clientData = {
                        name: client.name || "",
                        email: client.email || "",
                        phone: client.phone || "",
                        address: client.address || "",
                    };
                } catch (err) {
                    console.warn("Client non trouvé:", err);
                }

                const mappedItems = (doc.items || []).map((item) => ({
                    id: uuidv4(),
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: item.unit_price_cents,
                    tax_rate: item.tax_rate,
                }));

                let validityDays = 30;
                if (doc.due_date && doc.created_at) {
                    const diff = new Date(doc.due_date).getTime() - new Date(doc.created_at).getTime();
                    validityDays = Math.max(1, Math.round(diff / (1000 * 60 * 60 * 24)));
                }

                setDraft({
                    id: doc.id,
                    clientId: doc.client_id,
                    clientName: clientData.name,
                    clientEmail: clientData.email,
                    clientPhone: clientData.phone,
                    clientAddress: clientData.address,
                    reference: doc.number || `DEV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
                    date: doc.created_at ? new Date(doc.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                    validityDays,
                    hasVat: (doc.items || []).some((item) => (item.tax_rate ?? 0) > 0) || ((doc.tax_total_cents ?? 0) > 0),
                    vatRate: (doc.items || []).find((item) => (item.tax_rate ?? 0) > 0)?.tax_rate || 20,
                    isTaxExempt: false,
                    discountRate: 0,
                    items: mappedItems.length > 0 ? mappedItems : [{
                        id: uuidv4(),
                        description: "",
                        quantity: 1,
                        unitPrice: 0,
                        tax_rate: (doc.items || []).some((item) => (item.tax_rate ?? 0) > 0) ? 20 : 0,
                    }],
                    paymentMode: 'simple',
                    paymentMilestones: (doc as any).payment_schedule && (doc as any).payment_schedule.length > 0
                        ? (doc as any).payment_schedule.map((ms: any) => ({
                            id: uuidv4(),
                            title: ms.title,
                            percent: ms.percent,
                            description: ms.description || '',
                            trigger_date: ms.trigger_date ? ms.trigger_date.split('T')[0] : '',
                        }))
                        : [
                            {
                                id: uuidv4(),
                                title: 'Paiement intégral',
                                percent: 100,
                                description: '',
                                trigger_date: ''
                            }
                        ],
                    notes: doc.notes || "",
                    internalNotes: "",
                    logoUrl: null,
                    brandColor: (doc as any).primary_color || "#0ea5e9",
                    isSaved: true,
                    templateId: doc.template_id || null,
                    layoutStyle: (doc as any).layout_style || "classic",
                });
            } catch (error: any) {
                if (error.response?.status === 404) {
                    setDraft(prev => ({ ...prev, id: null, isSaved: false }));
                } else {
                    setLoadError(error.message);
                }
            } finally {
                setIsLoading(false);
            }
        };

        loadDocument();
    }, [documentId]);

    const handleDraftChange = (field: keyof QuoteDraft, value: any) => {
        setDraft(prev => ({ ...prev, [field]: value }));
        setHasUnsavedChanges(true);
        markAsChanged();
    };

    const handleItemChange = (id: string, field: keyof QuoteLineItem, value: any) => {
        setDraft(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.id === id ? { ...item, [field]: value } : item
            )
        }));
        setHasUnsavedChanges(true);
        markAsChanged();
    };

    const addItem = () => {
        setDraft(prev => ({
            ...prev,
            items: [
                ...prev.items,
                { id: uuidv4(), description: "", quantity: 1, unitPrice: 0, tax_rate: prev.hasVat ? (prev.vatRate || 20) : 0 }
            ]
        }));
        setHasUnsavedChanges(true);
        markAsChanged();
    };

    const removeItem = (id: string) => {
        if (draft.items.length === 1) return;
        setDraft(prev => ({
            ...prev,
            items: prev.items.filter(item => item.id !== id)
        }));
        setHasUnsavedChanges(true);
        markAsChanged();
    };

    const handleSave = useCallback(() => {
        if (isEditMode) {
            updateDocument();
        }
    }, [isEditMode, updateDocument]);

    const handleDownload = useCallback(async () => {
        const hasValidSchedule =
            draft.paymentMilestones &&
            draft.paymentMilestones.length > 0 &&
            !(draft.paymentMilestones.length === 1 && draft.paymentMilestones[0].percent === 100);

        const previewRequest = {
            type: "DEVIS",
            client_name: draft.clientName || "Client Exemple",
            client_email: draft.clientEmail || "",
            client_address: draft.clientAddress || "",
            client_phone: draft.clientPhone || "",
            items: draft.items.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unit_price_cents: item.unitPrice,
                tax_rate: draft.hasVat ? draft.vatRate : 0,
            })),
            template_id: draft.templateId || null,
            layout_style: draft.layoutStyle || "classic",
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

        try {
            await downloadPdf(previewRequest, draft.isSaved ? draft.id : null, `${draft.reference || 'devis'}.pdf`);
            toast({ title: "PDF téléchargé", description: "Le fichier a été téléchargé avec succès." });
        } catch (error) {
            toast({ title: "Erreur", description: "Impossible de télécharger le PDF.", variant: "destructive" });
        }
    }, [draft, downloadPdf, toast]);

    const [zoom, setZoom] = useState(() =>
    typeof window !== "undefined" && window.innerWidth < 1024 ? 1 : 0.85
);
    const [showActions, setShowActions] = useState(false);

    if (isLoading) {
        return (
            <div className="flex h-[100dvh] w-screen items-center justify-center bg-zinc-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full border-4 border-sky-500 border-t-transparent animate-spin" />
                    <p className="text-zinc-400 font-medium">Chargement...</p>
                </div>
            </div>
        );
    }

    if (loadError) {
        return (
            <div className="flex h-[100dvh] w-screen items-center justify-center bg-zinc-950">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-white mb-4">Erreur</h2>
                    <p className="text-zinc-400 mb-6">{loadError}</p>
                    <button onClick={() => router.push('/dashboard/quotes')} className="px-6 py-3 bg-sky-500 text-white rounded-xl">
                        Retour
                    </button>
                </div>
            </div>
        );
    }

    const currentIsSaving = isEditMode ? isUpdating : isSaving;
    const currentLastSavedAt = isEditMode ? lastUpdatedAt : lastSavedAt;
    const currentSaveStatus = isEditMode ? updateStatus : saveStatus;

    return (
        <div className="flex h-[100dvh] w-screen overflow-hidden bg-zinc-950 font-sans">
            {/* ═══════════ HEADER (toujours visible) ═══════════ */}
            <EditorHeader
                draft={draft}
                documentId={documentId}
                documentNumber={draft.reference}
                zoom={zoom}
                onZoomIn={() => setZoom(prev => Math.min(prev + 0.1, 1.5))}
                onZoomOut={() => setZoom(prev => Math.max(prev - 0.1, 0.4))}
                onResetZoom={() => setZoom(0.85)}
                onSave={handleSave}
                onColorChange={(color) => handleDraftChange('brandColor', color)}
                showActions={showActions}
                setShowActions={setShowActions}
                downloadPdf={handleDownload}
                isDownloading={isDownloading}
                isSaving={currentIsSaving}
                lastSavedAt={currentLastSavedAt}
                saveStatus={currentSaveStatus}
                hasUnsavedChanges={hasUnsavedChanges}
                isEditMode={isEditMode}
            />

            {/* Grain effect */}
            <div className="fixed inset-0 pointer-events-none z-50 opacity-[0.03] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

            {/* ═══════════ DESKTOP : Sidebar fixe ═══════════ */}
            <aside className="hidden lg:block w-[450px] xl:w-[500px] h-full shrink-0 relative overflow-hidden">
                <EditorPanel
                    draft={draft}
                    onChange={handleDraftChange}
                    onItemChange={handleItemChange}
                    onAddItem={addItem}
                    onRemoveItem={removeItem}
                />
            </aside>

            {/* ═══════════ MAIN (preview) ═══════════ */}
            <main className="flex-1 relative overflow-hidden bg-[#fafafa] dark:bg-zinc-900/50 pt-[72px]">
                <div className="absolute inset-0 overflow-auto custom-scrollbar pt-12 lg:pt-24 pb-32">
                    <div className="flex justify-center transition-transform duration-300 origin-top" style={{ transform: `scale(${zoom})` }}>
                        <div className="w-full max-w-[1000px] px-2 sm:px-8 lg:px-12">
                            <LivePreview
                                templateId={draft.templateId || null}
                                layoutStyle={draft.layoutStyle || "classic"}
                                draft={draft}
                            />
                        </div>
                    </div>
                </div>
            </main>

            {/* ═══════════ MOBILE : FAB + Drawer Bottom Sheet ═══════════ */}
            <MobileDrawer
                isOpen={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                draft={draft}
                onChange={handleDraftChange}
                onItemChange={handleItemChange}
                onAddItem={addItem}
                onRemoveItem={removeItem}
            />

            <DownloadLoader isVisible={isDownloading} filename={`${draft.reference || 'devis'}.pdf`} />
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════
   COMPOSANT MOBILE DRAWER
═══════════════════════════════════════════════════════════════ */
interface MobileDrawerProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    draft: QuoteDraft;
    onChange: <K extends keyof QuoteDraft>(field: K, value: QuoteDraft[K]) => void;
    onItemChange: <K extends keyof QuoteLineItem>(id: string, field: K, value: QuoteLineItem[K]) => void;
    onAddItem: () => void;
    onRemoveItem: (id: string) => void;
}

function MobileDrawer({ isOpen, onOpenChange, draft, onChange, onItemChange, onAddItem, onRemoveItem }: MobileDrawerProps) {
    return (
        <>
            {/* ═══════════ FAB (Floating Action Button) ═══════════ */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        onClick={() => onOpenChange(true)}
                        className="lg:hidden fixed bottom-24 right-4 z-40 h-14 w-14 rounded-full bg-[#2563EB] text-white shadow-[0_10px_30px_-5px_rgba(37,99,235,0.6)] hover:scale-110 active:scale-95 transition-transform flex items-center justify-center"
                        aria-label="Ouvrir les options"
                    >
                        <Settings2 className="h-6 w-6" />
                        {/* Badge indicateur */}
                        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-emerald-400 border-2 border-zinc-950" />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* ═══════════ DRAWER ═══════════ */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Overlay */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => onOpenChange(false)}
                            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                        />

                        {/* Drawer content */}
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="lg:hidden fixed inset-x-0 bottom-0 z-[70] h-[90dvh] bg-zinc-950 rounded-t-3xl border-t border-white/10 flex flex-col shadow-2xl overflow-hidden"
                            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                        >
                            {/* Header du drawer avec handle */}
                            <div className="relative flex items-center justify-between px-4 py-3 border-b border-white/5 shrink-0">
                                {/* Handle drag */}
                                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/20 rounded-full" />

                                <div className="flex items-center gap-2 mt-2">
                                    <ChevronUp className="h-4 w-4 text-zinc-400" />
                                    <span className="text-sm font-bold text-white">Options du devis</span>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onOpenChange(false)}
                                    className="mt-2 h-8 w-8 rounded-full hover:bg-white/10"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Contenu scrollable (EditorPanel réutilisé) */}
                            <div className="flex-1 overflow-hidden">
                                <EditorPanel
                                    draft={draft}
                                    onChange={onChange}
                                    onItemChange={onItemChange}
                                    onAddItem={onAddItem}
                                    onRemoveItem={onRemoveItem}
                                    isMobile
                                    onClose={() => onOpenChange(false)}
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}