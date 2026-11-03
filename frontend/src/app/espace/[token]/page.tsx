"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { AlertCircle, Loader2 } from "lucide-react"
import { fetchSharedWorkspace, type SharedWorkspace } from "@/features/projects/api/projectsApi"
import { SharedWorkspaceView } from "@/features/projects/components/SharedWorkspaceView"

export default function SharedProjectPage() {
    const params = useParams()
    const token = String(params?.token || "")
    const [data, setData] = useState<SharedWorkspace | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!token) return
        let cancelled = false
        setLoading(true)
        fetchSharedWorkspace(token)
            .then((workspace) => {
                if (!cancelled) setData(workspace)
            })
            .catch(() => {
                if (!cancelled) setError("Cet espace n’est pas disponible.")
            })
            .finally(() => {
                if (!cancelled) setLoading(false)
            })
        return () => {
            cancelled = true
        }
    }, [token])

    if (loading) {
        return (
            <div className="flex min-h-dvh items-center justify-center bg-[#0a0a0a]">
                <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="flex min-h-dvh flex-col items-center justify-center bg-[#0a0a0a] px-6 text-center">
                <AlertCircle className="mb-3 h-8 w-8 text-slate-500" />
                <h1 className="text-lg font-semibold text-white">Lien invalide ou désactivé</h1>
                <p className="mt-2 max-w-sm text-sm text-slate-400">
                    {error || "Demandez un nouveau lien à votre prestataire."}
                </p>
            </div>
        )
    }

    return <SharedWorkspaceView data={data} />
}
