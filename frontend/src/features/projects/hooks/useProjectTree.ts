
import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "../api/projectsApi";

export function useProjectTree(projectId: string | null) {
    return useQuery({
        queryKey: ["project-tree", projectId],
        queryFn: () => projectsApi.getProjectTree(projectId!),
        enabled: !!projectId,
        staleTime: 30_000, // 30 secondes
    });
}