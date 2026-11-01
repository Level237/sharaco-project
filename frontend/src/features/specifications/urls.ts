export function isHttpUrl(value: string): boolean {
    try {
        const parsed = new URL(value.trim())
        return parsed.protocol === "http:" || parsed.protocol === "https:"
    } catch {
        return false
    }
}
