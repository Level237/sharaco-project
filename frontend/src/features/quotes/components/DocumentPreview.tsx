// components/quotes/DocumentPreview.tsx
"use client"

import { useEffect, useState } from "react"
import { FileText, Loader2 } from "lucide-react"
import { quotesApi } from "@/features/quotes/api/quotesApi"

interface DocumentPreviewProps {
    documentId: string
    layoutStyle: string
}

export function DocumentPreview({ documentId, layoutStyle }: DocumentPreviewProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [hasError, setHasError] = useState(false)
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    
    useEffect(() => {
        let objectUrl: string | null = null
        let isMounted = true

        const fetchPreview = async () => {
            try {
                setIsLoading(true)
                setHasError(false)
                
                // Récupère le blob URL avec le token
                objectUrl = await quotesApi.getPreviewPngBlob(documentId)
                
                if (isMounted) {
                    setImageUrl(objectUrl)
                    setIsLoading(false)
                } else {
                    // Si le composant a été démonté, libérer immédiatement
                    URL.revokeObjectURL(objectUrl)
                }
            } catch (error) {
                console.error("Erreur preview:", error)
                if (isMounted) {
                    setHasError(true)
                    setIsLoading(false)
                }
            }
        }

        fetchPreview()

        // Cleanup : libérer la mémoire quand le composant est démonté
        return () => {
            isMounted = false
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl)
            }
        }
    }, [documentId])

    return (
        <div className="relative w-full aspect-[3/4] bg-slate-100 dark:bg-slate-900  overflow-hidden">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900 z-10">
                    <Loader2 className="h-8 w-8 text-slate-400 animate-spin" />
                </div>
            )}
            
            {hasError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 gap-3">
                    <FileText className="h-12 w-12 text-slate-300" />
                    <span className="text-xs text-slate-400 font-medium">Aperçu indisponible</span>
                </div>
            ) : imageUrl ? (
                <img
                    src={imageUrl}
                    alt={`Preview document ${documentId}`}
                    className={`w-full h-full object-cover transition-opacity duration-300 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false)
                        setHasError(true)
                    }}
                />
            ) : null}
        </div>
    )
}