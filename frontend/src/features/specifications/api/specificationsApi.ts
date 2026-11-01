import { API_URL } from "@/lib/api"
import { readAuthToken } from "@/lib/storage"
import type { Specification, SpecificationCreate, SpecSection } from "../types"

async function jsonFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = readAuthToken()
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
    const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers })
    if (res.status === 204) return null as T
    if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        const detail = err.detail
        const message = typeof detail === "string"
            ? detail
            : Array.isArray(detail)
                ? detail.map((item: { msg?: string }) => item.msg).filter(Boolean).join(" ")
                : `Erreur ${res.status}`
        throw new Error(message || `Erreur ${res.status}`)
    }
    return res.json()
}

export const specificationsApi = {
    create: (data: SpecificationCreate) =>
        jsonFetch<Specification>("/api/v1/specifications/", {
            method: "POST",
            body: JSON.stringify(data),
        }),

    getById: (id: string) => jsonFetch<Specification>(`/api/v1/specifications/${id}`),

    update: (
        id: string,
        data: {
            title?: string
            cover_style?: string
            primary_color?: string
            sections?: SpecSection[]
        }
    ) =>
        jsonFetch<Specification>(`/api/v1/specifications/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        }),

    delete: (id: string) =>
        jsonFetch<void>(`/api/v1/specifications/${id}`, { method: "DELETE" }),

    previewHtml: async (data: {
        project_id: string
        title: string
        kind: string
        cover_style: string
        primary_color: string
        version?: number
        number?: string | null
        sections: SpecSection[]
    }): Promise<string> => {
        const token = readAuthToken()
        const res = await fetch(`${API_URL}/api/v1/specifications/preview`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(data),
        })
        if (!res.ok) throw new Error("Erreur aperçu")
        return res.text()
    },

    getPreviewPngBlob: async (id: string): Promise<string> => {
        const token = readAuthToken()
        const res = await fetch(`${API_URL}/api/v1/specifications/${id}/preview.png?_t=${Date.now()}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!res.ok) throw new Error(`Erreur preview PNG (${res.status})`)
        const blob = await res.blob()
        return URL.createObjectURL(blob)
    },

    sendEmail: (
        id: string,
        data: { custom_message?: string; override_email?: string }
    ) =>
        jsonFetch<{ message: string; to_email: string }>(
            `/api/v1/specifications/${id}/send-email`,
            { method: "POST", body: JSON.stringify(data) }
        ),

    downloadPdf: async (id: string, filename?: string): Promise<void> => {
        const token = readAuthToken()
        const res = await fetch(`${API_URL}/api/v1/specifications/${id}/pdf`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (!res.ok) throw new Error(`Erreur PDF (${res.status})`)
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = filename || "cdc.pdf"
        document.body.appendChild(link)
        link.click()
        link.remove()
        window.URL.revokeObjectURL(url)
    },
}
