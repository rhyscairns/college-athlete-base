import React from 'react';
import { ActionButtonsProps } from '../../../../types';

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
                className="min-h-[44px] w-full sm:w-auto px-6 py-3 bg-blue-600 rounded-lg text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation flex items-center justify-center gap-2"
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
                className="min-h-[44px] w-full sm:w-auto px-6 py-3 bg-gray-200 rounded-lg text-gray-900 font-semibold hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
                type="button"
            >
                Cancel
            </button>
        </div>
    );
}
