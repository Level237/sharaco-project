"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ProjectDocuments } from "@/features/projects/components/ProjectDocuments"
import { Loader2, ArrowLeft, Trash2, PlusCircle, Settings, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useDeleteProject, useProject } from "@/features/projects/hooks/useProject"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu"
import { ProjectPropertiesModal } from "@/features/projects/components/ProjectPropertiesModal"

export default function ProjectDetailPage() {
    const params = useParams()
    const router = useRouter()
    const clientId = params.id as string
    const projectId = params.projectId as string

    const { data: project, isLoading } = useProject(projectId)
    const deleteMutation = useDeleteProject()
    const [isPropertiesOpen, setIsPropertiesOpen] = useState(false)

    const handleDelete = async () => {
        if (window.confirm("Êtes-vous sûr de vouloir supprimer ce projet ?")) {
            await deleteMutation.mutateAsync(projectId)
            router.push(`/dashboard/clients/${clientId}`)
        }
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 text-[#2563EB] animate-spin" />
            </div>
        )
    }

    if (!project) {
        return (
            <div className="py-20 text-center">
                <h2 className="text-xl font-bold text-white mb-4">Projet introuvable</h2>
                <Link href={`/dashboard/clients/${clientId}`} className="text-sm font-semibold text-[#2563EB]">
                    Retour au client
                </Link>
            </div>
        )
    }

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger asChild>
                    <div className="flex min-h-[calc(100dvh-8rem)] flex-col text-slate-200">
                        <div className="flex h-12 shrink-0 items-center justify-between gap-3 border-b border-white/10 text-sm">
                            <div className="flex min-w-0 items-center">
                                <button onClick={() => router.push(`/dashboard/clients/${clientId}`)} className="mr-2 shrink-0 p-1.5 text-slate-400 hover:text-white">
                                    <ArrowLeft className="h-4 w-4" />
                                </button>
                                <div className="flex min-w-0 items-center gap-1 font-medium text-[13px]">
                                    <Link href="/dashboard/clients" className="shrink-0 px-2 py-1 text-slate-400 hover:text-white">
                                        Clients
                                    </Link>
                                    <span className="shrink-0 text-slate-600">/</span>
                                    <Link href={`/dashboard/clients/${clientId}`} className="truncate px-2 py-1 text-slate-400 hover:text-white">
                                        {project.client?.name || project.client_name || "Client"}
                                    </Link>
                                    <span className="shrink-0 text-slate-600">/</span>
                                    <span className="truncate px-2 py-1 text-slate-200">{project.name}</span>
                                </div>
                            </div>
                            <Link href={`/dashboard/quotes/create?project_id=${project.id}`} className="shrink-0">
                                <Button size="sm" className="h-8 gap-1.5 bg-[#2563EB] px-3 text-xs text-white hover:bg-[#2563EB]/90">
                                    <PlusCircle className="h-3.5 w-3.5" />
                                    <span className="hidden sm:inline">Nouveau devis</span>
                                </Button>
                            </Link>
                        </div>
                        <div className="flex flex-1 flex-col py-4">
                            <ProjectDocuments projectId={project.id} />
                        </div>
                    </div>
                </ContextMenuTrigger>
                <ContextMenuContent className="w-64 border-white/10 bg-[#111113] text-slate-200">
                    <ContextMenuItem asChild className="cursor-pointer focus:bg-[#2563EB] focus:text-white">
                        <Link href={`/dashboard/quotes/create?project_id=${project.id}`} className="flex w-full items-center">
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Nouveau devis
                        </Link>
                    </ContextMenuItem>
                    <ContextMenuSeparator className="bg-white/10" />
                    <ContextMenuItem className="cursor-pointer focus:bg-[#2563EB] focus:text-white">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Actualiser
                    </ContextMenuItem>
                    <ContextMenuSeparator className="bg-white/10" />
                    <ContextMenuItem
                        className="cursor-pointer focus:bg-[#2563EB] focus:text-white"
                        onSelect={() => setTimeout(() => setIsPropertiesOpen(true), 150)}
                    >
                        <Settings className="mr-2 h-4 w-4" />
                        Propriétés du projet
                    </ContextMenuItem>
                    <ContextMenuItem
                        className="cursor-pointer text-red-400 focus:bg-red-600 focus:text-white"
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
