// features/quotes/hooks/useLinkToProject.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { quotesApi } from '../api/quotesApi';
import { useToast } from '@/hooks/use-toast';

export function useLinkToProject() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ documentId, projectId }: { documentId: string; projectId: string | null }) =>
            quotesApi.linkToProject(documentId, projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['project-documents'] });
            toast({
                title: 'Association mise à jour',
                description: 'Le document a été associé au projet.',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Erreur',
                description: error.response?.data?.detail || 'Impossible d\'associer le document.',
                variant: 'destructive',
            });
        },
    });
}