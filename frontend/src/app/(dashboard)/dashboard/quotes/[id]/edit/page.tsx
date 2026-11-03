"use client"

import { useParams } from "next/navigation"
import { Editor } from "@/features/quotes/components/QuoteBuilder/Editor"

export default function EditQuotePage() {
    const params = useParams<{ id: string }>()
    const documentId = typeof params.id === "string" ? params.id : ""

    if (!documentId) return null

    return <Editor documentId={documentId} />
}
