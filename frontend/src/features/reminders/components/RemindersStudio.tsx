"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronRight, CircleHelp, GitBranch, Loader2, RotateCcw, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useReminderConfig, useUpdateReminderConfig } from "../hooks/useReminders";
import type { ReminderConfigUpdate } from "../types";
import { QUOTE_DEFAULTS, WORKFLOWS, type WorkflowId } from "../data/workflows";
import { journalFromSearch, workflowFromSearch } from "../lib/workflowUrl";
import { useRemindersTour } from "../hooks/useRemindersTour";
import { JournalPreview, ReminderJournal } from "./ReminderJournal";
import { WorkflowCanvas } from "./WorkflowCanvas";
import {
    InspectorEmpty,
    InvoiceInspector,
    QuoteInspector,
    type SelectedNode,
} from "./WorkflowInspector";

function toForm(data: ReminderConfigUpdate): ReminderConfigUpdate {
    return {
        reminder_1_enabled: data.reminder_1_enabled,
        reminder_1_days: data.reminder_1_days,
        reminder_1_subject: data.reminder_1_subject,
        reminder_2_enabled: data.reminder_2_enabled,
        reminder_2_days: data.reminder_2_days,
        reminder_2_subject: data.reminder_2_subject,
        reminder_3_enabled: data.reminder_3_enabled,
        reminder_3_days: data.reminder_3_days,
        reminder_3_subject: data.reminder_3_subject,
        is_active: data.is_active,
        stop_on_view: data.stop_on_view,
        stop_on_payment: data.stop_on_payment,
    };
}

export function RemindersStudio() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const openId = workflowFromSearch(searchParams);
    const journalFilter = journalFromSearch(searchParams);
    const [selected, setSelected] = useState<SelectedNode | null>(null);
    const [focusNodeId, setFocusNodeId] = useState<string | null>(null);
    const [form, setForm] = useState<ReminderConfigUpdate>(QUOTE_DEFAULTS);
    const selectNode = useCallback((node: SelectedNode | null) => {
        setSelected(node);
    }, []);
    const focusNode = useCallback((id: string | null) => {
        setFocusNodeId(id);
    }, []);
    const { startTour } = useRemindersTour({
        scope: openId ?? "list",
        select: selectNode,
        focusNode,
        force: searchParams.get("guide") === "1",
        enabled: !journalFilter,
    });

    const configQuery = useReminderConfig(openId === "devis");
    const update = useUpdateReminderConfig();

    useEffect(() => {
        if (configQuery.data) setForm(toForm(configQuery.data));
    }, [configQuery.data]);

    const setField = <K extends keyof ReminderConfigUpdate>(
        key: K,
        value: ReminderConfigUpdate[K]
    ) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const openWorkflow = (id: WorkflowId | null) => {
        setSelected(null);
        if (!id) {
            router.push(pathname);
            return;
        }
        router.push(`${pathname}?${id}`);
    };

    const openJournal = (filter: "all" | "devis" | "facture" = "all") => {
        setSelected(null);
        router.push(filter === "all" ? `${pathname}?journal` : `${pathname}?journal=${filter}`);
    };

    const workflow = WORKFLOWS.find((item) => item.id === openId);

    if (journalFilter) {
        return (
            <ReminderJournal
                filter={journalFilter}
                onFilter={openJournal}
                onBack={() => openWorkflow(null)}
            />
        );
    }

    if (!workflow) {
        return (
            <div className="h-full overflow-y-auto bg-[#0a0a0a] text-white px-4 sm:px-8 py-6 sm:py-10">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                                Workflows
                            </p>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight mt-1">
                                Relances automatiques
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
                                Deux fils séparés avec garde-fou d’arrêt en amont. Cliquez sur une
                                relance pour inspecter et régler son graphe.
                            </p>
                        </div>
                        <GuideButton onClick={startTour} />
                    </div>

                    <div className="divide-y divide-white/10 rounded-lg border border-white/10 bg-[#111113]">
                        {WORKFLOWS.map((item) => (
                            <button
                                key={item.id}
                                type="button"
                                data-tour={`relance-list-${item.id}`}
                                onClick={() => openWorkflow(item.id)}
                                className="w-full p-4 sm:p-5 text-left hover:bg-white/[0.03] transition-colors flex items-start sm:items-center justify-between gap-4"
                            >
                                <div className="min-w-0 space-y-2">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <GitBranch className="h-4 w-4 text-blue-400 shrink-0" />
                                        <span className="text-base font-semibold text-white">
                                            {item.name}
                                        </span>
                                        <span
                                            className={cn(
                                                "text-[11px] font-medium px-2 py-0.5 rounded-md border",
                                                item.status === "active"
                                                    ? "border-blue-500/30 bg-blue-500/10 text-blue-300"
                                                    : "border-white/10 bg-white/5 text-slate-300"
                                            )}
                                        >
                                            {item.statusLabel}
                                        </span>
                                    </div>
                                    <p className="text-xs sm:text-sm text-slate-300">
                                        {item.goal} ·{" "}
                                        <span className="text-slate-400">{item.gateLabel}</span>
                                    </p>
                                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                                        {item.branches.map((branch) => (
                                            <span
                                                key={branch}
                                                className="text-[11px] text-slate-400 px-2 py-0.5 rounded-md bg-[#0a0a0a] border border-white/10"
                                            >
                                                {branch}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-slate-500 shrink-0 mt-1 sm:mt-0" />
                            </button>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={() => openJournal("all")}
                        className="w-full rounded-lg border border-white/10 bg-[#111113] p-4 sm:p-5 text-left hover:bg-white/[0.03] transition-colors flex items-center justify-between gap-4"
                    >
                        <div className="min-w-0">
                            <div className="flex items-center gap-2.5">
                                <ScrollText className="h-4 w-4 text-blue-400 shrink-0" />
                                <span className="text-base font-semibold text-white">
                                    Journal des envois
                                </span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-400 mt-1">
                                Voir les emails partis, les échecs, et ouvrir le document.
                            </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-slate-500 shrink-0" />
                    </button>

                    <JournalPreview onOpen={() => openJournal("all")} />
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 bg-[#0a0a0a] text-white overflow-hidden">
            <aside className="hidden xl:flex w-[240px] shrink-0 border-r border-white/10 flex-col min-h-0 bg-[#0d0d10]">
                <div className="h-12 px-3 border-b border-white/10 flex items-center">
                    <button
                        type="button"
                        onClick={() => openWorkflow(null)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Tous les workflows
                    </button>
                </div>
                <ul className="flex-1 overflow-y-auto p-2 space-y-1">
                    {WORKFLOWS.map((item) => {
                        const active = openId === item.id;
                        return (
                            <li key={item.id}>
                                <button
                                    type="button"
                                    onClick={() => openWorkflow(item.id)}
                                    className={cn(
                                        "w-full rounded-md px-3 py-2.5 text-left transition-colors",
                                        active ? "bg-white/10" : "hover:bg-white/5"
                                    )}
                                >
                                    <p className="text-sm font-semibold text-white">{item.name}</p>
                                    <p className="text-[11px] text-slate-400 mt-0.5">{item.goal}</p>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </aside>

            <div className="flex-1 min-w-0 min-h-0 flex flex-col">
                <header className="min-h-12 shrink-0 border-b border-white/10 flex flex-wrap items-center gap-2 sm:gap-3 px-3 py-2 bg-[#111113]">
                    <button
                        type="button"
                        onClick={() => openWorkflow(null)}
                        className="xl:hidden h-8 px-2 flex items-center gap-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        <span className="hidden sm:inline">Workflows</span>
                    </button>

                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{workflow.name}</p>
                        <p className="text-[11px] text-slate-400 truncate hidden sm:block">
                            Déplacez le graphe, zoomez, cliquez un bloc pour l’éditer
                        </p>
                    </div>
                    <GuideButton onClick={startTour} />

                    <div className="hidden md:flex items-center gap-3 text-[11px] text-slate-400 mr-1">
                        <span className="inline-flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-sm bg-blue-400" />
                            Email client
                        </span>
                        {workflow.id === "facture" && (
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2 w-2 rounded-sm bg-purple-400" />
                                Accord prestataire
                            </span>
                        )}
                    </div>

                    {workflow.id === "devis" && (
                        <>
                            {configQuery.isFetching && !configQuery.data && (
                                <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
                            )}
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setForm({ ...QUOTE_DEFAULTS })}
                                className="hidden sm:inline-flex h-8 px-2.5 rounded-md text-xs text-slate-300 hover:text-white hover:bg-white/5"
                                title="Revenir aux valeurs recommandées J+2 / J+5 / J+10"
                            >
                                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                                J+2 / J+5 / J+10
                            </Button>
                            <div data-tour="relance-devis-active" className="flex items-center gap-2">
                                <span className="text-[11px] text-slate-400 hidden sm:inline">
                                    Actif
                                </span>
                                <Switch
                                    checked={!!form.is_active}
                                    onCheckedChange={(checked) => setField("is_active", checked)}
                                    className="data-[state=checked]:bg-blue-600"
                                />
                            </div>
                            <Button
                                type="button"
                                data-tour="relance-devis-save"
                                onClick={() => update.mutate(form)}
                                disabled={update.isPending}
                                className="h-8 px-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-xs"
                            >
                                {update.isPending && (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                                )}
                                Sauver
                            </Button>
                        </>
                    )}
                    {workflow.id === "facture" && (
                        <span className="text-[11px] font-medium text-slate-300 px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                            J-3 / J-1 actifs
                        </span>
                    )}
                </header>

                <div className="flex-1 min-h-0 flex flex-col md:flex-row">
                    <WorkflowCanvas
                        workflowId={workflow.id}
                        form={form}
                        selected={selected}
                        onSelect={setSelected}
                        focusNodeId={focusNodeId}
                    />
                    {selected?.workflow === "devis" && workflow.id === "devis" ? (
                        <QuoteInspector
                            node={selected}
                            form={form}
                            saving={update.isPending}
                            onChange={setField}
                            onSave={() => update.mutate(form)}
                            onClose={() => setSelected(null)}
                        />
                    ) : selected?.workflow === "facture" && workflow.id === "facture" ? (
                        <InvoiceInspector
                            node={selected}
                            onClose={() => setSelected(null)}
                        />
                    ) : (
                        <InspectorEmpty />
                    )}
                </div>
            </div>
        </div>
    );
}

function GuideButton({ onClick }: { onClick: () => void }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="h-8 px-2.5 inline-flex items-center gap-1.5 rounded-md text-xs font-medium text-slate-300 hover:text-white hover:bg-white/5 border border-white/10 shrink-0"
            aria-label="Lancer le guide"
        >
            <CircleHelp className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Guide</span>
        </button>
    );
}
