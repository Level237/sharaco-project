"use client";

import { Suspense } from "react";
import { RemindersStudio } from "@/features/reminders/components/RemindersStudio";

export default function RelancesPage() {
    return (
        <div className="-m-4 md:-m-8 lg:-m-10 h-[calc(100dvh-7.5rem)] md:h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-5rem)]">
            <Suspense fallback={<div className="h-full bg-[#0a0a0a]" />}>
                <RemindersStudio />
            </Suspense>
        </div>
    );
}
