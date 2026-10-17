"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useProject } from "@/features/projects/hooks/useProject";
import { projectHref } from "@/features/projects/lib/paths";

export default function LegacyProjectPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;
    const { data: project, isLoading } = useProject(projectId);

    useEffect(() => {
        if (project?.client_id) {
            router.replace(projectHref(project.client_id, project.id));
        }
    }, [project, router]);

    if (isLoading || (project && project.client_id)) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
            </div>
        );
    }

    return (
        <div className="py-20 text-center">
            <h2 className="mb-4 text-xl font-bold text-white">Projet introuvable</h2>
            <Link href="/dashboard/clients" className="text-sm font-semibold text-[#2563EB]">
                Retour aux clients
            </Link>
        </div>
    );
}
