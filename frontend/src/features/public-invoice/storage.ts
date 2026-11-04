import { defaultPublicInvoiceDraft, emptyPublicInvoiceLine, type PublicInvoiceDraft } from "./types"

export const PUBLIC_INVOICE_DRAFT_KEY = "sharaco_public_invoice_draft_v2"

export function readPublicInvoiceDraft(): PublicInvoiceDraft {
    if (typeof window === "undefined") return defaultPublicInvoiceDraft()
    try {
        const raw = window.localStorage.getItem(PUBLIC_INVOICE_DRAFT_KEY)
        if (!raw) return defaultPublicInvoiceDraft()
        const parsed = JSON.parse(raw) as Partial<PublicInvoiceDraft>
        const base = defaultPublicInvoiceDraft()
        const items = parsed.items?.length
            ? parsed.items.map((row) => ({ ...emptyPublicInvoiceLine(), ...row }))
            : base.items
        return { ...base, ...parsed, items }
    } catch {
        return defaultPublicInvoiceDraft()
    }
}

export function writePublicInvoiceDraft(draft: PublicInvoiceDraft) {
    if (typeof window === "undefined") return
    try {
        window.localStorage.setItem(PUBLIC_INVOICE_DRAFT_KEY, JSON.stringify(draft))
    } catch {
        // quota / mode privé
    }
}

export function clearPublicInvoiceDraft() {
    if (typeof window === "undefined") return
    try {
        window.localStorage.removeItem(PUBLIC_INVOICE_DRAFT_KEY)
    } catch {
        // ignore
    }
}
