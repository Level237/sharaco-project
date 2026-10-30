import { ProjectDetailView } from "@/features/projects/components/ProjectDetailView"

export default async function NestedProjectPage({
    params,
}: {
    params: Promise<{ id: string; projectId: string }>
}) {
    const { id, projectId } = await params
    return <ProjectDetailView clientId={id} projectId={projectId} />
}
