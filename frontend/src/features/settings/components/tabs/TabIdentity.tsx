"use client";

import { BrandIdentity } from "../../types";
import { UploadCloud, CheckCircle2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TabIdentityProps {
    identity: BrandIdentity;
    onChange: (field: keyof BrandIdentity, value: any) => void;
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

export function TabIdentity({ identity, onChange }: TabIdentityProps) {
    // Mock file selection for the dropzone
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            onChange("logoUrl", url);
        }
    };

    return (
        <div className="space-y-12 pb-24 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* Settings Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* Left Column: Controls */}
                <div className="space-y-10">

                    {/* Logo Section */}
                    <div className="space-y-4">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                Logo de l'entreprise
                            </h3>
                            <p className="text-sm text-slate-400 mt-1">
                                Apparaîtra sur vos devis et factures. Format recommandé : PNG (fond transparent).
                            </p>
                        </div>

                        <label className="relative flex flex-col items-center justify-center w-full h-48 bg-slate-900 border-2 border-dashed border-slate-700 hover:border-slate-500 rounded-2xl cursor-pointer transition-all overflow-hidden group">
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />

                            {identity.logoUrl ? (
                                <div className="absolute inset-0 flex items-center justify-center bg-white/5 p-4 backdrop-blur-sm">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={identity.logoUrl} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <p className="text-white font-bold text-sm">Changer l'image</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center text-slate-400 group-hover:text-slate-300">
                                    <UploadCloud className="w-10 h-10 mb-3 group-hover:scale-110 transition-transform" />
                                    <p className="font-semibold text-sm">Glissez votre logo ici ou cliquez pour uploader</p>
                                    <p className="text-xs text-slate-500 mt-1">SVG, PNG, JPG ou GIF (max. 800x400px)</p>
                                </div>
                            )}
                        </label>
                    </div>

                    <div className="h-px bg-slate-800 w-full" />

                    {/* Brand Color Section */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                Couleur de marque
                            </h3>
                            <p className="text-sm text-slate-400 mt-1">
                                Choisissez la couleur d'accentuation principale pour vos documents PDF.
                            </p>
                        </div>

                        <div className="space-y-5">
                            {/* Color Picker Native */}
                            <div className="flex items-center gap-4 p-4 bg-slate-900 rounded-2xl border border-slate-800 focus-within:border-slate-600 transition-colors">
                                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 shadow-inner">
                                    <input
                                        type="color"
                                        value={identity.brandColor}
                                        onChange={(e) => onChange("brandColor", e.target.value)}
                                        className="absolute -top-4 -left-4 w-20 h-20 cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Code HEX</p>
                                    <p className="font-mono text-white text-lg tracking-wider bg-transparent border-none p-0 outline-none">
                                        {identity.brandColor.toUpperCase()}
                                    </p>
                                </div>
                            </div>

                            {/* Suggested Colors */}
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Couleurs suggérées</p>
                                <div className="flex flex-wrap gap-3">
                                    {suggestedColors.map((color) => {
                                        const isActive = identity.brandColor.toLowerCase() === color.hex.toLowerCase();
                                        return (
                                            <button
                                                key={color.hex}
                                                onClick={() => onChange("brandColor", color.hex)}
                                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg ${isActive ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 scale-110' : ''}`}
                                                style={{ backgroundColor: color.hex }}
                                                title={color.name}
                                            >
                                                {isActive && <CheckCircle2 className="w-5 h-5 text-white drop-shadow-md" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column: Preview */}
                <div className="space-y-4 lg:sticky lg:top-8 h-fit">
                    <h3 className="text-lg font-bold text-white">Aperçu du rendu</h3>
                    <p className="text-sm text-slate-400">Voici comment l'en-tête de vos devis apparaîtra.</p>

                    <div className="w-full bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-2xl overflow-hidden relative group">

                        {/* Mock A4 Paper Header */}
                        <div className="bg-white w-full rounded-t-lg shadow-sm overflow-hidden relative">
                            {/* Dynamic colored accent header */}
                            <div
                                className="h-3 w-full transition-colors duration-500"
                                style={{ backgroundColor: identity.brandColor }}
                            />

                            <div className="p-8 flex justify-between items-start">
                                <div className="w-40 h-16 flex items-center">
                                    {identity.logoUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={identity.logoUrl} alt="Your Logo" className="max-h-full max-w-full object-contain" />
                                    ) : (
                                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: identity.brandColor }}>
                                            <span className="text-white font-black text-xl">S</span>
                                        </div>
                                    )}
                                </div>

                                <div className="text-right">
                                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">DEVIS</h1>
                                    <p className="text-xs text-slate-500 font-mono tracking-widest bg-slate-100 inline-block px-2 py-1 rounded border border-slate-200">
                                        RÉF-XXXX
                                    </p>
                                </div>
                            </div>

                            <div className="px-8 pb-8 space-y-2 opacity-50">
                                <div className="h-2 bg-slate-200 rounded w-1/3"></div>
                                <div className="h-2 bg-slate-200 rounded w-1/4"></div>
                                <div className="h-2 bg-slate-200 rounded w-1/5"></div>
                            </div>

                            {/* Decorative overlay for mock effect */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/50 pointer-events-none" />
                        </div>

                    </div>
                </div>

            </div>

            {/* Action Footer */}
            <div className="fixed bottom-0 left-72 right-0 p-6 bg-slate-950/80 backdrop-blur-xl border-t border-slate-800 flex justify-end">
                <Button
                    className="h-12 px-8 rounded-2xl text-white font-bold tracking-wide shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] transition-all hover:-translate-y-0.5"
                    style={{ backgroundColor: identity.brandColor, boxShadow: `0 10px 30px -10px ${identity.brandColor}` }}
                >
                    <Save className="w-5 h-5 mr-2" />
                    Sauvegarder les modifications
                </Button>
            </div>

        </div>
    );
}
