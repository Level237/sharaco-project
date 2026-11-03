"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams } from "next/navigation"
import { AlertCircle, Loader2, Minus, Plus } from "lucide-react"
import Logo from "@/components/ui/logo"
import { API_URL } from "@/lib/api"
import { templatesApi } from "@/features/templates/api/templatesApi"
import { cn } from "@/lib/utils"

interface SharedDocument {
    id: string
    type: "DEVIS" | "FACTURE" | "CONTRAT"
    number?: string
    company_name?: string
    client_name?: string
}

const PREVIEW_WIDTH = 860
const DEFAULT_HEIGHT = 1122
const MIN_ZOOM = 0.5
const MAX_ZOOM = 1.6
const ZOOM_STEP = 0.1

function docTitle(type?: string) {
    if (type === "CONTRAT") return "Contrat"
    if (type === "FACTURE") return "Facture"
    return "Devis"
}

export default function SharedDocumentPage() {
    const params = useParams()
    const token = params.token as string

    const [document, setDocument] = useState<SharedDocument | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [previewHtml, setPreviewHtml] = useState("")
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
                const res = await fetch(`${API_URL}/api/v1/documents/shared/${token}`)
                if (!res.ok) {
                    throw new Error("Document introuvable ou lien expiré")
                }
                const data = (await res.json()) as SharedDocument
                if (cancelled) return
                setDocument(data)
                const html = await templatesApi.previewDocumentByShareToken(token)
                if (!cancelled) setPreviewHtml(html)
            } catch (err: unknown) {
                if (!cancelled) {
                    setError(err instanceof Error ? err.message : "Document introuvable ou lien expiré")
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

    const scale = fitScale * zoom
    const scaledWidth = PREVIEW_WIDTH * scale
    const scaledHeight = contentHeight * scale

    return (
        <div className="min-h-[100dvh] bg-zinc-950 text-zinc-100">
            <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/90 backdrop-blur-xl print:hidden">
                <div className="mx-auto flex h-14 max-w-[960px] items-center justify-between gap-2 px-3 sm:h-16 sm:px-6">
                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <Logo width={96} height={28} />
                    </div>
                    <div className="hidden sm:block">
                        <ZoomControls zoom={zoom} onZoomIn={zoomIn} onZoomOut={zoomOut} onReset={resetZoom} />
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-[960px] px-3 py-5 sm:px-6 sm:py-8">
                <div className="mb-5 flex items-end justify-between gap-3 sm:mb-6">
                    <div className="min-w-0">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                            {document.company_name || "Document"}
                        </p>
                        <h1 className="mt-1 truncate text-xl font-semibold tracking-tight text-white sm:text-2xl">
                            {docTitle(document.type)} {document.number || ""}
                        </h1>
                        {document.client_name ? (
                            <p className="mt-1 text-sm text-zinc-400">Pour {document.client_name}</p>
                        ) : null}
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
                className="flex h-8 w-8 items-center justify-center text-zinc-300 hover:text-white disabled:opacity-30 active:scale-95"
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
                className="flex h-8 w-8 items-center justify-center text-zinc-300 hover:text-white disabled:opacity-30 active:scale-95"
                aria-label="Zoomer"
            >
                <Plus className="h-3.5 w-3.5" />
            </button>
        </div>
    )
}
