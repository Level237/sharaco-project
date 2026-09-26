'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { templatesApi } from '../api/templatesApi';
import type { TemplateCreate, TemplateUpdate } from '../types';
import { useToast } from '@/hooks/use-toast';

export function useTemplates() {
    return useQuery({
        queryKey: ['templates'],
        queryFn: () => templatesApi.getAll(),
    });
}

export function useTemplate(id: string) {
    return useQuery({
        queryKey: ['templates', id],
        queryFn: () => templatesApi.getById(id),
        enabled: !!id,
    });
}
export function useLayouts() {
    return useQuery({
        queryKey: ['template-layouts'],
        queryFn: () => templatesApi.getLayouts(),
    });
}
export function useDefaultTemplate() {
    return useQuery({
        queryKey: ['templates', 'default'],
        queryFn: () => templatesApi.getDefault(),
    });
}

export function useTemplatePreview(id: string) {
    return useQuery({
        queryKey: ['templates', id, 'preview'],
        queryFn: () => templatesApi.getPreview(id),
        enabled: !!id,
    });
}

export function useCreateTemplate() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (data: TemplateCreate) => templatesApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            toast({
                title: 'Modèle créé',
                description: 'Le modèle de document a été créé avec succès.',
            });
        },
        onError: () => {
            toast({
                title: 'Erreur',
                description: 'Impossible de créer le modèle. Veuillez réessayer.',
                variant: 'destructive',
            });
        },
    });
}

export function useUpdateTemplate() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: TemplateUpdate }) =>
            templatesApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            toast({
                title: 'Modèle modifié',
                description: 'Le modèle de document a été modifié avec succès.',
            });
        },
        onError: () => {
            toast({
                title: 'Erreur',
                description: 'Impossible de modifier le modèle. Veuillez réessayer.',
                variant: 'destructive',
            });
        },
    });
}

export function useDeleteTemplate() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (id: string) => templatesApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['templates'] });
            toast({
                title: 'Modèle supprimé',
                description: 'Le modèle de document a été supprimé avec succès.',
            });
        },
        onError: () => {
            toast({
                title: 'Erreur',
                description: 'Impossible de supprimer le modèle. Veuillez réessayer.',
                variant: 'destructive',
            });
        },
    });
}
