// features/quotes/hooks/useUnlinkFromProject.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { quotesApi } from '../api/quotesApi';
import { useToast } from '@/hooks/use-toast';

export function useUnlinkFromProject() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (documentId: string) => quotesApi.unlinkFromProject(documentId),
        onSuccess: () => {
            // Invalider les caches concernés
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['project-documents'] });
            toast({
                title: 'Document dissocié',
                description: 'Le document a été retiré du projet.',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Erreur',
                description: error.response?.data?.detail || 'Impossible de dissocier le document.',
                variant: 'destructive',
            });
        },
    });
}