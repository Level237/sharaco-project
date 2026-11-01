import type { SpecCover } from "./covers"
import type { SpecKind } from "./kinds"

export type SpecSpacerSize = "sm" | "md" | "lg"

export type SpecBlock =
    | { type: "paragraph"; text: string }
    | { type: "table"; headers: string[]; rows: string[][] }
    | { type: "spacer"; size: SpecSpacerSize }
    | { type: "list"; style: "bullet" | "number"; items: string[] }
    | { type: "link"; label: string; url: string }
    | { type: "image"; url: string; caption: string }

export interface SpecSubsection {
    id: string
    title: string
    blocks: SpecBlock[]
}

export interface SpecSection {
    id: string
    title: string
    subsections: SpecSubsection[]
}

export interface Specification {
    id: string
    project_id: string
    client_id?: string | null
    client_name?: string | null
    client_email?: string | null
    sent_at?: string | null
    project_name?: string | null
    number?: string | null
    title: string
    kind: SpecKind
    cover_style: SpecCover
    primary_color: string
    version: number
    status: string
    sections: SpecSection[]
    created_at: string
    updated_at: string
}

export interface SpecificationCreate {
    project_id: string
    kind: SpecKind
    cover_style: SpecCover
    primary_color: string
}

export interface SpecificationDraft {
    id: string
    projectId: string
    clientId?: string | null
    clientName?: string | null
    clientEmail?: string | null
    status: string
    projectName?: string | null
    number?: string | null
    title: string
    kind: SpecKind
    coverStyle: SpecCover
    primaryColor: string
    version: number
    sections: SpecSection[]
}
