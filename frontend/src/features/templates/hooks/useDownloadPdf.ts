"use client";

import { useState } from "react";
import type { DocumentPreviewRequest } from "../types";
import { quotesApi } from "@/features/quotes/api/quotesApi";

/**
 * Hook pour télécharger le PDF d'un devis.
 *
 * Utilise TOUJOURS POST /documents/preview/pdf avec les données actuelles
 * de l'éditeur — même si le document est sauvegardé en DB.
 * Cela garantit que le PDF reflète toujours l'état actuel du formulaire,
 * et non une version potentiellement obsolète stockée en base.
 */
export function useDownloadPdf() {
    const [isDownloading, setIsDownloading] = useState(false);

    const downloadPdf = async (
        previewData: DocumentPreviewRequest,
        _documentId?: string | null,
        filename?: string
    ) => {
        setIsDownloading(true);
        try {
            // On utilise toujours le endpoint preview/pdf pour garantir
            // que le PDF reflète les données actuelles de l'éditeur.
            // Le paramètre _documentId est conservé pour compatibilité
            // mais n'est plus utilisé pour le téléchargement.
            const blob = await quotesApi.downloadPreviewPdf(previewData);

            // Déclencher le téléchargement dans le navigateur
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = filename || "devis.pdf";
            document.body.appendChild(link);
            link.click();

            // Nettoyage
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error: any) {
            throw error;
        } finally {
            setIsDownloading(false);
        }
    };

    return { downloadPdf, isDownloading };
}
