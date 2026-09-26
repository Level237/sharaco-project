"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User } from "lucide-react";
import { useUpdateClient } from "../hooks/useClients";
import { Client } from "../types";

interface UpdateClientModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    client: Client | null;
}

export function UpdateClientModal({ open, onOpenChange, client }: UpdateClientModalProps) {
    const { mutate: updateClient, isPending } = useUpdateClient();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");

    useEffect(() => {
        if (client && open) {
            setName(client.name);
            setEmail(client.email || "");
            setPhone(client.phone || "");
            setAddress(client.address || "");
        }
    }, [client, open]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!client) return;

        updateClient(
            {
                id: client.id,
                data: {
                    name,
                    email: email || undefined,
                    phone: phone || undefined,
                    address: address || undefined,
                }
            },
            {
                onSuccess: () => {
                    onOpenChange(false);
                }
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-950 border border-slate-200 dark:border-white/10 rounded-3xl shadow-2xl p-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 to-sky-500" />
                
                <div className="p-6">
                    <DialogHeader className="mb-6 flex flex-row items-center gap-4 space-y-0 text-left">
                        <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-sm shrink-0">
                            <User className="h-6 w-6 text-indigo-500" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">
                                Modifier le client
                            </DialogTitle>
                            <DialogDescription className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                Mettez à jour les informations de {client?.name}.
                            </DialogDescription>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-bold ml-1">Nom complet *</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="h-12 bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-indigo-500"
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-bold ml-1">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-indigo-500"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="phone" className="text-slate-700 dark:text-slate-300 font-bold ml-1">Téléphone</Label>
                            <Input
                                id="phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="h-12 bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-indigo-500"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="address" className="text-slate-700 dark:text-slate-300 font-bold ml-1">Adresse</Label>
                            <Input
                                id="address"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="h-12 bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/10 rounded-xl focus-visible:ring-indigo-500"
                            />
                        </div>

                        <div className="pt-6 flex justify-end gap-3">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => onOpenChange(false)}
                                className="rounded-xl font-bold hover:bg-slate-100 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300"
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending || !name.trim()}
                                className="bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl shadow-[0_4px_14px_rgba(99,102,241,0.39)] hover:shadow-[0_6px_20px_rgba(99,102,241,0.23)] hover:-translate-y-0.5 transition-all font-bold px-6"
                            >
                                {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Mettre à jour"}
                            </Button>
                        </div>
                    </form>
                </div>
            </DialogContent>
        </Dialog>
    );
}
