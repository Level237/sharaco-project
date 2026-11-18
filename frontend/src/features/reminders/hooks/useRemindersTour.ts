"use client";

import { useCallback, useEffect, useRef } from "react";
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";
import { readStorage, writeStorage } from "@/lib/storage";
import {
    reminderTourSteps,
    TOUR_STORAGE_KEY,
    type ReminderTourApi,
    type ReminderTourScope,
} from "../data/reminderTour";

type Options = {
    scope: ReminderTourScope;
    select: ReminderTourApi["select"];
    focusNode: ReminderTourApi["focusNode"];
    force?: boolean;
};

function waitForSelector(selector: string | undefined, timeoutMs = 5000) {
    return new Promise<boolean>((resolve) => {
        if (!selector) {
            resolve(true);
            return;
        }
        if (document.querySelector(selector)) {
            resolve(true);
            return;
        }
        const started = Date.now();
        const timer = window.setInterval(() => {
            if (document.querySelector(selector)) {
                window.clearInterval(timer);
                resolve(true);
                return;
            }
            if (Date.now() - started > timeoutMs) {
                window.clearInterval(timer);
                resolve(false);
            }
        }, 80);
    });
}

export function useRemindersTour({ scope, select, focusNode, force = false }: Options) {
    const selectRef = useRef(select);
    const focusRef = useRef(focusNode);
    const scopeRef = useRef(scope);
    const persistSeenRef = useRef(true);
    selectRef.current = select;
    focusRef.current = focusNode;
    scopeRef.current = scope;
    const instanceRef = useRef<ReturnType<typeof driver> | null>(null);

    const startTour = useCallback(() => {
        instanceRef.current?.destroy();
        persistSeenRef.current = true;
        const currentScope = scopeRef.current;

        const defs = reminderTourSteps(currentScope);
        const steps: DriveStep[] = defs.map((item, index) => {
            const next = defs[index + 1];
            const waitForPanel =
                !!next?.element &&
                (next.element.includes("relance-field") ||
                    next.element.includes("relance-inspector"));
            return {
                element: item.element,
                popover: {
                    title: item.title,
                    description: item.description,
                    side: item.side,
                    align: "center",
                    onNextClick: (_el, _step, { driver: driverObj }) => {
                        if (item.node) {
                            selectRef.current(item.node);
                            focusRef.current(item.node.id);
                        }
                        window.setTimeout(() => driverObj.moveNext(), waitForPanel ? 200 : 0);
                    },
                },
                onHighlightStarted: () => {
                    if (!item.node) return;
                    selectRef.current(item.node);
                    focusRef.current(item.node.id);
                },
            };
        });

        const instance = driver({
            showProgress: true,
            animate: true,
            smoothScroll: false,
            allowClose: true,
            overlayColor: "rgba(0, 0, 0, 0.72)",
            stagePadding: 8,
            stageRadius: 10,
            popoverOffset: 12,
            nextBtnText: "Suivant",
            prevBtnText: "Retour",
            doneBtnText: "Terminé",
            progressText: "{{current}} / {{total}}",
            onDestroyed: () => {
                if (persistSeenRef.current) {
                    writeStorage(TOUR_STORAGE_KEY[currentScope], "true");
                }
                focusRef.current(null);
                instanceRef.current = null;
            },
            steps,
        });

        instanceRef.current = instance;
        window.setTimeout(() => instance.drive(), 50);
    }, []);

    useEffect(() => {
        const seen = readStorage(TOUR_STORAGE_KEY[scope]);
        if (!force && seen) return;

        let cancelled = false;
        const timer = window.setTimeout(async () => {
            const first = reminderTourSteps(scope)[0]?.element;
            await waitForSelector(first);
            if (cancelled) return;
            startTour();
        }, 400);

        return () => {
            cancelled = true;
            window.clearTimeout(timer);
            persistSeenRef.current = false;
            instanceRef.current?.destroy();
            instanceRef.current = null;
        };
    }, [scope, force, startTour]);

    return { startTour };
}
