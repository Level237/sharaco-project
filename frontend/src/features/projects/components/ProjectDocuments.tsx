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
                <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
            </div>
        );
    }

    if (!tree || (tree.quotes.length === 0 && tree.standalone_invoices.length === 0)) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center opacity-60 pointer-events-none select-none h-full min-h-[400px]">
                <Folder className="w-24 h-24 mb-4 text-slate-300" strokeWidth={1} />
                <span className="text-lg font-bold tracking-wide text-slate-100">
                    Le projet est vide
                </span>
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