import React, { useState } from 'react';

export interface EditButtonProps {
    onClick: () => void;
    disabled?: boolean;
    tooltip?: string;
}

export function EditButton({ onClick, disabled = false, tooltip }: EditButtonProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    const handleMouseEnter = () => {
        if (disabled && tooltip) {
            setShowTooltip(true);
        }
    };

    const handleMouseLeave = () => {
        setShowTooltip(false);
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <button
                onClick={onClick}
                disabled={disabled}
                className="min-h-[44px] min-w-[44px] px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation"
                style={{ background: 'var(--brand-500)', color: 'var(--ink-0)', border: '1px solid var(--brand-500)' }}
                onMouseEnter={e => !disabled && (e.currentTarget.style.background = 'var(--brand-600)')}
                onMouseLeave={e => !disabled && (e.currentTarget.style.background = 'var(--brand-500)')}
                aria-label="Edit section"
            >
                Edit
            </button>

            {showTooltip && disabled && tooltip && (
                <div
                    className="absolute z-10 px-3 py-2 text-sm rounded-lg shadow-lg whitespace-nowrap -top-12 left-1/2 transform -translate-x-1/2"
                    style={{ background: 'var(--ink-0)', color: 'var(--text-hi)' }}
                    role="tooltip"
                >
                    {tooltip}
                    <div className="absolute w-2 h-2 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1" style={{ background: 'var(--ink-0)' }} />
                </div>
            )}
        </div>
    );
}
