import type { SubmitButtonProps } from '../../../types';

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
            className="w-full h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
            {loading ? 'Loading...' : children}
        </button>
    );
}
