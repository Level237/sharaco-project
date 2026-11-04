import { Suspense } from "react"
import type { Metadata } from "next"
import { PublicInvoiceEditor } from "@/features/public-invoice/components/PublicInvoiceEditor"

const title = "Nouvelle facture | Sharaco"
const description =
    "Créez une facture professionnelle en ligne, voyez l’aperçu en direct, puis obtenez le lien ou le PDF. Gratuit, sans Word ni Excel."
const shareImage = {
    url: "/img/bg.png",
    width: 1802,
    height: 872,
    alt: "Créer une facture avec Sharaco",
}

export const metadata: Metadata = {
    title,
    description,
    alternates: {
        canonical: "/nouvelle-facture",
    },
    openGraph: {
        title,
        description,
        url: "/nouvelle-facture",
        siteName: "Sharaco",
        locale: "fr_FR",
        type: "website",
        images: [shareImage],
    },
    twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [shareImage.url],
    },
}

export default function NouvelleFacturePage() {
    return (
        <Suspense fallback={<div className="min-h-[100dvh] bg-slate-950" />}>
            <PublicInvoiceEditor mode="public" />
        </Suspense>
    )
}
