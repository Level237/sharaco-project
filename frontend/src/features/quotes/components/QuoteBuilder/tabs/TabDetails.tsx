"use client";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { QuoteDraft } from "../../../types/QuoteBuilder";
import { Calendar, Hash, Info, ScrollText, User } from "lucide-react";

interface TabDetailsProps {
    draft: QuoteDraft;
    onChange: (field: keyof QuoteDraft, value: any) => void;
}

export function TabDetails({ draft, onChange }: TabDetailsProps) {
    return (
        <div className="space-y-10 pb-32">
            {/* Header Description */}
            <div className="space-y-1">
                <h3 className="text-lg font-bold text-white tracking-tight">Quotation Details</h3>
                <p className="text-sm text-zinc-500">Configure core document metadata, dates, and administrative settings.</p>
            </div>

            <div className="space-y-6">
                {/* Reference Section */}
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <Hash className="h-3 w-3" strokeWidth={3} /> Quotation Reference
                    </label>
                    <Input
                        value={draft.reference}
                        readOnly
                        className="h-11 bg-white/[0.02] border-white/5 text-zinc-400 focus:border-white/10 rounded-xl cursor-not-allowed font-mono text-xs"
                        placeholder="AUTO-GENERATED"
                    />
                </div>

                {/* Dates Grid */}
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <Calendar className="h-3 w-3" /> Issue Date
                        </label>
                        <Input
                            type="date"
                            value={draft.date}
                            onChange={(e) => onChange("date", e.target.value)}
                            className="h-11 bg-white/[0.02] border-white/5 text-zinc-200 focus:border-white/10 rounded-xl font-medium"
                        />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <ScrollText className="h-3 w-3" /> Validity (Days)
                        </label>
                        <Input
                            type="number"
                            min="1"
                            value={draft.validityDays}
                            onChange={(e) => onChange("validityDays", parseInt(e.target.value) || 0)}
                            className="h-11 bg-white/[0.02] border-white/5 text-zinc-200 focus:border-white/10 rounded-xl font-medium"
                        />
                    </div>
                </div>

                {/* Tax Settings */}
                <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                    <div className="space-y-1">
                        <label className="text-sm font-bold text-zinc-100 tracking-tight cursor-pointer" htmlFor="tax-exempt">Tax Exempt Status</label>
                        <p className="text-[11px] text-zinc-500 leading-relaxed">Toggle for VAT exemption (e.g. Small Business Scheme).</p>
                    </div>
                    <Switch
                        id="tax-exempt"
                        checked={draft.isTaxExempt}
                        onCheckedChange={(checked) => onChange("isTaxExempt", checked)}
                        className="data-[state=checked]:bg-sky-500"
                    />
                </div>

                <div className="h-px w-full bg-white/5 my-8" />

                {/* User Profile / Sender Info */}
                <div className="space-y-4">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                        <User className="h-3 w-3" /> Profil Utilisateur (Émetteur)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            placeholder="Nom de l'émetteur"
                            value={draft.senderName || ""}
                            onChange={(e) => onChange("senderName", e.target.value)}
                            className="h-11 bg-white/[0.02] border-white/5 text-zinc-200 focus:border-white/10 rounded-xl"
                        />
                        <Input
                            placeholder="Email de l'émetteur"
                            type="email"
                            value={draft.senderEmail || ""}
                            onChange={(e) => onChange("senderEmail", e.target.value)}
                            className="h-11 bg-white/[0.02] border-white/5 text-zinc-200 focus:border-white/10 rounded-xl"
                        />
                        <Input
                            placeholder="Téléphone de l'émetteur"
                            value={draft.senderPhone || ""}
                            onChange={(e) => onChange("senderPhone", e.target.value)}
                            className="h-11 bg-white/[0.02] border-white/5 text-zinc-200 focus:border-white/10 rounded-xl"
                        />
                        <Input
                            placeholder="Adresse de l'émetteur"
                            value={draft.senderAddress || ""}
                            onChange={(e) => onChange("senderAddress", e.target.value)}
                            className="h-11 bg-white/[0.02] border-white/5 text-zinc-200 focus:border-white/10 rounded-xl"
                        />
                    </div>
                </div>

                <div className="h-px w-full bg-white/5 my-8" />

                {/* Internal Notes */}
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                        Internal Workflow Notes
                    </label>
                    <Textarea
                        placeholder="Project milestones, special conditions, internal follow-up..."
                        value={draft.internalNotes}
                        onChange={(e) => onChange("internalNotes", e.target.value)}
                        className="bg-white/[0.02] border-white/5 text-zinc-200 focus:border-white/10 rounded-2xl min-h-[140px] resize-none p-4 leading-relaxed placeholder:text-zinc-700"
                    />
                    <div className="flex items-start gap-2 pt-1">
                        <Info className="h-3.5 w-3.5 text-zinc-600 shrink-0 mt-0.5" />
                        <p className="text-[10px] text-zinc-600 font-medium leading-relaxed">
                            These notes are strictly for internal use and will never appear on the final generated document.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
