import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Logo from "@/components/ui/logo"
import { RegisterForm } from "@/features/auth/components/RegisterForm"

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-black dark:bg-slate-950 text-white flex flex-col font-sans">
            {/* Navbar */}


            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center px-4 -mt-20">
                <Suspense fallback={<div className="text-zinc-500">Chargement...</div>}>
                    <RegisterForm />
                </Suspense>
            </main>

            {/* Footer */}
            <footer className="py-8 flex justify-center space-x-6 text-xs text-zinc-600 font-bold tracking-tight">
                <Link href="/terms" className="hover:text-zinc-400 transition-colors">
                    Terms
                </Link>
                <Link href="/privacy" className="hover:text-zinc-400 transition-colors">
                    Privacy Policy
                </Link>
            </footer>
        </div>
    )
}
