export function quoteDetailHref(id: string) {
    return `/dashboard/quotes/${id}`
}

export function quoteEditHref(id: string) {
    return `/dashboard/quotes/${id}/edit`
}

export function canEditQuote(status?: string | null) {
    return status !== "ACCEPTED"
}
