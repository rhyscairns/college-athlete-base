export function NoSearchResultsIllustration() {
    return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {/* Magnifying glass circle */}
            <circle cx="50" cy="50" r="28" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--brand-500)' }} />
            {/* Handle */}
            <path d="M71 71 L96 96" stroke="currentColor" strokeWidth="3" strokeLinecap="round" style={{ color: 'var(--brand-500)' }} />
            {/* X inside glass */}
            <path d="M42 42 L58 58 M58 42 L42 58" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ color: 'var(--accent-500)' }} />
        </svg>
    );
}
