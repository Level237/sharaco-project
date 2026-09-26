"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Plus,
    FileText,
    Eye,
    Trash2,
    Loader2,
    Search,
    MoreVertical,
    Unlink,
    Clock,
    AlertCircle,
    CheckCircle2
} from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Document } from "@/features/quotes/types"
import { formatCurrency } from "@/features/quotes/lib/formatCurrency"
import Link from "next/link"
import { DocumentPreview } from "@/features/quotes/components/DocumentPreview"
import { invoicesApi } from "../api/invoicesApi"
import { useDeleteDocument } from "@/features/quotes/hooks/useDeleteDocument"
import { Button } from "@/components/ui/button"
import { useLinkToProject } from "@/features/quotes/hooks/useLinkToProject"
import { useQuery } from "@tanstack/react-query"
import { projectsApi } from "@/features/projects/api/projectsApi"
import { useUnlinkFromProject } from "@/features/quotes/hooks/useUnlinkFromProject"

interface InvoiceListProps {
    invoices: Document[],
    onDeleteSuccess?: () => void,
    projectId?: string,
    searchQuery?: string,
    statusFilter?: string
}

const statusConfig: Record<string, { label: string, icon: any, color: string }> = {
    PENDING: { label: "En Attente", icon: Clock, color: "text-amber-500" },
    OVERDUE: { label: "En retard", icon: AlertCircle, color: "text-rose-500" },
    PAID: { label: "Payé", icon: CheckCircle2, color: "text-emerald-500" },
    // Fallback for types that might still use the old status internally
    DRAFT: { label: "Brouillon", icon: FileText, color: "text-slate-500" },
    SENT: { label: "Envoyé", icon: Clock, color: "text-sky-500" },
    VIEWED: { label: "Consulté", icon: Eye, color: "text-amber-500" },
    ACCEPTED: { label: "Payé", icon: CheckCircle2, color: "text-emerald-500" },
    REFUSED: { label: "Annulé", icon: AlertCircle, color: "text-rose-500" }
}

import type { Variants } from "framer-motion"

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.05 }
    }
}

const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1, transition: { type: "spring", stiffness: 300, damping: 25 } }
}

export function InvoiceList({ invoices, onDeleteSuccess, projectId, searchQuery = "", statusFilter = "ALL" }: InvoiceListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const unlinkMutation = useUnlinkFromProject();

    const { deleteDocument, isDeleting } = useDeleteDocument({
        onSuccess: () => {
            onDeleteSuccess?.()
            setDeletingId(null)
        },
    })

    const handleUnlinkFromProject = async (documentId: string) => {
        const confirmed = window.confirm(
            "Êtes-vous sûr de vouloir dissocier ce document de son projet ?"
        );
        if (confirmed) {
            try {
                await unlinkMutation.mutateAsync(documentId);
            } catch (error) {
                console.error("Erreur dissociation:", error);
            }
        }
    };
    const linkToProjectMutation = useLinkToProject();

    const { data: projects = [] } = useQuery({
        queryKey: ['projects'],
        queryFn: () => projectsApi.getAll(),
    });

    const handleLinkToProject = async (documentId: string, projectId: string) => {
        try {
            await linkToProjectMutation.mutateAsync({
                documentId,
                projectId: projectId === "none" ? null : projectId
            });
        } catch (error) {
            console.error("Erreur association:", error);
        }
    };

    const handleDelete = async (invoice: Document) => {
        setDeletingId(invoice.id)
        await deleteDocument(invoice.id, invoice.number)
    }

    const filteredInvoices = invoices.filter(invoice => {
        const clientName = invoice.client?.name || "";
        const invoiceNumber = invoice.number || "";

        const matchesSearch = !searchQuery ||
            clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());

        // For actual filtering by backend status if it uses PENDING/PAID etc., or fallback logic.
        const matchesStatus = statusFilter === "ALL" || invoice.status === statusFilter || 
            (statusFilter === "PAID" && invoice.status === "ACCEPTED") ||
            (statusFilter === "PENDING" && invoice.status === "SENT") ||
            (statusFilter === "OVERDUE" && invoice.status === "REFUSED"); // Map logic just in case backend still returns old statuses

        return matchesSearch && matchesStatus;
    });

    const handleDownloadPdf = async (id: string, number?: string) => {
        try {
            await invoicesApi.downloadPdf(id, `${number || 'facture'}.pdf`);
        } catch (error) {
            console.error('Erreur téléchargement PDF:', error)
        }
    }

    return (
        <div className="space-y-6">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-6 gap-4 md:gap-6"
            >
                {/* Nouvelle Facture Card */}
                <motion.div variants={cardVariants} className="h-full">
                    <Link href={`/dashboard/invoices/create${projectId ? `?project_id=${projectId}` : ''}`} className="group flex flex-col h-full w-full">
                        <div className="w-full aspect-[4/5] rounded-2xl bg-slate-100/50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 flex flex-col items-center justify-center group-hover:bg-slate-100 dark:group-hover:bg-white/[0.05] group-hover:border-violet-500/30 group-hover:shadow-xl group-hover:shadow-violet-500/10 group-hover:-translate-y-1">
                            <div className="w-12 h-12 rounded-full bg-[#2563EB] flex items-center justify-center text-white mb-3 shadow-[0_4px_15px_rgba(124,58,237,0.3)] group-hover:scale-110">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Nouvelle facture</span>
                        </div>
                        {/* Spacer to match text height of other cards */}
                        <div className="mt-3 opacity-0">
                            <h4 className="text-sm font-bold">X</h4>
                            <div className="text-[11px]">X</div>
                        </div>
                    </Link>
                </motion.div>

                {/* Document Cards */}
                <AnimatePresence mode="popLayout">
                    {filteredInvoices.map((invoice) => {
                        const config = statusConfig[invoice.status] || statusConfig.DRAFT
                        const StatusIcon = config.icon
                        const isBeingDeleted = deletingId === invoice.id

                        return (
                            <motion.div
                                key={invoice.id}
                                variants={cardVariants}
                                initial="hidden"
                                animate="show"
                                exit="hidden"
                                layout
                                className={`group flex flex-col ${isBeingDeleted ? 'opacity-50 pointer-events-none' : ''}`}
                            >
                                <div className={`relative w-full aspect-[4/5] rounded-2xl bg-slate-100/50 dark:bg-white/[0.02] border overflow-hidden group-hover:-translate-y-1 p-2 flex items-center justify-center transition-all ${
                                    invoice.status === "OVERDUE" 
                                        ? "border-rose-500/50 shadow-[0_0_20px_-5px_rgba(225,29,72,0.15)] dark:border-rose-500/30" 
                                        : "border-slate-200/50 dark:border-white/5"
                                }`}>

                                    {/* Overdue Badge */}
                                    {invoice.status === "OVERDUE" && (
                                        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-rose-500 text-white border border-rose-600/50 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-lg shadow-rose-500/20">
                                            <AlertCircle className="w-3 h-3" />
                                            En retard
                                        </div>
                                    )}

                                    {/* Preview Container */}
                                    <div className="w-full h-full rounded-xl overflow-hidden shadow-sm bg-white dark:bg-slate-950/50 relative">
                                        <DocumentPreview
                                            documentId={invoice.id}
                                            layoutStyle={invoice.layout_style}
                                        />
                                    </div>

                                    {/* Hover Actions Overlay */}
                                    <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 duration-300 flex items-center justify-center gap-3">
                                        <Link href={`/dashboard/invoices/${invoice.id}`}>
                                            <Button size="icon" className="h-10 w-10 rounded-full bg-white text-slate-900 hover:bg-slate-100 shadow-lg hover:scale-110">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" className="h-10 w-10 rounded-full bg-white text-slate-900 hover:bg-slate-100 shadow-lg hover:scale-110">
                                                    {isBeingDeleted ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-2xl p-2 w-56 bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/10 shadow-2xl shadow-violet-500/5">
                                                <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    Actions
                                                </div>

                                                {invoice.project_id && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleUnlinkFromProject(invoice.id)}
                                                        className="text-amber-600 focus:text-amber-600 cursor-pointer"
                                                    >
                                                        <Unlink className="mr-2 h-4 w-4" />
                                                        Dissocier du projet
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem className="cursor-pointer rounded-xl p-2 focus:bg-slate-100 dark:focus:bg-white/5" onSelect={(e) => e.preventDefault()}>
                                                    <div className="flex flex-col w-full gap-2">
                                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Associer à un projet</span>
                                                        <Select onValueChange={(value) => handleLinkToProject(invoice.id, value)}>
                                                            <SelectTrigger className="h-9 rounded-lg bg-slate-50 dark:bg-black/20 border-slate-200 dark:border-white/10">
                                                                <SelectValue placeholder="Choisir un projet" />
                                                            </SelectTrigger>
                                                            <SelectContent className="rounded-xl bg-white dark:bg-[#111113] border-slate-200 dark:border-white/10 shadow-xl">
                                                                <SelectItem value="none" className="rounded-lg cursor-pointer">Aucun projet</SelectItem>
                                                                {projects.map((project) => (
                                                                    <SelectItem key={project.id} value={project.id} className="rounded-lg cursor-pointer">
                                                                        {project.name}
                                                                    </SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </div>
                                                </DropdownMenuItem>

                                                <div className="h-px bg-slate-200/60 dark:bg-white/10 my-1.5 mx-1" />

                                                <DropdownMenuItem onClick={() => handleDownloadPdf(invoice.id, invoice.number)} className="cursor-pointer rounded-xl py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-white/5 transition-colors">
                                                    <FileText className="mr-2.5 h-4 w-4 text-sky-500" />
                                                    Télécharger PDF
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(invoice)} className="cursor-pointer rounded-xl py-2.5 px-3 text-rose-600 dark:text-rose-500 focus:text-rose-700 dark:focus:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-500/10 font-medium transition-colors">
                                                    <Trash2 className="mr-2.5 h-4 w-4" />
                                                    Supprimer facture
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Text Details */}
                                <div className="mt-3 px-1">
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                                        {invoice.client?.name || "Client Inconnu"}
                                    </h4>
                                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1.5 truncate">
                                        <div className={`p-0.5 rounded-md bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 ${config.color}`}>
                                            <StatusIcon className="w-3 h-3" />
                                        </div>
                                        <span>{config.label}</span>
                                        <span className="text-slate-300 dark:text-slate-600">•</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-300">{formatCurrency(invoice.grand_total_cents || 0)}</span>
                                        <span className="text-slate-300 dark:text-slate-600">•</span>
                                        <span>{new Date(invoice.created_at).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>

                {filteredInvoices.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                        <Search className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-4" />
                        <h4 className="text-lg font-bold text-slate-900 dark:text-white">Aucune facture trouvée</h4>
                        <p className="text-sm text-slate-500 mt-1">Essayez de modifier votre recherche.</p>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
