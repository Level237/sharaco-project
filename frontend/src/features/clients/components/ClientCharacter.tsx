interface ClientCharacterProps {
    className?: string;
}

export function ClientCharacter({ className }: ClientCharacterProps) {
    return (
        <svg viewBox="0 0 80 80" className={className} aria-hidden="true">
            <circle cx="40" cy="40" r="38" fill="#1d4ed8" />
            <circle cx="40" cy="30" r="15" fill="#f8fafc" />
            <path d="M8 72c5-18 15-26 32-26s27 8 32 26" fill="#f8fafc" />
        </svg>
    );
}
