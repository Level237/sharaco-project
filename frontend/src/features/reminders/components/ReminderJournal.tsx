"use client";

import Link from "next/link";
import { ArrowLeft, Loader2, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";
import { useReminderJournal } from "../hooks/useReminders";
import type { ReminderJournalEntry, ReminderJournalKind, ReminderStatus } from "../types";

const FILTERS: { id: "all" | ReminderJournalKind; label: string }[] = [
    { id: "all", label: "Tous" },
    { id: "devis", label: "Devis" },
    { id: "facture", label: "Factures" },
];

function formatWhen(value?: string | null) {
    if (!value) return "Date inconnue";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Date inconnue";
    return date.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function statusLabel(status: ReminderStatus) {
    if (status === "SENT") return "Envoyé";
    if (status === "FAILED") return "Échec";
    return "En cours";
}

function documentHref(entry: ReminderJournalEntry) {
    return entry.kind === "facture"
        ? `/dashboard/invoices/${entry.document_id}`
        : `/dashboard/quotes/${entry.document_id}`;
}

export function ReminderJournal({
    filter,
    onFilter,
    onBack,
}: {
    filter: "all" | ReminderJournalKind;
    onFilter: (value: "all" | ReminderJournalKind) => void;
    onBack: () => void;
}) {
    const kind = filter === "all" ? undefined : filter;
    const query = useReminderJournal(kind, 80);

    return (
        <div className="h-full overflow-y-auto bg-[#0a0a0a] text-white px-4 sm:px-8 py-6 sm:py-10">
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <button
                            type="button"
                            onClick={onBack}
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Workflows
                        </button>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-2">
                            Journal des relances
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                            Ce qui est parti, ce qui a échoué. Un clic ouvre le document.
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {FILTERS.map((item) => (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onFilter(item.id)}
                            className={cn(
                                "h-8 px-3 rounded-md text-xs font-medium border transition-colors",
                                filter === item.id
                                    ? "bg-white/10 border-white/20 text-white"
                                    : "border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {query.isLoading ? (
                    <div className="flex items-center justify-center py-16 text-slate-500">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                ) : query.isError ? (
                    <p className="text-sm text-rose-400">
                        {query.error instanceof Error
                            ? query.error.message
                            : "Impossible de charger le journal."}
                    </p>
                ) : (
                    <JournalList entries={query.data ?? []} />
                )}
            </div>
        </div>
    );
}

export function JournalPreview({
    onOpen,
}: {
    onOpen: () => void;
}) {
    const query = useReminderJournal(undefined, 5);

    return (
        <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                    <ScrollText className="h-4 w-4 text-slate-400" />
                    <h2 className="text-sm font-semibold text-white">Derniers envois</h2>
                </div>
                <button
                    type="button"
                    onClick={onOpen}
                    className="text-xs font-medium text-blue-400 hover:text-blue-300"
                >
                    Tout le journal
                </button>
            </div>
            {query.isLoading ? (
                <div className="rounded-lg border border-white/10 bg-[#111113] px-4 py-6 flex justify-center">
                    <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                </div>
            ) : (
                <JournalList entries={query.data ?? []} compact />
            )}
        </section>
    );
}

function JournalList({
    entries,
    compact = false,
}: {
    entries: ReminderJournalEntry[];
    compact?: boolean;
}) {
    if (!entries.length) {
        return (
            <div className="rounded-lg border border-white/10 bg-[#111113] px-4 py-8 text-center">
                <p className="text-sm text-slate-300">Aucune relance envoyée pour l’instant.</p>
                <p className="text-xs text-slate-500 mt-1">
                    Dès qu’un email part (cron ou envoi manuel), il s’affiche ici.
                </p>
            </div>
        );
    }

    return (
        <div className="divide-y divide-white/10 rounded-lg border border-white/10 bg-[#111113]">
            {entries.map((entry) => (
                <Link
                    key={`${entry.kind}-${entry.id}`}
                    href={documentHref(entry)}
                    className={cn(
                        "flex items-start justify-between gap-3 px-4 hover:bg-white/[0.03] transition-colors",
                        compact ? "py-3" : "py-3.5 sm:py-4"
                    )}
                >
                    <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-white truncate">
                                {entry.document_number || "Sans numéro"}
                            </span>
                            <span className="text-[11px] text-slate-400 px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10">
                                {entry.kind === "facture" ? "Facture" : "Devis"}
                            </span>
                            <StatusBadge status={entry.status} />
                        </div>
                        <p className="text-xs text-slate-300 truncate">
                            {entry.step_label}
                            {entry.client_name ? ` · ${entry.client_name}` : ""}
                        </p>
                        {!compact && entry.status === "FAILED" && entry.error_message ? (
                            <p className="text-[11px] text-rose-400/90 line-clamp-2">
                                {entry.error_message}
                            </p>
                        ) : null}
                    </div>
                    <p className="text-[11px] text-slate-500 shrink-0 pt-0.5">
                        {formatWhen(entry.sent_at)}
                    </p>
                </Link>
            ))}
        </div>
    );
}

function StatusBadge({ status }: { status: ReminderStatus }) {
    return (
        <span
            className={cn(
                "text-[11px] font-medium px-1.5 py-0.5 rounded-md border",
                status === "SENT" && "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
                status === "FAILED" && "border-rose-500/30 bg-rose-500/10 text-rose-300",
                status === "PENDING" && "border-white/10 bg-white/5 text-slate-300"
            )}
        >
            {statusLabel(status)}
        </span>
    );
}
