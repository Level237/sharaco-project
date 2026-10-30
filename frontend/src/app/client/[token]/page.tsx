"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { api } from "@/lib/api"
import {
    Loader2,
    AlertCircle,
    CheckCircle2,
    XCircle,
    PenTool,
    Shield,
    FileText,
    Minus,
    Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/features/quotes/lib/formatCurrency"
import { templatesApi } from "@/features/templates/api/templatesApi"
import { cn } from "@/lib/utils"
import { MilestonePreview } from "@/features/quotes/types"
import Logo from "@/components/ui/logo"

interface ClientDocument {
    id: string
    type: "DEVIS" | "FACTURE" | "CONTRAT"
    status: string
    number?: string
    created_at: string
    due_date?: string
    layout_style?: string
    notes?: string
    items: Array<{
        description: string
        quantity: number
        unit_price_cents: number
        tax_rate?: number
    }>
    subtotal_cents: number
    tax_total_cents: number
    grand_total_cents: number
    currency?: string
    primary_color: string
    background_color?: string
    text_color?: string
    company_name?: string
    client_name?: string
    client_email?: string
    client_address?: string
    can_validate: boolean
    accepted_at?: string
    refused_at?: string
    refusal_reason?: string
    signature_name?: string
    provider_signature_name?: string
    provider_signed_at?: string
    signature_revision?: number
    payment_schedule?: MilestonePreview[] | null
}

const PREVIEW_WIDTH = 860
const DEFAULT_HEIGHT = 1122
const MIN_ZOOM = 0.5
const MAX_ZOOM = 1.6
const ZOOM_STEP = 0.1

function docLabel(type?: string) {
    if (type === "CONTRAT") return "contrat"
    if (type === "FACTURE") return "facture"
    return "devis"
}

export default function ClientDocumentPage() {
    const params = useParams()
    const token = params.token as string
    const { toast } = useToast()

    const [document, setDocument] = useState<ClientDocument | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [previewHtml, setPreviewHtml] = useState("")
    const [showAcceptModal, setShowAcceptModal] = useState(false)
    const [showRefuseModal, setShowRefuseModal] = useState(false)
    const [signatureName, setSignatureName] = useState("")
    const [refusalReason, setRefusalReason] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [actionCompleted, setActionCompleted] = useState(false)
    const [fitScale, setFitScale] = useState(1)
    const [zoom, setZoom] = useState(1)
    const [contentHeight, setContentHeight] = useState(DEFAULT_HEIGHT)

    const containerRef = useRef<HTMLDivElement>(null)
    const iframeRef = useRef<HTMLIFrameElement>(null)

    useEffect(() => {
        const el = containerRef.current
        if (!el) return
        const updateScale = () => {
            const width = el.getBoundingClientRect().width
            setFitScale(Math.min(1, width / PREVIEW_WIDTH))
        }
        updateScale()
        const observer = new ResizeObserver(updateScale)
        observer.observe(el)
        return () => observer.disconnect()
    }, [previewHtml, loading])

    const measureHeight = useCallback(() => {
        const iframe = iframeRef.current
        if (!iframe) return
        try {
            const doc = iframe.contentDocument
            if (doc?.body) {
                const h = Math.max(doc.documentElement.scrollHeight, doc.body.scrollHeight)
                if (h > 100) setContentHeight(h)
            }
        } catch {
            /* ignore */
        }
    }, [])

    useEffect(() => {
        if (!previewHtml) return
        const t1 = window.setTimeout(measureHeight, 200)
        const t2 = window.setTimeout(measureHeight, 800)
        return () => {
            window.clearTimeout(t1)
            window.clearTimeout(t2)
        }
    }, [previewHtml, measureHeight])

    useEffect(() => {
        let cancelled = false
        const fetchDocument = async () => {
            try {
                const data = await api.get<ClientDocument>(`/api/v1/documents/client/${token}`)
                if (cancelled) return
                setDocument(data)
                const html = await templatesApi.previewDocumentByClientToken(token)
                if (!cancelled) setPreviewHtml(html)
            } catch (err: unknown) {
                if (!cancelled) {
                    const message = err instanceof Error ? err.message : "Document introuvable"
                    setError(message)
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }
        if (token) void fetchDocument()
        return () => {
            cancelled = true
        }
    }, [token])

    const refreshDocument = async () => {
        const data = await api.get<ClientDocument>(`/api/v1/documents/client/${token}`)
        setDocument(data)
        setActionCompleted(true)
        try {
            const html = await templatesApi.previewDocumentByClientToken(token)
            setPreviewHtml(html)
        } catch {
            /* keep current preview */
        }
    }

    const handleAccept = async () => {
        if (document?.type === "FACTURE") return
        if (!signatureName.trim()) {
            toast({
                title: "Nom requis",
                description: "Indiquez votre nom pour signer.",
                variant: "destructive",
            })
            return
        }
        setIsSubmitting(true)
        try {
            const response = await api.post<{ already_accepted?: boolean }>(
                `/api/v1/documents/client/${token}/accept`,
                { signature_name: signatureName }
            )
            if (response.already_accepted) {
                toast({ title: "Déjà accepté", description: `Ce ${docLabel(document?.type)} a déjà été accepté.` })
            } else {
                toast({
                    title: document?.type === "CONTRAT" ? "Contrat signé" : "Devis accepté",
                    description: "Le prestataire a été notifié.",
                })
            }
            await refreshDocument()
            setShowAcceptModal(false)
            setSignatureName("")
        } catch (err: unknown) {
            toast({
                title: "Erreur",
                description: err instanceof Error ? err.message : "Impossible d'accepter",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleRefuse = async () => {
        if (document?.type === "FACTURE") return
        setIsSubmitting(true)
        try {
            const response = await api.post<{ already_refused?: boolean }>(
                `/api/v1/documents/client/${token}/refuse`,
                { reason: refusalReason || null }
            )
            if (response.already_refused) {
                toast({ title: "Déjà refusé", description: `Ce ${docLabel(document?.type)} a déjà été refusé.` })
            } else {
                toast({
                    title: document?.type === "CONTRAT" ? "Contrat refusé" : "Devis refusé",
                    description: "Votre retour a été enregistré.",
                })
            }
            await refreshDocument()
            setShowRefuseModal(false)
            setRefusalReason("")
        } catch (err: unknown) {
            toast({
                title: "Erreur",
                description: err instanceof Error ? err.message : "Impossible de refuser",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const zoomIn = () => setZoom((value) => Math.min(MAX_ZOOM, Math.round((value + ZOOM_STEP) * 10) / 10))
    const zoomOut = () => setZoom((value) => Math.max(MIN_ZOOM, Math.round((value - ZOOM_STEP) * 10) / 10))
    const resetZoom = () => setZoom(1)

    if (loading && !previewHtml) {
        return (
            <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-zinc-950 px-4">
                <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
                <p className="mt-4 text-sm font-medium text-zinc-400">Chargement du document…</p>
            </div>
        )
    }

    if (error || !document) {
        return (
            <div className="flex min-h-[100dvh] items-center justify-center bg-zinc-950 p-4">
                <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-900 p-6 text-center sm:p-8">
                    <AlertCircle className="mx-auto h-8 w-8 text-rose-400" />
                    <h1 className="mt-4 text-lg font-semibold text-white">Document inaccessible</h1>
                    <p className="mt-2 text-sm text-zinc-400">
                        {error || "Ce document n’existe pas ou n’est plus disponible."}
                    </p>
                </div>
            </div>
        )
    }

    const isSignable = document.type === "DEVIS" || document.type === "CONTRAT"
    const canAct = isSignable && document.can_validate && !actionCompleted && document.status !== "ACCEPTED" && document.status !== "REFUSED"
    const noun = docLabel(document.type)
    const acceptLabel = document.type === "CONTRAT" ? "Signer" : "Accepter"
    const scale = fitScale * zoom
    const scaledWidth = PREVIEW_WIDTH * scale
    const scaledHeight = contentHeight * scale

    return (
        <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100">
            <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/90 backdrop-blur-xl">
                <div className="mx-auto flex h-14 max-w-[960px] items-center justify-between gap-2 px-3 sm:h-16 sm:px-6">
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <Logo width={96} height={28} />
                        <span className="hidden h-5 w-px bg-white/10 sm:block" />
                        <div className="hidden min-w-0 items-center gap-1.5 sm:flex">
                            <Shield className="h-3.5 w-3.5 shrink-0 text-[#2563EB]" />
                            <span className="truncate text-xs font-medium text-zinc-400">Lien sécurisé</span>
                        </div>
                    </div>

                    <div className="flex min-w-0 items-center gap-2">
                        <div className="hidden sm:block">
                            <ZoomControls
                                zoom={zoom}
                                onZoomIn={zoomIn}
                                onZoomOut={zoomOut}
                                onReset={resetZoom}
                            />
                        </div>
                        <StatusChip document={document} />
                        {canAct && (
                            <div className="hidden items-center gap-2 sm:flex">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowRefuseModal(true)}
                                    className="h-9 rounded-lg border-white/10 bg-white/5 text-zinc-200 hover:border-rose-400/30 hover:bg-rose-500/10 hover:text-rose-300"
                                >
                                    Refuser
                                </Button>
                                <Button
                                    onClick={() => setShowAcceptModal(true)}
                                    className="h-9 rounded-lg bg-[#2563EB] px-4 text-white hover:bg-[#2563EB]/90"
                                >
                                    {acceptLabel}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className={cn("mx-auto max-w-[960px] px-3 py-5 sm:px-6 sm:py-8", canAct && "pb-28 sm:pb-10")}>
                <div className="mb-5 flex items-end justify-between gap-3 sm:mb-6">
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            {document.company_name || "Document"}
                        </p>
                        <h1 className="mt-1 truncate text-xl font-semibold tracking-tight text-white sm:text-2xl">
                            {document.type === "CONTRAT" ? "Contrat" : document.type === "FACTURE" ? "Facture" : "Devis"}{" "}
                            {document.number || ""}
                        </h1>
                        {document.client_name && (
                            <p className="mt-1 text-sm text-zinc-400">Pour {document.client_name}</p>
                        )}
                    </div>
                    <div className="sm:hidden">
                        <ZoomControls
                            zoom={zoom}
                            onZoomIn={zoomIn}
                            onZoomOut={zoomOut}
                            onReset={resetZoom}
                            compact
                        />
                    </div>
                </div>

                {document.type === "CONTRAT" && document.provider_signature_name && document.status !== "ACCEPTED" && (
                    <div className="mb-5 rounded-xl border border-white/10 bg-white/5 px-4 py-3 sm:mb-6">
                        <p className="text-sm font-semibold text-zinc-200">Prestataire déjà signé</p>
                        <p className="mt-0.5 text-sm text-zinc-400">
                            {document.provider_signature_name}
                            {document.provider_signed_at
                                ? ` · ${new Date(document.provider_signed_at).toLocaleDateString("fr-FR")}`
                                : ""}
                        </p>
                    </div>
                )}

                {isSignable && document.status === "ACCEPTED" && (
                    <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 sm:mb-6 sm:px-5 sm:py-4">
                        <p className="text-sm font-semibold text-emerald-300">
                            {document.type === "CONTRAT" ? "Contrat signé" : "Devis accepté"}
                        </p>
                        <p className="mt-0.5 text-sm text-emerald-200/80">
                            {document.signature_name ? `Par ${document.signature_name}` : "Signature enregistrée"}
                            {document.accepted_at
                                ? ` · ${new Date(document.accepted_at).toLocaleDateString("fr-FR")}`
                                : ""}
                        </p>
                    </div>
                )}

                {isSignable && document.status === "REFUSED" && (
                    <div className="mb-5 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 sm:mb-6 sm:px-5 sm:py-4">
                        <p className="text-sm font-semibold text-rose-300">
                            {document.type === "CONTRAT" ? "Contrat refusé" : "Devis refusé"}
                        </p>
                        {document.refusal_reason && (
                            <p className="mt-1 text-sm text-rose-200/80">« {document.refusal_reason} »</p>
                        )}
                    </div>
                )}

                {document.type === "FACTURE" && document.status === "PAID" && (
                    <div className="mb-5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 sm:mb-6">
                        <p className="text-sm font-semibold text-emerald-300">Facture réglée</p>
                    </div>
                )}

                <div ref={containerRef} className="w-full overflow-x-auto">
                    {previewHtml ? (
                        <div className="flex justify-center" style={{ minWidth: scaledWidth }}>
                            <div
                                className="relative overflow-hidden rounded-lg bg-white shadow-[0_24px_60px_-20px_rgba(0,0,0,0.65)] ring-1 ring-white/10"
                                style={{ width: scaledWidth, height: scaledHeight }}
                            >
                                <iframe
                                    ref={iframeRef}
                                    srcDoc={previewHtml}
                                    onLoad={measureHeight}
                                    className="absolute left-0 top-0 block border-0 bg-white"
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
                    ) : (
                        <div className="flex aspect-[210/297] w-full items-center justify-center rounded-lg bg-zinc-900 ring-1 ring-white/10">
                            <Loader2 className="h-7 w-7 animate-spin text-[#2563EB]" />
                        </div>
                    )}
                </div>
            </main>

            {canAct && (
                <div
                    className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-zinc-950/95 p-3 backdrop-blur-xl sm:hidden"
                    style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
                >
                    <div className="mx-auto flex max-w-[960px] gap-2">
                        <Button
                            variant="outline"
                            onClick={() => setShowRefuseModal(true)}
                            className="h-12 flex-1 rounded-xl border-white/10 bg-white/5 text-zinc-200"
                        >
                            Refuser
                        </Button>
                        <Button
                            onClick={() => setShowAcceptModal(true)}
                            className="h-12 flex-[1.4] rounded-xl bg-[#2563EB] text-white hover:bg-[#2563EB]/90"
                        >
                            {document.type === "CONTRAT" ? "Signer le contrat" : "Accepter le devis"}
                        </Button>
                    </div>
                </div>
            )}

            {isSignable && (
                <Dialog open={showAcceptModal} onOpenChange={setShowAcceptModal}>
                    <DialogContent className="max-h-[90dvh] overflow-y-auto border-white/10 bg-zinc-950 p-0 text-zinc-100 sm:max-w-[440px]">
                        <div className="p-5 sm:p-6">
                            <DialogHeader className="text-left">
                                <DialogTitle className="text-lg font-semibold text-white">
                                    {document.type === "CONTRAT" ? "Signer le contrat" : "Accepter le devis"}
                                </DialogTitle>
                                <DialogDescription className="text-zinc-400">
                                    {document.number ? `${noun.charAt(0).toUpperCase() + noun.slice(1)} ${document.number}. ` : ""}
                                    Indiquez votre nom pour confirmer.
                                </DialogDescription>
                            </DialogHeader>

                            {document.grand_total_cents > 0 && (
                                <div className="mt-5 flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
                                    <span className="text-sm text-zinc-400">Montant</span>
                                    <span className="text-lg font-semibold text-white">
                                        {formatCurrency(document.grand_total_cents, document.currency)}
                                    </span>
                                </div>
                            )}

                            <div className="mt-5 space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                                    <PenTool className="h-4 w-4 text-[#2563EB]" />
                                    Votre nom
                                </label>
                                <Input
                                    placeholder="Prénom et nom"
                                    value={signatureName}
                                    onChange={(event) => setSignatureName(event.target.value)}
                                    className="h-12 border-white/10 bg-white/5 text-base text-white"
                                    disabled={isSubmitting}
                                    autoFocus
                                />
                                <p className="text-xs text-zinc-500">
                                    En signant, vous acceptez les conditions de ce {noun}.
                                </p>
                            </div>

                            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowAcceptModal(false)}
                                    disabled={isSubmitting}
                                    className="h-12 flex-1 rounded-xl border-white/10 bg-transparent text-zinc-300"
                                >
                                    Annuler
                                </Button>
                                <Button
                                    onClick={() => void handleAccept()}
                                    disabled={!signatureName.trim() || isSubmitting}
                                    className="h-12 flex-1 rounded-xl bg-[#2563EB] text-white hover:bg-[#2563EB]/90"
                                >
                                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : acceptLabel}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}

            {isSignable && (
                <Dialog open={showRefuseModal} onOpenChange={setShowRefuseModal}>
                    <DialogContent className="max-h-[90dvh] overflow-y-auto border-white/10 bg-zinc-950 p-0 text-zinc-100 sm:max-w-[440px]">
                        <div className="p-5 sm:p-6">
                            <DialogHeader className="text-left">
                                <DialogTitle className="text-lg font-semibold text-white">Refuser ce {noun}</DialogTitle>
                                <DialogDescription className="text-zinc-400">
                                    Un court motif aide le prestataire à ajuster sa proposition.
                                </DialogDescription>
                            </DialogHeader>

                            <Textarea
                                placeholder="Motif (optionnel)"
                                value={refusalReason}
                                onChange={(event) => setRefusalReason(event.target.value)}
                                rows={4}
                                disabled={isSubmitting}
                                className="mt-5 min-h-[120px] border-white/10 bg-white/5 text-base text-white"
                            />

                            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowRefuseModal(false)}
                                    disabled={isSubmitting}
                                    className="h-12 flex-1 rounded-xl border-white/10 bg-transparent text-zinc-300"
                                >
                                    Annuler
                                </Button>
                                <Button
                                    onClick={() => void handleRefuse()}
                                    disabled={isSubmitting}
                                    className="h-12 flex-1 rounded-xl bg-rose-600 text-white hover:bg-rose-500"
                                >
                                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Envoyer"}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}

function ZoomControls({
    zoom,
    onZoomIn,
    onZoomOut,
    onReset,
    compact = false,
}: {
    zoom: number
    onZoomIn: () => void
    onZoomOut: () => void
    onReset: () => void
    compact?: boolean
}) {
    return (
        <div className="flex items-center rounded-lg border border-white/10 bg-white/5">
            <button
                type="button"
                onClick={onZoomOut}
                disabled={zoom <= MIN_ZOOM}
                className="flex h-8 w-8 items-center justify-center text-zinc-300 hover:text-white disabled:opacity-30"
                aria-label="Dézoomer"
            >
                <Minus className="h-3.5 w-3.5" />
            </button>
            <button
                type="button"
                onClick={onReset}
                className={cn(
                    "min-w-[2.75rem] px-1 text-center font-mono text-[11px] font-semibold text-zinc-300 hover:text-white",
                    compact && "min-w-[2.4rem] text-[10px]"
                )}
                aria-label="Réinitialiser le zoom"
            >
                {Math.round(zoom * 100)}%
            </button>
            <button
                type="button"
                onClick={onZoomIn}
                disabled={zoom >= MAX_ZOOM}
                className="flex h-8 w-8 items-center justify-center text-zinc-300 hover:text-white disabled:opacity-30"
                aria-label="Zoomer"
            >
                <Plus className="h-3.5 w-3.5" />
            </button>
        </div>
    )
}

function StatusChip({ document }: { document: ClientDocument }) {
    if (document.type === "FACTURE") {
        if (document.status === "PAID") {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Payée
                </span>
            )
        }
        return (
            <span className="hidden items-center gap-1.5 rounded-full bg-sky-500/10 px-2.5 py-1 text-[11px] font-semibold text-sky-300 sm:inline-flex">
                <FileText className="h-3.5 w-3.5" />
                Facture
            </span>
        )
    }

    if (document.status === "ACCEPTED") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {document.type === "CONTRAT" ? "Signé" : "Accepté"}
            </span>
        )
    }
    if (document.status === "REFUSED") {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold text-rose-300">
                <XCircle className="h-3.5 w-3.5" />
                Refusé
            </span>
        )
    }
    return (
        <span className="hidden items-center gap-1.5 rounded-full bg-white/5 px-2.5 py-1 text-[11px] font-semibold text-zinc-400 sm:inline-flex">
            À relire
        </span>
    )
}
