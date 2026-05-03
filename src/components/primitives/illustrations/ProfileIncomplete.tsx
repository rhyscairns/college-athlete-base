export function ProfileIncompleteIllustration() {
    return (
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            {/* Person head */}
            <circle cx="60" cy="38" r="18" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--brand-500)' }} />
            {/* Person body arc */}
            <path d="M24 100 C24 78 38 66 60 66 C82 66 96 78 96 100" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ color: 'var(--brand-500)' }} />
            {/* Dashed incomplete line on body */}
            <path d="M24 100 C24 78 38 66 60 66" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4 4" style={{ color: 'var(--accent-500)' }} />
            {/* Exclamation badge */}
            <circle cx="90" cy="30" r="12" fill="currentColor" style={{ color: 'var(--accent-500)' }} />
            <path d="M90 24 L90 31" stroke="white" strokeWidth="2" strokeLinecap="round" />
            <circle cx="90" cy="35" r="1.5" fill="white" />
        </svg>
    );
}
