"use client"
import * as React from "react"
import { Toaster } from "@/components/ui/toaster"

export default function ContractEditorLayout({ children }: { children: React.ReactNode }) {
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

    return (
        <div className="dark flex h-[100dvh] overflow-hidden bg-slate-950 text-slate-50">
            <main className="relative h-full w-full flex-1">
                {children}
                <Toaster />
            </main>
        </div>
    )
}
