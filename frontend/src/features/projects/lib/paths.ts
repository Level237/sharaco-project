export function projectHref(clientId: string | null | undefined, projectId: string) {
    if (!clientId) return `/dashboard/projects/${projectId}`
    return `/dashboard/clients/${clientId}/projects/${projectId}`
}
