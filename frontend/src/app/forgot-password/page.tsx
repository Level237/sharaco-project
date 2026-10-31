import { Suspense } from "react"
import Link from "next/link"
import { Metadata } from "next"
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm"

export const metadata: Metadata = {
    title: "Mot de passe oublié | Sharaco",
    description: "Réinitialisez le mot de passe de votre compte Sharaco.",
}

export default function ForgotPasswordPage() {
    return (
        <div className="flex min-h-screen flex-col bg-black font-sans text-white dark:bg-slate-950">
            <main className="flex flex-1 flex-col items-center justify-center px-4 -mt-20">
                <Suspense fallback={<div className="text-zinc-500">Chargement...</div>}>
                    <ForgotPasswordForm />
                </Suspense>
            </main>
            <footer className="flex justify-center space-x-6 py-8 text-xs font-bold tracking-tight text-zinc-600">
                <Link href="/terms" className="hover:text-zinc-400">Terms</Link>
                <Link href="/privacy" className="hover:text-zinc-400">Privacy Policy</Link>
            </footer>
        </div>
    )
}
