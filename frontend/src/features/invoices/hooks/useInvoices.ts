'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesApi } from '../api/invoicesApi';
import type { DocumentCreate, DocumentStatus } from '@/features/quotes/types';
import { useToast } from '@/hooks/use-toast';

export function useInvoices() {
    return useQuery({
        queryKey: ['documents', 'FACTURE'],
        queryFn: () => invoicesApi.getAll(),
    });
}

export function useInvoice(id: string) {
    return useQuery({
        queryKey: ['documents', id],
        queryFn: () => invoicesApi.getById(id),
        enabled: !!id,
    });
}

export function useCreateInvoice() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (data: DocumentCreate) => invoicesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            toast({
                title: 'Facture créée',
                description: 'La facture a été créée avec succès.',
            });
        },
        onError: () => {
            toast({
                title: 'Erreur',
                description: 'Impossible de créer la facture. Veuillez réessayer.',
                variant: 'destructive',
            });
        },
    });
}

export function useUpdateInvoice() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            invoicesApi.update(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            queryClient.invalidateQueries({ queryKey: ['documents', variables.id] });
            toast({
                title: 'Facture modifiée',
                description: 'La facture a été modifiée avec succès.',
            });
        },
        onError: () => {
            toast({
                title: 'Erreur',
                description: 'Impossible de modifier la facture. Veuillez réessayer.',
                variant: 'destructive',
            });
        },
    });
}

export function useDeleteInvoice() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (id: string) => invoicesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            toast({
                title: 'Facture supprimée',
                description: 'La facture a été supprimée avec succès.',
            });
        },
        onError: () => {
            toast({
                title: 'Erreur',
                description: 'Impossible de supprimer la facture. Veuillez réessayer.',
                variant: 'destructive',
            });
        },
    });
}

export function useUpdateInvoiceStatus() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: DocumentStatus }) =>
            invoicesApi.updateStatus(id, status),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['documents'] });
            queryClient.invalidateQueries({ queryKey: ['documents', variables.id] });
            toast({
                title: 'Statut mis à jour',
                description: 'Le statut de la facture a été modifié avec succès.',
            });
        },
        onError: () => {
            toast({
                title: 'Erreur',
                description: 'Impossible de modifier le statut. Veuillez réessayer.',
                variant: 'destructive',
            });
        },
    });
}

export function useInvoicePreview(id: string) {
    return useQuery({
        queryKey: ['documents', id, 'preview'],
        queryFn: () => invoicesApi.getPreview(id),
        enabled: !!id,
    });
}
