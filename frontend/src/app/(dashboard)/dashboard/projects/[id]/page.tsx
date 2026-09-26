// app/dashboard/projects/[id]/page.tsx
"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProjectDocuments } from "@/features/projects/components/ProjectDocuments"
import { Loader2, ArrowLeft, Trash2, Edit3, FileText, TrendingUp, DollarSign, Calendar, PlusCircle, Settings, RefreshCw, Paperclip, Folder } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import Link from "next/link"
import { useDeleteProject, useProject } from "@/features/projects/hooks/useProject"
import { formatCurrency } from "@/features/quotes/lib/formatCurrency"

import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu"
import { ProjectPropertiesModal } from "@/features/projects/components/ProjectPropertiesModal"

export default function ProjectDetailPage() {
    const params = useParams()
    const router = useRouter()
    const projectId = params.id as string

    const { data: project, isLoading } = useProject(projectId)
    const deleteMutation = useDeleteProject()

    const [isPropertiesOpen, setIsPropertiesOpen] = useState(false)

    const handleDelete = async () => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
            await deleteMutation.mutateAsync(projectId)
            router.push("/dashboard/projects")
        }
    }

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
            </div>
        )
    }

    if (!project) {
        return (
            <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
                <div className="text-center">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Projet introuvable</h2>
                    <Link href="/dashboard/projects">
                        <Button variant="outline">Retour aux projets</Button>
                    </Link>
                </div>
            </div>
        )
    }


    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger asChild>
                    <div className="flex-1 min-h-[calc(100vh-4rem)] bg-[#141414] dark:bg-[#121212] flex flex-col text-slate-200 rounded-tl-2xl overflow-hidden -m-4 md:-m-8">
                        {/* Top Bar (Breadcrumb) */}
                        <div className="flex items-center px-4 h-12 bg-[#1e1e1e] dark:bg-[#1a1a1a] border-b border-black/50 shadow-sm text-sm shrink-0">
                            <button onClick={() => router.back()} className="p-1.5 hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-white mr-2">
                                <ArrowLeft className="w-4 h-4" />
                            </button>

                            <div className="flex items-center gap-1 font-medium text-[13px] bg-black/20 rounded-md px-2 py-1 ring-1 ring-white/5">
                                <Link href="/dashboard/projects" className="px-2 py-1 hover:bg-white/10 rounded transition-colors text-slate-400 hover:text-white">
                                    Projets
                                </Link>
                                <span className="text-slate-600">/</span>
                                <span className="px-2 py-1 text-slate-200">{project.name}</span>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 flex flex-col p-6">
                            <ProjectDocuments projectId={project.id} />
                        </div>
                    </div>
                </ContextMenuTrigger>

                <ContextMenuContent className="w-64 bg-[#1a1a1a] border-[#333] text-slate-200">
                    <ContextMenuItem className="focus:bg-sky-600 focus:text-white cursor-pointer">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Nouveau devis
                    </ContextMenuItem>
                    <ContextMenuSeparator className="bg-[#333]" />
                    <ContextMenuItem className="focus:bg-sky-600 focus:text-white cursor-pointer">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Actualiser
                    </ContextMenuItem>
                    <ContextMenuSeparator className="bg-[#333]" />
                    <ContextMenuItem
                        className="focus:bg-sky-600 focus:text-white cursor-pointer"
                        onSelect={() => setTimeout(() => setIsPropertiesOpen(true), 150)}
                    >
                        <Settings className="mr-2 h-4 w-4" />
                        Propriétés du projet
                    </ContextMenuItem>
                    <ContextMenuItem
                        className="text-red-400 focus:bg-red-600 focus:text-white cursor-pointer"
                        onClick={handleDelete}
                    >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Supprimer le projet
                    </ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            <ProjectPropertiesModal
                project={project}
                open={isPropertiesOpen}
                onOpenChange={setIsPropertiesOpen}
            />
        </>
    )
}