"use client";

import { QuoteDraft } from "../../../types/QuoteBuilder";
import { UploadCloud, CheckCircle2 } from "lucide-react";

interface TabDesignProps {
    draft: QuoteDraft;
    onChange: (field: keyof QuoteDraft, value: any) => void;
}

const suggestedColors = [
    { name: "Indigo", hex: "#6366f1" },
    { name: "Bleu", hex: "#3b82f6" },
    { name: "Violet", hex: "#8b5cf6" },
    { name: "Émeraude", hex: "#10b981" },
    { name: "Rose", hex: "#ec4899" },
    { name: "Orange", hex: "#f97316" },
    { name: "Ardoise", hex: "#64748b" },
];

export function TabDesign({ draft, onChange }: TabDesignProps) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            onChange("logoUrl", url);
        }
    };

    return (
        <div className="space-y-10 pb-32 animate-in fade-in duration-500">
            {/* Header Description */}
            <div className="space-y-1">
                <h3 className="text-lg font-bold text-white tracking-tight">Apparence du document</h3>
                <p className="text-sm text-slate-400">Personnalisez le logo et la couleur d'accentuation de ce devis. Le rendu est visible en temps réel sur la page de droite.</p>
            </div>

            {/* Logo Section */}
            <div className="space-y-4">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    Logo de l'entreprise
                </label>

                <label className="relative flex flex-col items-center justify-center w-full h-40 bg-slate-900 border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-2xl cursor-pointer transition-all overflow-hidden group">
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />

                    {draft.logoUrl ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950 p-4 backdrop-blur-sm">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={draft.logoUrl} alt="Logo preview" className="max-h-full max-w-full object-contain drop-shadow-md" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                                <p className="text-white font-bold text-sm bg-black/50 px-4 py-2 rounded-lg backdrop-blur-md border border-white/20">Changer l'image</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-slate-300 transition-colors">
                            <UploadCloud className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform duration-300 text-slate-500" />
                            <p className="font-bold text-sm">Cliquez pour uploader un logo</p>
                            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest">SVG, PNG, JPG</p>
                        </div>
                    )}
                </label>
            </div>

            <div className="h-px w-full bg-slate-800" />

            {/* Brand Color Section */}
            <div className="space-y-6">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    Couleur d'accentuation
                </label>

                <div className="space-y-6">
                    {/* Suggested Colors */}
                    <div>
                        <div className="flex flex-wrap gap-4">
                            {suggestedColors.map((color) => {
                                const isActive = draft.brandColor?.toLowerCase() === color.hex.toLowerCase();
                                return (
                                    <button
                                        key={color.hex}
                                        onClick={() => onChange("brandColor", color.hex)}
                                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg ${isActive ? 'ring-2 ring-white ring-offset-4 ring-offset-slate-950 scale-110 shadow-xl' : ''}`}
                                        style={{ backgroundColor: color.hex, boxShadow: isActive ? `0 0 20px -5px ${color.hex}` : '' }}
                                        title={color.name}
                                    >
                                        {isActive && <CheckCircle2 className="w-6 h-6 text-white drop-shadow-md" />}
                                    </button>
                                )
                            })}
                        </div>
                    </div>

                    {/* Custom Color Input */}
                    <div className="flex items-center gap-4 p-4 bg-slate-900/50 rounded-2xl border border-slate-800 focus-within:border-slate-500 transition-colors w-fit group">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 shadow-inner border border-white/10 group-hover:scale-105 transition-transform">
                            <input
                                type="color"
                                value={draft.brandColor || "#000000"}
                                onChange={(e) => onChange("brandColor", e.target.value)}
                                className="absolute -top-4 -left-4 w-20 h-20 cursor-pointer"
                            />
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Couleur personnalisée</p>
                            <p className="font-mono text-white text-sm font-bold tracking-wider">
                                {draft.brandColor?.toUpperCase() || "#000000"}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
