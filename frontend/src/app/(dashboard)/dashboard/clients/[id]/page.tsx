"use client"

import { useParams } from "next/navigation"
import { ClientWorkspace } from "@/features/clients/components/ClientWorkspace"

function firstParam(value: unknown): string {
    if (Array.isArray(value)) return String(value[0] || "")
    if (typeof value === "string") return value
    return ""
}

export default function ClientPage() {
    const params = useParams()
    const clientId = firstParam(params?.id)
    return <ClientWorkspace clientId={clientId} />
}
