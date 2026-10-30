"use client"

import { useParams, usePathname } from "next/navigation"
import { ProjectDetailView, projectIdFromPath } from "@/features/projects/components/ProjectDetailView"

function firstParam(value: unknown): string {
    if (Array.isArray(value)) return String(value[0] || "")
    if (typeof value === "string") return value
    return ""
}

export default function NestedProjectPage() {
    const params = useParams()
    const pathname = usePathname() || ""
    const clientId = firstParam(params?.id)
    const projectId = firstParam(params?.projectId) || projectIdFromPath(pathname)

    return <ProjectDetailView clientId={clientId} projectId={projectId} />
}
