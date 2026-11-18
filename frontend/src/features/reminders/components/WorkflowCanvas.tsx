"use client";

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type PointerEvent as ReactPointerEvent,
} from "react";
import { Maximize2, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkflowNode, type PortSide } from "./WorkflowNode";
import type { ReminderConfigUpdate } from "../types";
import type { SelectedNode } from "./WorkflowInspector";
import type { WorkflowId, WorkflowNodeTone } from "../data/workflows";

type CanvasProps = {
    workflowId: WorkflowId;
    form: ReminderConfigUpdate;
    selected: SelectedNode | null;
    onSelect: (node: SelectedNode) => void;
    focusNodeId?: string | null;
};

type NodeId = string;

type NodeBox = {
    id: NodeId;
    x: number;
    y: number;
    w: number;
    h: number;
};

type GraphItem = {
    id: NodeId;
    tag: string;
    title: string;
    sub: string;
    tone?: WorkflowNodeTone;
    ports: PortSide[];
    off?: boolean;
    soon?: boolean;
};

type Wire = {
    from: { id: NodeId; port: PortSide };
    to: { id: NodeId; port: PortSide };
    label?: string;
    labelAt?: "from" | "mid";
};

const NODE_H = 96;
const W1 = 214;
const W2 = 236;
const W3 = 268;
const MIN_ZOOM = 0.4;
const MAX_ZOOM = 1.8;
const ZOOM_STEP = 0.1;

function quoteLayout(): Record<NodeId, NodeBox> {
    const x1 = 48;
    const x2 = 348;
    const x3 = 712;
    const rows = [40, 164, 288, 412];
    const midY = 226;
    return {
        trigger: { id: "trigger", x: x1, y: midY, w: W1, h: NODE_H },
        stop: { id: "stop", x: x2, y: 40, w: W2, h: NODE_H },
        gate: { id: "gate", x: x2, y: midY, w: W2, h: NODE_H },
        mail1: { id: "mail1", x: x3, y: rows[0], w: W3, h: NODE_H },
        mail2: { id: "mail2", x: x3, y: rows[1], w: W3, h: NODE_H },
        mail3: { id: "mail3", x: x3, y: rows[2], w: W3, h: NODE_H },
        idle: { id: "idle", x: x3, y: rows[3], w: W3, h: NODE_H },
    };
}

function invoiceLayout(): Record<NodeId, NodeBox> {
    const x1 = 48;
    const x2 = 348;
    const x3 = 712;
    const rows = [40, 164, 288];
    const midY = 226;
    return {
        trigger: { id: "trigger", x: x1, y: midY, w: W1, h: NODE_H },
        stop: { id: "stop", x: x2, y: 40, w: W2, h: NODE_H },
        gate: { id: "gate", x: x2, y: midY, w: W2, h: NODE_H },
        j3: { id: "j3", x: x3, y: rows[0], w: W3, h: NODE_H },
        j1: { id: "j1", x: x3, y: rows[1], w: W3, h: NODE_H },
        digest: { id: "digest", x: x3, y: rows[2], w: W3, h: NODE_H },
        manual: { id: "manual", x: x3, y: 432, w: W3, h: NODE_H },
    };
}

function portPoint(box: NodeBox, port: PortSide) {
    if (port === "left") return { x: box.x, y: box.y + box.h / 2 };
    if (port === "right") return { x: box.x + box.w, y: box.y + box.h / 2 };
    if (port === "top") return { x: box.x + box.w / 2, y: box.y };
    return { x: box.x + box.w / 2, y: box.y + box.h };
}

function clampZoom(value: number) {
    return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.round(value * 100) / 100));
}

export function WorkflowCanvas({
    workflowId,
    form,
    selected,
    onSelect,
    focusNodeId = null,
}: CanvasProps) {
    const viewportRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [tx, setTx] = useState(32);
    const [ty, setTy] = useState(48);
    const [panning, setPanning] = useState(false);
    const [draggingId, setDraggingId] = useState<NodeId | null>(null);
    const [boxes, setBoxes] = useState<Record<NodeId, NodeBox>>(() =>
        workflowId === "devis" ? quoteLayout() : invoiceLayout()
    );

    const camera = useRef({ scale: 1, tx: 32, ty: 48 });
    const panRef = useRef<{ x: number; y: number } | null>(null);
    const dragRef = useRef<{
        id: NodeId;
        startX: number;
        startY: number;
        origX: number;
        origY: number;
        moved: boolean;
    } | null>(null);

    useEffect(() => {
        camera.current = { scale, tx, ty };
    }, [scale, tx, ty]);

    useEffect(() => {
        const next = workflowId === "devis" ? quoteLayout() : invoiceLayout();
        setBoxes(next);
        setDraggingId(null);
        requestAnimationFrame(() => fitToView(next));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workflowId]);

    useEffect(() => {
        if (!focusNodeId) return;
        const box = boxes[focusNodeId];
        const viewport = viewportRef.current;
        if (!box || !viewport) return;
        const nextScale = clampZoom(window.innerWidth < 768 ? 0.82 : 1);
        setScale(nextScale);
        const offsetY = window.innerWidth < 1024 ? 36 : 0;
        setTx(viewport.clientWidth / 2 - (box.x + box.w / 2) * nextScale);
        setTy(viewport.clientHeight / 2 - (box.y + box.h / 2) * nextScale - offsetY);
    }, [focusNodeId, boxes]);

    const items = useMemo(
        () => (workflowId === "devis" ? quoteItems(form) : invoiceItems()),
        [workflowId, form]
    );
    const wires = useMemo(
        () => (workflowId === "devis" ? quoteWires() : invoiceWires()),
        [workflowId]
    );

    const scene = useMemo(() => {
        const values = Object.values(boxes);
        const maxX = Math.max(...values.map((n) => n.x + n.w), 900);
        const maxY = Math.max(...values.map((n) => n.y + n.h), 500);
        return { w: maxX + 80, h: maxY + 80 };
    }, [boxes]);

    const zoomAt = useCallback((clientX: number, clientY: number, nextScale: number) => {
        const viewport = viewportRef.current;
        if (!viewport) return;
        const rect = viewport.getBoundingClientRect();
        const px = clientX - rect.left;
        const py = clientY - rect.top;
        const { scale: s, tx: cx, ty: cy } = camera.current;
        const worldX = (px - cx) / s;
        const worldY = (py - cy) / s;
        const clamped = clampZoom(nextScale);
        setScale(clamped);
        setTx(px - worldX * clamped);
        setTy(py - worldY * clamped);
    }, []);

    const fitToView = useCallback(
        (layout = boxes) => {
            const viewport = viewportRef.current;
            if (!viewport) return;
            const values = Object.values(layout);
            if (!values.length) return;
            const minX = Math.min(...values.map((n) => n.x)) - 40;
            const minY = Math.min(...values.map((n) => n.y)) - 40;
            const maxX = Math.max(...values.map((n) => n.x + n.w)) + 40;
            const maxY = Math.max(...values.map((n) => n.y + n.h)) + 40;
            const w = maxX - minX;
            const h = maxY - minY;
            const next = clampZoom(
                Math.min((viewport.clientWidth - 48) / w, (viewport.clientHeight - 48) / h, 1.05)
            );
            setScale(next);
            setTx((viewport.clientWidth - w * next) / 2 - minX * next);
            setTy((viewport.clientHeight - h * next) / 2 - minY * next);
        },
        [boxes]
    );

    useEffect(() => {
        const viewport = viewportRef.current;
        if (!viewport) return;
        const onWheelNative = (event: WheelEvent) => {
            event.preventDefault();
            if (event.ctrlKey || event.metaKey) {
                const factor = event.deltaY > 0 ? 0.92 : 1.08;
                zoomAt(event.clientX, event.clientY, camera.current.scale * factor);
                return;
            }
            setTx((value) => value - event.deltaX);
            setTy((value) => value - event.deltaY);
        };
        viewport.addEventListener("wheel", onWheelNative, { passive: false });
        return () => viewport.removeEventListener("wheel", onWheelNative);
    }, [zoomAt]);

    const onBackgroundPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (event.button !== 0 && event.button !== 1) return;
        if ((event.target as HTMLElement).closest("[data-wf-node]")) return;
        panRef.current = { x: event.clientX, y: event.clientY };
        setPanning(true);
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const applyPointerMove = (clientX: number, clientY: number) => {
        const drag = dragRef.current;
        if (drag) {
            const dx = (clientX - drag.startX) / camera.current.scale;
            const dy = (clientY - drag.startY) / camera.current.scale;
            if (!drag.moved && Math.abs(dx) + Math.abs(dy) < 6) return;
            drag.moved = true;
            setDraggingId(drag.id);
            setBoxes((prev) => ({
                ...prev,
                [drag.id]: {
                    ...prev[drag.id],
                    x: drag.origX + dx,
                    y: drag.origY + dy,
                },
            }));
            return;
        }
        if (!panRef.current) return;
        const dx = clientX - panRef.current.x;
        const dy = clientY - panRef.current.y;
        panRef.current = { x: clientX, y: clientY };
        setTx((value) => value + dx);
        setTy((value) => value + dy);
    };

    const onViewportPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
        applyPointerMove(event.clientX, event.clientY);
    };

    const endInteraction = () => {
        dragRef.current = null;
        panRef.current = null;
        setPanning(false);
        setDraggingId(null);
    };

    const startNodeDrag = (id: NodeId, event: ReactPointerEvent<HTMLButtonElement>) => {
        if (event.button !== 0) return;
        event.stopPropagation();
        const box = boxes[id];
        if (!box) return;
        selectNode(workflowId, id, onSelect);
        dragRef.current = {
            id,
            startX: event.clientX,
            startY: event.clientY,
            origX: box.x,
            origY: box.y,
            moved: false,
        };
    };

    useEffect(() => {
        const onMove = (event: PointerEvent) => {
            if (!dragRef.current && !panRef.current) return;
            applyPointerMove(event.clientX, event.clientY);
        };
        const onUp = () => endInteraction();
        window.addEventListener("pointermove", onMove);
        window.addEventListener("pointerup", onUp);
        return () => {
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("pointerup", onUp);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [workflowId, onSelect]);

    const percent = Math.round(scale * 100);
    const gridSize = 22 * scale;

    return (
        <div data-tour="relance-canvas" className="relative flex-1 min-w-0 min-h-[160px] md:min-h-0 h-full overflow-hidden">
            <div
                ref={viewportRef}
                className={cn(
                    "absolute inset-0 touch-none",
                    panning || draggingId ? "cursor-grabbing" : "cursor-grab"
                )}
                style={{
                    backgroundColor: "#0c0c0e",
                    backgroundImage:
                        "radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)",
                    backgroundSize: `${gridSize}px ${gridSize}px`,
                    backgroundPosition: `${tx}px ${ty}px`,
                }}
                onPointerDown={onBackgroundPointerDown}
                onPointerMove={onViewportPointerMove}
                onPointerUp={endInteraction}
                onPointerCancel={endInteraction}
            >
                <div
                    className="absolute left-0 top-0 origin-top-left will-change-transform"
                    style={{
                        width: scene.w,
                        height: scene.h,
                        transform: `translate(${tx}px, ${ty}px) scale(${scale})`,
                    }}
                >
                    <svg
                        width={scene.w}
                        height={scene.h}
                        viewBox={`0 0 ${scene.w} ${scene.h}`}
                        className="pointer-events-none absolute inset-0 overflow-visible"
                        aria-hidden
                    >
                        <ArrowDefs id={`wf-${workflowId}-arrow`} />
                        {wires.map((wire, index) => (
                            <WirePath
                                key={`${wire.from.id}-${wire.to.id}-${index}`}
                                boxes={boxes}
                                wire={wire}
                                markerId={`wf-${workflowId}-arrow`}
                            />
                        ))}
                        <BusRail
                            boxes={boxes}
                            fromId="gate"
                            toIds={
                                workflowId === "devis"
                                    ? ["mail1", "mail2", "mail3", "idle"]
                                    : ["j3", "j1", "digest"]
                            }
                            label={workflowId === "devis" ? "Muet" : "Impayée"}
                            markerId={`wf-${workflowId}-arrow`}
                        />
                    </svg>

                    {items.map((item) => {
                        const box = boxes[item.id];
                        if (!box) return null;
                        return (
                            <div
                                key={item.id}
                                data-wf-node
                                data-tour={`relance-${workflowId}-${item.id}`}
                                className="absolute"
                                style={{ left: box.x, top: box.y }}
                            >
                                <WorkflowNode
                                    tag={item.tag}
                                    title={item.title}
                                    sub={item.sub}
                                    tone={item.tone}
                                    disabledStep={item.off}
                                    soon={item.soon}
                                    ports={item.ports}
                                    dragging={draggingId === item.id}
                                    selected={isSelected(selected, workflowId, item.id)}
                                    onSelect={() => selectNode(workflowId, item.id, onSelect)}
                                    onPointerDown={(event) => startNodeDrag(item.id, event)}
                                    className="w-full"
                                    style={{ width: box.w, height: box.h }}
                                />
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="pointer-events-none absolute inset-x-0 top-3 flex justify-center px-3">
                <p className="pointer-events-none text-[11px] text-slate-500 bg-[#0c0c0e]/80 px-2 py-1 rounded-md">
                    Glisser le fond pour déplacer · tirer un bloc pour le ranger · Ctrl + molette pour zoomer
                </p>
            </div>

            <div
                data-tour="relance-zoom"
                className="absolute bottom-4 left-4 z-10 flex items-center rounded-md border border-white/10 bg-[#141418]/95 overflow-hidden"
            >
                <button
                    type="button"
                    className="h-9 w-9 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5"
                    onClick={() => {
                        const viewport = viewportRef.current;
                        if (!viewport) return;
                        const rect = viewport.getBoundingClientRect();
                        zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, scale - ZOOM_STEP);
                    }}
                    aria-label="Zoom arrière"
                >
                    <Minus className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    className="h-9 min-w-[3.5rem] px-2 text-xs font-semibold text-white hover:bg-white/5 border-x border-white/10"
                    onClick={() => {
                        const viewport = viewportRef.current;
                        if (!viewport) return;
                        const rect = viewport.getBoundingClientRect();
                        zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, 1);
                    }}
                    aria-label="Réinitialiser le zoom"
                >
                    {percent} %
                </button>
                <button
                    type="button"
                    className="h-9 w-9 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5"
                    onClick={() => {
                        const viewport = viewportRef.current;
                        if (!viewport) return;
                        const rect = viewport.getBoundingClientRect();
                        zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, scale + ZOOM_STEP);
                    }}
                    aria-label="Zoom avant"
                >
                    <Plus className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    className="h-9 w-9 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/5 border-l border-white/10"
                    onClick={() => fitToView()}
                    aria-label="Ajuster à l’écran"
                    title="Ajuster à l’écran"
                >
                    <Maximize2 className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}

function BusRail({
    boxes,
    fromId,
    toIds,
    label,
    markerId,
}: {
    boxes: Record<NodeId, NodeBox>;
    fromId: NodeId;
    toIds: NodeId[];
    label: string;
    markerId: string;
}) {
    const from = boxes[fromId];
    const targets = toIds.map((id) => boxes[id]).filter(Boolean);
    if (!from || !targets.length) return null;
    const fromPort = portPoint(from, "right");
    const busX = fromPort.x + 40;
    const centers = targets.map((box) => portPoint(box, "left").y);
    const minY = Math.min(fromPort.y, ...centers);
    const maxY = Math.max(fromPort.y, ...centers);

    return (
        <g>
            <path
                d={`M ${fromPort.x} ${fromPort.y} L ${busX} ${fromPort.y}`}
                fill="none"
                stroke="rgba(148,163,184,0.55)"
                strokeWidth="1.75"
            />
            <path
                d={`M ${busX} ${minY} L ${busX} ${maxY}`}
                fill="none"
                stroke="rgba(148,163,184,0.55)"
                strokeWidth="1.75"
            />
            <text x={(fromPort.x + busX) / 2} y={fromPort.y - 8} textAnchor="middle" fill="#94a3b8" fontSize="11">
                {label}
            </text>
            {targets.map((box) => {
                const to = portPoint(box, "left");
                return (
                    <path
                        key={box.id}
                        d={`M ${busX} ${to.y} L ${to.x} ${to.y}`}
                        fill="none"
                        stroke="rgba(148,163,184,0.55)"
                        strokeWidth="1.75"
                        markerEnd={`url(#${markerId})`}
                    />
                );
            })}
        </g>
    );
}

function WirePath({
    boxes,
    wire,
    markerId,
}: {
    boxes: Record<NodeId, NodeBox>;
    wire: Wire;
    markerId: string;
}) {
    const fromBox = boxes[wire.from.id];
    const toBox = boxes[wire.to.id];
    if (!fromBox || !toBox) return null;
    const from = portPoint(fromBox, wire.from.port);
    const to = portPoint(toBox, wire.to.port);
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const d =
        dx < 8
            ? `M ${from.x} ${from.y} L ${to.x} ${to.y}`
            : dy < 8
              ? `M ${from.x} ${from.y} L ${to.x} ${to.y}`
              : `M ${from.x} ${from.y} L ${from.x + Math.max(24, dx * 0.35)} ${from.y} L ${to.x - Math.max(24, dx * 0.35)} ${to.y} L ${to.x} ${to.y}`;

    const labelX =
        wire.labelAt === "from" ? from.x + 10 : (from.x + to.x) / 2;
    const labelY =
        wire.labelAt === "from" ? (from.y + to.y) / 2 : Math.min(from.y, to.y) - 8;

    return (
        <g>
            <path
                d={d}
                fill="none"
                stroke="rgba(148,163,184,0.55)"
                strokeWidth="1.75"
                markerEnd={`url(#${markerId})`}
            />
            {wire.label && (
                <text x={labelX} y={labelY} fill="#94a3b8" fontSize="11">
                    {wire.label}
                </text>
            )}
        </g>
    );
}

function ArrowDefs({ id }: { id: string }) {
    return (
        <defs>
            <marker
                id={id}
                viewBox="0 0 8 8"
                refX="6.5"
                refY="4"
                markerWidth="7"
                markerHeight="7"
                markerUnits="userSpaceOnUse"
                orient="auto-start-reverse"
            >
                <path
                    d="M 1 1 L 6.5 4 L 1 7"
                    fill="none"
                    stroke="rgba(148,163,184,0.8)"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </marker>
        </defs>
    );
}

function quoteItems(form: ReminderConfigUpdate): GraphItem[] {
    const d1 = form.reminder_1_days ?? 2;
    const d2 = form.reminder_2_days ?? 5;
    const d3 = form.reminder_3_days ?? 10;
    const active = !!form.is_active;
    return [
        {
            id: "trigger",
            tag: "Déclencheur",
            title: "Devis envoyé",
            sub: "Statut en attente",
            ports: ["right"],
        },
        {
            id: "stop",
            tag: "Coupe-circuit",
            title: "On coupe tout",
            sub: form.stop_on_view ? "Ouvert, signé, refusé" : "Signé ou refusé",
            ports: ["bottom"],
        },
        {
            id: "gate",
            tag: "Garde-fou",
            title: "État du devis",
            sub: "Ouvert ou tranché ?",
            ports: ["left", "top", "right"],
        },
        {
            id: "mail1",
            tag: "Email client",
            title: `1. J+${d1} : Bien reçu ?`,
            sub: "Optionnel, lien devis",
            tone: "client",
            ports: ["left"],
            off: !active || !form.reminder_1_enabled,
        },
        {
            id: "mail2",
            tag: "Email client",
            title: `2. J+${d2} : Questions ?`,
            sub: "Optionnel, indépendant",
            tone: "client",
            ports: ["left"],
            off: !active || !form.reminder_2_enabled,
        },
        {
            id: "mail3",
            tag: "Email client",
            title: `3. J+${d3} : Expiration`,
            sub: "Optionnel, dernier mail",
            tone: "client",
            ports: ["left"],
            off: !active || !form.reminder_3_enabled,
        },
        {
            id: "idle",
            tag: "Fin naturelle",
            title: "Silence",
            sub: "Fin, aucun 4e email",
            tone: "passive",
            ports: ["left"],
        },
    ];
}

function invoiceItems(): GraphItem[] {
    return [
        {
            id: "trigger",
            tag: "Déclencheur",
            title: "Facture envoyée",
            sub: "Autour échéance J0",
            ports: ["right"],
        },
        {
            id: "stop",
            tag: "Coupe-circuit",
            title: "Fil arrêté",
            sub: "Facture soldée",
            ports: ["bottom"],
        },
        {
            id: "gate",
            tag: "Garde-fou",
            title: "Statut facture",
            sub: "Payée entre-temps ?",
            ports: ["left", "top", "right"],
        },
        {
            id: "j3",
            tag: "Email client",
            title: "1. J-3 : Prévention",
            sub: "Client, montant et lien",
            tone: "client",
            ports: ["left"],
        },
        {
            id: "j1",
            tag: "Email client",
            title: "2. J-1 : Rappel",
            sub: "Client, veille échéance",
            tone: "client",
            ports: ["left"],
        },
        {
            id: "digest",
            tag: "Accord prestataire",
            title: "3. J+1 : Digest",
            sub: "À vous : déjà payée ?",
            tone: "provider",
            soon: true,
            ports: ["left", "bottom"],
        },
        {
            id: "manual",
            tag: "Email client",
            title: "Relance retard",
            sub: "Client, sur votre clic",
            tone: "client",
            soon: true,
            ports: ["top"],
        },
    ];
}

function quoteWires(): Wire[] {
    return [
        { from: { id: "trigger", port: "right" }, to: { id: "gate", port: "left" } },
        {
            from: { id: "gate", port: "top" },
            to: { id: "stop", port: "bottom" },
            label: "Oui, dès J+0",
            labelAt: "from",
        },
    ];
}

function invoiceWires(): Wire[] {
    return [
        { from: { id: "trigger", port: "right" }, to: { id: "gate", port: "left" } },
        {
            from: { id: "gate", port: "top" },
            to: { id: "stop", port: "bottom" },
            label: "Payée",
            labelAt: "from",
        },
        {
            from: { id: "digest", port: "bottom" },
            to: { id: "manual", port: "top" },
            label: "Sur votre clic",
            labelAt: "from",
        },
    ];
}

function isSelected(selected: SelectedNode | null, workflowId: WorkflowId, id: NodeId) {
    return selected?.workflow === workflowId && selected.id === id;
}

function selectNode(
    workflowId: WorkflowId,
    id: NodeId,
    onSelect: (node: SelectedNode) => void
) {
    if (workflowId === "devis") {
        onSelect({
            workflow: "devis",
            id: id as Extract<SelectedNode, { workflow: "devis" }>["id"],
        });
        return;
    }
    onSelect({
        workflow: "facture",
        id: id as Extract<SelectedNode, { workflow: "facture" }>["id"],
    });
}
