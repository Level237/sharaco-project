import { ContractEditor } from "@/features/contracts"

export default async function EditContractPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    return <ContractEditor documentId={id} />
}
