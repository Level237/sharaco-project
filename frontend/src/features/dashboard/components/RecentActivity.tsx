"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { MailCheck, MailWarning, Eye, CreditCard } from "lucide-react"

interface RecentActivityProps {
    relancesEnvoyees: number
    relancesEchouees: number
    isLoading?: boolean
}

// Fixed mockup data to simulate a timeline
const MOCK_TIMELINE = [
    {
        id: 1,
        type: 'PAYMENT',
        title: 'Paiement reçu',
        description: 'Virement de 1,200,000 FCFA reçu pour la facture DEV-2026-041.',
        date: 'Aujourd\'hui 14:32',
        icon: CreditCard,
        color: 'text-emerald-500',
        bg: 'bg-emerald-50 dark:bg-emerald-500/10'
    },
    {
        id: 2,
        type: 'VIEW',
        title: 'Devis consulté',
        description: 'Studio graphique X a consulté le devis DEV-2026-052.',
        date: 'Hier 09:15',
        icon: Eye,
        color: 'text-amber-500',
        bg: 'bg-amber-50 dark:bg-amber-500/10'
    },
    {
        id: 3,
        type: 'REMINDER_SUCCESS',
        title: 'Relance envoyée',
        description: 'Relance automatique J+7 envoyée à Agence Web L.',
        date: 'Il y a 2 jours',
        icon: MailCheck,
        color: 'text-blue-500',
        bg: 'bg-blue-50 dark:bg-blue-500/10'
    },
    {
        id: 4,
        type: 'REMINDER_FAILED',
        title: 'Échec de relance',
        description: 'L\'email de relance n\'a pas pu être délivré (adresse introuvable).',
        date: 'Il y a 3 jours',
        icon: MailWarning,
        color: 'text-rose-500',
        bg: 'bg-rose-50 dark:bg-rose-500/10'
    }
]

export function RecentActivity({ relancesEnvoyees, relancesEchouees, isLoading }: RecentActivityProps) {
    return (
        <Card className="col-span-1 shadow-sm border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div>
                    <CardTitle className="text-base font-semibold text-slate-900 dark:text-white">Fil d'activité</CardTitle>
                    <CardDescription className="text-xs">Événements récents sur vos documents.</CardDescription>
                </div>
                <div className="flex gap-2">
                    {relancesEchouees > 0 && (
                        <Badge variant="destructive" className="hidden sm:inline-flex text-[10px]">
                            {relancesEchouees} échec(s)
                        </Badge>
                    )}
                    <Button variant="outline" size="sm" className="hidden sm:flex">
                        Historique
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex-1">
                {isLoading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                ) : (
                    <div className="relative pl-6 space-y-6 before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">

                        {MOCK_TIMELINE.map((event) => {
                            const Icon = event.icon;
                            return (
                                <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                    {/* Timeline dot */}
                                    <div className={`absolute top-0 left-[-24px] md:left-1/2 md:-translate-x-1/2 flex items-center justify-center w-6 h-6 rounded-full border-2 border-white dark:border-slate-950 shadow-sm ${event.bg}`}>
                                        <Icon className={`w-3 h-3 ${event.color}`} />
                                    </div>

                                    {/* Content Card */}
                                    <div className="w-full">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-1">
                                            <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{event.title}</h4>
                                            <span className="text-[10px] text-slate-500 font-medium">{event.date}</span>
                                        </div>
                                        <p className="text-xs text-slate-600 dark:text-slate-400">
                                            {event.description}
                                        </p>
                                    </div>
                                </div>
                            )
                        })}

                    </div>
                )}
            </CardContent>
            {/* Mobile View All Button */}
            <div className="p-4 sm:hidden border-t border-slate-100 dark:border-slate-800">
                <Button variant="outline" className="w-full">
                    Historique
                </Button>
            </div>
        </Card>
    )
}
