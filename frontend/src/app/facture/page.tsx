import { redirect } from "next/navigation"
import { PUBLIC_INVOICE_PATH } from "@/features/public-invoice/paths"

type Search = Record<string, string | string[] | undefined>

export default async function FactureAliasPage({
    searchParams,
}: {
    searchParams: Promise<Search>
}) {
    const params = await searchParams
    const query = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) {
            value.forEach((item) => query.append(key, item))
        } else if (value) {
            query.set(key, value)
        }
    }
    const suffix = query.toString()
    redirect(suffix ? `${PUBLIC_INVOICE_PATH}?${suffix}` : PUBLIC_INVOICE_PATH)
}
