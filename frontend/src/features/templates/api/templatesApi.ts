import { api } from '@/lib/api';
import type { DocumentPreviewRequest, DocumentTemplate, Layout, TemplateCreate, TemplateUpdate } from '../types';

export const templatesApi = {
    getAll: async (): Promise<DocumentTemplate[]> => {
        return api.get<DocumentTemplate[]>('/api/v1/templates');
    },



    getById: async (id: string): Promise<DocumentTemplate> => {
        return api.get<DocumentTemplate>(`/api/v1/templates/${id}`);
    },

    getDefault: async (): Promise<DocumentTemplate> => {
        return api.get<DocumentTemplate>('/api/v1/templates/default');
    },

    getPreview: async (id: string): Promise<string> => {
        return api.get<string>(`/api/v1/templates/${id}/preview`);
    },

    previewDocument: async (data: DocumentPreviewRequest): Promise<string> => {
        const token = localStorage.getItem('sharaco_token');
        const res = await fetch(
            `http://localhost:8000/api/v1/documents/preview`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(data),
            }
        );
        if (!res.ok) throw new Error('Erreur aperçu document');
        return res.text(); // ← HTML, pas JSON
    },

    previewDocumentByClientToken: async (clientToken: string): Promise<string> => {
        const res = await fetch(
            `http://localhost:8000/api/v1/documents/client/${clientToken}/preview`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'text/html',
                },
            }
        );
        if (!res.ok) {
            if (res.status === 404) throw new Error('Document introuvable');
            if (res.status === 410) throw new Error('Lien expiré');
            throw new Error(`Erreur aperçu (${res.status})`);
        }
        return res.text();
    },

    previewDocumentByShareToken: async (shareToken: string): Promise<string> => {
        const res = await fetch(
            `http://localhost:8000/api/v1/documents/shared/${shareToken}/preview`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'text/html',
                },
            }
        );
        if (!res.ok) {
            if (res.status === 404) throw new Error('Document introuvable');
            if (res.status === 410) throw new Error('Lien expiré');
            throw new Error(`Erreur aperçu (${res.status})`);
        }
        return res.text();
    },


getLayoutPreview: async (layoutId: string): Promise<string> => {
    const token = localStorage.getItem('sharaco_token');
    const res = await fetch(
        `http://localhost:8000/api/v1/templates/layouts/${layoutId}/preview`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );
    if (!res.ok) throw new Error('Erreur aperçu layout');
    return res.text(); // ← .text() pas .json() car c'est du HTML
},
    getLayouts: async (): Promise<Layout[]> => {
        return api.get<Layout[]>('/api/v1/templates/layouts');
    },
    create: async (data: TemplateCreate): Promise<DocumentTemplate> => {
        return api.post<DocumentTemplate>('/api/v1/templates', data);
    },

    update: async (id: string, data: TemplateUpdate): Promise<DocumentTemplate> => {
        return api.put<DocumentTemplate>(`/api/v1/templates/${id}`, data);
    },

    delete: async (id: string): Promise<void> => {
        return api.delete<void>(`/api/v1/templates/${id}`);
    },
};