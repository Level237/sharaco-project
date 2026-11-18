"use client";

import type { ReactNode } from "react";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type { ReminderConfigUpdate } from "../types";

const FIELD = "h-11 rounded-md bg-[#0c0c0e] border-white/10";

export type SelectedNode =
    | {
          workflow: "devis";
          id: "trigger" | "gate" | "stop" | "mail1" | "mail2" | "mail3" | "idle";
      }
    | {
          workflow: "facture";
          id: "trigger" | "gate" | "stop" | "j3" | "j1" | "digest" | "manual";
      };

type QuoteInspectorProps = {
    node: Extract<SelectedNode, { workflow: "devis" }>;
    form: ReminderConfigUpdate;
    saving: boolean;
    onChange: <K extends keyof ReminderConfigUpdate>(
        key: K,
        value: ReminderConfigUpdate[K]
    ) => void;
    onSave: () => void;
    onClose: () => void;
};

export function QuoteInspector({
    node,
    form,
    saving,
    onChange,
    onSave,
    onClose,
}: QuoteInspectorProps) {
    if (node.id === "trigger") {
        return (
            <InspectorShell title="Devis envoyé" onClose={onClose}>
                <p className="text-[13px] text-slate-400 leading-relaxed">
                    Le fil s’active dès l’envoi du devis par email. Aucun message de relance
                    ne part ce jour-là.
                </p>
            </InspectorShell>
        );
    }

    if (node.id === "gate") {
        return (
            <InspectorShell title="État du devis" onClose={onClose}>
                <p className="text-[13px] text-slate-400 leading-relaxed">
                    Filtre vérifié avant chaque envoi quotidien. Si le client a tranché ou
                    ouvert le devis, on sort immédiatement vers « On coupe tout ». Sinon seul
                    le prochain palier actif non envoyé est déclenché.
                </p>
            </InspectorShell>
        );
    }

    if (node.id === "stop") {
        return (
            <InspectorShell title="On coupe tout" onClose={onClose}>
                <p className="text-[13px] text-slate-400 leading-relaxed">
                    Lorsque le devis est accepté ou refusé, les relances s’arrêtent tout de
                    suite, même le jour de l’envoi. Les emails J+2, J+5 et J+10 ne partent
                    plus. L’ouverture du devis, elle, n’arrête les relances que si vous
                    activez l’option ci-dessous.
                </p>
                <div
                    data-tour="relance-field-stop-view"
                    className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-[#0c0c0e] p-3"
                >
                    <div>
                        <p className="text-sm font-semibold text-white">Couper à l’ouverture</p>
                        <p className="text-[12px] text-slate-400 mt-0.5">
                            Lorsque le client ouvre le devis sans l’accepter ni le refuser, les relances s’arrêtent aussi.
                        </p>
                    </div>
                    <Switch
                        checked={!!form.stop_on_view}
                        onCheckedChange={(checked) => onChange("stop_on_view", checked)}
                        className="data-[state=checked]:bg-blue-600"
                    />
                </div>
                <SaveRow saving={saving} onSave={onSave} />
            </InspectorShell>
        );
    }

    if (node.id === "idle") {
        return (
            <InspectorShell title="Silence" onClose={onClose}>
                <p className="text-[13px] text-slate-400 leading-relaxed">
                    Une fois les paliers actifs envoyés, le système n’insiste plus. Aucun
                    quatrième email ne partira.
                </p>
            </InspectorShell>
        );
    }

    const level = node.id === "mail1" ? 1 : node.id === "mail2" ? 2 : 3;
    const enabledKey = `reminder_${level}_enabled` as const;
    const daysKey = `reminder_${level}_days` as const;
    const subjectKey = `reminder_${level}_subject` as const;

    return (
        <InspectorShell title={`Palier ${level} · Email client`} onClose={onClose}>
            <p className="text-[13px] text-slate-400 leading-relaxed">
                Branche indépendante : si vous coupez ce palier, les suivants restent actifs
                à leur date prévue.
            </p>
            <div
                data-tour="relance-field-mail-enabled"
                className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-[#0c0c0e] p-3"
            >
                <p className="text-sm font-semibold text-white">Activer ce palier</p>
                <Switch
                    checked={!!form[enabledKey]}
                    onCheckedChange={(checked) => onChange(enabledKey, checked)}
                    className="data-[state=checked]:bg-blue-600"
                />
            </div>
            <div data-tour="relance-field-mail-days" className="space-y-1.5">
                <Label className="text-xs font-semibold">Jours après envoi</Label>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">J+</span>
                    <Input
                        type="number"
                        min={1}
                        max={60}
                        value={form[daysKey] ?? ""}
                        onChange={(e) => onChange(daysKey, Number(e.target.value) || 1)}
                        disabled={!form[enabledKey]}
                        className={FIELD}
                    />
                </div>
            </div>
            <div data-tour="relance-field-mail-subject" className="space-y-1.5">
                <Label className="text-xs font-semibold">Sujet de l’email</Label>
                <Input
                    value={form[subjectKey] ?? ""}
                    onChange={(e) => onChange(subjectKey, e.target.value)}
                    disabled={!form[enabledKey]}
                    className={FIELD}
                />
                <p className="text-[11px] text-slate-500">
                    Variables : {"{number}"} {"{company}"} {"{expiry}"}
                </p>
            </div>
            <div data-tour="relance-field-mail-save">
                <SaveRow saving={saving} onSave={onSave} />
            </div>
        </InspectorShell>
    );
}

export function InvoiceInspector({
    node,
    onClose,
}: {
    node: Extract<SelectedNode, { workflow: "facture" }>;
    onClose: () => void;
}) {
    const copy = {
        trigger: {
            title: "Facture envoyée",
            body: "Chaque facture suit son propre fil autour de sa date d’échéance J0, sans mélange avec le devis.",
        },
        gate: {
            title: "Statut facture",
            body: "Avant tout envoi, on vérifie si la facture a été marquée payée.",
        },
        stop: {
            title: "Fil arrêté",
            body: "Dès que la facture est soldée, plus aucun rappel ne part.",
        },
        j3: {
            title: "1. J-3 : Prévention",
            body: "Email automatique au client trois jours avant l’échéance avec le montant et le lien. Déjà actif.",
        },
        j1: {
            title: "2. J-1 : Rappel",
            body: "Email automatique au client la veille de l’échéance. Déjà actif.",
        },
        digest: {
            title: "3. J+1 : Digest prestataire",
            body: "Prochaine brique : après l’échéance, l’alerte part d’abord à vous (Marquer payée, Relancer, Plus tard) pour ne jamais relancer un client qui a déjà payé.",
        },
        manual: {
            title: "Relance retard",
            body: "Prochaine brique : cet email client ne part jamais tout seul. Il dépend uniquement de votre validation dans le digest.",
        },
    }[node.id];

    return (
        <InspectorShell title={copy.title} onClose={onClose}>
            <p className="text-[13px] text-slate-400 leading-relaxed">{copy.body}</p>
        </InspectorShell>
    );
}

export function InspectorEmpty() {
    return (
        <aside className="hidden md:flex w-full md:w-[320px] shrink-0 self-stretch h-full border-t md:border-t-0 md:border-l border-white/10 bg-[#111113] flex-col min-h-0">
            <div className="h-12 px-4 border-b border-white/10 flex items-center">
                <p className="text-sm font-semibold text-white">Propriétés</p>
            </div>
            <div className="flex-1 min-h-0 p-4">
                <p className="text-[13px] text-slate-400 leading-relaxed">
                    Cliquez un bloc du graphe pour modifier ses règles, délais et sujets.
                </p>
            </div>
        </aside>
    );
}

function InspectorShell({
    title,
    onClose,
    children,
}: {
    title: string;
    onClose: () => void;
    children: ReactNode;
}) {
    return (
        <aside
            data-tour="relance-inspector"
            className="w-full md:w-[320px] shrink-0 self-stretch h-full flex-1 md:flex-none border-t md:border-t-0 md:border-l border-white/10 bg-[#111113] flex flex-col min-h-0 z-20"
        >
            <div className="flex items-center justify-between gap-2 px-4 h-12 border-b border-white/10">
                <p className="text-sm font-semibold text-white truncate">{title}</p>
                <button
                    type="button"
                    onClick={onClose}
                    className="h-8 w-8 flex items-center justify-center rounded-md text-slate-400 hover:text-white hover:bg-white/5"
                    aria-label="Fermer"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>
            <div className="flex-1 min-h-0 p-4 space-y-4 overflow-y-auto">{children}</div>
        </aside>
    );
}

function SaveRow({ saving, onSave }: { saving: boolean; onSave: () => void }) {
    return (
        <Button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="w-full h-11 rounded-md bg-blue-600 hover:bg-blue-700 text-white"
        >
            {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Enregistrer
        </Button>
    );
}
