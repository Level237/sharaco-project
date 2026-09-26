
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export interface ProfileUpdateData {
    full_name?: string;
    email?: string;
    company_name?: string;
    address?: string;
    tax_id?: string;
    payment_info?: string;
}

export function useUpdateProfile() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (data: ProfileUpdateData) =>
            api.put("/api/v1/auth/me", data),
        onSuccess: () => {
            // ⚠️ Adapte la key selon ton useCurrentUser
            queryClient.invalidateQueries({ queryKey: ["currentUser"] });
            queryClient.invalidateQueries({ queryKey: ["user"] });
            toast({
                title: "✅ Profil mis à jour",
                description: "Vos informations ont été enregistrées.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Erreur",
                description: error.response?.data?.detail || "Impossible de mettre à jour le profil.",
                variant: "destructive",
            });
        },
    });
}

export function useChangePassword() {
    const { toast } = useToast();

    return useMutation({
        mutationFn: (data: { current_password: string; new_password: string }) =>
            api.put("/api/v1/auth/me/password", data),
        onSuccess: (data: any) => {
            toast({
                title: "🔒 Mot de passe changé",
                description: data.message || "Votre mot de passe a été mis à jour.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Erreur",
                description: error.response?.data?.detail || "Impossible de changer le mot de passe.",
                variant: "destructive",
            });
        },
    });
}