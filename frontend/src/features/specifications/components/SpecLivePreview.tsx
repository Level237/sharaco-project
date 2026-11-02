"use client"

import { type ReactNode, useEffect, useRef, useState } from "react"
import { ArrowDown, ArrowUp, Bold, FileText, ImageIcon, Link2, List, ListOrdered, MoveVertical, Plus, Table2, Trash2, X } from "lucide-react"
import { specKindMeta } from "../kinds"
import type { SpecBlock, SpecSection, SpecSpacerSize, SpecSubsection, SpecificationDraft } from "../types"
import { useLocalText } from "../hooks/useLocalText"
import { isHttpUrl } from "../urls"
import { A4_HEIGHT, paginateDraft, type BodyUnit, type TocEntry } from "../paging"
import { roman } from "./SpecSidebar"

function PageFooter({ title, page, total }: { title: string; page: number; total: number }) {
    return (
        <div className="mt-auto flex items-end justify-between gap-8 pt-10 text-[11px] leading-none text-[#78716c]">
            <span className="min-w-0 truncate">{title}</span>
            <span className="shrink-0 tabular-nums">
                {page} / {total}
            </span>
        </div>
    )
}

function SheetFrame({
    children,
    footer,
    className,
}: {
    children: ReactNode
    footer?: ReactNode
    className?: string
}) {
    return (
        <section
            className={`relative flex w-full flex-col overflow-hidden rounded-sm bg-[#faf8f5] px-20 pb-14 pt-16 text-[#1c1917] shadow-2xl shadow-black/25 ${className || ""}`}
            style={{ minHeight: A4_HEIGHT }}
        >
            <div className="flex-1">{children}</div>
            {footer}
        </section>
    )
}

function TocLeader({
    label,
    page,
    accent,
    part = false,
    onJump,
}: {
    label: ReactNode
    page: number
    accent: string
    part?: boolean
    onJump?: () => void
}) {
    return (
        <button
            type="button"
            onClick={onJump}
            className={`flex w-full items-baseline gap-2 text-left ${part ? "mt-3.5 first:mt-0" : "mt-1 pl-5"}`}
        >
            <span
                className={`max-w-[72%] shrink-0 ${part ? "text-[13.5px] font-bold text-[#1c1917]" : "text-[12.5px] font-normal text-[#44403c]"}`}
            >
                {label}
            </span>
            <span className="min-w-4 flex-1 translate-y-[-5px] border-b border-dotted border-[#c4c0bb]" />
            <span
                className="shrink-0 tabular-nums text-[12.5px] text-[#1c1917]"
                style={part ? { color: accent } : undefined}
            >
                {page}
            </span>
        </button>
    )
}

function sid() {
    return crypto.randomUUID()
}

function emptyParagraph(): SpecBlock {
    return { type: "paragraph", text: "" }
}

function createSpacer(size: SpecSpacerSize = "md"): SpecBlock {
    return { type: "spacer", size }
}

function emptyList(style: "bullet" | "number" = "bullet"): SpecBlock {
    return { type: "list", style, items: ["", ""] }
}

function renderFormattedText(text: string): ReactNode[] {
    const parts = (text || "").split(/(\*\*.+?\*\*)/g)
    return parts.map((part, idx) => {
        if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
            return (
                <strong key={idx} className="font-bold text-[#1c1917]">
                    {part.slice(2, -2)}
                </strong>
            )
        }
        return <span key={idx}>{part}</span>
    })
}

function emptyLink(): SpecBlock {
    return { type: "link", label: "", url: "" }
}

function emptyImage(): SpecBlock {
    return { type: "image", url: "", caption: "" }
}

function stripLeadingRoman(raw: string): string {
    return raw.replace(/^\s*(?:[IVXLCDM]{1,5}|\d{1,2})\s*[-.:)]\s+/i, "")
}

export interface TablePreset {
    id: string
    label: string
    hint: string
    headers: string[]
    rows: string[][]
}

export const TABLE_PRESETS: TablePreset[] = [
    {
        id: "deliverables",
        label: "Catalogue des livrables",
        hint: "Réf., livrable, format et critère de validation",
        headers: ["Réf.", "Livrable", "Format", "Critère de validation"],
        rows: [
            ["L1", "Cadrage & planning", "PDF", "Validation écrite au lancement"],
            ["L2", "Livrable principal", "Sources + PDF", "PV de recette signé"],
        ],
    },
    {
        id: "schedule",
        label: "Planning et jalons",
        hint: "Phases, contenu, échéances et livrables",
        headers: ["Phase", "Contenu principal", "Échéance", "Jalon de validation"],
        rows: [
            ["Phase 1 : Lancement", "Collecte des éléments et accès", "Semaine 1", "Kick-off validé"],
            ["Phase 2 : Exécution", "Production et points d’étape", "Semaines 2 à 3", "Revue intermédiaire"],
            ["Phase 3 : Recette", "Ajustements et livraison finale", "Semaine 4", "PV de réception"],
        ],
    },
    {
        id: "scope",
        label: "Périmètre Inclus / Exclu",
        hint: "Clarifier ce qui est compris ou hors forfait",
        headers: ["Domaine", "Inclus dans la mission", "Exclu (sur devis complémentaire)"],
        rows: [
            ["Réalisation", "Périmètre principal décrit au CDC", "Demandes hors périmètre initial"],
            ["Suivi et retours", "2 cycles de retours consolidés", "Refonte après validation d’étape"],
        ],
    },
    {
        id: "work_lots",
        label: "Postes : Fourniture et Pose",
        hint: "Idéal chantier, intervention ou installation",
        headers: ["Poste", "Désignation technique", "Fourniture", "Pose", "Qté / Unité"],
        rows: [
            ["Poste 1", "Préparation et mise en sécurité", "Prestataire", "Prestataire", "Forfait"],
            ["Poste 2", "Ouvrage principal", "Prestataire", "Prestataire", "Ens."],
        ],
    },
    {
        id: "raci",
        label: "Rôles & responsabilités (RACI)",
        hint: "Qui pilote, exécute et valide côté client / prestataire",
        headers: ["Activité", "Prestataire", "Client (Référent)", "Direction Client"],
        rows: [
            ["Exécution & livrables", "Responsable", "Consulté", "Informé"],
            ["Validation des jalons", "Exécutant", "Consulté", "Approbateur"],
        ],
    },
    {
        id: "risks",
        label: "Hypothèses & maîtrise des risques",
        hint: "Risque identifié, impact et mesure de prévention",
        headers: ["Risque / Contrainte", "Impact potentiel", "Mesure d’atténuation"],
        rows: [
            ["Retard de remise des éléments", "Décalage du jalon final", "Validation du calendrier d’entrée dès J0"],
        ],
    },
    {
        id: "blank",
        label: "Tableau libre (3 colonnes)",
        hint: "Grille vierge personnalisable",
        headers: ["Élément", "Détail", "Observation"],
        rows: [["", "", ""]],
    },
]

function buildTableFromPreset(presetId?: string): SpecBlock {
    const preset = TABLE_PRESETS.find((p) => p.id === presetId) || TABLE_PRESETS[0]
    return {
        type: "table",
        headers: [...preset.headers],
        rows: preset.rows.map((r) => [...r]),
    }
}

export function createDefaultSection(index = 0): SpecSection {
    return {
        id: sid(),
        title: `Nouvelle grande partie ${index > 0 ? index + 1 : ""}`.trim(),
        subsections: [
            {
                id: sid(),
                title: "Objet et périmètre",
                blocks: [
                    {
                        type: "paragraph",
                        text: "Préciser ici les engagements, attentes et conditions applicables à cette partie.",
                    },
                ],
            },
        ],
    }
}

export function createDefaultSubsection(): SpecSubsection {
    return {
        id: sid(),
        title: "Nouveau point",
        blocks: [emptyParagraph()],
    }
}

export function SpecLivePreview({
    draft,
    companyName,
    readOnly = false,
    onChange,
    onFocusItem,
    onJump,
}: {
    draft: SpecificationDraft
    companyName: string
    readOnly?: boolean
    onChange: (patch: Partial<SpecificationDraft>) => void
    onFocusItem?: (id: string) => void
    onJump?: (id: string) => void
}) {
    const kindMeta = specKindMeta(draft.kind)
    const accent = draft.primaryColor || "#2563EB"
    const todayLabel = new Date().toLocaleDateString("fr-FR")
    const plan = paginateDraft(draft, !readOnly)
    const docTitle = draft.title || draft.number || "Cahier des charges"

    const updateSection = (sectionId: string, updater: (s: SpecSection) => SpecSection) => {
        onChange({
            sections: draft.sections.map((s) => (s.id === sectionId ? updater(s) : s)),
        })
    }

    const moveSection = (index: number, direction: -1 | 1) => {
        const target = index + direction
        if (target < 0 || target >= draft.sections.length) return
        const next = [...draft.sections]
        const [item] = next.splice(index, 1)
        next.splice(target, 0, item)
        onChange({ sections: next })
    }

    const removeSection = (sectionId: string) => {
        if (draft.sections.length <= 1) return
        onChange({ sections: draft.sections.filter((s) => s.id !== sectionId) })
    }

    const addSubsection = (sectionId: string, atIndex?: number) => {
        updateSection(sectionId, (s) => {
            const next = [...s.subsections]
            const insertAt = typeof atIndex === "number" ? atIndex : next.length
            next.splice(insertAt, 0, createDefaultSubsection())
            return { ...s, subsections: next }
        })
    }

    const insertBlockAt = (
        sectionId: string,
        subId: string,
        index: number,
        newBlock: SpecBlock
    ) => {
        updateSubsection(sectionId, subId, (sub) => {
            const prev = sub.blocks[index - 1]
            const curr = sub.blocks[index]
            if (
                newBlock.type === "spacer" &&
                (prev?.type === "spacer" || curr?.type === "spacer")
            ) {
                return sub
            }
            const next = [...sub.blocks]
            next.splice(index, 0, newBlock)
            return { ...sub, blocks: next }
        })
    }

    const updateSubsection = (
        sectionId: string,
        subId: string,
        updater: (sub: SpecSubsection) => SpecSubsection
    ) => {
        updateSection(sectionId, (s) => ({
            ...s,
            subsections: s.subsections.map((sub) => (sub.id === subId ? updater(sub) : sub)),
        }))
    }

    const removeSubsection = (sectionId: string, subId: string) => {
        updateSection(sectionId, (s) => {
            if (s.subsections.length <= 1) return s
            return { ...s, subsections: s.subsections.filter((sub) => sub.id !== subId) }
        })
    }

    return (
        <div className="mx-auto flex w-[820px] flex-col gap-14">
            <div id="spec-node-cover" onFocusCapture={() => onFocusItem?.("cover")} className="scroll-mt-20">
                <div className="mb-2.5 flex items-center justify-between px-1 text-[12px]  uppercase  text-stone-500">
                    <span>Page 1 · Couverture</span>
                    <span>{draft.number || "CDC"}</span>
                </div>
                <CoverSheet
                    draft={draft}
                    accent={accent}
                    kindTitle={`Cahier des charges · ${kindMeta.title}`}
                    companyName={companyName}
                    dateLabel={todayLabel}
                    readOnly={readOnly}
                    onTitleChange={(title) => onChange({ title })}
                />
            </div>

            {plan.tocPages.map((entries, tocIdx) => {
                const pageNo = plan.tocStart + tocIdx
                return (
                    <div
                        key={`toc-${tocIdx}`}
                        id={tocIdx === 0 ? "spec-node-toc" : undefined}
                        onFocusCapture={() => onFocusItem?.("toc")}
                        className="scroll-mt-20"
                    >
                        <div className="mb-2.5 flex items-center justify-between px-1 text-[12px]  uppercase  text-stone-500">
                            <span>Page {pageNo} · Sommaire</span>
                            <span>
                                {readOnly ? "Aperçu final" : "Cliquez sur un titre pour le renommer"}
                            </span>
                        </div>
                        <TocSheet
                            draft={draft}
                            accent={accent}
                            entries={entries}
                            page={pageNo}
                            total={plan.total}
                            isFirst={tocIdx === 0}
                            isLast={tocIdx === plan.tocPages.length - 1}
                            readOnly={readOnly}
                            onUpdateSection={updateSection}
                            onMoveSection={moveSection}
                            onRemoveSection={removeSection}
                            onAddSection={() =>
                                onChange({
                                    sections: [...draft.sections, createDefaultSection(draft.sections.length)],
                                })
                            }
                            onAddSubsection={addSubsection}
                            onUpdateSubsection={updateSubsection}
                            onRemoveSubsection={removeSubsection}
                            onJump={onJump}
                        />
                    </div>
                )
            })}

            {plan.bodyPages.map((units, bodyIdx) => {
                const pageNo = plan.bodyStart + bodyIdx
                const isLastBody = bodyIdx === plan.bodyPages.length - 1
                return (
                    <div key={`body-${bodyIdx}`} className="scroll-mt-20">
                        <div className="    mb-2.5 flex items-center justify-between px-1 text-[12px]  uppercase  text-stone-500">
                            <span>Page {pageNo} · Corps du document</span>
                            <span>
                                {pageNo} / {plan.total}
                            </span>
                        </div>
                        <SheetFrame
                            footer={<PageFooter title={docTitle} page={pageNo} total={plan.total} />}
                        >
                            <BodyPageCanvas
                                draft={draft}
                                units={units}
                                accent={accent}
                                readOnly={readOnly}
                                isLastPage={isLastBody}
                                onFocusItem={onFocusItem}
                                updateSection={updateSection}
                                removeSection={removeSection}
                                updateSubsection={updateSubsection}
                                removeSubsection={removeSubsection}
                                addSubsection={addSubsection}
                                insertBlockAt={insertBlockAt}
                                onAddSection={() =>
                                    onChange({
                                        sections: [
                                            ...draft.sections,
                                            createDefaultSection(draft.sections.length),
                                        ],
                                    })
                                }
                            />
                        </SheetFrame>
                    </div>
                )
            })}
        </div>
    )
}

function BodyPageCanvas({
    draft,
    units,
    accent,
    readOnly,
    isLastPage,
    onFocusItem,
    updateSection,
    removeSection,
    updateSubsection,
    removeSubsection,
    addSubsection,
    insertBlockAt,
    onAddSection,
}: {
    draft: SpecificationDraft
    units: BodyUnit[]
    accent: string
    readOnly: boolean
    isLastPage: boolean
    onFocusItem?: (id: string) => void
    updateSection: (sectionId: string, updater: (s: SpecSection) => SpecSection) => void
    removeSection: (sectionId: string) => void
    updateSubsection: (
        sectionId: string,
        subId: string,
        updater: (sub: SpecSubsection) => SpecSubsection
    ) => void
    removeSubsection: (sectionId: string, subId: string) => void
    addSubsection: (sectionId: string, atIndex?: number) => void
    insertBlockAt: (sectionId: string, subId: string, index: number, newBlock: SpecBlock) => void
    onAddSection: () => void
}) {
    const groups: BodyUnit[][] = []
    for (const unit of units) {
        const last = groups[groups.length - 1]
        const sameSub =
            last &&
            unit.kind !== "sec-head" &&
            last[0].kind !== "sec-head" &&
            "subId" in last[0] &&
            "subId" in unit &&
            last[0].subId === unit.subId
        if (sameSub) last.push(unit)
        else groups.push([unit])
    }

    return (
        <div className="space-y-8">
            {groups.map((group, gIdx) => {
                const head = group[0]
                if (head.kind === "sec-head") {
                    const section = draft.sections[head.sIdx]
                    if (!section) return null
                    const lastOfSection =
                        !units.some(
                            (u, i) =>
                                i > units.indexOf(head) &&
                                ((u.kind === "sub-head" && u.sectionId === section.id) ||
                                    (u.kind === "block" && u.sectionId === section.id))
                        ) && !group.slice(1).length
                    return (
                        <div
                            key={`${section.id}-head-${gIdx}`}
                            id={`spec-node-${section.id}`}
                            onFocusCapture={() => onFocusItem?.(section.id)}
                            className="group/section scroll-mt-24"
                        >
                            <div className="flex items-baseline gap-2.5 border-b border-[#d6d3d1] pb-3.5">
                                <span
                                    className="shrink-0 text-[22px] font-extrabold leading-[1.25] tracking-[-0.03em]"
                                    style={{ color: accent }}
                                >
                                    {roman(head.sIdx)}.
                                </span>
                                {readOnly ? (
                                    <h2 className="text-[22px] font-extrabold leading-[1.25] tracking-[-0.03em] text-[#1c1917]">
                                        {section.title}
                                    </h2>
                                ) : (
                                    <DeferredTextInput
                                        value={section.title}
                                        transform={stripLeadingRoman}
                                        onCommit={(title) =>
                                            updateSection(section.id, (s) => ({ ...s, title }))
                                        }
                                        placeholder="Titre de la grande partie"
                                        className="w-full bg-transparent text-[22px] font-extrabold leading-[1.25] tracking-[-0.03em] text-[#1c1917] outline-none placeholder:text-[#a8a29e]"
                                    />
                                )}
                                {!readOnly && draft.sections.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeSection(section.id)}
                                        title="Supprimer cette partie"
                                        className="rounded p-1 text-[#a8a29e] opacity-0 transition-opacity hover:text-rose-600 group-hover/section:opacity-100"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                            {!readOnly && lastOfSection && (
                                <button
                                    type="button"
                                    onClick={() => addSubsection(section.id)}
                                    className="mt-4 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-[#57534e] hover:bg-[#e7e5e4]/70 hover:text-[#1c1917]"
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Ajouter une sous-section
                                </button>
                            )}
                        </div>
                    )
                }

                const section = draft.sections[head.sIdx]
                const sub = section?.subsections.find((item) => item.id === head.subId)
                if (!section || !sub) return null
                const showHead = group.some((u) => u.kind === "sub-head")
                const blockUnits = group.filter((u): u is Extract<BodyUnit, { kind: "block" }> => u.kind === "block")
                const lastBlockOnPage = blockUnits[blockUnits.length - 1]
                const isEndOfSub =
                    lastBlockOnPage && lastBlockOnPage.bIdx === sub.blocks.length - 1
                const isEndOfSection = isEndOfSub && head.subIdx === section.subsections.length - 1

                return (
                    <div key={`${sub.id}-${gIdx}`} className="pl-4">
                        <SubsectionSlice
                            section={section}
                            sub={sub}
                            subIdx={head.subIdx}
                            accent={accent}
                            readOnly={readOnly}
                            showHead={showHead}
                            blockIndexes={blockUnits.map((u) => u.bIdx)}
                            startInsert={showHead}
                            endInsert={!!isEndOfSub}
                            onFocusItem={onFocusItem}
                            updateSubsection={updateSubsection}
                            removeSubsection={removeSubsection}
                            insertBlockAt={insertBlockAt}
                        />
                        {!readOnly && isEndOfSection && (
                            <button
                                type="button"
                                onClick={() => addSubsection(section.id)}
                                className="mt-4 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-semibold text-[#57534e] hover:bg-[#e7e5e4]/70 hover:text-[#1c1917]"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Ajouter une sous-section ({section.subsections.length + 1}.)
                            </button>
                        )}
                    </div>
                )
            })}

            {!readOnly && isLastPage && (
                <div className="border-t border-dashed border-[#d6d3d1] pt-6">
                    <button
                        type="button"
                        onClick={onAddSection}
                        className="inline-flex items-center gap-2 rounded-lg border border-[#d6d3d1] bg-white px-3.5 py-2 text-xs font-semibold text-[#1c1917] shadow-sm hover:bg-[#f5f3ef]"
                    >
                        <Plus className="h-3.5 w-3.5" style={{ color: accent }} />
                        Nouvelle grande partie ({roman(draft.sections.length)}.)
                    </button>
                </div>
            )}
        </div>
    )
}

function SubsectionSlice({
    section,
    sub,
    subIdx,
    accent,
    readOnly,
    showHead,
    blockIndexes,
    startInsert,
    endInsert,
    onFocusItem,
    updateSubsection,
    removeSubsection,
    insertBlockAt,
}: {
    section: SpecSection
    sub: SpecSubsection
    subIdx: number
    accent: string
    readOnly: boolean
    showHead: boolean
    blockIndexes: number[]
    startInsert: boolean
    endInsert: boolean
    onFocusItem?: (id: string) => void
    updateSubsection: (
        sectionId: string,
        subId: string,
        updater: (sub: SpecSubsection) => SpecSubsection
    ) => void
    removeSubsection: (sectionId: string, subId: string) => void
    insertBlockAt: (sectionId: string, subId: string, index: number, newBlock: SpecBlock) => void
}) {
    const insert = (index: number, block: SpecBlock) => insertBlockAt(section.id, sub.id, index, block)
    return (
        <div
            id={showHead ? `spec-node-${sub.id}` : undefined}
            onFocusCapture={() => onFocusItem?.(sub.id)}
            className={
                readOnly
                    ? "scroll-mt-24 py-1"
                    : "group/sub scroll-mt-24 rounded-lg border border-transparent p-3.5 transition-colors hover:border-[#e7e5e4] focus-within:border-[#d6d3d1] focus-within:bg-white/70"
            }
        >
            {showHead && (
                <div className="mb-3 flex items-baseline gap-2.5">
                    <span className="shrink-0 text-[15px] font-bold text-[#57534e]">{subIdx + 1}.</span>
                    {readOnly ? (
                        <h3 className="text-[15px] font-bold text-[#1c1917]">{sub.title}</h3>
                    ) : (
                        <DeferredTextInput
                            value={sub.title}
                            onCommit={(title) =>
                                updateSubsection(section.id, sub.id, (item) => ({ ...item, title }))
                            }
                            placeholder="Titre de la sous-section"
                            className="w-full bg-transparent text-[15px] font-bold text-[#1c1917] outline-none placeholder:text-[#a8a29e]"
                        />
                    )}
                    {!readOnly && section.subsections.length > 1 && (
                        <button
                            type="button"
                            onClick={() => removeSubsection(section.id, sub.id)}
                            title="Supprimer la sous-section"
                            className="rounded p-1 text-[#a8a29e] opacity-0 transition-opacity hover:text-rose-600 group-hover/sub:opacity-100"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            )}

            {!readOnly && startInsert && (
                <InlineInsertBar
                    allowSpacer={sub.blocks[0]?.type !== "spacer"}
                    accent={accent}
                    onAddParagraph={() => insert(0, emptyParagraph())}
                    onAddTable={(presetId) => insert(0, buildTableFromPreset(presetId))}
                    onAddList={(style) => insert(0, emptyList(style))}
                    onAddLink={() => insert(0, emptyLink())}
                    onAddImage={() => insert(0, emptyImage())}
                    onAddSpacer={(size) => insert(0, createSpacer(size))}
                />
            )}

            <div className="space-y-3">
                {blockIndexes.map((bIdx) => {
                    const block = sub.blocks[bIdx]
                    if (!block) return null
                    const nextBlock = sub.blocks[bIdx + 1]
                    const canAddSpacerAfter = block.type !== "spacer" && nextBlock?.type !== "spacer"
                    const showInsert = !readOnly && (endInsert || blockIndexes.includes(bIdx + 1))
                    return (
                        <div key={`${sub.id}-${bIdx}`} className="space-y-2">
                            <BlockCanvas
                                block={block}
                                accent={accent}
                                readOnly={readOnly}
                                canRemove={sub.blocks.length > 1}
                                onChange={(updated) =>
                                    updateSubsection(section.id, sub.id, (item) => ({
                                        ...item,
                                        blocks: item.blocks.map((b, i) => (i === bIdx ? updated : b)),
                                    }))
                                }
                                onRemove={() =>
                                    updateSubsection(section.id, sub.id, (item) => ({
                                        ...item,
                                        blocks:
                                            item.blocks.length > 1
                                                ? item.blocks.filter((_, i) => i !== bIdx)
                                                : item.blocks,
                                    }))
                                }
                            />
                            {showInsert && (
                                <InlineInsertBar
                                    allowSpacer={canAddSpacerAfter}
                                    accent={accent}
                                    isLast={bIdx === sub.blocks.length - 1}
                                    onAddParagraph={() => insert(bIdx + 1, emptyParagraph())}
                                    onAddTable={(presetId) => insert(bIdx + 1, buildTableFromPreset(presetId))}
                                    onAddList={(style) => insert(bIdx + 1, emptyList(style))}
                                    onAddLink={() => insert(bIdx + 1, emptyLink())}
                                    onAddImage={() => insert(bIdx + 1, emptyImage())}
                                    onAddSpacer={(size) => insert(bIdx + 1, createSpacer(size))}
                                />
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function TocSheet({
    draft,
    accent,
    entries,
    page,
    total,
    isFirst,
    isLast,
    readOnly = false,
    onUpdateSection,
    onMoveSection,
    onRemoveSection,
    onAddSection,
    onAddSubsection,
    onUpdateSubsection,
    onRemoveSubsection,
    onJump,
}: {
    draft: SpecificationDraft
    accent: string
    entries: TocEntry[]
    page: number
    total: number
    isFirst: boolean
    isLast: boolean
    readOnly?: boolean
    onUpdateSection: (id: string, updater: (s: SpecSection) => SpecSection) => void
    onMoveSection: (index: number, direction: -1 | 1) => void
    onRemoveSection: (id: string) => void
    onAddSection: () => void
    onAddSubsection: (sectionId: string) => void
    onUpdateSubsection: (
        sectionId: string,
        subId: string,
        updater: (sub: SpecSubsection) => SpecSubsection
    ) => void
    onRemoveSubsection: (sectionId: string, subId: string) => void
    onJump?: (id: string) => void
}) {
    const title = draft.title || draft.number || "Cahier des charges"
    const shownSectionIds = new Set(entries.filter((e) => e.kind === "part").map((e) => e.sectionId))
    entries.forEach((e) => {
        if (e.kind === "sub") shownSectionIds.add(e.sectionId)
    })

    return (
        <SheetFrame footer={<PageFooter title={title} page={page} total={total} />}>
            {isFirst && (
                <h2 className="mb-7 text-[28px] font-extrabold tracking-[-0.03em]" style={{ color: accent }}>
                    Sommaire
                </h2>
            )}
            <div>
                {entries.map((entry) => {
                    if (entry.kind === "part") {
                        const section = draft.sections[entry.sIdx]
                        if (!section) return null
                        if (readOnly) {
                            return (
                                <TocLeader
                                    key={section.id}
                                    part
                                    accent={accent}
                                    page={entry.page}
                                    onJump={() => onJump?.(section.id)}
                                    label={
                                        <>
                                            <span className="mr-1.5 font-extrabold" style={{ color: accent }}>
                                                {roman(entry.sIdx)}.
                                            </span>
                                            {section.title}
                                        </>
                                    }
                                />
                            )
                        }
                        return (
                            <div key={section.id} className="group/toc mt-3.5 first:mt-0">
                                <div className="flex items-baseline gap-2">
                                    <span className="shrink-0 text-[13.5px] font-extrabold" style={{ color: accent }}>
                                        {roman(entry.sIdx)}.
                                    </span>
                                    <DeferredTextInput
                                        value={section.title}
                                        transform={stripLeadingRoman}
                                        onCommit={(next) =>
                                            onUpdateSection(section.id, (s) => ({ ...s, title: next }))
                                        }
                                        placeholder="Titre de la grande partie"
                                        className="max-w-[58%] min-w-0 bg-transparent text-[13.5px] font-bold text-[#1c1917] outline-none placeholder:text-[#a8a29e]"
                                    />
                                    <span className="min-w-4 flex-1 translate-y-[-5px] border-b border-dotted border-[#c4c0bb]" />
                                    <span className="shrink-0 tabular-nums text-[12.5px] text-[#1c1917]">
                                        {entry.page}
                                    </span>
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover/toc:opacity-100">
                                        <button
                                            type="button"
                                            disabled={entry.sIdx === 0}
                                            onClick={() => onMoveSection(entry.sIdx, -1)}
                                            className="rounded p-0.5 text-[#78716c] hover:text-[#1c1917] disabled:opacity-25"
                                        >
                                            <ArrowUp className="h-3 w-3" />
                                        </button>
                                        <button
                                            type="button"
                                            disabled={entry.sIdx === draft.sections.length - 1}
                                            onClick={() => onMoveSection(entry.sIdx, 1)}
                                            className="rounded p-0.5 text-[#78716c] hover:text-[#1c1917] disabled:opacity-25"
                                        >
                                            <ArrowDown className="h-3 w-3" />
                                        </button>
                                        {draft.sections.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => onRemoveSection(section.id)}
                                                className="rounded p-0.5 text-[#a8a29e] hover:text-rose-600"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    }

                    const section = draft.sections[entry.sIdx]
                    const sub = section?.subsections[entry.subIdx]
                    if (!section || !sub) return null
                    if (readOnly) {
                        return (
                            <TocLeader
                                key={sub.id}
                                accent={accent}
                                page={entry.page}
                                onJump={() => onJump?.(sub.id)}
                                label={`${entry.subIdx + 1}. ${sub.title}`}
                            />
                        )
                    }
                    return (
                        <div key={sub.id} className="group/tocsub mt-1 flex items-baseline gap-2 pl-5">
                            <span className="shrink-0 text-[12.5px] text-[#44403c]">{entry.subIdx + 1}.</span>
                            <DeferredTextInput
                                value={sub.title}
                                onCommit={(title) =>
                                    onUpdateSubsection(section.id, sub.id, (item) => ({ ...item, title }))
                                }
                                placeholder="Sous-section"
                                className="max-w-[58%] min-w-0 bg-transparent text-[12.5px] text-[#44403c] outline-none placeholder:text-[#a8a29e]"
                            />
                            <span className="min-w-4 flex-1 translate-y-[-5px] border-b border-dotted border-[#c4c0bb]" />
                            <span className="shrink-0 tabular-nums text-[12.5px] text-[#1c1917]">
                                {entry.page}
                            </span>
                            {section.subsections.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => onRemoveSubsection(section.id, sub.id)}
                                    className="rounded p-0.5 text-[#a8a29e] opacity-0 hover:text-rose-600 group-hover/tocsub:opacity-100"
                                >
                                    ×
                                </button>
                            )}
                        </div>
                    )
                })}
            </div>

            {!readOnly &&
                [...shownSectionIds].map((sectionId) => {
                    const section = draft.sections.find((s) => s.id === sectionId)
                    if (!section) return null
                    const lastSub = section.subsections[section.subsections.length - 1]
                    const showsLastSub = entries.some((e) => e.kind === "sub" && e.subId === lastSub?.id)
                    if (!showsLastSub && lastSub) return null
                    return (
                        <button
                            key={`add-sub-${sectionId}`}
                            type="button"
                            onClick={() => onAddSubsection(section.id)}
                            className="mt-1.5 inline-flex items-center gap-1 pl-5 text-[11px] font-medium text-[#78716c] hover:text-[#1c1917]"
                        >
                            <Plus className="h-3 w-3" />
                            Ajouter un sous-point
                        </button>
                    )
                })}

            {!readOnly && isLast && (
                <div className="mt-8">
                    <button
                        type="button"
                        onClick={onAddSection}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-[#d6d3d1] bg-white px-3 py-1.5 text-xs font-semibold text-[#1c1917] shadow-sm hover:bg-[#f5f3ef]"
                    >
                        <Plus className="h-3.5 w-3.5" style={{ color: accent }} />
                        Ajouter une grande partie ({roman(draft.sections.length)}.)
                    </button>
                </div>
            )}
        </SheetFrame>
    )
}

function InlineInsertBar({
    allowSpacer,
    accent,
    isLast = false,
    onAddParagraph,
    onAddTable,
    onAddList,
    onAddLink,
    onAddImage,
    onAddSpacer,
}: {
    allowSpacer: boolean
    accent: string
    isLast?: boolean
    onAddParagraph: () => void
    onAddTable: (presetId: string) => void
    onAddList: (style: "bullet" | "number") => void
    onAddLink: () => void
    onAddImage: () => void
    onAddSpacer: (size: SpecSpacerSize) => void
}) {
    const [open, setOpen] = useState(false)
    const wrapperRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!open) return
        const handleOutside = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleOutside)
        return () => document.removeEventListener("mousedown", handleOutside)
    }, [open])

    const pick = (fn: () => void) => {
        fn()
        setOpen(false)
    }

    return (
        <div ref={wrapperRef} className="relative">
            <div
                className={`group/insert relative flex items-center justify-center py-1 transition-opacity ${
                    open || isLast
                        ? "opacity-100"
                        : "opacity-0 hover:opacity-100 focus-within:opacity-100 group-hover/sub:opacity-70"
                }`}
            >
                <div
                    className={`h-px flex-1 transition-colors ${
                        open ? "bg-[#d6d3d1]" : "bg-transparent group-hover/insert:bg-[#d6d3d1]"
                    }`}
                />
                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    title={open ? "Fermer" : "Ajouter un élément ici"}
                    className={`mx-2 flex h-6 w-6 items-center justify-center rounded-full border shadow-sm transition-all ${
                        open
                            ? "border-[#1c1917] bg-[#1c1917] text-white"
                            : "border-[#d6d3d1] bg-white text-[#1c1917] hover:scale-105 hover:border-[#1c1917] hover:bg-[#1c1917] hover:text-white"
                    }`}
                >
                    {open ? <X className="h-3 w-3" /> : <Plus className="h-3.5 w-3.5" />}
                </button>
                <div
                    className={`h-px flex-1 transition-colors ${
                        open ? "bg-[#d6d3d1]" : "bg-transparent group-hover/insert:bg-[#d6d3d1]"
                    }`}
                />
            </div>

            {open && (
                <div className="my-2 rounded-lg border border-[#d6d3d1] bg-white p-3 shadow-md">
                    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-5">
                        <InsertCell
                            icon={FileText}
                            label="Paragraphe"
                            onClick={() => pick(onAddParagraph)}
                        />
                        <InsertCell
                            icon={List}
                            label="Liste à puces"
                            onClick={() => pick(() => onAddList("bullet"))}
                        />
                        <InsertCell
                            icon={ListOrdered}
                            label="Liste numérotée"
                            onClick={() => pick(() => onAddList("number"))}
                        />
                        <InsertCell
                            icon={Link2}
                            label="Lien"
                            onClick={() => pick(onAddLink)}
                        />
                        <InsertCell
                            icon={ImageIcon}
                            label="Image (URL)"
                            onClick={() => pick(onAddImage)}
                        />
                    </div>

                    {allowSpacer && (
                        <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-[#efede8] pt-2.5">
                            <span className="flex items-center gap-1.5 text-[11px] font-medium text-[#78716c]">
                                <MoveVertical className="h-3 w-3" />
                                Espacement
                            </span>
                            <div className="flex items-center gap-1.5">
                                {(
                                    [
                                        ["sm", "16 px"],
                                        ["md", "28 px"],
                                        ["lg", "44 px"],
                                    ] as [SpecSpacerSize, string][]
                                ).map(([size, label]) => (
                                    <button
                                        key={size}
                                        type="button"
                                        onClick={() => pick(() => onAddSpacer(size))}
                                        className="rounded border border-[#e7e5e4] bg-[#faf8f5] px-2.5 py-1 font-mono text-[11px] font-medium text-[#1c1917] transition-colors hover:border-[#1c1917] hover:bg-[#1c1917] hover:text-white"
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-2.5 border-t border-[#efede8] pt-2.5">
                        <div className="mb-1.5 text-[11px] font-medium text-[#78716c]">
                            Tableaux
                        </div>
                        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                            {TABLE_PRESETS.map((preset) => (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => pick(() => onAddTable(preset.id))}
                                    className="flex items-center justify-between gap-2 rounded-md border border-[#e7e5e4] bg-[#faf8f5]/70 px-2.5 py-2 text-left transition-colors hover:border-[#1c1917] hover:bg-[#f5f3ef]"
                                >
                                    <span className="flex items-center gap-2 text-xs font-medium text-[#1c1917]">
                                        <Table2
                                            className="h-3.5 w-3.5 shrink-0"
                                            style={{ color: accent }}
                                        />
                                        {preset.label}
                                    </span>
                                    <span className="shrink-0 font-mono text-[10px] text-[#78716c]">
                                        {preset.headers.length} col.
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function InsertCell({
    icon: Icon,
    label,
    onClick,
}: {
    icon: typeof FileText
    label: string
    onClick: () => void
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex items-center gap-2 rounded-md border border-[#e7e5e4] bg-[#faf8f5]/70 px-2.5 py-2 text-left text-xs font-medium text-[#1c1917] transition-colors hover:border-[#1c1917] hover:bg-[#f5f3ef]"
        >
            <Icon className="h-3.5 w-3.5 shrink-0 text-[#57534e]" />
            <span className="truncate">{label}</span>
        </button>
    )
}

function CoverSheet({
    draft,
    accent,
    kindTitle,
    companyName,
    dateLabel,
    readOnly = false,
    onTitleChange,
}: {
    draft: SpecificationDraft
    accent: string
    kindTitle: string
    companyName: string
    dateLabel: string
    readOnly?: boolean
    onTitleChange: (title: string) => void
}) {
    const clientName = draft.clientName || "Client"
    const projectName = draft.projectName || draft.title
    const refLabel = `${draft.number || "CDC"} · v${draft.version}`
    const style = draft.coverStyle

    return (
        <section
            className="relative w-full overflow-hidden rounded-sm bg-[#faf8f5] text-[#1c1917] shadow-2xl shadow-black/25"
            style={{ minHeight: A4_HEIGHT }}
        >
            {style === "spine" && (
                <div className="flex flex-col" style={{ minHeight: A4_HEIGHT }}>
                    <div
                        className="absolute inset-y-0 left-0 w-20"
                        style={{ background: accent }}
                    />
                    <div className="flex flex-1 flex-col pl-32 pr-16 pt-24 pb-16">
                        <div
                            className="text-[11px] font-bold uppercase tracking-[0.22em]"
                            style={{ color: accent }}
                        >
                            Cahier des charges
                        </div>
                        <AutoTitleInput
                            value={draft.title}
                            readOnly={readOnly}
                            onChange={onTitleChange}
                            className="mt-4 text-[42px] font-bold leading-[1.08] tracking-[-0.04em] text-[#1c1917]"
                        />
                        <p className="mt-3 text-sm font-semibold text-[#57534e]">
                            {kindTitle} · {refLabel}
                        </p>
                        <div className="mt-auto grid grid-cols-2 gap-4 border-t border-[#e7e5e4] pt-6">
                            <MetaCell label="Client" value={clientName} />
                            <MetaCell label="Projet" value={projectName} />
                            <MetaCell label="Prestataire" value={companyName} />
                            <MetaCell label="Date" value={dateLabel} />
                        </div>
                    </div>
                </div>
            )}

            {style === "masthead" && (
                <div className="flex flex-col" style={{ minHeight: A4_HEIGHT }}>
                    <div
                        className="px-16 pb-16 pt-24 text-[#fffaf5]"
                        style={{ background: accent }}
                    >
                        <div className="text-[11px] font-bold uppercase tracking-[0.22em] opacity-90">
                            Cahier des charges
                        </div>
                        <AutoTitleInput
                            value={draft.title}
                            readOnly={readOnly}
                            onChange={onTitleChange}
                            darkBg
                            className="mt-3 text-[40px] font-bold leading-[1.08] tracking-[-0.04em] text-[#fffaf5]"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-6 px-16 py-14">
                        <MetaCell label="Client" value={clientName} />
                        <MetaCell label="Projet" value={projectName} />
                        <MetaCell label="Référence" value={refLabel} />
                        <MetaCell label="Prestataire" value={companyName} />
                    </div>
                </div>
            )}

            {style === "folio" && (
                <div className="flex flex-col px-16 py-24" style={{ minHeight: A4_HEIGHT }}>
                    <div
                        className="text-[11px] font-bold uppercase tracking-[0.22em]"
                        style={{ color: accent }}
                    >
                        Cahier des charges
                    </div>
                    <div className="my-6 h-2 w-36" style={{ background: accent }} />
                    <AutoTitleInput
                        value={draft.title}
                        readOnly={readOnly}
                        onChange={onTitleChange}
                        className="text-[50px] font-bold leading-[1.02] tracking-[-0.05em] text-[#1c1917]"
                    />
                    <p className="mt-4 text-sm font-medium text-[#57534e]">{kindTitle}</p>
                    <div className="mt-auto flex flex-wrap justify-between gap-6 border-t border-[#e7e5e4] pt-6">
                        <MetaCell label="Pour" value={clientName} />
                        <MetaCell label="Projet" value={projectName} />
                        <MetaCell label={draft.number || "CDC"} value={dateLabel} />
                    </div>
                </div>
            )}

            {style === "panel" && (
                <div className="flex flex-col p-14" style={{ minHeight: A4_HEIGHT }}>
                    <div
                        className="flex min-h-[480px] flex-col justify-end rounded-lg p-12 text-[#fffaf5]"
                        style={{ background: accent }}
                    >
                        <div className="text-[11px] font-bold uppercase tracking-[0.22em] opacity-90">
                            Cahier des charges
                        </div>
                        <AutoTitleInput
                            value={draft.title}
                            readOnly={readOnly}
                            onChange={onTitleChange}
                            darkBg
                            className="mt-3 text-[40px] font-bold leading-[1.08] tracking-[-0.04em] text-[#fffaf5]"
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-4 px-2 pt-10">
                        <MetaCell label="Client" value={clientName} />
                        <MetaCell label="Projet" value={projectName} />
                        <MetaCell label="Réf." value={refLabel} />
                    </div>
                </div>
            )}

            {style === "ledger" && (
                <div className="flex flex-col px-16 py-20" style={{ minHeight: A4_HEIGHT }}>
                    <div className="flex items-center gap-2.5">
                        <div className="h-3.5 w-3.5 rounded-full" style={{ background: accent }} />
                        <div className="text-[11px] font-bold uppercase tracking-[0.22em]">
                            Cahier des charges
                        </div>
                    </div>
                    <AutoTitleInput
                        value={draft.title}
                        readOnly={readOnly}
                        onChange={onTitleChange}
                        className="my-6 text-[36px] font-bold leading-[1.08] tracking-[-0.04em] text-[#1c1917]"
                    />
                    <div className="divide-y divide-[#e7e5e4] border-t border-[#e7e5e4] text-sm">
                        {[
                            ["Client", clientName],
                            ["Projet", projectName],
                            ["Type", kindTitle],
                            ["Référence", refLabel],
                            ["Prestataire", companyName],
                            ["Date", dateLabel],
                        ].map(([k, v]) => (
                            <div key={k} className="grid grid-cols-[140px_1fr] gap-3 py-3.5">
                                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#78716c]">
                                    {k}
                                </span>
                                <span className="font-semibold text-[#1c1917]">{v}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="pointer-events-none absolute bottom-4 right-6 text-[10px] uppercase tracking-[0.18em] text-[#a8a29e]">
                Sharaco
            </div>
        </section>
    )
}

function MetaCell({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#78716c]">
                {label}
            </div>
            <div className="mt-0.5 text-sm font-semibold text-[#1c1917]">{value}</div>
        </div>
    )
}

function DeferredTextInput({
    value,
    onCommit,
    transform,
    placeholder,
    className,
}: {
    value: string
    onCommit: (next: string) => void
    transform?: (raw: string) => string
    placeholder?: string
    className?: string
}) {
    const { local, setLocal, flush } = useLocalText(value, onCommit)
    return (
        <input
            type="text"
            value={local}
            onChange={(e) => setLocal(transform ? transform(e.target.value) : e.target.value)}
            onBlur={flush}
            placeholder={placeholder}
            className={className}
        />
    )
}

function AutoTitleInput({
    value,
    onChange,
    className,
    darkBg,
    readOnly = false,
}: {
    value: string
    onChange: (value: string) => void
    className?: string
    darkBg?: boolean
    readOnly?: boolean
}) {
    const { local, setLocal, flush } = useLocalText(value, onChange)
    const ref = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return
        el.style.height = "0px"
        el.style.height = `${el.scrollHeight}px`
    }, [local])

    if (readOnly) {
        return <h1 className={className}>{value}</h1>
    }

    return (
        <textarea
            ref={ref}
            rows={1}
            value={local}
            onChange={(e) => setLocal(e.target.value)}
            onBlur={flush}
            placeholder="Titre du cahier des charges"
            className={`w-full resize-none overflow-hidden rounded bg-transparent outline-none transition-colors ${
                darkBg
                    ? "placeholder:text-white/50 focus:bg-white/10"
                    : "placeholder:text-[#a8a29e] focus:bg-black/[0.03]"
            } ${className || ""}`}
        />
    )
}

function BlockCanvas({
    block,
    accent,
    readOnly = false,
    canRemove,
    onChange,
    onRemove,
}: {
    block: SpecBlock
    accent: string
    readOnly?: boolean
    canRemove: boolean
    onChange: (block: SpecBlock) => void
    onRemove: () => void
}) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const paragraphValue = block.type === "paragraph" ? block.text : ""
    const {
        local: paragraphLocal,
        setLocal: setParagraphLocal,
        flush: flushParagraph,
    } = useLocalText(paragraphValue, (text) => onChange({ type: "paragraph", text }))

    useEffect(() => {
        if (block.type !== "paragraph" || readOnly) return
        const el = textareaRef.current
        if (!el) return
        el.style.height = "0px"
        el.style.height = `${Math.max(40, el.scrollHeight)}px`
    }, [block.type, paragraphLocal, readOnly])

    if (readOnly) {
        if (block.type === "spacer") {
            const size: SpecSpacerSize = block.size || "md"
            const h = size === "sm" ? "h-4" : size === "lg" ? "h-11" : "h-7"
            return <div className={h} />
        }
        if (block.type === "list") {
            const items = (block.items || []).filter((item) => item.trim().length > 0)
            const ListTag = block.style === "number" ? "ol" : "ul"
            return (
                <ListTag
                    className={
                        block.style === "number"
                            ? "my-2 list-decimal space-y-1.5 pl-6 text-[13px] leading-[1.7] text-[#44403c]"
                            : "my-2 list-disc space-y-1.5 pl-6 text-[13px] leading-[1.7] text-[#44403c]"
                    }
                >
                    {items.map((item, idx) => (
                        <li key={idx}>{renderFormattedText(item)}</li>
                    ))}
                </ListTag>
            )
        }
        if (block.type === "link") {
            const valid = isHttpUrl(block.url)
            if (!valid) {
                return (
                    <p className="text-[13px] leading-[1.7] text-[#44403c]">
                        {renderFormattedText(block.label || "")}
                    </p>
                )
            }
            return (
                <p className="my-1">
                    <a
                        href={block.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[13px] font-semibold underline"
                        style={{ color: accent }}
                    >
                        {block.label || block.url}
                    </a>
                </p>
            )
        }
        if (block.type === "image") {
            if (!isHttpUrl(block.url)) return null
            return (
                <figure className="my-4">
                    <img
                        src={block.url}
                        alt={block.caption || "Illustration"}
                        className="max-h-80 w-full rounded border border-[#e7e5e4] bg-[#faf8f5] object-contain"
                    />
                    {block.caption && (
                        <figcaption className="mt-2 text-xs text-[#78716c]">
                            {renderFormattedText(block.caption)}
                        </figcaption>
                    )}
                </figure>
            )
        }
        if (block.type === "table") {
            const headers = block.headers.length > 0 ? block.headers : ["Colonne 1", "Colonne 2"]
            const rows = block.rows.length > 0 ? block.rows : [headers.map(() => "")]
            return (
                <div className="my-4 overflow-x-auto rounded-sm border border-[#e7e5e4] bg-white">
                    <table className="w-full border-collapse text-xs">
                        <thead>
                            <tr style={{ background: accent }} className="text-[#fffaf5]">
                                {headers.map((h, i) => (
                                    <th key={i} className="px-3 py-2.5 text-left font-semibold">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, rIdx) => (
                                <tr key={rIdx} className="border-t border-[#e7e5e4]">
                                    {headers.map((_, cIdx) => (
                                        <td
                                            key={cIdx}
                                            className="px-3 py-2.5 align-top leading-relaxed text-[#1c1917]"
                                        >
                                            {renderFormattedText(row[cIdx] ?? "")}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )
        }
        return (
            <p className="text-[13px] leading-[1.75] text-[#44403c]">
                {renderFormattedText(block.text || "")}
            </p>
        )
    }

    if (block.type === "spacer") {
        const size: SpecSpacerSize = block.size || "md"
        const heightMap: Record<SpecSpacerSize, string> = {
            sm: "h-4",
            md: "h-7",
            lg: "h-11",
        }
        const labelMap: Record<SpecSpacerSize, string> = {
            sm: "Petit espace (16 px)",
            md: "Espace moyen (28 px)",
            lg: "Grand espace max (44 px)",
        }

        return (
            <div
                className={`group/spacer relative flex w-full items-center justify-between rounded border border-dashed border-[#d6d3d1] bg-[#f5f3ef]/60 px-3 transition-colors hover:border-[#a8a29e] ${heightMap[size]}`}
            >
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#78716c]">
                    {labelMap[size]}
                </span>
                <div className="flex items-center gap-1 opacity-80 group-hover/spacer:opacity-100">
                    {(["sm", "md", "lg"] as SpecSpacerSize[]).map((s) => (
                        <button
                            key={s}
                            type="button"
                            onClick={() => onChange({ type: "spacer", size: s })}
                            className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${
                                size === s
                                    ? "bg-[#1c1917] text-white"
                                    : "text-[#78716c] hover:bg-[#e7e5e4]"
                            }`}
                        >
                            {s === "sm" ? "S" : s === "md" ? "M" : "L"}
                        </button>
                    ))}
                    {canRemove && (
                        <button
                            type="button"
                            onClick={onRemove}
                            title="Supprimer cet espace"
                            className="ml-1 rounded p-0.5 text-[#78716c] hover:text-rose-600"
                        >
                            <Trash2 className="h-3 w-3" />
                        </button>
                    )}
                </div>
            </div>
        )
    }

    if (block.type === "list") {
        const items = block.items.length > 0 ? block.items : [""]
        const ListTag = block.style === "number" ? "ol" : "ul"
        return (
            <div className="group/list rounded-md border border-[#e7e5e4] bg-white/70 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                        <List className="h-3.5 w-3.5 text-[#78716c]" />
                        <button
                            type="button"
                            onClick={() => onChange({ ...block, style: "bullet" })}
                            className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                                block.style === "bullet" ? "bg-[#1c1917] text-white" : "text-[#57534e] hover:bg-[#e7e5e4]"
                            }`}
                        >
                            Puces
                        </button>
                        <button
                            type="button"
                            onClick={() => onChange({ ...block, style: "number" })}
                            className={`rounded px-2 py-0.5 text-[11px] font-semibold ${
                                block.style === "number" ? "bg-[#1c1917] text-white" : "text-[#57534e] hover:bg-[#e7e5e4]"
                            }`}
                        >
                            Numéros
                        </button>
                    </div>
                    {canRemove && (
                        <button type="button" onClick={onRemove} className="text-[#a8a29e] hover:text-rose-600">
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
                <ListTag className={block.style === "number" ? "list-decimal space-y-1.5 pl-5" : "list-disc space-y-1.5 pl-5"}>
                    {items.map((item, idx) => (
                        <li key={`${idx}-${items.length}`} className="flex items-center gap-2">
                            <DeferredTextInput
                                value={item}
                                onCommit={(next) => {
                                    const nextItems = [...items]
                                    nextItems[idx] = next
                                    onChange({ ...block, items: nextItems })
                                }}
                                placeholder={`Point ${idx + 1}`}
                                className="w-full bg-transparent text-[13px] leading-relaxed text-[#44403c] outline-none"
                            />
                            {items.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        onChange({ ...block, items: items.filter((_, i) => i !== idx) })
                                    }
                                    className="text-[#a8a29e] hover:text-rose-600"
                                >
                                    ×
                                </button>
                            )}
                        </li>
                    ))}
                </ListTag>
                {items.length < 20 && (
                    <button
                        type="button"
                        onClick={() => onChange({ ...block, items: [...items, ""] })}
                        className="mt-2 text-[11px] font-semibold text-[#57534e] hover:text-[#1c1917]"
                    >
                        + Élément
                    </button>
                )}
            </div>
        )
    }

    if (block.type === "link") {
        const valid = isHttpUrl(block.url)
        return (
            <div className="group/link space-y-2 rounded-md border border-[#e7e5e4] bg-white/70 p-3">
                <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#78716c]">
                        <Link2 className="h-3.5 w-3.5" />
                        Lien externe
                    </span>
                    {canRemove && (
                        <button type="button" onClick={onRemove} className="text-[#a8a29e] hover:text-rose-600">
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
                <DeferredTextInput
                    value={block.label}
                    onCommit={(label) => onChange({ ...block, label })}
                    placeholder="Libellé affiché"
                    className="w-full border-b border-transparent bg-transparent text-[13px] font-semibold text-[#1c1917] outline-none focus:border-[#d6d3d1]"
                />
                <DeferredTextInput
                    value={block.url}
                    onCommit={(url) => onChange({ ...block, url: url.trim() })}
                    placeholder="https://…"
                    className="w-full bg-transparent font-mono text-[12px] text-[#57534e] outline-none"
                />
                {block.url && !valid && (
                    <p className="text-[11px] text-rose-600">URL http ou https uniquement.</p>
                )}
                {valid && (
                    <a
                        href={block.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-[12px] font-semibold underline"
                        style={{ color: accent }}
                    >
                        {block.label || block.url}
                    </a>
                )}
            </div>
        )
    }

    if (block.type === "image") {
        const valid = isHttpUrl(block.url)
        return (
            <div className="group/image space-y-2 rounded-md border border-[#e7e5e4] bg-white/70 p-3">
                <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#78716c]">
                        <ImageIcon className="h-3.5 w-3.5" />
                        Image (lien public)
                    </span>
                    {canRemove && (
                        <button type="button" onClick={onRemove} className="text-[#a8a29e] hover:text-rose-600">
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
                <DeferredTextInput
                    value={block.url}
                    onCommit={(url) => onChange({ ...block, url: url.trim() })}
                    placeholder="https://exemple.com/illustration.jpg"
                    className="w-full bg-transparent font-mono text-[12px] text-[#57534e] outline-none"
                />
                <DeferredTextInput
                    value={block.caption}
                    onCommit={(caption) => onChange({ ...block, caption })}
                    placeholder="Légende (optionnel)"
                    className="w-full bg-transparent text-[12px] text-[#44403c] outline-none"
                />
                {block.url && !valid && (
                    <p className="text-[11px] text-rose-600">Lien http ou https uniquement. Pas d’upload interne.</p>
                )}
                {valid && (
                    <img
                        src={block.url}
                        alt={block.caption || "Illustration"}
                        className="max-h-64 w-full rounded border border-[#e7e5e4] object-contain bg-[#faf8f5]"
                    />
                )}
            </div>
        )
    }

    if (block.type === "table") {
        const headers = block.headers.length > 0 ? block.headers : ["Colonne 1", "Colonne 2"]
        const rows = block.rows.length > 0 ? block.rows : [headers.map(() => "")]

        const updateHeader = (colIdx: number, value: string) => {
            const next = [...headers]
            next[colIdx] = value
            onChange({ type: "table", headers: next, rows })
        }

        const updateCell = (rIdx: number, cIdx: number, value: string) => {
            const nextRows = rows.map((item) => [...item])
            while (nextRows[rIdx].length < headers.length) {
                nextRows[rIdx].push("")
            }
            nextRows[rIdx][cIdx] = value
            onChange({ type: "table", headers, rows: nextRows })
        }

        const addColumn = () => {
            if (headers.length >= 6) return
            onChange({
                type: "table",
                headers: [...headers, `Colonne ${headers.length + 1}`],
                rows: rows.map((r) => [...r, ""]),
            })
        }

        const removeColumn = (colIdx: number) => {
            if (headers.length <= 2) return
            onChange({
                type: "table",
                headers: headers.filter((_, i) => i !== colIdx),
                rows: rows.map((r) => r.filter((_, i) => i !== colIdx)),
            })
        }

        const addRow = () => {
            onChange({
                type: "table",
                headers,
                rows: [...rows, headers.map(() => "")],
            })
        }

        const removeRow = (rowIdx: number) => {
            if (rows.length <= 1) return
            onChange({
                type: "table",
                headers,
                rows: rows.filter((_, i) => i !== rowIdx),
            })
        }

        return (
            <div className="group/table relative my-2 overflow-hidden rounded-md border border-[#e7e5e4] bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                        <thead>
                            <tr style={{ background: accent }} className="text-[#fffaf5]">
                                {headers.map((h, colIdx) => (
                                    <th
                                        key={`h-${colIdx}`}
                                        className="border-r border-white/15 p-0 last:border-r-0"
                                    >
                                        <div className="flex items-center">
                                            <DeferredTextInput
                                                value={h}
                                                onCommit={(next) => updateHeader(colIdx, next)}
                                                placeholder={`Colonne ${colIdx + 1}`}
                                                className="w-full min-w-[90px] bg-transparent px-2.5 py-2 font-semibold text-[#fffaf5] outline-none placeholder:text-white/60"
                                            />
                                            {headers.length > 2 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeColumn(colIdx)}
                                                    title="Supprimer la colonne"
                                                    className="px-1.5 text-white/60 opacity-0 hover:text-white group-hover/table:opacity-100"
                                                >
                                                    ×
                                                </button>
                                            )}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, rIdx) => (
                                <tr key={`r-${rIdx}`} className="border-t border-[#e7e5e4]">
                                    {headers.map((_, cIdx) => (
                                        <td
                                            key={`c-${rIdx}-${cIdx}`}
                                            className="border-r border-[#e7e5e4] p-0 align-top last:border-r-0"
                                        >
                                            <div className="flex items-center">
                                                <DeferredTextInput
                                                    value={row[cIdx] ?? ""}
                                                    onCommit={(next) => updateCell(rIdx, cIdx, next)}
                                                    placeholder="Saisir…"
                                                    className="w-full min-w-[90px] bg-transparent px-3 py-2.5 text-[#1c1917] outline-none focus:bg-[#faf8f5]"
                                                />
                                                {cIdx === headers.length - 1 && rows.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => removeRow(rIdx)}
                                                        title="Supprimer la ligne"
                                                        className="px-1.5 text-[#a8a29e] opacity-0 hover:text-rose-600 group-hover/table:opacity-100"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#e7e5e4] bg-[#faf8f5] px-2.5 py-1.5 text-[11px] text-[#78716c]">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={addRow}
                            className="font-semibold hover:text-[#1c1917]"
                        >
                            + Ligne
                        </button>
                        {headers.length < 6 && (
                            <button
                                type="button"
                                onClick={addColumn}
                                className="font-semibold hover:text-[#1c1917]"
                            >
                                + Colonne
                            </button>
                        )}
                    </div>
                    {canRemove && (
                        <button
                            type="button"
                            onClick={onRemove}
                            className="text-[#a8a29e] hover:text-rose-600"
                        >
                            Supprimer le tableau
                        </button>
                    )}
                </div>
            </div>
        )
    }

    const wrapBold = () => {
        const el = textareaRef.current
        if (!el) return
        const start = el.selectionStart
        const end = el.selectionEnd
        const text = paragraphLocal || ""
        const selected = text.slice(start, end) || "élément clé"
        const next = `${text.slice(0, start)}**${selected}**${text.slice(end)}`
        setParagraphLocal(next)
        onChange({ type: "paragraph", text: next })
    }

    return (
        <div className="group/para relative">
            <textarea
                ref={textareaRef}
                rows={1}
                value={paragraphLocal}
                onChange={(e) => setParagraphLocal(e.target.value)}
                onBlur={flushParagraph}
                placeholder="Rédigez ce point… (**mot** pour mettre en gras)"
                className="w-full resize-none overflow-hidden rounded bg-transparent pr-14 text-[13px] leading-[1.7] text-[#44403c] outline-none placeholder:text-[#a8a29e] focus:bg-white"
            />
            <div className="absolute right-1 top-0.5 flex items-center gap-0.5 opacity-0 transition-opacity group-hover/para:opacity-100 focus-within:opacity-100">
                <button
                    type="button"
                    onClick={wrapBold}
                    title="Mettre la sélection en gras (**texte**)"
                    className="rounded p-1 text-[#78716c] hover:bg-[#e7e5e4] hover:text-[#1c1917]"
                >
                    <Bold className="h-3.5 w-3.5" />
                </button>
                {canRemove && (
                    <button
                        type="button"
                        onClick={onRemove}
                        title="Supprimer ce paragraphe"
                        className="rounded p-1 text-[#a8a29e] hover:bg-[#e7e5e4] hover:text-rose-600"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
        </div>
    )
}
