"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, FolderPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useClient } from "../hooks/useClients";
import { ProjectFolder } from "@/features/projects/components/ProjectFolder";
import { CreateProjectModal } from "@/features/projects/components/CreateProjectModal";
import { useDeleteProject, useProjects } from "@/features/projects/hooks/useProject";

export function ClientWorkspace({ clientId }: { clientId: string }) {
    const { data: client, isLoading: isLoadingClient, isError } = useClient(clientId);
    const { data: projects = [], isLoading: isLoadingProjects } = useProjects({ client_id: clientId });
    const deleteProject = useDeleteProject();
    const [isCreateOpen, setIsCreateOpen] = useState(false);

    if (isLoadingClient) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
            </div>
        );
    }

    if (isError || !client) {
        return (
            <div className="py-20 text-center">
                <h2 className="mb-4 text-xl font-bold text-white">Client introuvable</h2>
                <Link href="/dashboard/clients" className="text-sm font-semibold text-[#2563EB]">
                    Retour aux clients
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full min-w-0 flex-1 space-y-8 p-4 pt-6 md:p-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                    <Link
                        href="/dashboard/clients"
                        className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Clients
                    </Link>
                    <h1 className="truncate text-3xl font-black tracking-tight text-white max-sm:text-2xl">
                        {client.name}
                    </h1>
                </div>
                <Button
                    onClick={() => setIsCreateOpen(true)}
                    className="h-12 shrink-0 bg-[#2563EB] px-6 font-bold text-white hover:bg-[#2563EB]/80"
                >
                    <FolderPlus className="mr-2 h-5 w-5" />
                    Nouveau projet
                </Button>
            </div>

            <section>
                <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">
                    Projets
                </h2>
                {isLoadingProjects ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
                    </div>
                ) : projects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
                        <FolderPlus className="mb-4 h-8 w-8 text-slate-500" />
                        <h3 className="text-lg font-bold text-white">Aucun projet</h3>
                        <p className="mt-2 max-w-sm text-sm text-slate-400">
                            Créez un projet pour ce client, puis ajoutez-y ses devis et ses factures.
                        </p>
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            className="mt-6 bg-[#2563EB] text-white hover:bg-[#2563EB]/80"
                        >
                            <FolderPlus className="mr-2 h-4 w-4" />
                            Créer un projet
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {projects.map((project) => (
                            <ProjectFolder
                                key={project.id}
                                project={project}
                                showClient={false}
                                onDelete={(id) => deleteProject.mutate(id)}
                            />
                        ))}
                    </div>
                )}
            </section>

            <CreateProjectModal
                open={isCreateOpen}
                onOpenChange={setIsCreateOpen}
                lockedClientId={client.id}
                lockedClientName={client.name}
            />
        </div>
    );
}
