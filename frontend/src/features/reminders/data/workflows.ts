export type WorkflowId = "devis" | "facture";

export type WorkflowNodeTone = "neutral" | "client" | "provider" | "passive";

export type CatalogWorkflow = {
    id: WorkflowId;
    name: string;
    goal: string;
    gateLabel: string;
    branches: string[];
    status: "active" | "partial";
    statusLabel: string;
};

export const WORKFLOWS: CatalogWorkflow[] = [
    {
        id: "devis",
        name: "Relance devis",
        goal: "Faire décider sans insister",
        gateLabel: "Coupe dès J+0 si ouvert, accepté ou refusé",
        branches: ["J+2 · Reçu ?", "J+5 · Questions ?", "J+10 · Expiration"],
        status: "active",
        statusLabel: "Configurable",
    },
    {
        id: "facture",
        name: "Relance facture",
        goal: "Faire payer autour de l’échéance",
        gateLabel: "Coupe dès paiement · accord prestataire après échéance",
        branches: ["J-3 · Prévention", "J-1 · Rappel", "J+1 · Digest prestataire"],
        status: "partial",
        statusLabel: "J-3 / J-1 actifs",
    },
];

export const QUOTE_DEFAULTS = {
    reminder_1_enabled: true,
    reminder_1_days: 2,
    reminder_1_subject: "Vous avez bien reçu le devis {number} ?",
    reminder_2_enabled: true,
    reminder_2_days: 5,
    reminder_2_subject: "Une question sur le devis {number} ?",
    reminder_3_enabled: true,
    reminder_3_days: 10,
    reminder_3_subject: "Dernier rappel : le devis {number} expire bientôt",
    is_active: true,
    stop_on_view: true,
    stop_on_payment: true,
};
