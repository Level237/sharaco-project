"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Check, ChevronDown, Copy, Link2, Loader2, Lock, Share2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useCurrentUser } from "@/features/auth/hooks/useAuth"
import { cn } from "@/lib/utils"
import { projectsApi } from "../api/projectsApi"

type AccessMode = "limited" | "link"

export function ProjectShareModal({
    projectId,
    projectName,
    open,
    onOpenChange,
}: {
    projectId: string
    projectName: string
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const { toast } = useToast()
    const queryClient = useQueryClient()
    const { data: user } = useCurrentUser()
    const [access, setAccess] = useState<AccessMode>("limited")
    const [copied, setCopied] = useState(false)
    const [menuOpen, setMenuOpen] = useState(false)

    const shareQuery = useQuery({
        queryKey: ["project-share", projectId],
        queryFn: () => projectsApi.getShare(projectId),
        enabled: open && Boolean(projectId),
    })

    useEffect(() => {
        if (!shareQuery.data) return
        setAccess(shareQuery.data.enabled ? "link" : "limited")
    }, [shareQuery.data])

    const saveMutation = useMutation({
        mutationFn: (enabled: boolean) => projectsApi.updateShare(projectId, enabled),
        onSuccess: (data) => {
            queryClient.setQueryData(["project-share", projectId], data)
            toast({
                title: data.enabled ? "Lien activé" : "Accès limité",
                description: data.enabled
                    ? "Toute personne avec le lien peut ouvrir l’espace du projet."
                    : "Le lien ne donne plus accès à l’espace.",
            })
            onOpenChange(false)
        },
        onError: (error: Error) => {
            toast({ title: "Erreur", description: error.message, variant: "destructive" })
        },
    })

    const shareUrl = useMemo(() => {
        const path = shareQuery.data?.share_path
        if (!path || typeof window === "undefined") return ""
        return `${window.location.origin}${path}`
    }, [shareQuery.data?.share_path])

    const ownerName = user?.full_name || user?.company_name || "Vous"
    const ownerEmail = user?.email || ""
    const initials = ownerName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("") || "P"

    const copyLink = async () => {
        if (!shareUrl) return
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1600)
            toast({
                title: "Lien copié",
                description: access === "link"
                    ? "Le lien de l’espace projet est dans le presse-papiers."
                    : "Le lien est copié. Enregistrez « Toute personne avec le lien » pour l’activer.",
            })
        } catch {
            toast({ title: "Impossible de copier le lien", variant: "destructive" })
        }
    }

    const dirty = shareQuery.data ? (access === "link") !== shareQuery.data.enabled : false

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 overflow-hidden border-white/10 bg-[#161618] p-0 text-slate-100 sm:max-w-[520px]">
                <div className="flex items-start gap-3 border-b border-white/10 px-5 py-4 pr-12">
                    <Share2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                    <div className="min-w-0">
                        <DialogTitle className="truncate text-[15px] font-medium text-white">
                            Partager « {projectName} »
                        </DialogTitle>
                        <DialogDescription className="sr-only">
                            Contrôlez qui peut ouvrir l’espace de ce projet
                        </DialogDescription>
                    </div>
                </div>

                {shareQuery.isPending ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="h-6 w-6 animate-spin text-[#2563EB]" />
                    </div>
                ) : (
                    <div className="px-5 py-4">
                        <p className="mb-3 text-[13px] font-medium text-slate-200">Personnes avec accès</p>
                        <div className="mb-6 flex items-center justify-between gap-3">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#2563EB] text-xs font-semibold text-white">
                                    {initials}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm font-medium text-white">{ownerName}</p>
                                    {ownerEmail ? (
                                        <p className="truncate text-xs text-slate-400">{ownerEmail}</p>
                                    ) : null}
                                </div>
                            </div>
                            <span className="shrink-0 text-xs text-slate-500">Propriétaire</span>
                        </div>

                        <p className="mb-2 text-[13px] font-medium text-slate-200">Accès au projet</p>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => setMenuOpen((v) => !v)}
                                className="flex w-full items-start gap-3 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-3 text-left hover:bg-white/[0.06]"
                            >
                                {access === "link" ? (
                                    <Link2 className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                ) : (
                                    <Lock className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                                )}
                                <span className="min-w-0 flex-1">
                                    <span className="block text-sm text-white">
                                        {access === "link" ? "Toute personne avec le lien" : "Limité"}
                                    </span>
                                    <span className="mt-0.5 block text-xs text-slate-400">
                                        {access === "link"
                                            ? "Les documents déjà envoyés sont visibles via ce lien"
                                            : "Seules les personnes qui y ont accès peuvent l’ouvrir à l’aide du lien"}
                                    </span>
                                </span>
                                <ChevronDown className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />
                            </button>
                            {menuOpen ? (
                                <div className="absolute left-0 right-0 z-20 mt-1 overflow-hidden rounded-xl border border-white/10 bg-[#1c1c1f] py-1 shadow-xl">
                                    <button
                                        type="button"
                                        className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-white/5"
                                        onClick={() => {
                                            setAccess("limited")
                                            setMenuOpen(false)
                                        }}
                                    >
                                        <Lock className="mt-0.5 h-4 w-4 text-slate-400" />
                                        <span>
                                            <span className="block text-sm text-white">Limité</span>
                                            <span className="block text-xs text-slate-400">Lien désactivé</span>
                                        </span>
                                    </button>
                                    <button
                                        type="button"
                                        className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-white/5"
                                        onClick={() => {
                                            setAccess("link")
                                            setMenuOpen(false)
                                        }}
                                    >
                                        <Link2 className="mt-0.5 h-4 w-4 text-slate-400" />
                                        <span>
                                            <span className="block text-sm text-white">Toute personne avec le lien</span>
                                            <span className="block text-xs text-slate-400">Documents envoyés uniquement</span>
                                        </span>
                                    </button>
                                </div>
                            ) : null}
                        </div>

                        <div className="mt-6 flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => void copyLink()}
                                disabled={!shareUrl}
                                className="inline-flex h-9 items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 text-sm text-slate-200 hover:bg-white/[0.08] disabled:opacity-40"
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                Copier le lien
                            </button>
                            <button
                                type="button"
                                disabled={saveMutation.isPending || !dirty}
                                onClick={() => saveMutation.mutate(access === "link")}
                                className={cn(
                                    "inline-flex h-9 items-center rounded-full px-4 text-sm font-medium",
                                    dirty
                                        ? "bg-white text-slate-900 hover:bg-slate-200"
                                        : "bg-white/10 text-slate-500"
                                )}
                            >
                                {saveMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    "Enregistrer"
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
