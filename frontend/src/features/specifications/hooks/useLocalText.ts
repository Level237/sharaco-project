"use client"

import { useEffect, useRef, useState } from "react"

/** Saisie immédiate dans le champ, commit parent différé (évite de re-rendre tout le CDC à chaque lettre). */
export function useLocalText(value: string, onCommit: (next: string) => void, delay = 280) {
    const [local, setLocal] = useState(value)
    const [seenValue, setSeenValue] = useState(value)
    const onCommitRef = useRef(onCommit)

    if (value !== seenValue) {
        setSeenValue(value)
        setLocal(value)
    }

    useEffect(() => {
        onCommitRef.current = onCommit
    }, [onCommit])

    useEffect(() => {
        if (local === value) return
        const timer = window.setTimeout(() => {
            onCommitRef.current(local)
        }, delay)
        return () => window.clearTimeout(timer)
    }, [local, value, delay])

    const flush = () => {
        if (local === value) return
        onCommitRef.current(local)
    }

    return { local, setLocal, flush }
}
