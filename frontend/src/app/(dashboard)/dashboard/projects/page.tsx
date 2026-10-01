// app/dashboard/projects/page.tsx
"use client"

import { useState } from "react"
import { ProjectFolder } from "@/features/projects/components/ProjectFolder"
import { CreateProjectModal } from "@/features/projects/components/CreateProjectModal"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu"

import { Loader2, FolderPlus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useDeleteProject, useProjects } from "@/features/projects/hooks/useProject"

export default function ProjectsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { data: projects = [], isLoading } = useProjects({ search: searchQuery || undefined });
    const deleteProjectMutation = useDeleteProject();

    const handleDelete = async (id: string) => {
        await deleteProjectMutation.mutateAsync(id);
    };

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger asChild>
                    <div className="flex-1 space-y-6 lg:space-y-8 p-4 md:p-8 pt-6 min-h-screen flex flex-col">
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8 md:mb-10">
                            <div className="min-w-0">
                                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
                                    Mes Projets
                                </h1>
                                <p className="text-muted-foreground mt-1 text-sm md:text-base line-clamp-2">
                                    Gérez vos dossiers, importations et fichiers liés à vos devis.
                                </p>
                            </div>

                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="relative flex-1 md:flex-none md:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                                    <Input
                                        placeholder="Rechercher..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 h-10 md:h-11 w-full bg-slate-50 dark:bg-slate-900/50 border-transparent focus:bg-white dark:focus:bg-slate-900 rounded-xl text-sm"
                                    />
                                </div>

                                <Button
                                    onClick={() => setIsModalOpen(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white shrink-0 h-10 md:h-11 px-3 sm:px-4"
                                    title="Nouveau projet"
                                >
                                    <FolderPlus className="h-4 w-4 sm:mr-2" />
                                    <span className="hidden sm:inline">Nouveau projet</span>
                                </Button>
                            </div>
                        </div>

                        {isLoading && (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                            </div>
                        )}

                        {!isLoading && projects.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="h-16 w-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                    <FolderPlus className="h-8 w-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Aucun projet</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-6">
                                    Créez votre premier projet pour commencer.
                                </p>
                                <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                                    <FolderPlus className="mr-2 h-4 w-4" />
                                    Créer un projet
                                </Button>
                            </div>
                        )}

                        {!isLoading && projects.length > 0 && (
                            <div className="grid grid-cols-2 min-[500px]:grid-cols-3 md:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4 sm:gap-6 flex-1 content-start">
                                {projects.map((project) => (
                                    <ProjectFolder
                                        key={project.id}
                                        project={project}
                                        onDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </ContextMenuTrigger>

                <ContextMenuContent className="w-64">
                    <ContextMenuItem onSelect={() => setTimeout(() => setIsModalOpen(true), 150)}>
                        <FolderPlus className="mr-2 h-4 w-4" />
                        Nouveau projet
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem>Tout sélectionner</ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>

            {/* Modal de création */}
            <CreateProjectModal
                open={isModalOpen}
                onOpenChange={setIsModalOpen}
            />
        </>
    )
}
