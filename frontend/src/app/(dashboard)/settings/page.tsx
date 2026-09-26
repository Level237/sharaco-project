import { SettingsLayout } from "@/features/settings/components/SettingsLayout";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Paramètres | Sharaco",
    description: "Gérez votre identité visuelle, votre facturation et plus encore.",
};

export default function SettingsPage() {
    return <SettingsLayout />;
}
