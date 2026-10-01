// features/quotes/components/QuoteList.tsx
"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Plus,
    FileText,
    FileCheck,
    Eye,
    CreditCard,
    Ban,
    Trash2,
    Loader2,
    Search,
    MoreVertical,
    Unlink
} from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Document, DocumentStatus } from "../types"
import { formatCurrency } from "../lib/formatCurrency"
import Link from "next/link"
import { DocumentPreview } from "./DocumentPreview"
import { quotesApi } from "../api/quotesApi"
import { useDeleteDocument } from "../hooks/useDeleteDocument"
import { Button } from "@/components/ui/button"
import { useLinkToProject } from "../hooks/useLinkToProject"
import { useQuery } from "@tanstack/react-query"
import { projectsApi } from "@/features/projects/api/projectsApi"
import { useUnlinkFromProject } from "../hooks/useUnlinkFromProject"
import { cn } from "@/lib/utils"

interface QuoteListProps {
    quotes: Document[],
    onDeleteSuccess?: () => void,
    projectId?: string,
    searchQuery?: string,
    statusFilter?: string
}

const statusConfig: Record<DocumentStatus, { label: string, icon: any, color: string }> = {
    ACCEPTED: { label: "Accepté", icon: CreditCard, color: "text-emerald-500" },
    REFUSED: { label: "Refusé", icon: Ban, color: "text-rose-500" },
    SENT: { label: "Envoyé", icon: FileCheck, color: "text-blue-500" },
    VIEWED: { label: "Consulté", icon: Eye, color: "text-amber-500" },
    DRAFT: { label: "Brouillon", icon: FileText, color: "text-slate-500" },
    PAID: { label: "Payé", icon: CreditCard, color: "text-emerald-500" },
    OVERDUE: { label: "En retard", icon: Ban, color: "text-rose-500" },
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

export function QuoteList({ quotes, onDeleteSuccess, projectId, searchQuery = "", statusFilter = "ALL" }: QuoteListProps) {
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

    const handleDelete = async (quote: Document) => {
        if (quote.status !== "DRAFT") return;
        setDeletingId(quote.id)
        await deleteDocument(quote.id, quote.number)
    }

    const filteredQuotes = quotes.filter(quote => {
        const clientName = quote.client?.name || "";
        const quoteNumber = quote.number || "";

        const matchesSearch = !searchQuery ||
            clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            quoteNumber.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === "ALL" || quote.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleDownloadPdf = async (id: string, number?: string) => {
        try {
            await quotesApi.downloadPdf(id, `${number || 'devis'}.pdf`)
        } catch (error) {
            console.error('Erreur téléchargement PDF:', error)
        }
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6"
            >
                {/* ═══════════ NOUVEAU DEVIS CARD ═══════════ */}
                <motion.div variants={cardVariants} className="h-full">
                    <Link href={`/dashboard/quotes/create${projectId ? `?project_id=${projectId}` : ''}`} className="group flex flex-col h-full w-full">
                        <div className="w-full aspect-[4/5] rounded-lg bg-slate-100/50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 flex flex-col items-center justify-center group-hover:bg-slate-100 dark:group-hover:bg-white/[0.05] group-hover:border-blue-500/30 group-hover:shadow-xl group-hover:shadow-blue-500/10 group-hover:-translate-y-1 transition-all duration-300">
                            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-[#2563EB] flex items-center justify-center text-white mb-2 sm:mb-3 shadow-[0_4px_15px_rgba(37,99,235,0.3)] group-hover:scale-105 transition-transform">
                                <Plus className="w-5 h-5" />
                            </div>
                            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 px-2 text-center">
                                Nouveau devis
                            </span>
                        </div>
                        {/* Spacer pour aligner avec les autres cards */}
                        <div className="mt-2 sm:mt-3 opacity-0">
                            <h4 className="text-xs sm:text-sm font-bold">X</h4>
                            <div className="text-[10px] sm:text-[11px]">X</div>
                        </div>
                    </Link>
                </motion.div>

                {/* ═══════════ DOCUMENT CARDS ═══════════ */}
                <AnimatePresence mode="popLayout">
                    {filteredQuotes.map((quote) => {
                        const config = statusConfig[quote.status] || statusConfig.DRAFT
                        const StatusIcon = config.icon
                        const isBeingDeleted = deletingId === quote.id

                        return (
                            <motion.div
                                key={quote.id}
                                variants={cardVariants}
                                initial="hidden"
                                animate="show"
                                exit="hidden"
                                layout
                                className={cn(
                                    "group flex flex-col",
                                    isBeingDeleted && "opacity-50 pointer-events-none"
                                )}
                            >
                                <div className="relative w-full aspect-[4/5] rounded-lg bg-slate-100/50 dark:bg-white/[0.02] border border-slate-200/50 dark:border-white/5 overflow-hidden group-hover:-translate-y-1 p-1 sm:p-1.5 flex items-center justify-center transition-transform duration-300">
                                    {/* Preview Container - Feuille de document nette */}
                                    <div className="w-full h-full rounded-[4px] overflow-hidden shadow-sm bg-white dark:bg-slate-950/50 relative">
                                        <DocumentPreview
                                            documentId={quote.id}
                                            layoutStyle={quote.layout_style}
                                        />
                                    </div>

                                    {/* ═══════════ HOVER ACTIONS OVERLAY ═══════════ */}
                                    <div className="absolute inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 sm:gap-3">
                                        <Link href={`/dashboard/quotes/${quote.id}`}>
                                            <Button size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-white text-slate-900 hover:bg-slate-100 shadow-lg hover:scale-105 transition-transform">
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </Link>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" className="h-8 w-8 sm:h-9 sm:w-9 rounded-lg bg-white text-slate-900 hover:bg-slate-100 shadow-lg hover:scale-105 transition-transform">
                                                    {isBeingDeleted ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreVertical className="h-4 w-4" />}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="rounded-xl p-2 w-56 bg-white dark:bg-[#111113] border border-slate-200/60 dark:border-white/10 shadow-2xl shadow-blue-500/5">
                                                <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                    Actions
                                                </div>

                                                {quote.project_id && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleUnlinkFromProject(quote.id)}
                                                        className="text-amber-600 focus:text-amber-600 cursor-pointer"
                                                    >
                                                        <Unlink className="mr-2 h-4 w-4" />
                                                        Dissocier du projet
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuItem className="cursor-pointer rounded-xl p-2 focus:bg-slate-100 dark:focus:bg-white/5" onSelect={(e) => e.preventDefault()}>
                                                    <div className="flex flex-col w-full gap-2">
                                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Associer à un projet</span>
                                                        <Select onValueChange={(value) => handleLinkToProject(quote.id, value)}>
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

                                                <DropdownMenuItem onClick={() => handleDownloadPdf(quote.id, quote.number)} className="cursor-pointer rounded-xl py-2.5 px-3 font-medium text-slate-700 dark:text-slate-300 focus:bg-slate-100 dark:focus:bg-white/5 transition-colors">
                                                    <FileText className="mr-2.5 h-4 w-4 text-blue-500" />
                                                    Télécharger PDF
                                                </DropdownMenuItem>
                                                {quote.status === "DRAFT" && (
                                                    <DropdownMenuItem onClick={() => handleDelete(quote)} className="cursor-pointer rounded-xl py-2.5 px-3 text-rose-600 dark:text-rose-500 focus:text-rose-700 dark:focus:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-500/10 font-medium transition-colors">
                                                        <Trash2 className="mr-2.5 h-4 w-4" />
                                                        Supprimer devis
                                                    </DropdownMenuItem>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* ═══════════ TEXT DETAILS ═══════════ */}
                                <div className="mt-2 sm:mt-3 px-0.5 sm:px-1">
                                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                                        {quote.client?.name || "Client Inconnu"}
                                    </h4>
                                    <div className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1 sm:mt-1.5 truncate">
                                        <div className={cn(
                                            "p-0.5 rounded-md bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10",
                                            config.color
                                        )}>
                                            <StatusIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                        </div>
                                        <span className="truncate">{config.label}</span>
                                        <span className="text-slate-300 dark:text-slate-600 shrink-0">•</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-300 shrink-0">
                                            {formatCurrency(quote.grand_total_cents || 0)}
                                        </span>
                                        <span className="text-slate-300 dark:text-slate-600 shrink-0">•</span>
                                        <span className="truncate">
                                            {new Date(quote.created_at).toLocaleDateString("fr-FR", { day: 'numeric', month: 'short' })}
                                        </span>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>

                {/* ═══════════ EMPTY STATE ═══════════ */}
                {filteredQuotes.length === 0 && (
                    <div className="col-span-full py-12 sm:py-20 flex flex-col items-center justify-center text-center">
                        <Search className="h-8 w-8 sm:h-10 sm:w-10 text-slate-300 dark:text-slate-600 mb-3 sm:mb-4" />
                        <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Aucun devis trouvé</h4>
                        <p className="text-sm text-slate-500 mt-1 px-4">Essayez de modifier votre recherche.</p>
                    </div>
                )}
            </motion.div>
        </div>
    )
}