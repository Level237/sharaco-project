import type { User } from "@/features/auth/types"
import type { PublicInvoiceDraft } from "./types"

export function splitStoredAddress(raw?: string | null): { street: string; city: string } {
    const lines = (raw || "")
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
    if (lines.length === 0) return { street: "", city: "" }
    if (lines.length === 1) return { street: lines[0], city: "" }
    return {
        street: lines.slice(0, -1).join("\n"),
        city: lines[lines.length - 1],
    }
}

export function accountPatchForDraft(
    draft: PublicInvoiceDraft,
    user: User
): Partial<PublicInvoiceDraft> {
    const patch: Partial<PublicInvoiceDraft> = {}
    if (!draft.issuerName.trim()) {
        const name = (user.company_name || user.full_name || "").trim()
        if (name) patch.issuerName = name
    }
    if (!draft.issuerEmail.trim() && user.email) {
        patch.issuerEmail = user.email
    }
    if (!draft.issuerPhone.trim() && user.phone) {
        patch.issuerPhone = user.phone
    }
    if (!draft.issuerAddress.trim() && !draft.issuerCity.trim() && user.address) {
        const { street, city } = splitStoredAddress(user.address)
        patch.issuerAddress = street
        patch.issuerCity = city
    }
    if (!draft.issuerTaxId.trim() && user.tax_id) {
        patch.issuerTaxId = user.tax_id
    }
    if (!draft.signatureImage && user.signature_image) {
        patch.signatureImage = user.signature_image
    }
    const blankIssuer = !draft.issuerName.trim() && !draft.issuerEmail.trim()
    if (blankIssuer && user.currency) {
        patch.currency = user.currency
    }
    return patch
}
