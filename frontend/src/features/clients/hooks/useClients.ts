import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientsApi } from '../api/clientsApi';
import type { ClientCreate, ClientUpdate } from '../types';
import { ApiError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

export function useClients(skip = 0, limit = 50) {
    return useQuery({
        queryKey: ['clients', skip, limit],
        queryFn: () => clientsApi.getAll(skip, limit),
    });
}

export function useClient(id: string) {
    return useQuery({
        queryKey: ['clients', id],
        queryFn: () => clientsApi.getById(id),
        enabled: !!id,
    });
}

export function useCreateClient() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ClientCreate) => clientsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
        },
    });
}

export function useUpdateClient() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: ClientUpdate }) =>
            clientsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            toast({
                title: "Client mis à jour",
                description: "Les informations ont été enregistrées.",
            });
        },
        onError: (error: unknown) => {
            const detail = error instanceof ApiError ? error.detail : "Impossible de mettre à jour le client.";
            toast({
                title: "Erreur",
                description: detail,
                variant: "destructive",
            });
        },
    });
}

export function useDeleteClient() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (id: string) => clientsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            toast({
                title: "Client supprimé",
                description: "Le client a été retiré de la liste.",
            });
        },
        onError: (error: unknown) => {
            const detail = error instanceof ApiError ? error.detail : "Impossible de supprimer le client.";
            toast({
                title: "Erreur",
                description: detail,
                variant: "destructive",
            });
        },
    });
}