const TOKEN_KEY = "sharaco_token"

function canUseBrowser() {
    return typeof window !== "undefined"
}

/** Lecture tolérante : certains navigateurs lèvent SecurityError si le stockage est refusé. */
export function readStorage(key: string): string | null {
    if (!canUseBrowser()) return null
    try {
        return window.localStorage.getItem(key)
    } catch {
        return null
    }
}

export function writeStorage(key: string, value: string): void {
    if (!canUseBrowser()) return
    try {
        window.localStorage.setItem(key, value)
    } catch {
        // Safari privé, WebView ou cookies bloqués.
    }
}

export function removeStorage(key: string): void {
    if (!canUseBrowser()) return
    try {
        window.localStorage.removeItem(key)
    } catch {
        // Même refus que pour la lecture.
    }
}

export function readCookie(name: string): string | null {
    if (typeof document === "undefined") return null
    try {
        const prefix = `${name}=`
        const part = document.cookie.split("; ").find((row) => row.startsWith(prefix))
        if (!part) return null
        return decodeURIComponent(part.slice(prefix.length))
    } catch {
        return null
    }
}

export function writeCookie(name: string, value: string, days = 30): void {
    if (typeof document === "undefined") return
    try {
        const expires = new Date(Date.now() + days * 864e5).toUTCString()
        document.cookie = `${name}=${encodeURIComponent(value)}; path=/; expires=${expires}; SameSite=Lax`
    } catch {
        // Le document peut aussi refuser document.cookie.
    }
}

export function deleteCookie(name: string): void {
    if (typeof document === "undefined") return
    try {
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    } catch {
        // Ignoré : la session reste en mémoire pour cet onglet.
    }
}

export function readAuthToken(): string | null {
    return readStorage(TOKEN_KEY) ?? readCookie(TOKEN_KEY)
}
