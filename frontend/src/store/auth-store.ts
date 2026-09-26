import { create } from 'zustand';
import type { User } from '@/features/auth/types';

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

const getInitialToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('sharaco_token');
    }
    return null;
};

const setCookie = (name: string, value: string, days: number = 30) => {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Lax`;
};

const deleteCookie = (name: string) => {
    document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
};

export const useAuthStore = create<AuthState>((set, get) => ({
    token: getInitialToken(),
    user: null,
    isAuthenticated: !!getInitialToken(),
    currency: "XOF",
    setCurrency: (currency) => set({ currency }),
    setToken: (token: string) => {
        localStorage.setItem('sharaco_token', token);
        setCookie('sharaco_token', token);
        set({ token, isAuthenticated: true });
    },

    setUser: (user: User) => {
        set({ user });
    },

    logout: () => {
        localStorage.removeItem('sharaco_token');
        deleteCookie('sharaco_token');
        set({ token: null, user: null, isAuthenticated: false });
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    },
}));