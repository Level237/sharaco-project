// features/projects/hooks/useProjects.ts
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '../api/projectsApi';
import type { ProjectCreate, ProjectUpdate } from '../types';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook pour récupérer la liste des projets
 */

export function useProjectTree(projectId: string | null) {
    return useQuery({
        queryKey: ["project-tree", projectId],
        queryFn: () => projectsApi.getProjectTree(projectId!),
        enabled: !!projectId,
        staleTime: 30_000, // 30 secondes
    });
}
export function useProjects(params?: {
    status?: string;
    client_id?: string;
    search?: string;
}) {
    return useQuery({
        queryKey: ['projects', params],
        queryFn: () => projectsApi.getAll(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/**
 * Hook pour récupérer un projet spécifique
 */
export function useProject(id: string | null) {
    return useQuery({
        queryKey: ['project', id],
        queryFn: () => projectsApi.getById(id!),
        enabled: !!id,
        staleTime: 2 * 60 * 1000,
    });
}

/**
 * Hook pour créer un projet
 */
export function useCreateProject() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (data: ProjectCreate) => projectsApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast({
                title: 'Projet créé',
                description: 'Le projet a été créé avec succès.',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Erreur',
                description: error.response?.data?.detail || 'Impossible de créer le projet.',
                variant: 'destructive',
            });
        },
    });
}

/**
 * Hook pour mettre à jour un projet
 */
export function useUpdateProject() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: ProjectUpdate }) =>
            projectsApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast({
                title: 'Projet mis à jour',
                description: 'Les modifications ont été enregistrées.',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Erreur',
                description: error.response?.data?.detail || 'Impossible de mettre à jour le projet.',
                variant: 'destructive',
            });
        },
    });
}

/**
 * Hook pour supprimer un projet
 */
export function useDeleteProject() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (id: string) => projectsApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast({
                title: 'Projet supprimé',
                description: 'Le projet a été supprimé.',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Erreur',
                description: error.response?.data?.detail || 'Impossible de supprimer le projet.',
                variant: 'destructive',
            });
        },
    });
}

/**
 * Hook pour ajouter un attachment
 */
export function useAddAttachment() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ projectId, data }: { projectId: string; data: any }) =>
            projectsApi.addAttachment(projectId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
            toast({
                title: 'Fichier ajouté',
                description: 'Le fichier a été ajouté au projet.',
            });
        },
        onError: (error: any) => {
            toast({
                title: 'Erreur',
                description: error.response?.data?.detail || 'Impossible d\'ajouter le fichier.',
                variant: 'destructive',
            });
        },
    });
}