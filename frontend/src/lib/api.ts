const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiError extends Error {
    status: number;
    detail: string;

    constructor(status: number, detail: string) {
        super(detail);
        this.status = status;
        this.detail = detail;
        this.name = 'ApiError';
    }
}

async function apiFetch<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${API_URL}${endpoint}`;

    // 1. Construire les headers
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    // Fusionner avec les headers passés en options
    if (options.headers) {
        if (options.headers instanceof Headers) {
            options.headers.forEach((value, key) => {
                headers[key] = value;
            });
        } else if (Array.isArray(options.headers)) {
            options.headers.forEach(([key, value]) => {
                headers[key] = value;
            });
        } else {
            Object.assign(headers, options.headers as Record<string, string>);
        }
    }

    // 2. Injecter le token JWT automatiquement
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('sharaco_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }

    // 3. Faire la requête
    const res = await fetch(url, {
        ...options,
        headers,
    });

    // 4. Intercepter les erreurs 401
    if (res.status === 401) {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('sharaco_token');
            document.cookie =
                'sharaco_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            const currentPath = window.location.pathname;
            if (currentPath !== '/login' && currentPath !== '/register') {
                window.location.href = '/login';
            }
        }
        throw new ApiError(401, 'Non autorisé');
    }

    // 5. Gérer les autres erreurs
    if (!res.ok) {
        let detail = `Erreur ${res.status}`;
        try {
            const errorData = await res.json();
            detail = errorData.detail || errorData.message || detail;
        } catch {
            // Impossible de parser l'erreur, on garde le message par défaut
        }
        throw new ApiError(res.status, detail);
    }

    // 6. 204 No Content
    if (res.status === 204) {
        return null as T;
    }

    // 7. Retourner les données JSON
    return res.json();
}



export const api = {
    get: <T>(endpoint: string) => apiFetch<T>(endpoint),

    post: <T>(endpoint: string, data?: unknown) =>
        apiFetch<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        }),

    put: <T>(endpoint: string, data?: unknown) =>
        apiFetch<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        }),

    patch: <T>(endpoint: string, data?: unknown) =>
        apiFetch<T>(endpoint, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        }),

    delete: <T>(endpoint: string) =>
        apiFetch<T>(endpoint, { method: 'DELETE' }),

    postForm: <T>(endpoint: string, formData: URLSearchParams) =>
        apiFetch<T>(endpoint, {
            method: 'POST',
            body: formData.toString(),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }),
};

export { ApiError };