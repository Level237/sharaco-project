"use client"
import * as React from "react"
import { Toaster } from "@/components/ui/toaster"

export default function QuoteCreateLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex bg-background dark:bg-slate-900 h-screen overflow-hidden">
            {/* Page Content - Full screen, no sidebar padding */}
            <main className="flex-1 w-full h-full relative">
                {children}
                <Toaster />
            </main>
        </div>
    )
}
