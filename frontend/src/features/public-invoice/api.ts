import { API_URL } from "@/lib/api"
import { clientsApi } from "@/features/clients/api/clientsApi"
import { invoicesApi } from "@/features/invoices/api/invoicesApi"
import { settingsApi } from "@/features/settings/api/settingsApi"
import type { DocumentPreviewRequest } from "@/features/quotes/types"
import type { PublicInvoiceDraft, PublicInvoiceLine } from "./types"

function formatLineDescription(line: PublicInvoiceLine): string {
    const title = line.description.trim() || "Prestation"
    const details = (line.details || "").trim()
    return details ? `${title}\n${details}` : title
}

function joinAddress(street: string, city: string): string {
    return [street.trim(), city.trim()].filter(Boolean).join("\n")
}

export function computeDraftTotals(draft: PublicInvoiceDraft) {
    let subtotal = 0
    let tax = 0
    for (const item of draft.items) {
        const lineHt = Math.max(0, Number(item.unitPrice) || 0) * Math.max(1, Number(item.quantity) || 1)
        subtotal += lineHt
        if (draft.hasVat && item.taxable && draft.vatRate > 0) {
            tax += Math.round((lineHt * draft.vatRate) / 100)
        }
    }
    return {
        subtotal,
        tax,
        total: subtotal + tax,
    }
}

export function draftToPublicPreviewPayload(draft: PublicInvoiceDraft): DocumentPreviewRequest {
    return {
        type: "FACTURE",
        reference: draft.number.trim() || "FAC-0001",
        client_name: draft.clientName || "Client",
        client_email: draft.clientEmail,
        client_phone: draft.clientPhone || draft.clientMobile,
        client_address: joinAddress(draft.clientAddress, draft.clientCity),
        items: draft.items.map((item) => ({
            description: formatLineDescription(item),
            quantity: Math.max(1, Number(item.quantity) || 1),
            unit_price_cents: Math.max(0, Math.round(Number(item.unitPrice) || 0)),
            tax_rate: draft.hasVat && item.taxable ? draft.vatRate : 0,
        })),
        layout_style: "classic",
        primary_color: draft.brandColor || "#2563EB",
        notes: draft.notes || null,
        due_date: draft.dueDate ? `${draft.dueDate}T12:00:00` : null,
        issuer_name: draft.issuerName || "Votre entreprise",
        issuer_email: draft.issuerEmail,
        issuer_phone: draft.issuerPhone,
        issuer_address: joinAddress(draft.issuerAddress, draft.issuerCity),
        provider_signature_name: draft.signatureImage ? draft.issuerName || null : null,
        provider_signature_image: draft.signatureImage,
        provider_signed_at: draft.signatureImage ? new Date().toISOString() : null,
        currency: draft.currency,
    }
}

export async function previewPublicInvoice(draft: PublicInvoiceDraft): Promise<string> {
    const res = await fetch(`${API_URL}/api/v1/documents/public-preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/html" },
        body: JSON.stringify(draftToPublicPreviewPayload(draft)),
    })
    if (res.status === 429) throw new Error("Trop de prévisualisations. Réessayez dans un instant.")
    if (!res.ok) throw new Error("Impossible d'afficher l'aperçu")
    return res.text()
}

export function validatePublicInvoiceDraft(draft: PublicInvoiceDraft): string | null {
    if (!draft.issuerName.trim()) return "Indiquez le nom de votre entreprise (De)."
    if (!draft.clientName.trim()) return "Indiquez le nom du client (Facturé à)."
    const lines = draft.items.filter((item) => item.description.trim())
    if (lines.length === 0) return "Ajoutez au moins une ligne de facture."
    return null
}

export async function savePublicInvoiceDraft(draft: PublicInvoiceDraft): Promise<string> {
    const error = validatePublicInvoiceDraft(draft)
    if (error) throw new Error(error)

    const client = await clientsApi.create({
        name: draft.clientName.trim(),
        email: draft.clientEmail.trim() || undefined,
        phone: (draft.clientPhone || draft.clientMobile).trim() || undefined,
        address: joinAddress(draft.clientAddress, draft.clientCity) || undefined,
    })

    const document = await invoicesApi.create({
        type: "FACTURE",
        client_id: client.id,
        layout_style: "classic",
        notes: draft.notes.trim() || null,
        due_date: draft.dueDate ? `${draft.dueDate}T12:00:00` : null,
        provider_signature_name: draft.issuerName.trim(),
        provider_signature_image: draft.signatureImage,
        items: draft.items
            .filter((item) => item.description.trim())
            .map((item) => ({
                description: formatLineDescription(item),
                quantity: Math.max(1, Number(item.quantity) || 1),
                unit_price_cents: Math.max(0, Math.round(Number(item.unitPrice) || 0)),
                tax_rate: draft.hasVat && item.taxable ? draft.vatRate : 0,
            })),
    })

    try {
        await settingsApi.updateProfile({
            company_name: draft.issuerName.trim(),
            address: joinAddress(draft.issuerAddress, draft.issuerCity) || undefined,
            tax_id: draft.issuerTaxId.trim() || undefined,
            currency: draft.currency,
            signature_image: draft.signatureImage || undefined,
        })
    } catch {
        // profil non bloquant
    }

    return document.id
}
