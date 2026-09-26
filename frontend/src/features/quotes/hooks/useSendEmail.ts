// features/quotes/hooks/useSendEmail.ts
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface SendEmailData {
    custom_message?: string;
    override_email?: string;
}

interface SendEmailResponse {
    message: string;
    to_email: string;
    resend_id?: string;
}

export function useSendEmail() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({ documentId, data }: { documentId: string; data: SendEmailData }) => {
            const response = await api.post<SendEmailResponse>(
                `/api/v1/documents/${documentId}/send-email`,
                data
            );
            return response;
        },
        onSuccess: (data) => {
            // Invalider le cache du document pour mettre à jour le statut
            queryClient.invalidateQueries({ queryKey: ['document'] });
            queryClient.invalidateQueries({ queryKey: ['documents'] });

            toast({
                title: 'Email envoyé !',
                description: `Le document a été envoyé à ${data.to_email}`,
            });
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.detail || "Impossible d'envoyer l'email.";

            toast({
                title: "Erreur d'envoi",
                description: errorMessage,
                variant: 'destructive',
            });
        },
    });
}