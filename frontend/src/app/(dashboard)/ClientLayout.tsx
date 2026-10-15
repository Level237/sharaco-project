// app/dashboard/layout.tsx
"use client"
import * as React from "react"
import { cn } from "@/lib/utils"
import Sidebar from "@/features/navigation/components/Sidebar"
import { Toaster } from "@/components/ui/toaster"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)

    // Le thème clair du téléphone ne doit pas repeindre le tableau de bord.
    React.useEffect(() => {
        const root = document.documentElement
        const keepDark = () => {
            if (!root.classList.contains("dark")) root.classList.add("dark")
        }
        keepDark()
        const observer = new MutationObserver(keepDark)
        observer.observe(root, { attributes: true, attributeFilter: ["class"] })
        return () => observer.disconnect()
    }, [])

    // Fermer le sidebar sur mobile au démarrage et au resize
    React.useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false)
            }
        }

        window.addEventListener('resize', handleResize)
        handleResize()

        return () => window.removeEventListener('resize', handleResize)
    }, [])

    return (
        <div className="dark flex min-h-[100dvh] overflow-x-hidden bg-slate-950 text-slate-50">
            {/* Sidebar (fixed position, n'affecte pas le flow) */}
            <Sidebar setIsSidebarOpen={setIsSidebarOpen} isSidebarOpen={isSidebarOpen} />

            {/* ═══════════════════════════════════════════════════════════
                MAIN CONTENT
                ✅ Marges FIXES selon le breakpoint, pas selon isSidebarOpen
                ✅ Pas de transition (le sidebar est fixed, ne doit rien animer)
            ═══════════════════════════════════════════════════════════ */}
            <div className="flex-1 min-w-0 ml-0 md:ml-[88px]">
                <main className="relative flex-1 p-4 md:p-8 lg:p-10 w-full pb-28 md:pb-8">
                    {children}
                    <Toaster />
                </main>
            </div>
        </div>
    )
}