import { api } from '@/lib/api';
import { Client, ClientCreate, ClientUpdate } from '../types';


export const clientsApi = {
    getAll: async (skip = 0, limit = 50): Promise<Client[]> => {
        return api.get<Client[]>(`/api/v1/clients?skip=${skip}&limit=${limit}`);
    },

    getById: async (id: string): Promise<Client> => {
        return api.get<Client>(`/api/v1/clients/${id}`);
    },

    create: async (data: ClientCreate): Promise<Client> => {
        return api.post<Client>('/api/v1/clients', data);
    },

    update: async (id: string, data: ClientUpdate): Promise<Client> => {
        return api.put<Client>(`/api/v1/clients/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return api.delete<void>(`/api/v1/clients/${id}`);
    },
};