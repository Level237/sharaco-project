"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
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
    SENT: { label: "Envoyé", icon: Clock, color: "text-blue-500" },
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
                <motion.div variants={cardVariants} className="h-full min-w-0">
                    <Link href={`/dashboard/invoices/create${projectId ? `?project_id=${projectId}` : ''}`} className="group flex flex-col h-full w-full">
                        <div className="w-full aspect-[4/5] rounded-lg bg-white/[0.02] border border-white/5 flex flex-col items-center justify-center group-hover:bg-white/[0.05] group-hover:border-violet-500/30 group-hover:shadow-xl group-hover:shadow-violet-500/10 group-hover:-translate-y-1">
                            <div className="w-12 h-12 rounded-full bg-[#2563EB] flex items-center justify-center text-white mb-3 shadow-[0_4px_15px_rgba(124,58,237,0.3)] group-hover:scale-110">
                                <Plus className="w-6 h-6" />
                            </div>
                            <span className="text-sm font-bold text-slate-300">Nouvelle facture</span>
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
                                <div className={`relative w-full aspect-[4/5] rounded-lg bg-white/[0.02] border overflow-hidden group-hover:-translate-y-1 p-2 flex items-center justify-center transition-all ${
                                    invoice.status === "OVERDUE" 
                                        ? "border-rose-500/50 shadow-[0_0_20px_-5px_rgba(225,29,72,0.15)] dark:border-rose-500/30" 
                                        : "border-white/5"
                                }`}>

                                    {/* Overdue Badge */}
                                    {invoice.status === "OVERDUE" && (
                                        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 z-20 flex items-center gap-1.5 bg-rose-500 text-white border border-rose-600/50 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full shadow-lg shadow-rose-500/20">
                                            <AlertCircle className="w-3 h-3" />
                                            En retard
                                        </div>
                                    )}

                                    {/* Preview Container - Clickable Link */}
                                    <Link href={`/dashboard/invoices/${invoice.id}`} className="w-full h-full rounded-[4px] overflow-hidden shadow-sm bg-slate-950/50 relative block group/preview">
                                        <DocumentPreview
                                            documentId={invoice.id}
                                            layoutStyle={invoice.layout_style}
                                        />
                                        {/* Subtle overlay on hover */}
                                        <div className="absolute inset-0 bg-black/0 group-hover/preview:bg-black/20 transition-colors duration-300 flex items-center justify-center">
                                            <div className="opacity-0 group-hover/preview:opacity-100 transition-opacity duration-300 h-10 w-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white scale-90 group-hover/preview:scale-100">
                                                <Eye className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </Link>

                                    {/* Menu Actions (always visible on mobile) */}
                                    <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 z-10">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-10 w-10 rounded-md bg-black/40 hover:bg-black/60 text-slate-300 backdrop-blur-md border border-white/10 shadow-lg" onClick={(e) => e.stopPropagation()}>
                                                    {isBeingDeleted ? <Loader2 className="h-5 w-5 animate-spin" /> : <MoreVertical className="h-5 w-5" />}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-lg p-2 w-56 bg-[#111113] border border-white/10 shadow-2xl shadow-blue-500/5">
                                                <div className="px-2 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                                                    Actions
                                                </div>

                                                <DropdownMenuItem onClick={() => handleDownloadPdf(invoice.id, invoice.number)} className="cursor-pointer rounded-lg py-2.5 px-3 font-medium text-slate-300 focus:bg-white/5 transition-colors">
                                                    <FileText className="mr-2.5 h-4 w-4 text-blue-500" />
                                                    Télécharger PDF
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(invoice)} className="cursor-pointer rounded-lg py-2.5 px-3 text-rose-500 focus:text-rose-400 focus:bg-rose-500/10 font-medium transition-colors">
                                                    <Trash2 className="mr-2.5 h-4 w-4" />
                                                    Supprimer facture
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Text Details */}
                                <div className="mt-2 sm:mt-3 px-0.5 sm:px-1 w-full min-w-0">
                                    <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                                        {invoice.client?.name || "Client Inconnu"}
                                    </h4>
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-x-1.5 gap-y-1 text-[10px] sm:text-[11px] text-slate-400 font-medium mt-1 sm:mt-1.5 min-w-0">
                                        <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto min-w-0 gap-2">
                                            <div className="flex items-center gap-1 shrink-0 min-w-0">
                                                <div className={cn(
                                                    "p-0.5 rounded-md border border-white/10 shrink-0",
                                                    config.color
                                                )}>
                                                    <StatusIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                                </div>
                                                <span className="truncate">{config.label}</span>
                                            </div>
                                            
                                            <span className="truncate shrink-0 sm:hidden">
                                                {new Date(invoice.created_at).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                        
                                        <span className="text-slate-600 shrink-0 hidden sm:inline">•</span>
                                        
                                        <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto">
                                            <span className="font-bold text-slate-300 shrink-0">
                                                {formatCurrency(invoice.grand_total_cents || 0)}
                                            </span>
                                            
                                            <span className="text-slate-600 shrink-0 hidden sm:inline">•</span>
                                            <span className="truncate shrink-0 hidden sm:inline">
                                                {new Date(invoice.created_at).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>

                {filteredInvoices.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                        <Search className="h-10 w-10 text-slate-600 mb-4" />
                        <h4 className="text-lg font-bold text-white">Aucune facture trouvée</h4>
                        <p className="text-sm text-slate-500 mt-1">Essayez de modifier votre recherche.</p>
                    </div>
                )}
            </motion.div>
        </div>
    )
}
