"use client";

import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/utils";
import type { WorkflowNodeTone } from "../data/workflows";

export type PortSide = "left" | "right" | "top" | "bottom";

type WorkflowNodeProps = {
    tag: string;
    title: string;
    sub: string;
    tone?: WorkflowNodeTone;
    disabledStep?: boolean;
    soon?: boolean;
    selected?: boolean;
    dragging?: boolean;
    ports?: PortSide[];
    style?: CSSProperties;
    className?: string;
    onSelect: () => void;
    onPointerDown?: (event: ReactPointerEvent<HTMLButtonElement>) => void;
};

export function WorkflowNode({
    tag,
    title,
    sub,
    tone = "neutral",
    disabledStep = false,
    soon = false,
    selected = false,
    dragging = false,
    ports = [],
    style,
    className,
    onSelect,
    onPointerDown,
}: WorkflowNodeProps) {
    return (
        <button
            type="button"
            style={style}
            onClick={onSelect}
            onPointerDown={onPointerDown}
            className={cn(
                "group relative rounded-lg border text-left select-none",
                "px-4 py-3.5 min-h-[92px]",
                "transition-[border-color,box-shadow] duration-150 ease-out",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
                "active:scale-[0.99]",
                tone === "neutral" && "bg-[#17171b] border-white/20 hover:border-white/35",
                tone === "passive" && "bg-[#131316] border-white/12 hover:border-white/25",
                tone === "client" &&
                    !disabledStep &&
                    "bg-blue-500/[0.10] border-blue-400/40 hover:border-blue-300/70",
                tone === "client" &&
                    disabledStep &&
                    "bg-[#141416] border-white/10 opacity-55 hover:opacity-80",
                tone === "provider" &&
                    "bg-purple-500/[0.11] border-purple-400/40 hover:border-purple-300/70",
                selected && "ring-2 ring-blue-500 border-blue-400",
                dragging && "cursor-grabbing z-20",
                !dragging && "cursor-grab",
                className
            )}
        >
            {ports.includes("left") && <Port className="left-0 top-1/2 -translate-x-1/2 -translate-y-1/2" />}
            {ports.includes("right") && (
                <Port className="right-0 top-1/2 translate-x-1/2 -translate-y-1/2" />
            )}
            {ports.includes("top") && (
                <Port className="top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            )}
            {ports.includes("bottom") && (
                <Port className="bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2" />
            )}

            <div className="flex items-center justify-between gap-2">
                <span
                    className={cn(
                        "text-[11px] font-medium tracking-wide",
                        tone === "client" && !disabledStep && "text-blue-300",
                        tone === "provider" && "text-purple-300",
                        (tone === "neutral" || tone === "passive" || disabledStep) &&
                            "text-slate-400"
                    )}
                >
                    {tag}
                </span>
                {(disabledStep || soon) && (
                    <span className="text-[11px] font-medium text-slate-400">
                        {soon ? "Bientôt" : "Off"}
                    </span>
                )}
            </div>
            <p className="mt-1.5 text-[14px] font-semibold text-white leading-snug">{title}</p>
            <p className="mt-1 text-[12px] text-slate-400 leading-snug">{sub}</p>
        </button>
    );
}

function Port({ className }: { className: string }) {
    return (
        <span
            className={cn(
                "pointer-events-none absolute h-3 w-3 rounded-full border border-white/35 bg-[#0c0c0e]",
                className
            )}
        />
    );
}
