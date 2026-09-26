"use client"

import { useParams, useRouter } from "next/navigation"
import { TemplateVisualizer } from "@/features/templates/components/TemplateVisualizer"

export default function TemplatePreviewPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const handleSelect = (layoutId: string) => {
        router.push(`/dashboard/quotes/create?template-id=${layoutId}`)
    }

    if (!id) return null

    return (
        <div className="h-screen w-screen">
            <TemplateVisualizer 
                layoutId={id} 
                onSelect={handleSelect} 
            />
        </div>
    )
}
