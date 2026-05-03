export function EmptyProspectsIllustration() {
    return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {/* Heart outline */}
            <path
                d="M60 95 C60 95 20 70 20 44 C20 32 30 24 40 24 C48 24 55 29 60 36 C65 29 72 24 80 24 C90 24 100 32 100 44 C100 70 60 95 60 95Z"
                stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round"
                style={{ color: 'var(--brand-500)' }}
            />
            {/* Plus sign inside */}
            <path d="M60 50 L60 62 M54 56 L66 56" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ color: 'var(--brand-500)' }} />
            {/* Sparkle */}
            <path d="M96 28 L97.5 23 L99 28 L104 29.5 L99 31 L97.5 36 L96 31 L91 29.5 Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" style={{ color: 'var(--accent-500)' }} />
        </svg>
    );
}
