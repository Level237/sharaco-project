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
            let errorMessage = error.detail || error.response?.data?.detail || error.message || "Impossible d'envoyer l'email.";

            const lower = String(errorMessage).toLowerCase();
            if (
                lower.includes("nameresolutionerror") ||
                lower.includes("failed to resolve") ||
                lower.includes("temporary failure in name resolution") ||
                lower.includes("httpsconnectionpool") ||
                lower.includes("max retries exceeded") ||
                lower.includes("connectionerror") ||
                lower.includes("gaierror") ||
                lower.includes("failed to fetch") ||
                lower.includes("networkerror")
            ) {
                errorMessage = "Problème de connexion : impossible de joindre le serveur d'envoi. Veuillez vérifier votre connexion internet.";
            }

            toast({
                title: "Erreur d'envoi",
                description: errorMessage,
                variant: 'destructive',
            });
        },
    });
}