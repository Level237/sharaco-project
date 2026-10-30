"use client"

import { CheckCircle2, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import type { ContractDraft, ContractRule } from "../types"
import { quotesApi } from "@/features/quotes/api/quotesApi"
import { CONTRACT_KINDS, contractKindMeta, type ContractKind } from "../kinds"
import { CONTRACT_BRAND_COLORS } from "../brandColors"

interface ContractSidebarProps {
    draft: ContractDraft;
    onChange: (patch: Partial<ContractDraft>) => void;
    isMobile?: boolean;
}

export function ContractSidebar({ draft, onChange, isMobile = false }: ContractSidebarProps) {
    const kind = contractKindMeta(draft.layoutStyle);

    const changeKind = (next: ContractKind) => {
        onChange({ layoutStyle: next })
        void quotesApi.getContractDefaultRules(next).then((rules) => {
            onChange({ layoutStyle: next, rules })
        }).catch(() => {
            onChange({ layoutStyle: next })
        })
    };

    const updateItem = (id: string, description: string) => {
        onChange({
            items: draft.items.map((item) => (item.id === id ? { ...item, description } : item)),
        });
    };

    const updateRule = (index: number, patch: Partial<ContractRule>) => {
        onChange({
            rules: draft.rules.map((rule, i) => (i === index ? { ...rule, ...patch } : rule)),
        });
    };

    return (
        <div
            className={cn(
                "flex h-full min-h-0 flex-col overflow-y-auto bg-[#0c0d10] px-4 py-5 sm:px-5 sm:py-6",
                !isMobile && "border-r border-white/10"
            )}
        >
            {!isMobile && (
                <>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">Contrat</p>
                    <h2 className="mt-1 truncate text-lg font-semibold text-white">{draft.number || "Brouillon"}</h2>
                    <p className="mt-1 truncate text-sm text-slate-400">{draft.clientName || "Client du projet"}</p>
                    {(draft.signatureRevision || 1) > 1 && (
                        <p className="mt-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                            Version {draft.signatureRevision}
                        </p>
                    )}
                    <div className="mt-3 space-y-1 text-xs text-zinc-400">
                        <p>
                            Prestataire :{" "}
                            {draft.providerSignatureName
                                ? `signé par ${draft.providerSignatureName}`
                                : "en attente"}
                        </p>
                        <p>
                            Client :{" "}
                            {draft.signatureName ? `signé par ${draft.signatureName}` : "en attente"}
                        </p>
                    </div>
                </>
            )}

            <div className={cn("space-y-2", isMobile ? "mt-1" : "mt-8")}>
                <Label className="text-slate-300">Type</Label>
                <select
                    value={kind.id}
                    onChange={(event) => changeKind(event.target.value as ContractKind)}
                    className="h-11 w-full rounded-md border border-white/10 bg-white/5 px-3 text-base text-white"
                >
                    {CONTRACT_KINDS.map((row) => (
                        <option key={row.id} value={row.id} className="bg-zinc-950 text-white">
                            {row.title}
                        </option>
                    ))}
                </select>
                <p className="text-xs text-slate-500">Changer de type remplace les articles proposés.</p>
            </div>

            <div className="mt-6 space-y-3">
                <Label className="text-slate-300">Couleur d’accent</Label>
                <div className="flex flex-wrap gap-2.5">
                    {CONTRACT_BRAND_COLORS.map((color) => {
                        const isActive = draft.brandColor?.toLowerCase() === color.value.toLowerCase()
                        return (
                            <button
                                key={color.value}
                                type="button"
                                title={color.name}
                                onClick={() => onChange({ brandColor: color.value })}
                                className={cn(
                                    "h-8 w-8 rounded-full border-2 transition-transform hover:scale-110",
                                    isActive ? "border-white scale-110" : "border-transparent"
                                )}
                                style={{ backgroundColor: color.value }}
                            >
                                {isActive ? <CheckCircle2 className="mx-auto h-4 w-4 text-white" /> : null}
                            </button>
                        )
                    })}
                </div>
                <div className="flex w-fit items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-2.5">
                    <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded-md border border-white/10">
                        <input
                            type="color"
                            value={draft.brandColor || "#2563EB"}
                            onChange={(event) => onChange({ brandColor: event.target.value })}
                            className="absolute -left-2 -top-2 h-14 w-14 cursor-pointer"
                            aria-label="Couleur personnalisée"
                        />
                    </div>
                    <p className="font-mono text-sm font-semibold tracking-wider text-white">
                        {(draft.brandColor || "#2563EB").toUpperCase()}
                    </p>
                </div>
            </div>

            <div className="mt-6 space-y-2">
                <Label className="text-slate-300">{kind.dateLabel}</Label>
                <Input
                    type="date"
                    value={draft.endDate}
                    onChange={(event) => onChange({ endDate: event.target.value })}
                    className="h-11 min-w-0 border-white/10 bg-white/5 text-base text-white"
                />
            </div>

            <section className="mt-8">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <Label className="text-slate-300">{kind.itemsLabel}</Label>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-10 shrink-0 text-slate-300"
                        onClick={() => onChange({ items: [...draft.items, { id: crypto.randomUUID(), description: "" }] })}
                    >
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Ajouter
                    </Button>
                </div>
                <p className="mb-3 text-xs text-slate-500">Facultatif. Laissez vide si le contrat ne détaille pas les tâches.</p>
                <div className="space-y-2">
                    {draft.items.map((item) => (
                        <div key={item.id} className="flex min-w-0 items-center gap-2">
                            <Input
                                value={item.description}
                                placeholder="Intitulé"
                                onChange={(event) => updateItem(item.id, event.target.value)}
                                className="h-11 min-w-0 flex-1 border-white/10 bg-white/5 text-base text-white"
                            />
                            <button
                                type="button"
                                aria-label="Retirer la prestation"
                                className="flex h-11 w-11 shrink-0 items-center justify-center text-slate-500 hover:text-rose-400"
                                onClick={() => onChange({ items: draft.items.filter((row) => row.id !== item.id) })}
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <section className="mt-8">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <Label className="min-w-0 text-slate-300">Règlement intérieur</Label>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-10 shrink-0 text-slate-300"
                        onClick={() => onChange({ rules: [...draft.rules, { title: "", body: "" }] })}
                    >
                        <Plus className="mr-1 h-3.5 w-3.5" />
                        Article
                    </Button>
                </div>
                <p className="mb-3 text-xs text-slate-500">Chaque article a un titre et une description.</p>
                <div className="space-y-4">
                    {draft.rules.map((rule, index) => (
                        <div key={index} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
                            <div className="mb-2 flex items-center justify-between gap-2">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    Article {index + 1}
                                </p>
                                <button
                                    type="button"
                                    aria-label="Retirer l'article"
                                    className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-500 hover:text-rose-400"
                                    onClick={() => onChange({ rules: draft.rules.filter((_, i) => i !== index) })}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                            <Input
                                value={rule.title}
                                placeholder="Titre"
                                onChange={(event) => updateRule(index, { title: event.target.value })}
                                className="mb-2 h-11 border-white/10 bg-white/5 text-base font-semibold text-white"
                            />
                            <Textarea
                                value={rule.body}
                                placeholder="Description"
                                rows={4}
                                onChange={(event) => updateRule(index, { body: event.target.value })}
                                className="min-h-[96px] border-white/10 bg-white/5 text-base text-white"
                            />
                        </div>
                    ))}
                </div>
            </section>

            <section className="mt-8 pb-24 sm:pb-10">
                <Label className="text-slate-300">Conditions particulières</Label>
                <Textarea
                    value={draft.notes}
                    placeholder="Mentions libres, hors règlement intérieur"
                    rows={5}
                    onChange={(event) => onChange({ notes: event.target.value })}
                    className="mt-2 min-h-[120px] border-white/10 bg-white/5 text-base text-white"
                />
            </section>
        </div>
    );
}
