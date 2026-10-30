"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, CheckCircle2, ChevronUp, Loader2, Mail, PenTool, Save, Settings2, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { quotesApi } from "@/features/quotes/api/quotesApi"
import { clientsApi } from "@/features/clients/api/clientsApi"
import { LivePreview } from "@/features/quotes/components/QuoteBuilder/LivePreview"
import { SendEmailModal } from "@/features/quotes/components/sendEmailModal"
import { useToast } from "@/hooks/use-toast"
import { projectHref } from "@/features/projects/lib/paths"
import type { QuoteDraft } from "@/features/quotes/types/QuoteBuilder"
import { ContractSidebar } from "./ContractSidebar"
import type { ContractDraft } from "../types"
import { normalizeContractKind } from "../kinds"
import { CONTRACT_BRAND_COLORS, DEFAULT_CONTRACT_COLOR } from "../brandColors"
import { contractDetailHref } from "../paths"
import { useAuthStore } from "@/store/auth-store"
import type { Document } from "@/features/quotes/types"

function signatureFields(doc: Document): Pick<
    ContractDraft,
    "status" | "signatureName" | "acceptedAt" | "providerSignatureName" | "providerSignedAt" | "signatureRevision"
> {
    return {
        status: doc.status,
        signatureName: doc.signature_name || null,
        acceptedAt: doc.accepted_at || null,
        providerSignatureName: doc.provider_signature_name || null,
        providerSignedAt: doc.provider_signed_at || null,
        signatureRevision: doc.signature_revision || 1,
    }
}

interface ContractEditorProps {
    documentId: string;
}

function toDateInput(value?: string | null) {
    if (!value) return "";
    return value.slice(0, 10);
}

export function ContractEditor({ documentId }: ContractEditorProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [draft, setDraft] = useState<ContractDraft | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [clientId, setClientId] = useState<string>("");
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEmailOpen, setIsEmailOpen] = useState(false);
    const [isSignOpen, setIsSignOpen] = useState(false);
    const [providerName, setProviderName] = useState("");
    const [signing, setSigning] = useState(false);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const doc = await quotesApi.getById(documentId);
                if (doc.type !== "CONTRAT") {
                    router.replace(`/dashboard/quotes/create/${documentId}`);
                    return;
                }
                if (doc.status === "ACCEPTED") {
                    router.replace(contractDetailHref(documentId));
                    return;
                }
                let client = { name: "", email: "", phone: "", address: "" };
                if (doc.client_id) {
                    setClientId(doc.client_id);
                    try {
                        const row = await clientsApi.getById(doc.client_id);
                        client = {
                            name: row.name || "",
                            email: row.email || "",
                            phone: row.phone || "",
                            address: row.address || "",
                        };
                    } catch {
                        client = {
                            name: doc.client?.name || "",
                            email: doc.client?.email || "",
                            phone: "",
                            address: "",
                        };
                    }
                }
                if (cancelled) return;
                setDraft({
                    id: doc.id,
                    number: doc.number || "Contrat",
                    status: doc.status,
                    projectId: doc.project_id || null,
                    clientName: client.name,
                    clientEmail: client.email,
                    clientAddress: client.address,
                    clientPhone: client.phone,
                    notes: doc.notes || "",
                    endDate: toDateInput(doc.due_date),
                    items: (doc.items || [])
                        .filter((item) => item.description)
                        .map((item) => ({ id: item.id, description: item.description })),
                    rules: (doc.rules || []).map((rule) => ({
                        title: rule.title || "",
                        body: rule.body || "",
                    })),
                    layoutStyle: normalizeContractKind(doc.layout_style),
                    brandColor: doc.primary_color || DEFAULT_CONTRACT_COLOR,
                    ...signatureFields(doc),
                });
                setProviderName(user?.full_name || user?.company_name || "");
            } catch {
                toast({ title: "Erreur", description: "Contrat introuvable.", variant: "destructive" });
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [documentId, router, toast]);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape" && isDrawerOpen) setIsDrawerOpen(false);
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [isDrawerOpen]);

    useEffect(() => {
        if (!isDrawerOpen) return;
        const previous = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previous;
        };
    }, [isDrawerOpen]);

    const previewDraft = useMemo<QuoteDraft | null>(() => {
        if (!draft) return null;
        return {
            documentType: "CONTRAT",
            clientId,
            clientName: draft.clientName,
            clientEmail: draft.clientEmail,
            clientPhone: draft.clientPhone,
            clientAddress: draft.clientAddress,
            reference: draft.number,
            date: new Date().toISOString().slice(0, 10),
            validityDays: 30,
            hasVat: false,
            isTaxExempt: true,
            items: draft.items
                .filter((item) => item.description.trim())
                .map((item) => ({
                    id: item.id,
                    description: item.description,
                    quantity: 1,
                    unitPrice: 0,
                    tax_rate: 0,
                })),
            paymentMode: "simple",
            paymentMilestones: [],
            notes: draft.notes,
            endDate: draft.endDate || null,
            rules: draft.rules,
            layoutStyle: draft.layoutStyle || "prestation",
            brandColor: draft.brandColor || DEFAULT_CONTRACT_COLOR,
            signatureName: draft.signatureName,
            acceptedAt: draft.acceptedAt,
            providerSignatureName: draft.providerSignatureName,
            providerSignedAt: draft.providerSignedAt,
            signatureRevision: draft.signatureRevision,
        };
    }, [draft, clientId]);

    const save = useCallback(async (options?: { silent?: boolean }) => {
        if (!draft) return false;
        setSaving(true);
        try {
            const updated = await quotesApi.update(documentId, {
                notes: draft.notes,
                layout_style: draft.layoutStyle,
                primary_color: draft.brandColor,
                due_date: draft.endDate ? `${draft.endDate}T12:00:00` : null,
                rules: draft.rules.filter((rule) => rule.title.trim() || rule.body.trim()),
                items: draft.items
                    .filter((item) => item.description.trim())
                    .map((item) => ({
                        description: item.description.trim(),
                        quantity: 1,
                        unit_price_cents: 0,
                        tax_rate: 0,
                    })),
            });
            const reset =
                updated.signatures_reset ||
                (updated.signature_revision || 1) > (draft.signatureRevision || 1);
            setDraft((prev) => (prev ? { ...prev, ...signatureFields(updated) } : prev));
            if (reset) {
                toast({
                    title: "Nouvelle version",
                    description: "Les signatures ont été annulées. Les deux parties devront re-signer.",
                });
            } else if (!options?.silent) {
                toast({ title: "Contrat enregistré" });
            }
            return true;
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Impossible d'enregistrer le contrat.";
            toast({ title: "Erreur", description: message, variant: "destructive" });
            return false;
        } finally {
            setSaving(false);
        }
    }, [documentId, draft, toast]);

    const signAsProvider = useCallback(async () => {
        if (!providerName.trim()) {
            toast({ title: "Nom requis", description: "Indiquez votre nom pour signer.", variant: "destructive" });
            return;
        }
        const saved = await save({ silent: true });
        if (!saved) return;
        setSigning(true);
        try {
            const updated = await quotesApi.signAsProvider(documentId, providerName.trim());
            setDraft((prev) => (prev ? { ...prev, ...signatureFields(updated) } : prev));
            setIsSignOpen(false);
            toast({ title: "Contrat signé", description: "Votre signature apparaît sur le document." });
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Impossible de signer.";
            toast({ title: "Erreur", description: message, variant: "destructive" });
        } finally {
            setSigning(false);
        }
    }, [documentId, providerName, save, toast]);

    const openSendModal = useCallback(async () => {
        const saved = await save();
        if (saved) setIsEmailOpen(true);
    }, [save]);

    if (loading || !draft || !previewDraft) {
        return (
            <div className="flex min-h-[100dvh] items-center justify-center bg-zinc-950">
                <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
            </div>
        );
    }

    const backHref = draft.projectId && clientId
        ? projectHref(clientId, draft.projectId)
        : "/dashboard/clients";

    const patchDraft = (patch: Partial<ContractDraft>) => {
        setDraft((prev) => (prev ? { ...prev, ...patch } : prev));
    };

    return (
        <div className="flex h-[100dvh] w-full overflow-hidden bg-zinc-950">
            <header className="fixed inset-x-0 top-0 z-[80] flex h-14 items-center justify-between gap-2 border-b border-white/10 bg-zinc-950/90 px-3 backdrop-blur-xl sm:h-16 sm:px-4">
                <button
                    type="button"
                    onClick={() => router.push(backHref)}
                    className="flex min-w-0 items-center gap-2 text-sm text-slate-300"
                >
                    <ArrowLeft className="h-4 w-4 shrink-0" />
                    <span className="hidden sm:inline">Retour au projet</span>
                    <span className="truncate sm:hidden">{draft.number || "Contrat"}</span>
                </button>
                <div className="hidden min-w-0 flex-1 justify-center px-3 lg:flex">
                    <ContractColorPicker
                        color={draft.brandColor}
                        onChange={(brandColor) => patchDraft({ brandColor })}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <div className="lg:hidden">
                        <ContractColorPicker
                            color={draft.brandColor}
                            onChange={(brandColor) => patchDraft({ brandColor })}
                            compact
                        />
                    </div>
                    {draft.providerSignatureName ? (
                        <span className="hidden items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-2 text-xs font-medium text-emerald-300 sm:inline-flex">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Signé
                        </span>
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                if (!providerName) {
                                    setProviderName(user?.full_name || user?.company_name || "");
                                }
                                setIsSignOpen(true);
                            }}
                            disabled={saving || signing}
                            className="h-10 border-white/10 bg-white/5 px-3 text-slate-200 hover:bg-white/10 sm:px-4"
                        >
                            <PenTool className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Signer</span>
                        </Button>
                    )}
                    {(draft.status === "DRAFT" || draft.status === "SENT" || !draft.status) && (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={openSendModal}
                            disabled={saving}
                            className="h-10 border-white/10 bg-white/5 px-3 text-slate-200 hover:bg-white/10 sm:px-4"
                        >
                            <Mail className="h-4 w-4 sm:mr-2" />
                            <span className="hidden sm:inline">Envoyer</span>
                        </Button>
                    )}
                    <Button
                        onClick={() => void save()}
                        disabled={saving}
                        className="h-10 shrink-0 bg-[#2563EB] px-3 text-white hover:bg-[#2563EB]/90 sm:px-4"
                    >
                        {saving ? <Loader2 className="h-4 w-4 animate-spin sm:mr-2" /> : <Save className="h-4 w-4 sm:mr-2" />}
                        <span className="hidden sm:inline">Enregistrer</span>
                    </Button>
                </div>
            </header>

            <aside className="hidden h-full w-[min(420px,38vw)] shrink-0 overflow-hidden pt-16 lg:block">
                <ContractSidebar draft={draft} onChange={patchDraft} />
            </aside>

            <main className="relative h-full min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-[#f4f1ea] pt-14 sm:pt-16">
                <div className="px-3 py-4 pb-28 sm:px-6 sm:py-6 lg:pb-6">
                    <div className="mx-auto w-full max-w-[900px]">
                        <LivePreview draft={previewDraft} layoutStyle={draft.layoutStyle || "prestation"} />
                    </div>
                </div>
            </main>

            <ContractMobileDrawer
                isOpen={isDrawerOpen}
                onOpenChange={setIsDrawerOpen}
                draft={draft}
                onChange={patchDraft}
            />

            <SendEmailModal
                open={isEmailOpen}
                onOpenChange={setIsEmailOpen}
                documentId={documentId}
                documentNumber={draft.number}
                clientEmail={draft.clientEmail}
                clientName={draft.clientName}
                documentLabel="contrat"
                onSent={() => setDraft((prev) => prev ? { ...prev, status: "SENT" } : prev)}
            />

            <Dialog open={isSignOpen} onOpenChange={setIsSignOpen}>
                <DialogContent className="border-white/10 bg-zinc-950 text-zinc-100 sm:max-w-[420px]">
                    <DialogHeader>
                        <DialogTitle className="text-white">Signer en tant que prestataire</DialogTitle>
                        <DialogDescription className="text-zinc-400">
                            Votre nom et la date apparaîtront dans la case prestataire.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-zinc-300">Votre nom</label>
                        <Input
                            value={providerName}
                            onChange={(event) => setProviderName(event.target.value)}
                            placeholder="Prénom et nom"
                            className="h-12 border-white/10 bg-white/5 text-white"
                            disabled={signing}
                        />
                    </div>
                    <div className="flex flex-col-reverse gap-2 sm:flex-row">
                        <Button
                            variant="outline"
                            onClick={() => setIsSignOpen(false)}
                            disabled={signing}
                            className="h-11 flex-1 border-white/10 bg-transparent text-zinc-300"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={() => void signAsProvider()}
                            disabled={!providerName.trim() || signing}
                            className="h-11 flex-1 bg-[#2563EB] text-white hover:bg-[#2563EB]/90"
                        >
                            {signing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Signer"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function ContractColorPicker({
    color,
    onChange,
    compact = false,
}: {
    color: string
    onChange: (color: string) => void
    compact?: boolean
}) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {compact ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-10 w-10 border border-white/10 bg-white/5 hover:bg-white/10"
                    >
                        <div
                            className="h-4 w-4 rounded-full border border-white/20"
                            style={{ backgroundColor: color }}
                        />
                    </Button>
                ) : (
                    <button
                        type="button"
                        className="flex min-w-[110px] items-center gap-3 rounded-lg border border-white/5 bg-white/5 px-3 py-1.5 hover:bg-white/10"
                    >
                        <div
                            className="h-3.5 w-3.5 rounded-full border border-white/20"
                            style={{ backgroundColor: color }}
                        />
                        <span className="font-mono text-[10px] font-black uppercase tracking-widest text-zinc-300">
                            {color}
                        </span>
                    </button>
                )}
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align={compact ? "end" : "center"}
                className="z-[120] w-56 rounded-lg border-white/10 bg-zinc-900 p-3 shadow-2xl backdrop-blur-xl"
            >
                <DropdownMenuLabel className="px-1 pb-3 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Palette de couleurs
                </DropdownMenuLabel>
                <div className={cn("grid gap-2", compact ? "grid-cols-5" : "grid-cols-6")}>
                    {CONTRACT_BRAND_COLORS.map((item) => (
                        <button
                            key={item.value}
                            type="button"
                            title={item.name}
                            onClick={() => onChange(item.value)}
                            className={cn(
                                "h-6 w-6 rounded-full border-2 transition-all hover:scale-110",
                                color.toLowerCase() === item.value.toLowerCase() ? "border-white" : "border-transparent"
                            )}
                            style={{ backgroundColor: item.value }}
                        />
                    ))}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

function ContractMobileDrawer({
    isOpen,
    onOpenChange,
    draft,
    onChange,
}: {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    draft: ContractDraft;
    onChange: (patch: Partial<ContractDraft>) => void;
}) {
    return (
        <>
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        type="button"
                        initial={{ opacity: 0, scale: 0.8, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 16 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        onClick={() => onOpenChange(true)}
                        className="fixed right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#2563EB] text-white shadow-[0_10px_30px_-5px_rgba(37,99,235,0.55)] lg:hidden"
                        style={{ bottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
                        aria-label="Modifier le contrat"
                    >
                        <Settings2 className="h-6 w-6" />
                    </motion.button>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => onOpenChange(false)}
                            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed inset-x-0 bottom-0 z-[70] flex h-[min(92dvh,860px)] flex-col overflow-hidden rounded-t-3xl border-t border-white/10 bg-zinc-950 shadow-2xl lg:hidden"
                            style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
                        >
                            <div className="relative flex shrink-0 items-center justify-between px-4 pb-3 pt-5">
                                <div className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-white/20" />
                                <div className="flex min-w-0 items-center gap-2">
                                    <ChevronUp className="h-4 w-4 shrink-0 text-zinc-400" />
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold text-white">Modifier le contrat</p>
                                        <p className="truncate text-xs text-slate-500">{draft.number}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onOpenChange(false)}
                                    className="h-10 w-10 shrink-0 rounded-full hover:bg-white/10"
                                    aria-label="Fermer"
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                            <div className="min-h-0 flex-1 overflow-hidden">
                                <ContractSidebar draft={draft} onChange={onChange} isMobile />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
