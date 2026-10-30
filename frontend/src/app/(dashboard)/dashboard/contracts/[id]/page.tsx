import { ContractDetailView } from "@/features/contracts/components/ContractDetailView"

export default async function ContractDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    return <ContractDetailView contractId={id} />
}
