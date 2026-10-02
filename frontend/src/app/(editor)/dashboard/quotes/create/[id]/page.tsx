// app/dashboard/quotes/[id]/page.tsx

import { Editor } from "@/features/quotes/components/QuoteBuilder/Editor";


export default async function EditQuotePage({ params }: { params: Promise<{ id: string }> }) {
    // documentId fourni → Mode édition
    const resolvedParams = await params;
    console.log(resolvedParams.id);
    return <Editor documentId={resolvedParams.id} />
}