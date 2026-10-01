// features/projects/components/ProjectFolder.tsx
"use client"

import { useRouter } from "next/navigation"
import { CloudUpload, FolderOpen, FileText, TrendingUp } from "lucide-react"
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "@/components/ui/context-menu"
import { Project } from "../types"
import { useState } from "react"
import { CreateProjectModal } from "./CreateProjectModal"
import { cn } from "@/lib/utils"


interface ProjectFolderProps {
    project: Project;
    onDelete?: (id: string) => void;
}

export function ProjectFolder({ project, onDelete }: ProjectFolderProps) {
    const router = useRouter();
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    const handleOpen = () => {
        router.push(`/dashboard/projects/${project.id}`);
    };

    const handleEdit = () => {
        setIsEditModalOpen(true);
    };

    const handleDelete = () => {
        const confirmed = window.confirm(
            `Êtes-vous sûr de vouloir supprimer le projet "${project.name}" ?\n\nCette action est irréversible.`
        );
        if (confirmed && onDelete) {
            onDelete(project.id);
        }
    };

    const getStatusIcon = () => {
        switch (project.status) {
            case 'ACTIVE':
                return <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />;
            case 'COMPLETED':
                return <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" strokeWidth={1.5} />;
            default:
                return <CloudUpload className="w-6 h-6 sm:w-8 sm:h-8 text-slate-800 dark:text-slate-200" strokeWidth={1.5} />;
        }
    };

    return (
        <>
            <ContextMenu>
                <ContextMenuTrigger asChild>
                    <div
                        className="group cursor-pointer flex flex-col w-full"
                        onClick={handleOpen}
                    >
                        {/* ═══════════ DOSSIER VISUEL ═══════════ */}
                        <div className="relative pt-2 sm:pt-3 w-full">
                            {/* Back Tab (onglet supérieur) */}
                            <div className="absolute top-0 left-0 w-[40%] sm:w-[45%] h-6 sm:h-8 bg-slate-200 dark:bg-slate-800/80 rounded-t-md sm:rounded-t-lg transition-colors duration-300 group-hover:bg-slate-300 dark:group-hover:bg-slate-700" />

                            {/* Front Body */}
                            <div className={cn(
                                "relative z-10 w-full bg-slate-100 dark:bg-[#1a1a1a] rounded-md sm:rounded-lg",
                                "flex items-center justify-center transition-all duration-300",
                                "group-hover:shadow-lg group-hover:-translate-y-0.5 sm:group-hover:-translate-y-1",
                                "border border-black/5 dark:border-white/5",
                                // ✅ Responsive aspect ratio
                                "aspect-[5/4] md:aspect-[4/3]"
                            )}>
                                {getStatusIcon()}
                            </div>
                        </div>

                        {/* ═══════════ INFOS ═══════════ */}
                        <div className="mt-2 sm:mt-3 ml-0.5 sm:ml-1 space-y-0.5 sm:space-y-1">
                            <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm tracking-wide line-clamp-1 block">
                                {project.name}
                            </span>

                            <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400">
                                {project.client_name && (
                                    <span className="line-clamp-1 flex-1 min-w-0">{project.client_name}</span>
                                )}
                                {project.documents_count !== undefined && project.documents_count > 0 && (
                                    <span className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                                        <FileText className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                        {project.documents_count}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </ContextMenuTrigger>

                <ContextMenuContent className="w-64">
                    <ContextMenuItem onClick={handleOpen}>
                        <FolderOpen className="mr-2 h-4 w-4" />
                        Ouvrir le projet
                    </ContextMenuItem>
                    <ContextMenuItem onClick={handleEdit}>
                        Modifier le projet
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem
                        onClick={handleDelete}
                        className="text-red-500 focus:text-red-500 dark:text-red-500 dark:focus:text-red-400"
                    >
                        Supprimer le projet
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    <ContextMenuItem>Propriétés</ContextMenuItem>
                </ContextMenuContent>
            </ContextMenu>
            
            <CreateProjectModal 
                open={isEditModalOpen} 
                onOpenChange={setIsEditModalOpen} 
                project={project}
            />
        </>
    );
}