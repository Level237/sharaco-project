interface ClientCharacterProps {
    className?: string;
}

export function ClientCharacter({ className }: ClientCharacterProps) {
    return (
        <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
            <circle cx="40" cy="40" r="32" fill="#1d4ed8" />
            <circle cx="40" cy="33" r="9" fill="#f8fafc" />
            <path d="M20 66c3-12 10-16 20-16s17 4 20 16" fill="#f8fafc" />
        </svg>
    );
}
