"use client"

import { useEffect, useState } from "react"
import { BookOpen } from "lucide-react"
import { specificationsApi } from "@/features/specifications/api/specificationsApi"

export function SpecActivityThumb({
    specId,
    color,
}: {
    specId: string
    color?: string
}) {
    const [imageUrl, setImageUrl] = useState<string | null>(null)

    useEffect(() => {
        let objectUrl: string | null = null
        let mounted = true
        specificationsApi
            .getPreviewPngBlob(specId)
            .then((url) => {
                objectUrl = url
                if (mounted) setImageUrl(url)
                else URL.revokeObjectURL(url)
            })
            .catch(() => {
                if (mounted) setImageUrl(null)
            })
        return () => {
            mounted = false
            if (objectUrl) URL.revokeObjectURL(objectUrl)
        }
    }, [specId])

    if (imageUrl) {
        return <img src={imageUrl} alt="" className="h-full w-full object-cover object-top" />
    }

    return (
        <div
            className="flex h-full w-full items-center justify-center"
            style={{ background: color || "#2563EB" }}
        >
            <BookOpen className="h-5 w-5 text-white/80" />
        </div>
    )
}
