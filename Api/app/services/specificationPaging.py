"""Pagination A4 approximative du CDC (sommaire + numéros de page)."""

PAGE_INNER = 995
TOC_HEADER = 72
TOC_PART = 28
TOC_SUB = 22
TOC_GAP = 10
SEC_HEAD = 78
SUB_HEAD = 44


def _block_height(block: dict) -> int:
    kind = block.get("type") or "paragraph"
    if kind == "spacer":
        size = block.get("size") or "md"
        return 16 if size == "sm" else 44 if size == "lg" else 28
    if kind == "table":
        rows = block.get("rows") or []
        return 40 + max(1, len(rows)) * 34
    if kind == "list":
        items = block.get("items") or []
        return 18 + max(1, len(items)) * 26
    if kind == "image":
        return 280
    if kind == "link":
        return 36
    text = block.get("text") or ""
    lines = max(1, (len(text) + 87) // 88)
    return lines * 22 + 16


def _pack(items: list[tuple[object, int]], inner: int, header: int = 0) -> list[list]:
    pages: list[list] = []
    current: list = []
    used = header

    def push():
        nonlocal current, used
        if current:
            pages.append(current)
        current = []
        used = header

    for item, height in items:
        h = min(height, inner - 8)
        if current and used + h > inner:
            push()
        current.append(item)
        used += h
    if current:
        pages.append(current)
    return pages or [[]]


def build_page_map(sections: list[dict]) -> dict:
    units: list[tuple[dict, int]] = []
    for s_idx, section in enumerate(sections or []):
        units.append(({"kind": "sec-head", "id": section.get("id")}, SEC_HEAD))
        for sub in section.get("subsections") or []:
            units.append(({"kind": "sub-head", "id": sub.get("id"), "section_id": section.get("id")}, SUB_HEAD))
            for block in sub.get("blocks") or []:
                units.append(({"kind": "block", "id": sub.get("id")}, _block_height(block)))

    body_pages = _pack(units, PAGE_INNER)
    toc_load = TOC_HEADER + sum(
        TOC_PART + TOC_GAP + len(s.get("subsections") or []) * TOC_SUB for s in (sections or [])
    )
    guess_toc = max(1, (toc_load + PAGE_INNER - 1) // PAGE_INNER)
    body_start = 2 + guess_toc

    section_pages: dict[str, int] = {}
    subsection_pages: dict[str, int] = {}
    for idx, page in enumerate(body_pages):
        page_no = body_start + idx
        for unit in page:
            if unit["kind"] == "sec-head" and unit["id"] not in section_pages:
                section_pages[str(unit["id"])] = page_no
            if unit["kind"] == "sub-head" and unit["id"] not in subsection_pages:
                subsection_pages[str(unit["id"])] = page_no

    toc_items: list[tuple[dict, int]] = []
    for s_idx, section in enumerate(sections or []):
        sid = str(section.get("id"))
        page = section_pages.get(sid, body_start)
        toc_items.append(({"kind": "part", "id": sid, "s_idx": s_idx, "page": page}, TOC_PART + TOC_GAP))
        for sub_idx, sub in enumerate(section.get("subsections") or []):
            sub_id = str(sub.get("id"))
            toc_items.append(
                (
                    {
                        "kind": "sub",
                        "id": sub_id,
                        "section_id": sid,
                        "s_idx": s_idx,
                        "sub_idx": sub_idx,
                        "page": subsection_pages.get(sub_id, page),
                    },
                    TOC_SUB,
                )
            )

    toc_pages = _pack(toc_items, PAGE_INNER, TOC_HEADER)
    toc_count = max(1, len(toc_pages))
    body_start_final = 2 + toc_count
    shift = body_start_final - body_start
    if shift:
        section_pages = {k: v + shift for k, v in section_pages.items()}
        subsection_pages = {k: v + shift for k, v in subsection_pages.items()}
        for page in toc_pages:
            for entry in page:
                entry["page"] += shift

    total = 1 + toc_count + max(1, len(body_pages))
    return {
        "total": total,
        "toc_count": toc_count,
        "body_start": body_start_final,
        "section_pages": section_pages,
        "subsection_pages": subsection_pages,
        "toc_pages": toc_pages,
    }


def css_content(value: str) -> str:
    return (value or "").replace("\\", "\\\\").replace('"', '\\"')
