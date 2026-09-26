'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { remindersApi } from '../api/remindersApi';
import type { ReminderConfigUpdate } from '../types';
import { useToast } from '@/hooks/use-toast';

export function useReminderConfig() {
    return useQuery({
        queryKey: ['reminders', 'config'],
        queryFn: () => remindersApi.getConfig(),
    });
}

export function useUpdateReminderConfig() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (data: ReminderConfigUpdate) => remindersApi.updateConfig(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reminders', 'config'] });
            toast({
                title: 'Configuration sauvegardée',
                description: 'Les paramètres de relance ont été mis à jour.',
            });
        },
        onError: () => {
            toast({
                title: 'Erreur',
                description: 'Impossible de sauvegarder la configuration. Veuillez réessayer.',
                variant: 'destructive',
            });
        },
    });
}

export function useSendDocument() {
    const { toast } = useToast();

    return useMutation({
        mutationFn: (documentId: string) => remindersApi.sendDocument(documentId),
        onSuccess: () => {
            toast({
                title: 'Document envoyé',
                description: 'Le document a été envoyé par email avec succès.',
            });
        },
        onError: () => {
            toast({
                title: 'Erreur',
                description: 'Impossible d\'envoyer le document. Veuillez réessayer.',
                variant: 'destructive',
            });
        },
    });
}

export function useSendReminder() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ documentId, level }: { documentId: string; level: number }) =>
            remindersApi.sendReminder(documentId, level),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['reminders', 'history'] });
            toast({
                title: 'Relance envoyée',
                description: 'La relance a été envoyée avec succès.',
            });
        },
        onError: () => {
            toast({
                title: 'Erreur',
                description: 'Impossible d\'envoyer la relance. Veuillez réessayer.',
                variant: 'destructive',
            });
        },
    });
}

export function useReminderHistory(documentId?: string) {
    return useQuery({
        queryKey: ['reminders', 'history', documentId],
        queryFn: () => remindersApi.getHistory(documentId),
    });
}