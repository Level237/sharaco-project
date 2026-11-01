"use client"

import { useEffect, useState } from "react"
import { motion, type Variants } from "framer-motion"
import Link from "next/link"
import { BookOpen, Eye, FileDown, Mail, MoreVertical, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ProjectTreeSpecification } from "@/features/projects/types"
import { specificationsApi } from "../api/specificationsApi"
import { specKindMeta } from "../kinds"
import { specificationEditHref } from "../paths"
import { SendEmailModal } from "@/features/quotes/components/sendEmailModal"

export function SpecificationCard({
    spec,
    variants,
    onRefresh,
    clientEmail,
    clientName,
}: {
    spec: ProjectTreeSpecification
    variants?: Variants
    onRefresh?: () => void
    clientEmail?: string | null
    clientName?: string | null
}) {
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [emailOpen, setEmailOpen] = useState(false)
    const kind = specKindMeta(spec.kind)
    const canSend = spec.status === "DRAFT" || spec.status === "SENT"
    const statusLabel = spec.status === "SENT" ? "Envoyé" : spec.status === "DRAFT" ? "Brouillon" : spec.status

    useEffect(() => {
        let objectUrl: string | null = null
        let mounted = true
        specificationsApi
            .getPreviewPngBlob(spec.id)
            .then((url) => {
                objectUrl = url
                if (mounted) setImageUrl(url)
                else URL.revokeObjectURL(url)
            })
            .catch(() => {
                if (mounted) setImageUrl(null)
            })
        return () => {
            mounted = false
            if (objectUrl) URL.revokeObjectURL(objectUrl)
        }
    }, [spec.id])

    const handleDelete = async () => {
        if (!window.confirm(`Supprimer « ${spec.number || spec.title} » ?`)) return
        await specificationsApi.delete(spec.id)
        onRefresh?.()
    }

    return (
        <motion.div variants={variants} initial="hidden" animate="show" layout className="group flex flex-col">
            <div className="relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-lg border border-white/5 bg-white/[0.02] p-1.5 transition-transform duration-300 group-hover:-translate-y-1">
                <Link href={specificationEditHref(spec.id)} className="relative block h-full w-full overflow-hidden rounded-md bg-slate-950/50 shadow-sm">
                    {imageUrl ? (
                        <img src={imageUrl} alt="" className="h-full w-full object-cover object-top" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center" style={{ background: spec.primary_color }}>
                            <BookOpen className="h-8 w-8 text-white/80" />
                        </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-md transition-opacity group-hover:opacity-100">
                            <Eye className="h-5 w-5" />
                        </div>
                    </div>
                </Link>
                <div className="absolute right-2 top-2 z-20">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button size="icon" variant="ghost" className="h-10 w-10 rounded-md border border-white/10 bg-black/40 text-slate-200">
                                <MoreVertical className="h-5 w-5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 border-white/10 bg-[#111113] p-2 text-slate-200">
                            <DropdownMenuItem asChild className="cursor-pointer">
                                <Link href={specificationEditHref(spec.id)}>
                                    <Pencil className="mr-2 h-4 w-4" />
                                    Modifier
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() =>
                                    specificationsApi.downloadPdf(
                                        spec.id,
                                        `${(spec.title || spec.number || "Cahier des charges").replace(/[\\/*?:"<>|\r\n]+/g, "").trim()}.pdf`
                                    )
                                }
                            >
                                <FileDown className="mr-2 h-4 w-4 text-blue-500" />
                                Télécharger PDF
                            </DropdownMenuItem>
                            {canSend && (
                                <DropdownMenuItem className="cursor-pointer" onClick={() => setEmailOpen(true)}>
                                    <Mail className="mr-2 h-4 w-4 text-emerald-400" />
                                    Envoyer par email
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="cursor-pointer text-rose-400" onClick={handleDelete}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
            <div className="mt-3 px-1">
                <h4 className="flex items-center gap-1.5 text-sm font-bold text-white">
                    <BookOpen className="h-3.5 w-3.5 text-[#2563EB]" />
                    {spec.number || "CDC"}
                </h4>
                <div className="mt-1 text-[11px] font-medium text-slate-400">
                    {kind.title} · {statusLabel}
                </div>
            </div>

            <SendEmailModal
                open={emailOpen}
                onOpenChange={setEmailOpen}
                documentId={spec.id}
                documentNumber={spec.number || ""}
                clientEmail={clientEmail || ""}
                clientName={clientName || ""}
                documentLabel="cahier des charges"
                sendKind="specification"
                onSent={onRefresh}
            />
        </motion.div>
    )
}
