"use client";

import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Paintbrush, CreditCard, Bell, User } from "lucide-react";
import { TabIdentity } from "./tabs/TabIdentity";
import { TabBilling } from "./tabs/TabBilling";
import { TabNotifications } from "./tabs/TabNotifications";
import { TabAccount } from "./tabs/TabAccount";
import { BrandIdentity } from "../types";

// Default identity state
const defaultIdentity: BrandIdentity = {
    logoUrl: null,
    brandColor: "#6366f1", // Indigo-500 default
};

export function SettingsLayout() {
    const [identity, setIdentity] = useState<BrandIdentity>(defaultIdentity);

    const handleIdentityChange = (field: keyof BrandIdentity, value: any) => {
        setIdentity((prev) => ({ ...prev, [field]: value }));
    };

    return (
        <div className="w-full h-[calc(100vh-80px)] overflow-hidden flex flex-col bg-slate-950">

            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-800 bg-slate-950 shrink-0">
                <h1 className="text-3xl font-black text-white tracking-tight">Paramètres</h1>
                <p className="text-sm text-slate-400 mt-1">Gérez votre identité visuelle, votre facturation et plus encore.</p>
            </div>

            {/* Tabs Layout */}
            <Tabs defaultValue="identity" className="flex-1 flex flex-col overflow-hidden">

                {/* Horizontal Tabs Bar */}
                <div className="px-8 pt-4 bg-slate-900/50 border-b border-slate-800 shrink-0">
                    <TabsList className="h-12 bg-transparent gap-6 p-0 w-full justify-start">

                        <TabsTrigger
                            value="identity"
                            className="h-12 px-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-white data-[state=active]:border-b-2 rounded-none transition-all text-slate-400 font-bold tracking-wide"
                            style={{ borderBottomColor: identity.brandColor }}
                        >
                            <Paintbrush className="w-4 h-4 mr-2" />
                            Mon Identité
                        </TabsTrigger>

                        <TabsTrigger
                            value="billing"
                            className="h-12 px-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-white data-[state=active]:border-b-2 rounded-none transition-all text-slate-400 font-bold tracking-wide"
                            style={{ borderBottomColor: identity.brandColor }}
                        >
                            <CreditCard className="w-4 h-4 mr-2" />
                            Facturation
                        </TabsTrigger>

                        <TabsTrigger
                            value="notifications"
                            className="h-12 px-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-white data-[state=active]:border-b-2 rounded-none transition-all text-slate-400 font-bold tracking-wide"
                            style={{ borderBottomColor: identity.brandColor }}
                        >
                            <Bell className="w-4 h-4 mr-2" />
                            Notifications
                        </TabsTrigger>

                        <TabsTrigger
                            value="account"
                            className="h-12 px-2 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:text-white data-[state=active]:border-b-2 rounded-none transition-all text-slate-400 font-bold tracking-wide"
                            style={{ borderBottomColor: identity.brandColor }}
                        >
                            <User className="w-4 h-4 mr-2" />
                            Compte
                        </TabsTrigger>

                    </TabsList>
                </div>

                {/* Tab Contents: Scrollable Area */}
                <div className="flex-1 overflow-y-auto w-full p-8">
                    <div className="max-w-5xl mx-auto w-full pb-24">

                        <TabsContent value="identity" className="mt-0 outline-none w-full">
                            <TabIdentity identity={identity} onChange={handleIdentityChange} />
                        </TabsContent>

                        <TabsContent value="billing" className="mt-0 outline-none">
                            <TabBilling />
                        </TabsContent>

                        <TabsContent value="notifications" className="mt-0 outline-none">
                            <TabNotifications />
                        </TabsContent>

                        <TabsContent value="account" className="mt-0 outline-none">
                            <TabAccount />
                        </TabsContent>

                    </div>
                </div>

            </Tabs>
        </div>
    );
}
