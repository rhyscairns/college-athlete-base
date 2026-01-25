import React from 'react';

interface ActionButtonsProps {
    onSave: () => void;
    onCancel: () => void;
    isSaving: boolean;
    disabled?: boolean;
}

export function ActionButtons({
    onSave,
    onCancel,
    isSaving,
    disabled = false,
}: ActionButtonsProps) {
    const handleSaveKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === 'Enter' && !disabled && !isSaving) {
            e.preventDefault();
            onSave();
        }
    };

    const handleCancelKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
        if (e.key === 'Enter' && !isSaving) {
            e.preventDefault();
            onCancel();
        }
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
                onClick={onSave}
                onKeyDown={handleSaveKeyDown}
                disabled={disabled || isSaving}
                className="min-h-[44px] w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white font-semibold hover:shadow-lg disabled:opacity-60 transition-all touch-manipulation flex items-center justify-center gap-2"
                type="button"
            >
                {isSaving && (
                    <svg
                        className="animate-spin h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                    >
                        <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                        ></circle>
                        <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                    </svg>
                )}
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
            </button>
            <button
                onClick={onCancel}
                onKeyDown={handleCancelKeyDown}
                disabled={isSaving}
                className="min-h-[44px] w-full sm:w-auto px-6 py-3 bg-white/5 border border-white/10 rounded-lg text-white/70 font-semibold hover:bg-white/10 hover:text-white transition-all touch-manipulation disabled:opacity-60 disabled:cursor-not-allowed"
                type="button"
            >
                Cancel
            </button>
        </div>
    );
}
