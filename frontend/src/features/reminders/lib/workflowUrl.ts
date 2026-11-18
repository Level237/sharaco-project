import type { WorkflowId } from "../data/workflows";

const WORKFLOW_IDS: WorkflowId[] = ["devis", "facture"];

export function journalFromSearch(
    searchParams: Pick<URLSearchParams, "get" | "has">
): "devis" | "facture" | "all" | null {
    if (!searchParams.has("journal")) return null;
    const value = searchParams.get("journal");
    if (value === "devis" || value === "facture") return value;
    return "all";
}

export function workflowFromSearch(
    searchParams: Pick<URLSearchParams, "get" | "has">
): WorkflowId | null {
    if (searchParams.has("journal")) return null;

    const type = searchParams.get("type") || searchParams.get("relance");
    if (type === "devis" || type === "facture") return type;

    for (const id of WORKFLOW_IDS) {
        if (searchParams.has(id)) return id;
    }
    return null;
}
