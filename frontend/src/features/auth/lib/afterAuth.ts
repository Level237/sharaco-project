const KEY = "sharaco_after_auth"

export function setAfterAuthPath(path: string) {
    if (typeof window === "undefined") return
    try {
        sessionStorage.setItem(KEY, path)
    } catch {
        // sessionStorage indisponible
    }
}

export function consumeAfterAuthPath(): string | null {
    if (typeof window === "undefined") return null
    try {
        const value = sessionStorage.getItem(KEY)
        if (value) sessionStorage.removeItem(KEY)
        return value
    } catch {
        return null
    }
}

export function isSafeNextPath(path: string | null): path is string {
    return Boolean(path && path.startsWith("/") && !path.startsWith("//"))
}
