"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"
import { useDebouncedValue } from "@/features/quotes/hooks/useDebouncedValue"
import { previewPublicInvoice } from "../api"
import type { PublicInvoiceDraft } from "../types"

interface PublicInvoicePreviewProps {
    draft: PublicInvoiceDraft
    variant?: "thumbnail" | "full"
    onSelect?: () => void
}

const SHEET_W = 820
const SHEET_H = 1160

export function PublicInvoicePreview({
    draft,
    variant = "full",
    onSelect,
}: PublicInvoicePreviewProps) {
    const [html, setHtml] = useState("")
    const [loading, setLoading] = useState(false)
    const wrapRef = useRef<HTMLDivElement>(null)
    const [scale, setScale] = useState(variant === "thumbnail" ? 0.3 : 0.9)
    const debounced = useDebouncedValue(draft, 550)

    useEffect(() => {
        const el = wrapRef.current
        if (!el) return
        const measure = () => {
            const w = el.getBoundingClientRect().width
            if (w > 40) setScale(Math.min(1, w / SHEET_W))
        }
        measure()
        const obs = new ResizeObserver(measure)
        obs.observe(el)
        return () => obs.disconnect()
    }, [])

    useEffect(() => {
        let cancelled = false
        setLoading(true)
        previewPublicInvoice(debounced)
            .then((next) => {
                if (!cancelled) setHtml(next)
            })
            .catch(() => {
                if (!cancelled) setHtml("")
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => {
            cancelled = true
        }
    }, [debounced])

    const scaledH = Math.round(SHEET_H * scale)

    return (
        <div
            ref={wrapRef}
            onClick={onSelect}
            role={onSelect ? "button" : undefined}
            tabIndex={onSelect ? 0 : undefined}
            className={
                variant === "thumbnail"
                    ? "group relative w-full cursor-pointer overflow-hidden rounded-lg border-2 border-[#2563EB]/70 bg-white shadow-[0_10px_30px_rgba(37,99,235,0.18)] transition-all hover:border-[#2563EB]"
                    : "relative mx-auto w-full max-w-[820px] overflow-hidden rounded-lg border border-white/10 bg-white shadow-2xl"
            }
            style={{ height: `${scaledH}px` }}
        >
            {loading && (
                <div className="absolute right-2.5 top-2.5 z-10 flex items-center gap-1.5 rounded-full bg-slate-950/85 px-2.5 py-1 text-[10px] font-semibold text-white">
                    <Loader2 className="h-3 w-3 animate-spin text-[#2563EB]" />
                    <span>Mise à jour</span>
                </div>
            )}
            {html ? (
                <iframe
                    title="Aperçu facture"
                    srcDoc={html}
                    sandbox="allow-same-origin"
                    style={{
                        width: `${SHEET_W}px`,
                        height: `${SHEET_H}px`,
                        transform: `scale(${scale})`,
                        transformOrigin: "top left",
                    }}
                    className="pointer-events-none border-0 bg-white"
                />
            ) : (
                <div className="flex h-full items-center justify-center bg-white px-4 text-center text-xs text-slate-400">
                    Aperçu de la facture…
                </div>
            )}
        </div>
    )
}
