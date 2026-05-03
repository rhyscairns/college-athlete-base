import type { SubmitButtonProps } from '../../../../types';

export function SubmitButton({
    loading = false,
    disabled = false,
    children,
    onClick,
    type = 'button',
}: SubmitButtonProps) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className="w-full h-12 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
            style={{ background: 'var(--brand-500)', color: 'var(--ink-0)' }}
        >
            {loading ? 'Loading...' : children}
        </button>
    );
}
