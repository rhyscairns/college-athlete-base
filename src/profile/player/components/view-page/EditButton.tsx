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
                className="min-h-[44px] min-w-[44px] px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-semibold hover:bg-white/15 disabled:opacity-50 disabled:cursor-not-allowed transition-all touch-manipulation"
                aria-label="Edit section"
            >
                Edit
            </button>

            {showTooltip && disabled && tooltip && (
                <div
                    className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg whitespace-nowrap -top-12 left-1/2 transform -translate-x-1/2"
                    role="tooltip"
                >
                    {tooltip}
                    <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1" />
                </div>
            )}
        </div>
    );
}
