"use client"

import { useParams, usePathname } from "next/navigation"
import { ProjectDetailView, projectIdFromPath } from "@/features/projects/components/ProjectDetailView"

function firstParam(value: unknown): string {
    if (Array.isArray(value)) return String(value[0] || "")
    if (typeof value === "string") return value
    return ""
}

export default function ProjectByIdPage() {
    const params = useParams()
    const pathname = usePathname() || ""
    const projectId = firstParam(params?.id) || projectIdFromPath(pathname)

    return <ProjectDetailView projectId={projectId} />
}
