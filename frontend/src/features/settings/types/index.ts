export interface BrandIdentity {
    logoUrl: string | null;
    brandColor: string; // Hex color code
}

export type SettingsTab = "identity" | "billing" | "notifications" | "account";