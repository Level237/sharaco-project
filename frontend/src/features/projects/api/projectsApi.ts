// features/projects/api/projectsApi.ts
import { api, API_URL } from '@/lib/api';
import type { Project, ProjectCreate, ProjectUpdate, ProjectAttachmentCreate, ProjectAttachment, ProjectTreeResponse } from '../types';

export const projectsApi = {
    /**
     * Liste tous les projets de l'utilisateur
     */

     getProjectTree: async (projectId: string): Promise<ProjectTreeResponse> => {
        return api.get(`/api/v1/projects/${projectId}/tree`);
    },
    getAll: async (params?: {
        status?: string;
        client_id?: string;
        search?: string;
        skip?: number;
        limit?: number;
    }): Promise<Project[]> => {
        const query = new URLSearchParams();
        if (params?.status) query.set('status', params.status);
        if (params?.client_id) query.set('client_id', params.client_id);
        if (params?.search) query.set('search', params.search);
        if (params?.skip !== undefined) query.set('skip', params.skip.toString());
        if (params?.limit !== undefined) query.set('limit', params.limit.toString());

        const queryString = query.toString();
        return api.get<Project[]>(`/api/v1/projects/${queryString ? `?${queryString}` : ''}`);
    },

        
    getDocuments: async (
        projectId: string,
        params?: {
            type?: 'DEVIS' | 'FACTURE';
            status?: string;
        }
    ): Promise<any[]> => {
        const query = new URLSearchParams();
        if (params?.type) query.set('type', params.type);
        if (params?.status) query.set('status', params.status);

        const queryString = query.toString();
        return api.get<any[]>(
            `/api/v1/projects/${projectId}/documents${queryString ? `?${queryString}` : ''}`
        );
    },

    /**
     * Récupère un projet par son ID
     */
    getById: async (id: string): Promise<Project> => {
        return api.get<Project>(`/api/v1/projects/${id}`);
    },

    

    /**
     * Crée un nouveau projet
     */
    create: async (data: ProjectCreate): Promise<Project> => {
        return api.post<Project>('/api/v1/projects/', data);
    },

    /**
     * Met à jour un projet
     */
    update: async (id: string, data: ProjectUpdate): Promise<Project> => {
        return api.put<Project>(`/api/v1/projects/${id}`, data);
    },

    /**
     * Supprime un projet
     */
    delete: async (id: string): Promise<void> => {
        return api.delete<void>(`/api/v1/projects/${id}`);
    },

    /**
     * Ajoute un attachment à un projet
     */
    addAttachment: async (projectId: string, data: ProjectAttachmentCreate): Promise<ProjectAttachment> => {
        return api.post<ProjectAttachment>(`/api/v1/projects/${projectId}/attachments`, data);
    },

    /**
     * Supprime un attachment
     */
    deleteAttachment: async (attachmentId: string): Promise<void> => {
        return api.delete<void>(`/api/v1/projects/attachments/${attachmentId}`);
    },

    getShare: async (projectId: string): Promise<ProjectShare> => {
        return api.get<ProjectShare>(`/api/v1/projects/${projectId}/share`);
    },

    updateShare: async (projectId: string, enabled: boolean): Promise<ProjectShare> => {
        return api.put<ProjectShare>(`/api/v1/projects/${projectId}/share`, { enabled });
    },
};

export type ProjectShare = {
    enabled: boolean;
    share_token?: string | null;
    share_path?: string | null;
};

export type SharedWorkspaceItem = {
    id: string;
    kind: "DEVIS" | "FACTURE" | "CONTRAT" | "CDC" | string;
    title: string;
    status: string;
    href?: string | null;
    pdf_url?: string | null;
    preview_url?: string | null;
};

export type SharedWorkspace = {
    project_name: string;
    client_name?: string | null;
    company_name?: string | null;
    items: SharedWorkspaceItem[];
};

export async function fetchSharedWorkspace(token: string): Promise<SharedWorkspace> {
    const res = await fetch(`${API_URL}/api/v1/projects/shared/${token}`);
    if (!res.ok) {
        throw new Error("Espace projet introuvable");
    }
    return res.json();
}