"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Logo from "@/components/ui/logo"
import { authApi } from "../api/authApi"
import { ApiError } from "@/lib/api"

const passwordSchema = z
    .object({
        password: z.string().min(8, "Au moins 8 caractères").max(128),
        confirm: z.string().min(1, "Confirmez le mot de passe"),
    })
    .refine((data) => data.password === data.confirm, {
        message: "Les mots de passe ne correspondent pas",
        path: ["confirm"],
    })

export function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const token = (searchParams.get("token") || "").trim()
    const [password, setPassword] = useState("")
    const [confirm, setConfirm] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [done, setDone] = useState(false)
    const [pending, setPending] = useState(false)

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault()
        setError("")
        const parsed = passwordSchema.safeParse({ password, confirm })
        if (!parsed.success) {
            setError(parsed.error.issues[0]?.message || "Vérifiez le formulaire")
            return
        }
        if (!token) {
            setError("Lien incomplet. Demandez un nouvel email de réinitialisation.")
            return
        }
        setPending(true)
        try {
            await authApi.resetPassword(token, parsed.data.password)
            setDone(true)
        } catch (err) {
            if (err instanceof ApiError && err.status === 429) {
                setError("Trop de tentatives. Réessayez plus tard.")
            } else if (err instanceof ApiError) {
                setError(err.detail || "Ce lien est invalide ou a expiré.")
            } else {
                setError("Impossible de mettre à jour le mot de passe.")
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
                    <h1 className="text-3xl font-bold tracking-tight">Nouveau mot de passe</h1>
                    <p className="text-sm font-medium text-zinc-500">
                        {done
                            ? "Votre mot de passe a été mis à jour. Connectez-vous avec le nouveau."
                            : "Choisissez un mot de passe d’au moins 8 caractères."}
                    </p>
                </div>
            </div>

            {done ? (
                <Button asChild className="h-12 w-full rounded-xl bg-[#2563EB] font-bold text-white hover:bg-[#2563EB]/80">
                    <Link href="/login">Se connecter</Link>
                </Button>
            ) : (
                <form onSubmit={onSubmit} className="space-y-4 text-left">
                    {error && (
                        <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 text-sm text-red-500">
                            {error}
                        </div>
                    )}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="password" className="text-xs font-bold text-zinc-400">
                                Mot de passe
                            </Label>
                            <button
                                type="button"
                                className="text-xs font-bold text-sky-500 hover:text-sky-400"
                                onClick={() => setShowPassword((v) => !v)}
                            >
                                {showPassword ? "Masquer" : "Afficher"}
                            </button>
                        </div>
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="new-password"
                            disabled={pending}
                            className="h-12 rounded-xl border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="confirm" className="text-xs font-bold text-zinc-400">
                            Confirmation
                        </Label>
                        <Input
                            id="confirm"
                            type={showPassword ? "text" : "password"}
                            value={confirm}
                            onChange={(e) => setConfirm(e.target.value)}
                            autoComplete="new-password"
                            disabled={pending}
                            className="h-12 rounded-xl border-zinc-800 bg-zinc-900/50 text-white placeholder:text-zinc-600"
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={pending}
                        className="h-12 w-full rounded-xl bg-[#2563EB] font-bold text-white hover:bg-[#2563EB]/80"
                    >
                        {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Enregistrer"}
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
