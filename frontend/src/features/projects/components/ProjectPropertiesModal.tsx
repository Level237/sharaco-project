"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Folder, Info, Calendar, User, DollarSign, FileText } from "lucide-react"
import { Project } from "../types"
import { formatCurrency } from "@/features/quotes/lib/formatCurrency"

interface ProjectPropertiesModalProps {
    project: Project;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ProjectPropertiesModal({ project, open, onOpenChange }: ProjectPropertiesModalProps) {
    const createdDate = project.created_at ? new Date(project.created_at).toLocaleDateString("fr-FR", {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
    }) : "Inconnue";

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden bg-[#f0f0f0] dark:bg-[#202020] border border-slate-300 dark:border-[#333] shadow-2xl rounded-lg font-sans">
                {/* Windows-like Header */}
                <div className="flex items-center px-4 py-2 bg-white dark:bg-[#2d2d2d] border-b border-slate-200 dark:border-[#1a1a1a]">
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                        Propriétés de : {project.name}
                    </span>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                    {/* Icon and Name */}
                    <div className="flex items-center gap-4 pb-4 border-b border-slate-300 dark:border-[#333]">
                        <Folder className="w-12 h-12 text-sky-500 fill-sky-500/20" strokeWidth={1} />
                        <input 
                            readOnly 
                            value={project.name} 
                            className="flex-1 bg-white dark:bg-[#1a1a1a] border border-slate-300 dark:border-[#333] rounded-sm px-2 py-1 text-sm text-slate-900 dark:text-slate-100 focus:outline-none"
                        />
                    </div>

                    {/* Properties List */}
                    <div className="space-y-3 text-[13px] text-slate-700 dark:text-slate-300">
                        <div className="flex">
                            <span className="w-28 text-slate-500 dark:text-slate-400">Type :</span>
                            <span className="flex items-center gap-1">
                                <Info className="w-4 h-4 text-slate-400" /> Dossier de projet
                            </span>
                        </div>
                        <div className="flex">
                            <span className="w-28 text-slate-500 dark:text-slate-400">Emplacement :</span>
                            <span>Mes Projets\{project.name}</span>
                        </div>
                        <div className="flex">
                            <span className="w-28 text-slate-500 dark:text-slate-400">Client :</span>
                            <span className="flex items-center gap-1">
                                <User className="w-4 h-4 text-slate-400" /> {project.client_name || "Non assigné"}
                            </span>
                        </div>
                        
                        <div className="h-px bg-slate-300 dark:bg-[#333] my-2" />

                        <div className="flex">
                            <span className="w-28 text-slate-500 dark:text-slate-400">Contient :</span>
                            <span className="flex items-center gap-1">
                                <FileText className="w-4 h-4 text-slate-400" /> {project.documents_count || 0} Fichiers
                            </span>
                        </div>
                        <div className="flex">
                            <span className="w-28 text-slate-500 dark:text-slate-400">Budget :</span>
                            <span className="flex items-center gap-1">
                                <DollarSign className="w-4 h-4 text-slate-400" /> {project.budget_cents ? formatCurrency(project.budget_cents) : "Non défini"}
                            </span>
                        </div>

                        <div className="h-px bg-slate-300 dark:bg-[#333] my-2" />

                        <div className="flex">
                            <span className="w-28 text-slate-500 dark:text-slate-400">Créé le :</span>
                            <span className="flex items-center gap-1 capitalize">
                                <Calendar className="w-4 h-4 text-slate-400" /> {createdDate}
                            </span>
                        </div>
                        <div className="flex items-center">
                            <span className="w-28 text-slate-500 dark:text-slate-400">Statut :</span>
                            <span className="px-2 py-0.5 bg-slate-200 dark:bg-[#333] rounded text-xs font-medium">
                                {project.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="flex items-center justify-end gap-2 p-3 bg-[#f0f0f0] dark:bg-[#202020] border-t border-slate-300 dark:border-[#333]">
                    <button 
                        onClick={() => onOpenChange(false)}
                        className="px-6 py-1.5 bg-white dark:bg-[#333] border border-slate-300 dark:border-[#444] rounded text-sm text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#3a3a3a] transition-colors"
                    >
                        OK
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
