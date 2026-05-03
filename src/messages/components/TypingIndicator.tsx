'use client';

/**
 * TypingIndicator — three dots with staggered breath animation.
 * Uses the design system --e-glide easing and --d-base timing.
 */
export function TypingIndicator({ name }: { name: string }) {
    return (
        <div
            className="flex items-center gap-2 px-4 py-2"
            role="status"
            aria-label={`${name} is typing`}
            data-testid="typing-indicator"
        >
            <div
                className="flex items-center gap-1 px-3 py-2 rounded-2xl rounded-bl-sm"
                style={{ background: 'var(--ink-2)' }}
            >
                {[0, 160, 320].map((delay) => (
                    <span
                        key={delay}
                        aria-hidden="true"
                        className="block w-2 h-2 rounded-full animate-breath"
                        style={{
                            background: 'var(--text-lo)',
                            animationDelay: `${delay}ms`,
                        }}
                    />
                ))}
            </div>
            <span className="sr-only">{name} is typing…</span>
        </div>
    );
}
