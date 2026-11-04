"use client"

import { useEffect, useRef, useState } from "react"
import { PenLine, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SignaturePadProps {
    value: string | null
    onChange: (dataUrl: string | null) => void
    label?: string
    showSignedDate?: boolean
}

export function SignaturePad({
    value,
    onChange,
    label = "Signature",
    showSignedDate = false,
}: SignaturePadProps) {
    const [editing, setEditing] = useState(false)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const drawing = useRef(false)
    const hasStroke = useRef(false)

    useEffect(() => {
        if (!editing) return
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        const ratio = window.devicePixelRatio || 1
        const width = canvas.clientWidth || 320
        const height = 130
        canvas.width = width * ratio
        canvas.height = height * ratio
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
        ctx.lineCap = "round"
        ctx.lineJoin = "round"
        ctx.lineWidth = 2.2
        ctx.strokeStyle = "#0f172a"
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, width, height)
        hasStroke.current = false
        if (value) {
            const img = new Image()
            img.onload = () => {
                ctx.drawImage(img, 0, 0, width, height)
                hasStroke.current = true
            }
            img.src = value
        }
    }, [editing, value])

    const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        if (!canvas) return { x: 0, y: 0 }
        const rect = canvas.getBoundingClientRect()
        return { x: event.clientX - rect.left, y: event.clientY - rect.top }
    }

    const start = (event: React.PointerEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!canvas || !ctx) return
        drawing.current = true
        hasStroke.current = true
        canvas.setPointerCapture(event.pointerId)
        const { x, y } = point(event)
        ctx.beginPath()
        ctx.moveTo(x, y)
    }

    const move = (event: React.PointerEvent<HTMLCanvasElement>) => {
        if (!drawing.current) return
        const ctx = canvasRef.current?.getContext("2d")
        if (!ctx) return
        const { x, y } = point(event)
        ctx.lineTo(x, y)
        ctx.stroke()
    }

    const end = () => {
        if (!drawing.current) return
        drawing.current = false
    }

    const clearCanvas = () => {
        const canvas = canvasRef.current
        const ctx = canvas?.getContext("2d")
        if (!canvas || !ctx) return
        const width = canvas.clientWidth || 320
        ctx.fillStyle = "#ffffff"
        ctx.fillRect(0, 0, width, 130)
        hasStroke.current = false
    }

    const saveSignature = () => {
        const canvas = canvasRef.current
        if (!canvas || !hasStroke.current) {
            onChange(null)
            setEditing(false)
            return
        }
        onChange(canvas.toDataURL("image/png"))
        setEditing(false)
    }

    const signedLabel = new Date().toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    })

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            {label ? (
                <span className="w-24 shrink-0 text-xs font-semibold text-slate-400">
                    {label}
                </span>
            ) : null}

            {editing ? (
                <div className="w-full max-w-sm space-y-2.5 rounded-lg border border-white/10 bg-[#141720] p-3">
                    <canvas
                        ref={canvasRef}
                        className="h-[130px] w-full cursor-crosshair touch-none rounded-md border border-slate-200 bg-white"
                        onPointerDown={start}
                        onPointerMove={move}
                        onPointerUp={end}
                        onPointerLeave={end}
                    />
                    <div className="flex items-center justify-between gap-2">
                        <Button
                            type="button"
                            variant="ghost"
                            className="h-8 px-2.5 text-xs text-slate-400 hover:text-white"
                            onClick={clearCanvas}
                        >
                            Effacer
                        </Button>
                        <div className="flex items-center gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                className="h-8 px-2.5 text-xs text-slate-400 hover:text-white"
                                onClick={() => setEditing(false)}
                            >
                                Annuler
                            </Button>
                            <Button
                                type="button"
                                className="h-8 bg-[#2563EB] px-3 text-xs text-white hover:bg-[#1d4ed8]"
                                onClick={saveSignature}
                            >
                                Valider
                            </Button>
                        </div>
                    </div>
                </div>
            ) : value ? (
                <div className="flex w-44 flex-col items-center rounded-lg border border-white/10 bg-white px-4 py-3 text-slate-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={value}
                        alt="Signature"
                        className="h-12 max-w-[140px] object-contain"
                    />
                    {showSignedDate ? (
                        <p className="mt-1.5 text-[11px] font-bold text-slate-800">
                            Signé le : {signedLabel}
                        </p>
                    ) : null}
                    <div className="mt-1.5 flex items-center gap-3 text-slate-400">
                        <button
                            type="button"
                            onClick={() => onChange(null)}
                            className="hover:text-rose-500"
                            aria-label="Supprimer la signature"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setEditing(true)}
                            className="hover:text-slate-800"
                            aria-label="Modifier la signature"
                        >
                            <PenLine className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="flex h-24 w-44 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/15 bg-white/[0.02] text-xs font-semibold text-slate-300 transition-colors hover:border-[#2563EB]/60 hover:bg-[#2563EB]/5 hover:text-white"
                >
                    <Plus className="h-4 w-4 text-[#2563EB]" />
                    <span>+ Signature</span>
                </button>
            )}
        </div>
    )
}
