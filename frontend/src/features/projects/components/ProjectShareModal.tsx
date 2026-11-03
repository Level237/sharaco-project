"use client"

import { useEffect, useMemo, useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Check, Copy, Loader2, Share2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useCurrentUser } from "@/features/auth/hooks/useAuth"
import { cn } from "@/lib/utils"
import { projectsApi } from "../api/projectsApi"

type AccessMode = "limited" | "link"

export function ProjectShareModal({
    projectId,
    projectName,
    clientEmail,
    clientName,
    open,
    onOpenChange,
}: {
    projectId: string
    projectName: string
    clientEmail?: string | null
    clientName?: string | null
    open: boolean
    onOpenChange: (open: boolean) => void
}) {
    const { toast } = useToast()
    const queryClient = useQueryClient()
    const { data: user } = useCurrentUser()
    const [access, setAccess] = useState<AccessMode>("limited")
    const [copied, setCopied] = useState(false)
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")
    const [emailError, setEmailError] = useState("")

    const shareQuery = useQuery({
        queryKey: ["project-share", projectId],
        queryFn: () => projectsApi.getShare(projectId),
        enabled: open && Boolean(projectId),
    })

    useEffect(() => {
        if (!open) return
        if (shareQuery.data) setAccess(shareQuery.data.enabled ? "link" : "limited")
        setEmail(clientEmail || "")
        setMessage("")
        setEmailError("")
        setCopied(false)
    }, [open, shareQuery.data, clientEmail])

    const saveMutation = useMutation({
        mutationFn: (enabled: boolean) => projectsApi.updateShare(projectId, enabled),
        onSuccess: (data) => {
            queryClient.setQueryData(["project-share", projectId], data)
            setAccess(data.enabled ? "link" : "limited")
            toast({
                title: data.enabled ? "Lien activé" : "Accès limité",
                description: data.enabled
                    ? "Toute personne avec le lien peut ouvrir l’espace du projet."
                    : "Le lien ne donne plus accès à l’espace.",
            })
        },
        onError: (error: Error) => {
            toast({ title: "Erreur", description: error.message, variant: "destructive" })
        },
    })

    const sendMutation = useMutation({
        mutationFn: () =>
            projectsApi.sendShareEmail(projectId, {
                email: email.trim(),
                custom_message: message.trim() || undefined,
            }),
        onSuccess: (data) => {
            queryClient.setQueryData(["project-share", projectId], data)
            setAccess("link")
            toast({
                title: "Email envoyé",
                description: `L’espace projet a été envoyé à ${email.trim()}.`,
            })
            onOpenChange(false)
        },
        onError: (error: Error) => {
            toast({ title: "Erreur d’envoi", description: error.message, variant: "destructive" })
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
        if (access !== "link") {
            try {
                await saveMutation.mutateAsync(true)
            } catch {
                return
            }
        }
        try {
            await navigator.clipboard.writeText(shareUrl)
            setCopied(true)
            window.setTimeout(() => setCopied(false), 1600)
            toast({ title: "Lien copié" })
        } catch {
            toast({ title: "Impossible de copier le lien", variant: "destructive" })
        }
    }

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    const dirty = shareQuery.data ? (access === "link") !== shareQuery.data.enabled : false
    const busy = saveMutation.isPending || sendMutation.isPending

    const handlePrimary = () => {
        if (access === "link" && email.trim()) {
            if (!validEmail) {
                setEmailError("Email invalide")
                return
            }
            setEmailError("")
            sendMutation.mutate()
            return
        }
        if (dirty) {
            saveMutation.mutate(access === "link")
            return
        }
        onOpenChange(false)
    }

    const primaryLabel =
        access === "link" && email.trim()
            ? "Envoyer"
            : dirty
                ? "Enregistrer"
                : "Fermer"

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="gap-0 border-white/10 bg-[#141416] p-0 text-slate-100 sm:max-w-[460px]">
                <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4 pr-12">
                    <Share2 className="h-4 w-4 shrink-0 text-slate-400" />
                    <DialogTitle className="truncate text-[15px] font-medium text-white">
                        Partager « {projectName} »
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                        Paramètres de partage du projet
                    </DialogDescription>
                </div>

                {shareQuery.isPending ? (
                    <div className="flex justify-center py-14">
                        <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                    </div>
                ) : (
                    <div className="px-5 py-4">
                        <div className="flex items-center justify-between gap-3 pb-4 border-b border-white/10">
                            <div className="flex min-w-0 items-center gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-medium text-white">
                                    {initials}
                                </div>
                                <div className="min-w-0">
                                    <p className="truncate text-sm text-white">{ownerName}</p>
                                    {ownerEmail ? (
                                        <p className="truncate text-xs text-slate-400">{ownerEmail}</p>
                                    ) : null}
                                </div>
                            </div>
                            <span className="shrink-0 text-xs text-slate-500">Propriétaire</span>
                        </div>

                        <div className="py-4 border-b border-white/10">
                            <label className="mb-1.5 block text-xs font-medium text-slate-300">
                                Accès au projet
                            </label>
                            <Select value={access} onValueChange={(v) => setAccess(v as AccessMode)}>
                                <SelectTrigger className="h-10 border-white/10 bg-[#0d0d0f] text-sm text-white focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="z-[150] border-white/10 bg-[#1c1c1f] text-slate-100">
                                    <SelectItem value="limited" className="focus:bg-white/10 focus:text-white">
                                        Limité
                                    </SelectItem>
                                    <SelectItem value="link" className="focus:bg-white/10 focus:text-white">
                                        Toute personne avec le lien
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="mt-1.5 text-xs text-slate-500">
                                {access === "link"
                                    ? "Les documents déjà envoyés sont visibles via ce lien."
                                    : "Le lien est désactivé."}
                            </p>
                        </div>

                        {access === "link" ? (
                            <div className="space-y-3 py-4 border-b border-white/10">
                                <div>
                                    <div className="mb-1.5 flex items-baseline justify-between gap-2">
                                        <label htmlFor="share-email" className="text-xs font-medium text-slate-300">
                                            Email d’envoi
                                        </label>
                                        {clientName ? (
                                            <span className="truncate text-xs text-slate-500">{clientName}</span>
                                        ) : null}
                                    </div>
                                    <input
                                        id="share-email"
                                        type="email"
                                        value={email}
                                        onChange={(event) => {
                                            setEmail(event.target.value)
                                            setEmailError("")
                                        }}
                                        placeholder="client@email.com"
                                        className="h-10 w-full rounded-md border border-white/10 bg-[#0d0d0f] px-3 text-sm text-slate-100 placeholder:text-slate-600 focus:border-white/25 focus:outline-none"
                                    />
                                    {emailError ? (
                                        <p className="mt-1 text-xs text-rose-400">{emailError}</p>
                                    ) : null}
                                </div>
                                <div>
                                    <label htmlFor="share-message" className="mb-1.5 block text-xs font-medium text-slate-300">
                                        Message
                                    </label>
                                    <textarea
                                        id="share-message"
                                        rows={2}
                                        value={message}
                                        onChange={(event) => setMessage(event.target.value)}
                                        placeholder="Optionnel"
                                        className="w-full resize-none rounded-md border border-white/10 bg-[#0d0d0f] px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:border-white/25 focus:outline-none"
                                    />
                                </div>
                            </div>
                        ) : null}

                        <div className="mt-4 flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() => void copyLink()}
                                disabled={!shareUrl || busy}
                                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-white/15 px-3 text-xs font-medium text-slate-200 hover:bg-white/5 disabled:opacity-40"
                            >
                                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                                {copied ? "Copié" : "Copier le lien"}
                            </button>
                            <button
                                type="button"
                                disabled={busy}
                                onClick={handlePrimary}
                                className={cn(
                                    "inline-flex h-9 items-center rounded-md px-4 text-xs font-medium",
                                    access === "link" && email.trim()
                                        ? "bg-[#2563EB] text-white hover:bg-[#1d4ed8]"
                                        : dirty
                                            ? "bg-white text-slate-900 hover:bg-slate-200"
                                            : "bg-white/10 text-slate-300 hover:bg-white/15"
                                )}
                            >
                                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : primaryLabel}
                            </button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
}
