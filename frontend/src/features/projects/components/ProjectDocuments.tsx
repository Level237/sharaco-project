// features/projects/components/ProjectDocuments.tsx
"use client"

import { useProjectTree } from "../hooks/useProjectTree"
import { ProjectQuoteGrid } from "./ProjectQuoteGrid"
import { Loader2, Folder } from "lucide-react"

interface ProjectDocumentsProps {
    projectId: string;
}

export function ProjectDocuments({ projectId }: ProjectDocumentsProps) {
    const { data: tree, isLoading, refetch } = useProjectTree(projectId);
    console.log(tree)
    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center min-h-[300px]">
                <Loader2 className="h-8 w-8 text-[#2563EB] animate-spin" />
            </div>
        );
    }

    if (!tree || (tree.quotes.length === 0 && tree.standalone_invoices.length === 0)) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center h-full min-h-[400px] text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-[#2563EB]/10 border border-[#2563EB]/20 flex items-center justify-center mb-4">
                    <Folder className="w-8 h-8 text-[#2563EB]" strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-bold tracking-wide text-slate-100 mb-1">
                    Le projet est vide
                </h3>
                <p className="text-sm text-slate-400 max-w-sm mb-6">
                    Aucun devis ni facture n'est encore associé à ce projet. Créez votre premier devis pour démarrer.
                </p>
                <a
                    href={`/dashboard/quotes/create?project_id=${projectId}`}
                    className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#2563EB] hover:bg-[#2563EB]/90 text-white shadow-lg shadow-[#2563EB]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Folder className="w-4 h-4 mr-2" />
                    Créer un devis pour ce projet
                </a>
            </div>
        );
    }

    return (
        <ProjectQuoteGrid 
            tree={tree} 
            projectId={projectId}
            onRefresh={refetch}
        />
    );
}