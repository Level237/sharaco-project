"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Logo from "@/components/ui/logo"
import { authApi } from "../api/authApi"
import { ApiError } from "@/lib/api"

const emailSchema = z.string().min(1).email()

export function ForgotPasswordForm() {
    const searchParams = useSearchParams()
    const [email, setEmail] = useState(searchParams.get("email") || "")
    const [error, setError] = useState("")
    const [sent, setSent] = useState(false)
    const [pending, setPending] = useState(false)

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setError("")
        const parsed = emailSchema.safeParse(email.trim())
        if (!parsed.success) {
            setError("Veuillez entrer un email valide")
            return
        }
        setPending(true)
        try {
            await authApi.forgotPassword(parsed.data)
            setSent(true)
        } catch (err) {
            if (err instanceof ApiError && err.status === 429) {
                setError("Trop de tentatives. Réessayez plus tard.")
            } else {
                setError("Impossible d’envoyer la demande. Réessayez.")
            }
        } finally {
            setPending(false)
        }
    }

    return (
        <div className="w-full max-w-[400px] space-y-8 text-center">
            <div className="flex flex-col items-center space-y-6">
                <div className="p-3">
                    <Logo width={160} height={160} />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Mot de passe oublié</h1>
                    <p className="text-sm font-medium text-zinc-500">
                        {sent
                            ? "Si un compte existe pour cet email, un lien a été envoyé. Pensez à vérifier les indésirables."
                            : "Indiquez l’email de votre compte. Vous recevrez un lien valable une heure."}
                    </p>
                </div>
            </div>

            {sent ? (
                <Button asChild className="h-12 w-full rounded-xl bg-[#2563EB] font-bold text-white hover:bg-[#2563EB]/80">
                    <Link href="/login">Retour à la connexion</Link>
                </Button>
            ) : (
                <form onSubmit={onSubmit} className="space-y-4">
                    {error && (
                        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-left text-sm text-red-500">
                            {error}
                        </div>
                    )}
                    <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Entrez votre email"
                        autoComplete="email"
                        disabled={pending}
                        className="h-12 rounded-xl border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600 focus:border-[#2563EB] focus:ring-[#2563EB]"
                    />
                    <Button
                        type="submit"
                        disabled={pending || !email}
                        className="h-12 w-full rounded-xl bg-[#2563EB] font-bold text-white hover:bg-[#2563EB]/80"
                    >
                        {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Envoyer le lien"}
                    </Button>
                </form>
            )}

            <p className="pt-4 text-sm font-medium text-zinc-500">
                <Link href="/login" className="font-bold text-[#2563EB] hover:underline">
                    Retour à la connexion
                </Link>
            </p>
        </div>
    )
}
