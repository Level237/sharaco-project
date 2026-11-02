import type { SpecBlock, SpecSection, SpecificationDraft } from "./types"

export const A4_HEIGHT = 1123
export const PAGE_INNER = 995

const TOC_HEADER = 72
const TOC_PART = 28
const TOC_SUB = 22
const TOC_GAP = 10
const SEC_HEAD = 78
const SUB_HEAD = 44
const INSERT = 22

export type BodyUnit =
    | { kind: "sec-head"; sectionId: string; sIdx: number }
    | { kind: "sub-head"; sectionId: string; sIdx: number; subId: string; subIdx: number }
    | { kind: "block"; sectionId: string; sIdx: number; subId: string; subIdx: number; bIdx: number }

export type TocEntry =
    | { kind: "part"; sectionId: string; sIdx: number; page: number }
    | { kind: "sub"; sectionId: string; subId: string; sIdx: number; subIdx: number; page: number }

export interface SpecPagePlan {
    total: number
    tocStart: number
    bodyStart: number
    tocPages: TocEntry[][]
    bodyPages: BodyUnit[][]
    sectionPages: Record<string, number>
    subsectionPages: Record<string, number>
}

function blockHeight(block: SpecBlock, edit: boolean): number {
    const extra = edit ? INSERT : 0
    switch (block.type) {
        case "spacer":
            return (block.size === "sm" ? 16 : block.size === "lg" ? 44 : 28) + extra
        case "table":
            return 40 + Math.max(1, block.rows?.length || 1) * 34 + extra
        case "list":
            return 18 + Math.max(1, block.items?.length || 1) * 26 + extra
        case "image":
            return 280 + extra
        case "link":
            return 36 + extra
        default: {
            const lines = Math.max(1, Math.ceil((block.text || "").length / 88))
            return lines * 22 + 16 + extra
        }
    }
}

function pack<T>(items: { item: T; height: number }[], inner: number, header = 0): T[][] {
    const pages: T[][] = []
    let current: T[] = []
    let used = header
    const pushPage = () => {
        if (current.length) pages.push(current)
        current = []
        used = header
    }
    for (const { item, height } of items) {
        const h = Math.min(height, inner - 8)
        if (current.length && used + h > inner) pushPage()
        current.push(item)
        used += h
    }
    if (current.length) pages.push(current)
    return pages.length ? pages : [[]]
}

export function paginateDraft(draft: SpecificationDraft, edit = false): SpecPagePlan {
    const units: { item: BodyUnit; height: number }[] = []
    for (let sIdx = 0; sIdx < draft.sections.length; sIdx++) {
        const section = draft.sections[sIdx]
        units.push({ item: { kind: "sec-head", sectionId: section.id, sIdx }, height: SEC_HEAD })
        for (let subIdx = 0; subIdx < section.subsections.length; subIdx++) {
            const sub = section.subsections[subIdx]
            units.push({
                item: { kind: "sub-head", sectionId: section.id, sIdx, subId: sub.id, subIdx },
                height: SUB_HEAD + (edit ? INSERT : 0),
            })
            sub.blocks.forEach((block, bIdx) => {
                units.push({
                    item: { kind: "block", sectionId: section.id, sIdx, subId: sub.id, subIdx, bIdx },
                    height: blockHeight(block, edit),
                })
            })
        }
    }

    const bodyPages = pack(units, PAGE_INNER)
    const tocLoad =
        TOC_HEADER +
        draft.sections.reduce(
            (n, s) => n + TOC_PART + TOC_GAP + s.subsections.length * TOC_SUB,
            0
        )
    const guessTocPages = Math.max(1, Math.ceil(tocLoad / PAGE_INNER))
    const guessedBodyStart = 2 + guessTocPages

    const sectionPages: Record<string, number> = {}
    const subsectionPages: Record<string, number> = {}
    bodyPages.forEach((page, idx) => {
        const pageNo = guessedBodyStart + idx
        for (const unit of page) {
            if (unit.kind === "sec-head" && sectionPages[unit.sectionId] == null) {
                sectionPages[unit.sectionId] = pageNo
            }
            if (unit.kind === "sub-head" && subsectionPages[unit.subId] == null) {
                subsectionPages[unit.subId] = pageNo
            }
        }
    })

    const tocItems: { item: TocEntry; height: number }[] = []
    for (let sIdx = 0; sIdx < draft.sections.length; sIdx++) {
        const section = draft.sections[sIdx]
        const page = sectionPages[section.id] || guessedBodyStart
        tocItems.push({
            item: { kind: "part", sectionId: section.id, sIdx, page },
            height: TOC_PART + TOC_GAP,
        })
        for (let subIdx = 0; subIdx < section.subsections.length; subIdx++) {
            const sub = section.subsections[subIdx]
            tocItems.push({
                item: {
                    kind: "sub",
                    sectionId: section.id,
                    subId: sub.id,
                    sIdx,
                    subIdx,
                    page: subsectionPages[sub.id] || page,
                },
                height: TOC_SUB,
            })
        }
    }

    const tocPages = pack(tocItems, PAGE_INNER, TOC_HEADER)
    const tocPageCount = Math.max(1, tocPages.length)
    const bodyStart = 2 + tocPageCount
    const shift = bodyStart - guessedBodyStart
    if (shift !== 0) {
        for (const key of Object.keys(sectionPages)) sectionPages[key] += shift
        for (const key of Object.keys(subsectionPages)) subsectionPages[key] += shift
        for (const page of tocPages) {
            for (const entry of page) entry.page += shift
        }
    }

    return {
        total: 1 + tocPageCount + Math.max(1, bodyPages.length),
        tocStart: 2,
        bodyStart,
        tocPages,
        bodyPages: bodyPages.length ? bodyPages : [[]],
        sectionPages,
        subsectionPages,
    }
}

export function findSection(sections: SpecSection[], id: string) {
    return sections.find((s) => s.id === id) || null
}
