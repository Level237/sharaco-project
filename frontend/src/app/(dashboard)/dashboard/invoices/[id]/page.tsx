import { InvoiceDetail } from "@/features/invoices/components/InvoiceDetail";

export default async function InvoicePage({ params }: { params: { id: string } }) {
    const resolvedParams = await params;
    return <InvoiceDetail invoiceId={resolvedParams.id} />
}
