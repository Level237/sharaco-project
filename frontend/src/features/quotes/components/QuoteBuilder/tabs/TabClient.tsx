"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { QuoteDraft } from "../../../types/QuoteBuilder";
import { Search, User, Mail, MapPin, Plus, Loader2 } from "lucide-react";
import { useClients, useCreateClient } from "@/features/clients/hooks/useClients";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface TabClientProps {
    draft: QuoteDraft;
    onChange: (field: keyof QuoteDraft, value: any) => void;
}

export function TabClient({ draft, onChange }: TabClientProps) {
    const { data: clients, isLoading } = useClients();
    const createClient = useCreateClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newClient, setNewClient] = useState({
        name: "",
        email: "",
        address: "",
        phone: "",
    });

    const handleClientSelect = (clientId: string) => {
        const client = clients?.find((c) => c.id === clientId);
        if (client) {
            onChange("clientName", client.name);
            onChange("clientEmail", client.email || "");
            onChange("clientAddress", client.address || "");
            onChange("clientPhone", client.phone || "");
            onChange("clientId", client.id);
        }
    };

    const handleCreateClient = async () => {
        try {
            const client = await createClient.mutateAsync(newClient);
            onChange("clientName", client.name);
            onChange("clientEmail", client.email || "");
            onChange("clientAddress", client.address || "");
            onChange("clientPhone", client.phone || "");
            onChange("clientId", client.id);
            setIsDialogOpen(false);
            setNewClient({ name: "", email: "", address: "",phone: "" });
        } catch (error) {
            console.error("Failed to create client:", error);
        }
    };

    return (
        <div className="space-y-10 pb-32">
            {/* Header Description */}
            <div className="space-y-1">
                <h3 className="text-lg font-bold text-white tracking-tight">Client Information</h3>
                <p className="text-sm text-zinc-500">Search for an existing contact or enter new billing details manually.</p>
            </div>

            <div className="space-y-8">
                {/* Search existing / Select */}
                <div className="flex items-center gap-3">
                    <div className="relative flex-1 group">
                        <Select 
                            onValueChange={handleClientSelect}
                            value={clients?.find(c => c.name === draft.clientName && c.email === draft.clientEmail && c.phone === draft.clientPhone)?.id || ""}
                        >
                            <SelectTrigger className="h-12 bg-white/[0.02] border-white/5 text-zinc-200 focus:ring-1 focus:ring-white/10 rounded-2xl transition-all shadow-inner">
                                <div className="flex items-center gap-3">
                                    <Search className="h-4 w-4 text-zinc-600" />
                                    <SelectValue placeholder="Select client from CRM..." />
                                </div>
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10 text-zinc-200">
                                {isLoading ? (
                                    <div className="flex items-center justify-center p-4">
                                        <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />
                                    </div>
                                ) : clients?.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-zinc-500">
                                        No clients found
                                    </div>
                                ) : (
                                    clients?.map((client) => (
                                        <SelectItem key={client.id} value={client.id} className="focus:bg-white/5 focus:text-white">
                                            {client.name}
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="h-12 w-12 rounded-2xl border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 text-zinc-400 p-0">
                                <Plus className="h-5 w-5" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] bg-zinc-900 border-white/10 text-zinc-200">
                            <DialogHeader>
                                <DialogTitle>Add New Client</DialogTitle>
                                <DialogDescription className="text-zinc-500">
                                    Enter the details for the new client.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-zinc-400">Name</Label>
                                    <Input
                                        id="name"
                                        value={newClient.name}
                                        onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                                        className="bg-zinc-800 border-white/5 text-zinc-200"
                                        placeholder="Client or Business Name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-zinc-400">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={newClient.email}
                                        onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                                        className="bg-zinc-800 border-white/5 text-zinc-200"
                                        placeholder="billing@client.com"
                                    />
                                </div>

                                
                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-zinc-400">Phone Number</Label>
                                    <Input
                                        id="phone"
                                        type="tel"
                                        value={newClient.phone}
                                        onChange={(e) => setNewClient({ ...newClient, phone: e.target.value })}
                                        className="bg-zinc-800 border-white/5 text-zinc-200"
                                        placeholder="+33 6 12 34 56 78"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="address" className="text-zinc-400">Address</Label>
                                    <Textarea
                                        id="address"
                                        value={newClient.address}
                                        onChange={(e) => setNewClient({ ...newClient, address: e.target.value })}
                                        className="bg-zinc-800 border-white/5 text-zinc-200 resize-none"
                                        placeholder="Street, City, Postcode, Country"
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button
                                    onClick={handleCreateClient}
                                    disabled={createClient.isPending || !newClient.name}
                                    className="bg-blue-600 hover:bg-blue-700 text-white"
                                >
                                    {createClient.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Client
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="flex items-center gap-4">
                    <div className="h-px flex-1 bg-white/5" />
                    <span className="text-[10px] font-black text-zinc-700 uppercase tracking-[0.2em]">or manual entry</span>
                    <div className="h-px flex-1 bg-white/5" />
                </div>

                {/* Manual fields */}
                <div className="space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <User className="h-3 w-3" /> Client Name / Business
                        </label>
                        <Input
                            value={draft.clientName}
                            onChange={(e) => onChange("clientName", e.target.value)}
                            placeholder="e.g. Acme Corp or Jane Cooper"
                            className="h-11 bg-white/[0.02] border-white/5 text-zinc-200 focus:border-white/10 rounded-xl font-medium"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <Mail className="h-3 w-3" /> Billing Email
                        </label>
                        <Input
                            type="email"
                            value={draft.clientEmail}
                            onChange={(e) => onChange("clientEmail", e.target.value)}
                            placeholder="billing@client.com"
                            className="h-11 bg-white/[0.02] border-white/5 text-zinc-200 focus:border-white/10 rounded-xl font-medium"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <Mail className="h-3 w-3" /> Phone
                        </label>
                        <Input
                            type="string"
                            value={draft.clientPhone}
                            onChange={(e) => onChange("clientPhone", e.target.value)}
                            placeholder="billing@client.com"
                            className="h-11 bg-white/[0.02] border-white/5 text-zinc-200 focus:border-white/10 rounded-xl font-medium"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                            <MapPin className="h-3 w-3" /> Billing Address
                        </label>
                        <Textarea
                            value={draft.clientAddress}
                            onChange={(e) => onChange("clientAddress", e.target.value)}
                            placeholder="Street, City, Postcode, Country..."
                            className="bg-white/[0.02] border-white/5 text-zinc-200 focus:border-white/10 rounded-2xl min-h-[120px] resize-none p-4 leading-relaxed placeholder:text-zinc-700"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
