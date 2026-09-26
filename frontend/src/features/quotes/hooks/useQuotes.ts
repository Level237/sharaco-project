'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotesApi } from '../api/quotesApi';
import { DocumentType, Document, DocumentCreate, DocumentStatus } from '../types';
import { useToast } from '@/hooks/use-toast';

/* ═══════════════════════════════════════════════════════════
   QUERIES (lecture)
═══════════════════════════════════════════════════════════ */

export function useQuotes(params?: {
    type?: DocumentType;
    project_id?: string;
}) {
    return useQuery({
        queryKey: ['documents', params],
        queryFn: () => quotesApi.getAll(params),
        staleTime: 5 * 60 * 1000,
    });
}

export function useQuote(id: string) {
    return useQuery({
        queryKey: ['document', id],
        queryFn: () => quotesApi.getById(id),
        enabled: !!id,
    });
}

/* ═══════════════════════════════════════════════════════════
   MUTATIONS (écriture)
═══════════════════════════════════════════════════════════ */

export function useCreateQuote() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (data: DocumentCreate) => quotesApi.create(data),
        onSuccess: () => {
            // ✅ Invalider la liste des documents
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
        onError: (error: any) => {
            toast({
                title: "Erreur",
                description: error.message || "Impossible de créer le devis.",
                variant: "destructive",
            });
        },
    });
}

export function useUpdateQuote() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: unknown }) => 
            quotesApi.update(id, data),
        onSuccess: (updatedDoc, variables) => {
            // ✅ Invalider la liste ET le document spécifique
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            queryClient.invalidateQueries({ queryKey: ['document', variables.id] });
        },
        onError: (error: any) => {
            toast({
                title: "Erreur",
                description: error.message || "Impossible de mettre à jour le devis.",
                variant: "destructive",
            });
        },
    });
}

export function useDeleteQuote() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (id: string) => quotesApi.delete(id),
        onSuccess: (_, deletedId) => {
            // ✅ Invalider la liste ET le document spécifique
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            queryClient.invalidateQueries({ queryKey: ['document', deletedId] });
            
            toast({
                title: "✅ Devis supprimé",
                description: "Le devis a été supprimé avec succès.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Erreur",
                description: error.message || "Impossible de supprimer le devis.",
                variant: "destructive",
            });
        },
    });
}

export function useUpdateQuoteStatus() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: DocumentStatus }) =>
            quotesApi.updateStatus(id, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            queryClient.invalidateQueries({ queryKey: ['document', variables.id] });
        },
    });
}

export function useConvertToInvoice() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (id: string) => quotesApi.convertToInvoice(id),
        onSuccess: () => {
            // ✅ Invalider devis ET factures (nouvelle facture créée)
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            
            toast({
                title: "✅ Facture créée",
                description: "La facture a été générée avec succès.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Erreur",
                description: error.message || "Impossible de créer la facture.",
                variant: "destructive",
            });
        },
    });
}

export function useLinkToProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ documentId, projectId }: { documentId: string; projectId: string | null }) =>
            quotesApi.linkToProject(documentId, projectId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
    });
}

export function useUnlinkFromProject() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (documentId: string) => quotesApi.unlinkFromProject(documentId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
    });
}

export function useGenerateNextInvoice() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (quoteId: string) => quotesApi.generateNextInvoice(quoteId),
        onSuccess: () => {
            // ✅ Invalider devis + factures (nouvelle facture créée)
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
        onError: (error: any) => {
            toast({
                title: "Erreur",
                description: error.message || "Impossible de générer la facture.",
                variant: "destructive",
            });
        },
    });
}