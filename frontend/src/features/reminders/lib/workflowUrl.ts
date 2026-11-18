import type { WorkflowId } from "../data/workflows";

const WORKFLOW_IDS: WorkflowId[] = ["devis", "facture"];

export function workflowFromSearch(
    searchParams: Pick<URLSearchParams, "get" | "has">
): WorkflowId | null {
    const type = searchParams.get("type") || searchParams.get("relance");
    if (type === "devis" || type === "facture") return type;

    for (const id of WORKFLOW_IDS) {
        if (searchParams.has(id)) return id;
    }
    return null;
}
