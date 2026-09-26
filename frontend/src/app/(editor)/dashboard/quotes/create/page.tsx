// app/dashboard/quotes/create/page.tsx
"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { TemplateSelector } from "@/features/templates/components/TemplateSelector";
import { quotesApi } from "@/features/quotes/api/quotesApi";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { projectsApi } from "@/features/projects/api/projectsApi";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useClients, useCreateClient } from "@/features/clients/hooks/useClients";
import { User, Mail, Phone, MapPin } from "lucide-react";

function QuoteBuilderContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { toast } = useToast();

    const isChoosing = searchParams.has('choose-template');
    const [isCreating, setIsCreating] = useState(false);
    const [selectedProjectId, setSelectedProjectId] = useState<string>("");

    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [selectedLayoutStyle, setSelectedLayoutStyle] = useState<string>("");

    const { data: clientsData } = useClients();
    const clients = clientsData?.items || clientsData || [];
    const [clientMode, setClientMode] = useState<"select" | "create">("create");
    const [selectedClientIdModal, setSelectedClientIdModal] = useState<string>("");

    const [newClient, setNewClient] = useState({ name: "", email: "", phone: "", address: "" });
    const createClient = useCreateClient();

    const { data: projects = [] } = useQuery({
        queryKey: ['projects'],
        queryFn: () => projectsApi.getAll(),
    });

    if (!isChoosing) {
        return (
            <>
                <TemplateSelector onSelect={handleSelectTemplate} />
                {renderClientModal()}
                {isCreating && !isClientModalOpen && (
                    <div className="fixed inset-0 z-50 flex h-[100dvh] w-screen items-center justify-center bg-zinc-950/80 backdrop-blur-sm p-4">
                        <div className="flex flex-col items-center gap-3 sm:gap-4 text-center max-w-xs">
                            <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-[#2563EB] animate-spin" />
                            <p className="text-zinc-300 font-bold text-base sm:text-lg mt-2 sm:mt-4">Veuillez patienter...</p>
                            <p className="text-zinc-500 font-medium text-sm">Nous vous redirigeons vers l'éditeur de devis</p>
                        </div>
                    </div>
                )}
            </>
        );
    }

    async function handleSelectTemplate(layoutStyle: string) {
        setSelectedLayoutStyle(layoutStyle);
        if (selectedProjectId) {
            await createQuoteWithProject(layoutStyle, selectedProjectId);
        } else {
            if (clients && clients.length > 0) {
                setClientMode("select");
            } else {
                setClientMode("create");
            }
            setIsClientModalOpen(true);
        }
    }

    async function createQuoteWithProject(layoutStyle: string, projectId: string) {
        setIsCreating(true);
        try {
            const document = await quotesApi.create({
                type: "DEVIS",
                layout_style: layoutStyle,
                project_id: projectId,
                items: [{ description: "", quantity: 1, unit_price_cents: 0, tax_rate: 0 }],
                notes: ""
            });
            router.push(`/dashboard/quotes/${document.id}`);
        } catch (error: any) {
            toast({ title: "Erreur", description: error.message, variant: "destructive" });
            setIsCreating(false);
        }
    }

    async function handleCreateClientAndQuote() {
        if (clientMode === "create" && !newClient.name) {
            toast({ title: "Attention", description: "Le nom du client est obligatoire.", variant: "destructive" });
            return;
        }
        if (clientMode === "select" && !selectedClientIdModal) {
            toast({ title: "Attention", description: "Veuillez sélectionner un client.", variant: "destructive" });
            return;
        }

        setIsCreating(true);

        try {
            let finalClientId = selectedClientIdModal;

            if (clientMode === "create") {
                const clientResponse = await createClient.mutateAsync(newClient);
                finalClientId = clientResponse.id;
            }

            const document = await quotesApi.create({
                type: "DEVIS",
                layout_style: selectedLayoutStyle,
                client_id: finalClientId,
                items: [{ description: "", quantity: 1, unit_price_cents: 0, tax_rate: 0 }],
                notes: ""
            });

            router.push(`/dashboard/quotes/create/${document.id}`);
        } catch (error: any) {
            console.error("❌ Erreur création:", error);
            toast({
                title: "Erreur",
                description: "Impossible de finaliser la création.",
                variant: "destructive",
            });
            setIsCreating(false);
        }
    }

    function renderClientModal() {
        return (
            <Dialog open={isClientModalOpen} onOpenChange={(open) => !isCreating && setIsClientModalOpen(open)}>
                <DialogContent className="max-w-[92vw] sm:max-w-[425px] bg-white dark:bg-zinc-950 border-white/10 shadow-2xl rounded-[1.5rem] sm:rounded-[2rem] p-0 overflow-hidden !z-[9999] max-h-[90dvh] overflow-y-auto">
                    <div className="h-1.5 sm:h-2 bg-gradient-to-r from-[#2563EB] to-indigo-500 w-full" />

                    {isCreating ? (
                        <div className="p-8 sm:p-12 flex flex-col items-center justify-center text-center space-y-3 sm:space-y-4">
                            <div className="relative mb-2">
                                <div className="absolute inset-0 bg-[#2563EB]/20 blur-xl rounded-full" />
                                <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-[#2563EB] animate-spin relative z-10" />
                            </div>
                            <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-2 sm:mt-4">
                                Création en cours...
                            </DialogTitle>
                            <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 font-medium px-4">
                                Veuillez patienter pendant que nous générons votre devis et vous redirigeons vers l'éditeur.
                            </DialogDescription>
                        </div>
                    ) : (
                        <div className="p-4 sm:p-6">
                            <DialogHeader className="mb-4 sm:mb-6 text-left">
                                <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                    Pour qui créez-vous ce devis ?
                                </DialogTitle>
                                <DialogDescription className="text-sm text-slate-500 dark:text-slate-400">
                                    {clientMode === "select"
                                        ? "Sélectionnez un client existant pour votre devis."
                                        : "Ajoutez les informations du client pour pouvoir finaliser la création du devis."}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-3 sm:space-y-4">
                                {clientMode === "select" ? (
                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                Client *
                                            </Label>
                                            <Select value={selectedClientIdModal} onValueChange={setSelectedClientIdModal}>
                                                <SelectTrigger className="h-11 sm:h-12 bg-slate-50 dark:bg-zinc-900/50 border-slate-200 dark:border-white/5 rounded-xl text-sm">
                                                    <SelectValue placeholder="Sélectionnez un client" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 z-[10000]">
                                                    {clients.map((client: any) => (
                                                        <SelectItem key={client.id} value={client.id}>
                                                            {client.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="pt-2 text-center">
                                            <button
                                                type="button"
                                                onClick={() => setClientMode("create")}
                                                className="text-sm font-bold text-[#2563EB] hover:text-indigo-500 transition-colors"
                                            >
                                                + Ou créer un nouveau client
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <Label className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                Nom complet / Entreprise *
                                            </Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    className="pl-10 h-11 sm:h-12 bg-slate-50 dark:bg-zinc-900/50 border-slate-200 dark:border-white/5 rounded-xl focus:border-[#2563EB] focus:ring-[#2563EB] text-sm"
                                                    placeholder="Nom Client ou Nom de l'entreprise"
                                                    value={newClient.name}
                                                    onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                Email
                                            </Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                <Input
                                                    type="email"
                                                    className="pl-10 h-11 sm:h-12 bg-slate-50 dark:bg-zinc-900/50 border-slate-200 dark:border-white/5 rounded-xl focus:border-[#2563EB] focus:ring-[#2563EB] text-sm"
                                                    placeholder="contact@client.com"
                                                    value={newClient.email}
                                                    onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* ✅ Grille responsive : stack mobile, 2 cols desktop */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                    Téléphone
                                                </Label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        className="pl-10 h-11 sm:h-12 bg-slate-50 dark:bg-zinc-900/50 border-slate-200 dark:border-white/5 rounded-xl focus:border-[#2563EB] focus:ring-[#2563EB] text-sm"
                                                        placeholder="+33 6..."
                                                        value={newClient.phone}
                                                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                    Adresse
                                                </Label>
                                                <div className="relative">
                                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                                    <Input
                                                        className="pl-10 h-11 sm:h-12 bg-slate-50 dark:bg-zinc-900/50 border-slate-200 dark:border-white/5 rounded-xl focus:border-[#2563EB] focus:ring-[#2563EB] text-sm"
                                                        placeholder="123 rue..."
                                                        value={newClient.address}
                                                        onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {clients && clients.length > 0 && (
                                            <div className="pt-2 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setClientMode("select")}
                                                    className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                                                >
                                                    ← Retour à la sélection d'un client
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>

                            <DialogFooter className="mt-6 sm:mt-8 flex gap-2 sm:gap-3 sm:justify-start flex-col-reverse sm:flex-row">
                                <Button
                                    variant="outline"
                                    onClick={() => setIsClientModalOpen(false)}
                                    className="flex-1 h-11 sm:h-12 rounded-xl border-slate-200 dark:border-white/5 font-bold text-sm w-full"
                                >
                                    Annuler
                                </Button>
                                <Button
                                    onClick={handleCreateClientAndQuote}
                                    disabled={createClient.isPending || (clientMode === "create" && !newClient.name) || (clientMode === "select" && !selectedClientIdModal)}
                                    className="flex-1 h-11 sm:h-12 bg-[#2563EB] hover:bg-[#2563EB]/80 text-white font-bold rounded-xl text-sm w-full"
                                >
                                    {createClient.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Créer et Continuer"}
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-950 p-4 sm:p-6 md:p-8 relative">
            {isCreating && !isClientModalOpen && (
                <div className="fixed inset-0 z-50 flex h-[100dvh] w-screen items-center justify-center bg-zinc-950/80 backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-4 text-center px-4">
                        <Loader2 className="h-10 w-10 sm:h-12 sm:w-12 text-[#2563EB] animate-spin" />
                        <p className="text-zinc-300 font-bold text-base sm:text-lg mt-4">Veuillez patienter...</p>
                        <p className="text-zinc-500 font-medium text-sm">Nous vous redirigeons vers l'éditeur de devis</p>
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
                {/* Sélecteur de projet */}
                {projects.length > 0 && (
                    <Card className="bg-zinc-900 border-zinc-800">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-white text-base sm:text-lg">Projet associé (optionnel)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Label className="text-zinc-400 mb-2 block text-xs sm:text-sm">Sélectionner un projet</Label>
                            <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white h-11">
                                    <SelectValue placeholder="Aucun projet" />
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-800 border-zinc-700">
                                    <SelectItem value="">Aucun projet</SelectItem>
                                    {projects.map((project: any) => (
                                        <SelectItem key={project.id} value={project.id}>
                                            {project.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-[11px] sm:text-xs text-zinc-500 mt-2">
                                Si vous sélectionnez un projet, le client sera automatiquement récupéré.
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Sélecteur de template */}
                <Card className="bg-zinc-900 border-zinc-800">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-white text-base sm:text-lg">Choisir un modèle</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TemplateSelector onSelect={handleSelectTemplate} />
                    </CardContent>
                </Card>
            </div>
            {renderClientModal()}
        </div>
    );
}

export default function LiveQuoteBuilderPage() {
    return (
        <Suspense fallback={
            <div className="h-screen w-screen flex items-center justify-center bg-slate-900 text-white">
                Chargement...
            </div>
        }>
            <QuoteBuilderContent />
        </Suspense>
    );
}