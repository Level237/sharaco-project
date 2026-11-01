import { SpecificationEditor } from "@/features/specifications/components/SpecificationEditor"

export default async function EditSpecificationPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return <SpecificationEditor specId={id} />
}
