// features/projects/hooks/useProjectDocuments.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import { projectsApi } from '../api/projectsApi';

export function useProjectDocuments(
    projectId: string | null,
    params?: {
        type?: 'DEVIS' | 'FACTURE';
        status?: string;
    }
) {
    return useQuery({
        queryKey: ['project-documents', projectId, params],
        queryFn: () => projectsApi.getDocuments(projectId!, params),
        enabled: !!projectId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

