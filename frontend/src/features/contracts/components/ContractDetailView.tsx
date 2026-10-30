"use client"

import { useCallback, useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
    ArrowLeft,
    CheckCircle2,
    Download,
    Loader2,
    Mail,
    PenTool,
    Phone,
    ScrollText,
    Trash2,
} from "lucide-react"
import { quotesApi } from "@/features/quotes/api/quotesApi"
import { DocumentPreview } from "@/features/quotes/components/DocumentPreview"
import { SendEmailModal } from "@/features/quotes/components/sendEmailModal"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { formatCurrency } from "@/features/quotes/lib/formatCurrency"
import { projectHref } from "@/features/projects/lib/paths"
import { useAuthStore } from "@/store/auth-store"
import type { Document } from "@/features/quotes/types"
import { contractKindMeta } from "../kinds"
import { contractEditHref } from "../paths"

function formatDate(value?: string | null) {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return date.toLocaleDateString("fr-FR")
}

export function ContractDetailView({ contractId: contractIdProp }: { contractId?: string }) {
    const params = useParams()
    const router = useRouter()
    const contractId = contractIdProp || (params.id as string)

    const { toast } = useToast()
    const user = useAuthStore((state) => state.user)

    const [contract, setContract] = useState<Document | null>(null)
    const [loading, setLoading] = useState(true)
    const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)
    const [isDownloading, setIsDownloading] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isSignOpen, setIsSignOpen] = useState(false)
    const [providerName, setProviderName] = useState("")
    const [signing, setSigning] = useState(false)

    const loadContract = useCallback(async () => {
        try {
            const data = await quotesApi.getById(contractId)
            if (data.type !== "CONTRAT") {
                router.replace(`/dashboard/quotes/${contractId}`)
                return
            }
            setContract(data)
        } catch {
            setContract(null)
        } finally {
            setLoading(false)
        }
    }, [contractId, router])

    useEffect(() => {
        if (contractId) void loadContract()
    }, [contractId, loadContract])

    useEffect(() => {
        if (!providerName) {
            setProviderName(user?.full_name || user?.company_name || "")
        }
    }, [user, providerName])

    const handleDownload = async () => {
        setIsDownloading(true)
        try {
            await quotesApi.downloadPdf(contractId, `${contract?.number || "contrat"}.pdf`)
            toast({ title: "Succès", description: "Le téléchargement du contrat a démarré." })
        } catch (error: unknown) {
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Impossible de télécharger le PDF.",
                variant: "destructive",
            })
        } finally {
            setIsDownloading(false)
        }
    }

    const handleDelete = async () => {
        if (contract?.status !== "DRAFT") return
        if (!window.confirm(`Supprimer le contrat ${contract?.number || ""} ?\n\nCette action est irréversible.`)) {
            return
        }
        setIsDeleting(true)
        try {
            await quotesApi.delete(contractId)
            toast({ title: "Contrat supprimé" })
            if (contract.project_id && contract.client_id) {
                router.push(projectHref(contract.client_id, contract.project_id))
            } else {
                router.push("/dashboard/clients")
            }
        } catch (error: unknown) {
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Impossible de supprimer le contrat.",
                variant: "destructive",
            })
        } finally {
            setIsDeleting(false)
        }
    }

    const signAsProvider = async () => {
        if (!providerName.trim()) {
            toast({ title: "Nom requis", description: "Indiquez votre nom pour signer.", variant: "destructive" })
            return
        }
        setSigning(true)
        try {
            const updated = await quotesApi.signAsProvider(contractId, providerName.trim())
            setContract(updated)
            setIsSignOpen(false)
            toast({ title: "Contrat signé", description: "Votre signature apparaît sur le document." })
        } catch (error: unknown) {
            toast({
                title: "Erreur",
                description: error instanceof Error ? error.message : "Impossible de signer.",
                variant: "destructive",
            })
        } finally {
            setSigning(false)
        }
    }

    if (loading) {
        return (
            <div className="flex min-h-[100dvh] flex-1 flex-col items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
        )
    }

    if (!contract) {
        return (
            <div className="flex min-h-[100dvh] flex-1 flex-col items-center justify-center px-4">
                <ScrollText className="mb-4 h-8 w-8 text-slate-300" />
                <h2 className="mb-2 text-lg font-medium text-slate-900 dark:text-slate-100">Contrat introuvable</h2>
                <p className="mb-6 text-center text-sm text-slate-500">Le document demandé n&apos;est pas disponible.</p>
                <Link href="/dashboard/clients">
                    <Button variant="outline" className="rounded-md">Retour</Button>
                </Link>
            </div>
        )
    }

    const isSigned = contract.status === "ACCEPTED"
    const isRefused = contract.status === "REFUSED"
    const canEdit = !isSigned
    const canDelete = contract.status === "DRAFT"
    const canSignAsProvider = !isRefused && !contract.provider_signature_name
    const kind = contractKindMeta(contract.layout_style)
    const totalCents = contract.grand_total_cents || contract.total_cents || 0
    const backHref = contract.project_id && contract.client_id
        ? projectHref(contract.client_id, contract.project_id)
        : "/dashboard/clients"

    return (
        <div className="flex min-h-[100dvh] flex-col bg-[#FAFAFA] font-sans text-slate-900 dark:bg-[#0A0A0A] dark:text-slate-100">
            <header className="sticky top-0 z-30 w-full border-b border-slate-200 bg-[#FAFAFA]/90 backdrop-blur-md dark:border-slate-800 dark:bg-[#0A0A0A]/90">
                <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-3 sm:h-16 sm:px-4 md:px-6">
                    <div className="flex min-w-0 items-center gap-2 sm:gap-4">
                        <Link
                            href={backHref}
                            className="shrink-0 text-slate-400 transition-colors duration-200 hover:text-slate-900 dark:hover:text-slate-100"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                        <div className="flex min-w-0 items-baseline gap-1.5 sm:gap-3">
                            <h1 className="truncate text-xs font-semibold tracking-tight text-slate-900 sm:text-sm dark:text-slate-100">
                                Contrat {contract.number || "Sans numéro"}
                            </h1>
                            <span className="hidden truncate text-sm text-slate-500 sm:inline">
                                {contract.client?.name || contract.client_name || "Client inconnu"}
                            </span>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 sm:gap-4">
                        {isSigned ? (
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 sm:gap-2 sm:text-xs">
                                <CheckCircle2 className="h-3 w-3 text-emerald-500 sm:h-3.5 sm:w-3.5" />
                                <span>Signé</span>
                            </div>
                        ) : contract.status === "SENT" || contract.status === "VIEWED" ? (
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-blue-500 sm:gap-2 sm:text-xs">
                                <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                <span>{contract.status === "VIEWED" ? "Consulté" : "Envoyé"}</span>
                            </div>
                        ) : isRefused ? (
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-rose-500 sm:gap-2 sm:text-xs">
                                <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                                <span>Refusé</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 sm:gap-2 sm:text-xs">
                                <span className="relative flex h-2 w-2">
                                    <span className="relative inline-flex h-2 w-2 rounded-full bg-slate-400" />
                                </span>
                                <span>Brouillon</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="relative mx-auto flex w-full max-w-[1700px] flex-1 flex-col gap-4 px-3 py-4 sm:gap-6 sm:px-4 sm:py-6 md:px-6 xl:flex-row xl:gap-8 lg:px-8 xl:px-10">
                <div className="flex w-full flex-1 flex-col items-center xl:items-start">
                    <div className="mb-4 w-full max-w-[900px] border border-slate-200 bg-white p-1.5 shadow-sm sm:mb-8 sm:p-2 xl:max-w-none dark:border-slate-800 dark:bg-[#111111]">
                        <DocumentPreview
                            documentId={contractId}
                            layoutStyle={contract.layout_style || "prestation"}
                        />
                    </div>
                </div>

                <div className="flex w-full shrink-0 flex-col gap-4 sm:gap-6 xl:w-[400px] xl:pt-2 2xl:w-[580px]">
                    <div className="rounded-lg border border-slate-200/80 bg-white/90 p-4 shadow-[0_1px_0_rgba(15,23,42,0.03),0_8px_20px_rgba(15,23,42,0.04)] backdrop-blur-sm sm:p-5 dark:border-slate-800 dark:bg-slate-950/60">
                        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                            Informations client
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                                {contract.client?.name || contract.client_name || "Nom non renseigné"}
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                <Mail className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{contract.client?.email || contract.client_email || "Email non renseigné"}</span>
                            </div>
                            {(contract.client?.phone || contract.client_phone) && (
                                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                                    <Phone className="h-3.5 w-3.5 shrink-0" />
                                    <span className="truncate">{contract.client?.phone || contract.client_phone}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-lg border border-slate-200/80 bg-white/90 p-4 shadow-[0_1px_0_rgba(15,23,42,0.03),0_8px_20px_rgba(15,23,42,0.04)] backdrop-blur-sm sm:p-5 dark:border-slate-800 dark:bg-slate-950/60">
                        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                            Contrat
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-slate-500 dark:text-slate-400">Type</span>
                                <span className="font-medium text-slate-900 dark:text-slate-100">{kind.title}</span>
                            </div>
                            {(contract.signature_revision || 1) > 1 && (
                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-slate-500 dark:text-slate-400">Version</span>
                                    <span className="font-medium text-slate-900 dark:text-slate-100">{contract.signature_revision}</span>
                                </div>
                            )}
                            {totalCents > 0 && (
                                <div className="flex items-center justify-between gap-3 pt-1">
                                    <span className="font-semibold text-slate-900 dark:text-slate-100">Montant</span>
                                    <span className="text-lg font-bold tracking-tight text-[#2563EB] dark:text-blue-400">
                                        {formatCurrency(totalCents)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="rounded-lg border border-slate-200/80 bg-white/90 p-4 shadow-[0_1px_0_rgba(15,23,42,0.03),0_8px_20px_rgba(15,23,42,0.04)] backdrop-blur-sm sm:p-5 dark:border-slate-800 dark:bg-slate-950/60">
                        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                            Signatures
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div>
                                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Prestataire</p>
                                {contract.provider_signature_name ? (
                                    <p className="mt-0.5 font-medium text-slate-900 dark:text-slate-100">
                                        {contract.provider_signature_name}
                                        {formatDate(contract.provider_signed_at) ? (
                                            <span className="font-normal text-slate-500"> · Signé le {formatDate(contract.provider_signed_at)}</span>
                                        ) : null}
                                    </p>
                                ) : (
                                    <p className="mt-0.5 text-slate-500">En attente</p>
                                )}
                            </div>
                            <div>
                                <p className="text-[11px] font-medium uppercase tracking-wider text-slate-400">Client</p>
                                {contract.signature_name ? (
                                    <p className="mt-0.5 font-medium text-slate-900 dark:text-slate-100">
                                        {contract.signature_name}
                                        {formatDate(contract.accepted_at) ? (
                                            <span className="font-normal text-slate-500"> · Signé le {formatDate(contract.accepted_at)}</span>
                                        ) : null}
                                    </p>
                                ) : (
                                    <p className="mt-0.5 text-slate-500">En attente</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="rounded-lg border border-slate-200/80 bg-white/90 p-4 shadow-[0_1px_0_rgba(15,23,42,0.03),0_8px_20px_rgba(15,23,42,0.04)] backdrop-blur-sm sm:p-5 dark:border-slate-800 dark:bg-slate-950/60">
                        <h3 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400 sm:mb-4">
                            Actions rapides
                        </h3>

                        <div className="grid grid-cols-2 gap-2 sm:gap-3">
                            <Button
                                onClick={() => setIsEmailModalOpen(true)}
                                className="group flex h-12 cursor-pointer flex-col items-center justify-center rounded-md bg-[#2563EB] text-xs text-white shadow-sm transition-all duration-200 hover:bg-[#2563EB]/80 sm:h-14 sm:rounded-lg sm:text-sm"
                            >
                                Envoyer au client
                            </Button>
                            <Button
                                onClick={() => void handleDownload()}
                                disabled={isDownloading}
                                variant="outline"
                                className="group flex h-12 cursor-pointer flex-col items-center justify-center gap-0.5 rounded-md border-slate-200 bg-white text-xs text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-60 sm:h-14 sm:gap-1 sm:rounded-lg sm:text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                {isDownloading ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-[#2563EB]" />
                                ) : (
                                    <Download className="h-4 w-4 text-slate-500 transition-colors group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white" />
                                )}
                                <span>{isDownloading ? "Téléchargement..." : "Télécharger PDF"}</span>
                            </Button>
                        </div>

                        <div className="mt-3 flex w-full flex-col items-stretch gap-2 sm:mt-4 sm:flex-row sm:items-center sm:gap-3">
                            {canEdit && (
                                <Button
                                    onClick={() => router.push(contractEditHref(contractId))}
                                    variant="outline"
                                    className="h-11 flex-1 gap-2 rounded-md border-slate-200 bg-white text-xs text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 sm:h-12 sm:text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                    Modifier le contrat
                                </Button>
                            )}
                            {canSignAsProvider && (
                                <Button
                                    onClick={() => setIsSignOpen(true)}
                                    variant="outline"
                                    className="h-11 flex-1 gap-2 rounded-md border-slate-200 bg-white text-xs text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:text-slate-900 sm:h-12 sm:text-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                                >
                                    <PenTool className="h-3.5 w-3.5" />
                                    Signer
                                </Button>
                            )}
                            {canDelete && (
                                <Button
                                    onClick={() => void handleDelete()}
                                    disabled={isDeleting}
                                    variant="ghost"
                                    className="h-11 flex-1 justify-center gap-2 rounded-md text-xs text-red-600 transition-all duration-200 hover:bg-red-50 hover:text-red-700 disabled:opacity-60 sm:h-12 sm:text-sm dark:text-red-400 dark:hover:bg-red-950/40 dark:hover:text-red-300"
                                >
                                    {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                                    <span className="font-medium">Supprimer le contrat</span>
                                </Button>
                            )}
                        </div>
                    </div>

                    <SendEmailModal
                        open={isEmailModalOpen}
                        onOpenChange={setIsEmailModalOpen}
                        documentId={contractId}
                        documentNumber={contract.number || ""}
                        clientEmail={contract.client?.email || contract.client_email || ""}
                        clientName={contract.client?.name || contract.client_name || "Client"}
                        onSent={() => void loadContract()}
                        documentLabel="contrat"
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
            </main>
        </div>
    )
}
