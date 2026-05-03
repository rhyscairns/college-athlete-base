export function EmptyInboxIllustration() {
    return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {/* Envelope body */}
            <rect x="16" y="34" width="88" height="60" rx="6" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--brand-500)' }} />
            {/* Envelope flap */}
            <path d="M16 40 L60 68 L104 40" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--brand-500)' }} />
            {/* Sparkle top-right */}
            <path d="M90 20 L92 14 L94 20 L100 22 L94 24 L92 30 L90 24 L84 22 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" style={{ color: 'var(--accent-500)' }} />
            {/* Small dot */}
            <circle cx="28" cy="22" r="3" fill="currentColor" style={{ color: 'var(--brand-200)' }} />
        </svg>
    );
}
