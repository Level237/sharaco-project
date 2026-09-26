
import { api } from '@/lib/api';
import type { LoginRequest, AuthResponse, RegisterRequest, User } from '../types';

export const authApi = {
    login: async (data: LoginRequest): Promise<AuthResponse> => {
        const formData = new URLSearchParams();
        formData.append('username', data.username);
        formData.append('password', data.password);
        return api.postForm<AuthResponse>('/api/v1/auth/login', formData);
    },

    verifyIfEmailExist: async (email: string): Promise<boolean> => {

        return api.post<boolean>(`/api/v1/auth/verify-email?email=${email}`);
    },

    register: async (data: RegisterRequest): Promise<User> => {
        return api.post<User>('/api/v1/auth/register', data);
    },

    getMe: async (): Promise<User> => {
        return api.get<User>('/api/v1/auth/me');
    },
};