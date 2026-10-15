import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const ALLOWED = new Set(["login", "callback"])

/**
 * Le navigateur reste sur le domaine du site. L'API n'apparaît pas
 * dans la barre d'adresse pendant la connexion Google.
 */
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ path: string[] }> },
) {
    const { path } = await context.params
    if (path.length !== 1 || !ALLOWED.has(path[0])) {
        return NextResponse.json({ detail: "Not found" }, { status: 404 })
    }

    const target = new URL(`${API_URL}/api/v1/auth/google/${path[0]}`)
    target.search = request.nextUrl.search

    let upstream: Response
    try {
        upstream = await fetch(target, {
            method: "GET",
            headers: {
                cookie: request.headers.get("cookie") ?? "",
                accept: request.headers.get("accept") ?? "*/*",
            },
            redirect: "manual",
            cache: "no-store",
        })
    } catch {
        return NextResponse.redirect(new URL("/login?error=google_auth_failed", request.url))
    }

    const headers = new Headers()
    const location = upstream.headers.get("location")
    if (location) headers.set("location", location)

    const setCookies = typeof upstream.headers.getSetCookie === "function"
        ? upstream.headers.getSetCookie()
        : []
    for (const cookie of setCookies) {
        headers.append("set-cookie", cookie)
    }

    const isRedirect = upstream.status >= 300 && upstream.status < 400
    return new NextResponse(isRedirect ? null : upstream.body, {
        status: upstream.status,
        headers,
    })
}
