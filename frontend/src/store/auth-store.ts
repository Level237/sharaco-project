import { create } from 'zustand';
import type { User } from '@/features/auth/types';
import { deleteCookie, readAuthToken, removeStorage, writeCookie, writeStorage } from '@/lib/storage';

interface AuthState {
    token: string | null;
    user: User | null;
    isAuthenticated: boolean;
    setToken: (token: string) => void;
    setUser: (user: User) => void;
    currency: string;
    setCurrency: (currency: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    token: readAuthToken(),
    user: null,
    isAuthenticated: !!readAuthToken(),
    currency: "XOF",
    setCurrency: (currency) => set({ currency }),
    setToken: (token: string) => {
        writeStorage('sharaco_token', token);
        writeCookie('sharaco_token', token);
        set({ token, isAuthenticated: true });
    },

    setUser: (user: User) => {
        set({ user });
    },

    logout: () => {
        removeStorage('sharaco_token');
        deleteCookie('sharaco_token');
        set({ token: null, user: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    },
}));