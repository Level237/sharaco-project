"use client"

import Link from "next/link"
import {
    FileText,
    LayoutDashboard,
    Receipt,
    Settings,
    Users,
} from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { User } from "@/features/auth/types"

const ACCOUNT_LINKS = [
    { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/nouvelle-facture", label: "Nouvelle facture", icon: Receipt },
    { href: "/dashboard/quotes/create", label: "Nouveau devis", icon: FileText },
    { href: "/dashboard/clients", label: "Mes clients", icon: Users },
    { href: "/dashboard/settings", label: "Mon profil", icon: Settings },
]

function initials(user: User | null | undefined) {
    const name = (user?.full_name || user?.company_name || user?.email || "U").trim()
    const parts = name.split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
}

interface HomeAccountMenuProps {
    user: User | null | undefined
}

export function HomeAccountMenu({ user }: HomeAccountMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#2563EB] text-sm font-bold text-white outline-none ring-offset-slate-950 focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                    aria-label="Menu du compte"
                >
                    {user?.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={user.avatar} alt="" className="h-full w-full object-cover" />
                    ) : (
                        initials(user)
                    )}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                sideOffset={10}
                className="w-56 rounded-md border-white/10 bg-[#0B0E16] p-1.5 text-slate-200 shadow-xl"
            >
                <div className="px-2.5 py-2">
                    <p className="truncate text-sm font-semibold text-white">
                        {user?.full_name || user?.company_name || "Mon espace"}
                    </p>
                    {user?.email ? (
                        <p className="truncate text-[11px] text-slate-400">{user.email}</p>
                    ) : null}
                </div>
                <DropdownMenuSeparator className="bg-white/10" />
                {ACCOUNT_LINKS.map((item) => (
                    <DropdownMenuItem key={item.href} asChild className="cursor-pointer rounded-md px-2.5 py-2 focus:bg-white/5 focus:text-white">
                        <Link href={item.href} className="flex items-center gap-2.5 text-sm font-medium">
                            <item.icon className="h-4 w-4 text-slate-400" />
                            {item.label}
                        </Link>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
