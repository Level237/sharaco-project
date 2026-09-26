// app/dashboard/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { useUpdateProfile, useChangePassword } from "@/features/settings/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Loader2, User, Building2, Lock, ArrowLeft, Globe, Eye,
} from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/features/quotes/lib/formatCurrency";
import {
    COUNTRY_CURRENCY,
    CURRENCY_LABELS,
    detectCurrency,
} from "@/lib/currency";

export default function SettingsPage() {
    const { data: user, isLoading } = useCurrentUser();
    const updateProfile = useUpdateProfile();
    const changePassword = useChangePassword();
    const { toast } = useToast();

    const [form, setForm] = useState({
        full_name: "",
        email: "",
        company_name: "",
        address: "",
        tax_id: "",
        payment_info: "",
        country: "",
        currency: "XOF",
    });

    const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });

    // Pré-remplir quand le user charge
    useEffect(() => {
        if (user) {
            // ✅ Détection auto au premier chargement si pas de pays
            const detectedCountry =
                user.country ||
                (typeof navigator !== "undefined"
                    ? (navigator.language || "").split("-")[1]?.toUpperCase() || ""
                    : "");

            setForm({
                full_name: user.full_name || "",
                email: user.email || "",
                company_name: user.company_name || "",
                address: user.address || "",
                tax_id: user.tax_id || "",
                payment_info: user.payment_info || "",
                country: detectedCountry || "SN",
                currency:
                    user.currency ||
                    COUNTRY_CURRENCY[detectedCountry] ||
                    detectCurrency("XOF"),
            });
        }
    }, [user]);

    const set = (key: keyof typeof form) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => setForm({ ...form, [key]: e.target.value });

    const handleCountryChange = (country: string) => {
        setForm({
            ...form,
            country,
            currency: COUNTRY_CURRENCY[country] || "XOF",
        });
    };

    const handleSaveProfile = (e: React.FormEvent) => {
        e.preventDefault();
        updateProfile.mutate(form);
    };

    const handleSavePassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (pwd.next !== pwd.confirm) {
            toast({
                title: "Attention",
                description: "Les mots de passe ne correspondent pas.",
                variant: "destructive",
            });
            return;
        }
        changePassword.mutate(
            { current_password: pwd.current, new_password: pwd.next },
            { onSuccess: () => setPwd({ current: "", next: "", confirm: "" }) }
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] bg-[#FAFAFA] dark:bg-[#0A0A0A] text-slate-900 dark:text-slate-100">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                {/* ═══════════ HEADER ═══════════ */}
                <div className="flex items-center gap-3 mb-6 sm:mb-8">
                    <Link
                        href="/dashboard"
                        className="p-2 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                            Mon profil
                        </h1>
                        <p className="text-xs sm:text-sm text-slate-500">
                            Ces informations apparaissent sur vos devis et factures.
                        </p>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* ═══════════ CARTE 1 : INFOS PERSONNELLES ═══════════ */}
                    <form
                        onSubmit={handleSaveProfile}
                        className="bg-white dark:bg-[#0b0b0b] rounded-2xl border border-slate-100 dark:border-slate-800 p-5 sm:p-6 space-y-5 shadow-sm hover:shadow-md transition"
                    >
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-sky-500" />
                            <h2 className="text-sm font-bold text-slate-500">
                                Informations personnelles
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Nom complet</Label>
                                <Input
                                    value={form.full_name}
                                    onChange={set("full_name")}
                                    placeholder="Jean Dupont"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Email (identifiant)</Label>
                                <Input
                                    type="email"
                                    value={form.email}
                                    onChange={set("email")}
                                    placeholder="jean@entreprise.com"
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={updateProfile.isPending}
                            className="w-full sm:w-auto h-11 rounded-xl bg-sky-600 hover:bg-sky-700 text-white"
                        >
                            {updateProfile.isPending && (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            )}
                            Enregistrer
                        </Button>
                    </form>

                    {/* ═══════════ CARTE 2 : ENTREPRISE + DEVISE ═══════════ */}
                    <form
                        onSubmit={handleSaveProfile}
                        className="bg-white dark:bg-[#0b0b0b] rounded-2xl border border-slate-100 dark:border-slate-800 p-5 sm:p-6 space-y-5 shadow-sm hover:shadow-md transition"
                    >
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4 text-sky-500" />
                            <h2 className="text-sm font-bold text-slate-500">Entreprise</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Nom de l'entreprise</Label>
                                <Input
                                    value={form.company_name}
                                    onChange={set("company_name")}
                                    placeholder="Sharaco Inc"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">SIRET / NIF</Label>
                                <Input
                                    value={form.tax_id}
                                    onChange={set("tax_id")}
                                    placeholder="123 456 789 00012"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">Adresse</Label>
                            <Textarea
                                value={form.address}
                                onChange={set("address")}
                                placeholder={
                                    "Entrez votre adresse complète ici.\nExemple:\n123 Rue de la Paix\n75000 Paris\nFrance"
                                }
                                rows={2}
                                className="rounded-xl border border-slate-800 resize-none"
                            />
                        </div>

                        {/* ═══════════ PAYS + DEVISE ═══════════ */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold flex items-center gap-1.5">
                                    <Globe className="h-3 w-3" /> Pays
                                </Label>
                                <Select value={form.country} onValueChange={handleCountryChange}>
                                    <SelectTrigger className="h-11 rounded-xl">
                                        <SelectValue placeholder="Choisir votre pays" />
                                    </SelectTrigger>
                                    <SelectContent className="max-h-[300px] bg-slate-900">
                                        {Object.keys(COUNTRY_CURRENCY).map((code) => (
                                            <SelectItem key={code} value={code}>
                                                {code} — {CURRENCY_LABELS[COUNTRY_CURRENCY[code]]}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Devise</Label>
                                <div className="h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex items-center px-3 text-sm font-semibold text-sky-600 dark:text-sky-400">
                                    {CURRENCY_LABELS[form.currency] || form.currency}
                                </div>
                                <p className="text-[11px] text-slate-500 flex items-center gap-1">
                                    <Eye className="h-3 w-3" />
                                    Aperçu :{" "}
                                    <span className="font-bold">
                                        {formatCurrency(1500000, form.currency)}
                                    </span>
                                </p>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label className="text-xs font-semibold">
                                Coordonnées de paiement (IBAN, Mobile Money...)
                            </Label>
                            <Textarea
                                value={form.payment_info}
                                onChange={set("payment_info")}
                                placeholder={"IBAN: FR76 1234 5678 9012 3456 7890 123\nBIC: ABCDFR21"}
                                rows={3}
                                className="rounded-xl border border-slate-800 resize-none"
                            />
                            <p className="text-[11px] text-slate-500">
                                Affichées en bas de vos factures et devis.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            disabled={updateProfile.isPending}
                            className="w-full sm:w-auto h-11 rounded-xl bg-sky-600 hover:bg-sky-700 text-white"
                        >
                            {updateProfile.isPending && (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            )}
                            Enregistrer
                        </Button>
                    </form>

                    {/* ═══════════ CARTE 3 : MOT DE PASSE ═══════════ */}
                    <form
                        onSubmit={handleSavePassword}
                        className="bg-white dark:bg-[#0b0b0b] rounded-2xl border border-slate-100 dark:border-slate-800 p-5 sm:p-6 space-y-5 shadow-sm hover:shadow-md transition"
                    >
                        <div className="flex items-center gap-2">
                            <Lock className="h-4 w-4 text-sky-500" />
                            <h2 className="text-sm font-bold text-slate-500">Mot de passe</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Actuel</Label>
                                <Input
                                    type="password"
                                    value={pwd.current}
                                    onChange={(e) => setPwd({ ...pwd, current: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Nouveau</Label>
                                <Input
                                    type="password"
                                    value={pwd.next}
                                    onChange={(e) => setPwd({ ...pwd, next: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Confirmer</Label>
                                <Input
                                    type="password"
                                    value={pwd.confirm}
                                    onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={changePassword.isPending}
                            variant="outline"
                            className="w-full sm:w-auto h-11 rounded-xl"
                        >
                            {changePassword.isPending && (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            )}
                            Changer le mot de passe
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}