'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/authApi';

import type { LoginRequest, RegisterRequest } from '../types';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';

export function useCurrentUser() {
    const token = useAuthStore((s) => s.token);

    return useQuery({
        queryKey: ['currentUser'],
        queryFn: () => authApi.getMe(),
        enabled: !!token, // Ne fetch que si un token existe
    });
}

export function useLogin() {
    const setToken = useAuthStore((s) => s.setToken);
    const setUser = useAuthStore((s) => s.setUser);
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: (data: LoginRequest) => authApi.login(data),
        onSuccess: async (response) => {
            setToken(response.access_token);

            // 2. Fetch les infos utilisateur
            try {
                const user = await authApi.getMe();
                setUser(user);
                queryClient.setQueryData(['currentUser'], user);
            } catch {
                // Si getMe échoue, on redirige quand même
            }

            // 3. Rediriger vers le dashboard
            router.push('/dashboard');
        },
    });
}

export function useVerifyIfEmailExist() {
    return useMutation({
        mutationFn: (email: string) => authApi.verifyIfEmailExist(email),
    });
}

export function useRegister() {
    const setToken = useAuthStore((s) => s.setToken);
    const setUser = useAuthStore((s) => s.setUser);
    const queryClient = useQueryClient();
    const router = useRouter();

    return useMutation({
        mutationFn: async (data: RegisterRequest) => {
            // 1. Créer le compte
            await authApi.register(data);

            // 2. Auto-login après inscription
            const loginRes = await authApi.login({
                username: data.email,
                password: data.password,
            });
            return loginRes;
        },
        onSuccess: async (response) => {
            setToken(response.access_token);
            try {
                const user = await authApi.getMe();
                setUser(user);
                queryClient.setQueryData(['currentUser'], user);
            } catch {
                // Si getMe échoue, on redirige quand même
            }
            router.push('/dashboard');
        },
    });
}