export interface PublicInvoiceLine {
    id: string
    description: string
    details: string
    quantity: number
    unitPrice: number
    taxable: boolean
}

export type InvoiceTerms = "receipt" | "net7" | "net15" | "net30"

export interface PublicInvoiceDraft {
    title: string
    number: string
    issueDate: string
    terms: InvoiceTerms
    dueDate: string
    issuerName: string
    issuerEmail: string
    issuerPhone: string
    issuerAddress: string
    issuerCity: string
    issuerTaxId: string
    clientId: string | null
    clientName: string
    clientEmail: string
    clientPhone: string
    clientMobile: string
    clientAddress: string
    clientCity: string
    items: PublicInvoiceLine[]
    notes: string
    brandColor: string
    signatureImage: string | null
    hasVat: boolean
    vatRate: number
    currency: string
}

export function emptyPublicInvoiceLine(): PublicInvoiceLine {
    const id = typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `line-${Date.now()}-${Math.random().toString(16).slice(2)}`
    return {
        id,
        description: "",
        details: "",
        quantity: 1,
        unitPrice: 0,
        taxable: true,
    }
}

export function defaultPublicInvoiceDraft(): PublicInvoiceDraft {
    const today = new Date().toISOString().split("T")[0]
    return {
        title: "Facture",
        number: "FAC-0001",
        issueDate: today,
        terms: "receipt",
        dueDate: today,
        issuerName: "",
        issuerEmail: "",
        issuerPhone: "",
        issuerAddress: "",
        issuerCity: "",
        issuerTaxId: "",
        clientId: null,
        clientName: "",
        clientEmail: "",
        clientPhone: "",
        clientMobile: "",
        clientAddress: "",
        clientCity: "",
        items: [emptyPublicInvoiceLine()],
        notes: "",
        brandColor: "#2563EB",
        signatureImage: null,
        hasVat: false,
        vatRate: 0,
        currency: "XOF",
    }
}
