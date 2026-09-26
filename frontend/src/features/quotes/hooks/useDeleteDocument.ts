// hooks/useDeleteDocument.ts
'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { quotesApi } from '@/features/quotes/api/quotesApi';

interface UseDeleteDocumentProps {
    onSuccess?: () => void;
}

export function useDeleteDocument({ onSuccess }: UseDeleteDocumentProps) {
    const { toast } = useToast();
    const [isDeleting, setIsDeleting] = useState(false);

    const deleteDocument = async (documentId: string, documentNumber?: string) => {
        // Confirmation
        const confirmed = window.confirm(
            `Êtes-vous sûr de vouloir supprimer le devis ${documentNumber || ''} ?\n\nCette action est irréversible.`
        );

        if (!confirmed) return;

        setIsDeleting(true);

        try {
            await quotesApi.delete(documentId);
            
            toast({
                title: 'Devis supprimé',
                description: `Le devis ${documentNumber || ''} a été supprimé avec succès.`,
                duration: 3000,
            });

            onSuccess?.();
        } catch (error: any) {
            console.error('❌ Erreur suppression:', error);
            
            const errorMessage = error.response?.data?.detail || "Impossible de supprimer le document.";
            
            toast({
                title: 'Erreur',
                description: errorMessage,
                variant: 'destructive',
                duration: 4000,
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return {
        deleteDocument,
        isDeleting,
    };
}