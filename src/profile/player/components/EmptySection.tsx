'use client';

import React from 'react';

export interface EmptySectionProps {
    /**
     * Title to display in the empty state
     */
    title: string;

    /**
     * Description or helpful message to display
     */
    description: string;

    /**
     * Whether the current user is the profile owner
     */
    isOwner?: boolean;

    /**
     * Whether to show the edit button (only shown if isOwner is true)
     */
    showEditButton?: boolean;

    /**
     * Callback when edit button is clicked
     */
    onEdit?: () => void;

    /**
     * Optional icon to display (emoji or SVG)
     */
    icon?: React.ReactNode;

    /**
     * Optional custom CSS classes
     */
    className?: string;
}

/**
 * EmptySection component displays a placeholder when a profile section has no data.
 * It shows different content based on whether the viewer is the profile owner.
 * 
 * For owners: Shows edit prompts and action buttons
 * For non-owners: Shows minimal placeholder or can be hidden entirely
 */
export function EmptySection({
    title,
    description,
    isOwner = false,
    showEditButton = true,
    onEdit,
    icon,
    className = '',
}: EmptySectionProps) {
    // For non-owners, return null to hide the section entirely
    if (!isOwner) {
        return null;
    }

    return (
        <div
            className={`rounded-2xl p-8 md:p-12 border-dashed text-center ${className}`}
            style={{ background: 'oklch(68% 0.22 150 / 0.04)', border: '1px dashed var(--ink-3)' }}
        >
            {/* Icon */}
            {icon && (
                <div className="mb-4 flex justify-center">
                    {typeof icon === 'string' ? (
                        <span className="text-5xl opacity-50">{icon}</span>
                    ) : (
                        icon
                    )}
                </div>
            )}

            {/* Title */}
            <h3 className="text-xl md:text-2xl font-bold mb-3" style={{ color: 'var(--text-hi)' }}>
                {title}
            </h3>

            {/* Description */}
            <p className="text-base mb-6 max-w-md mx-auto" style={{ color: 'var(--text-lo)' }}>
                {description}
            </p>

            {/* Edit Button for Owners */}
            {isOwner && showEditButton && onEdit && (
                <button
                    onClick={onEdit}
                    className="min-h-[44px] px-6 py-3 font-semibold rounded-lg transition-all hover:scale-105 touch-manipulation"
                    style={{ background: 'var(--brand-500)', color: 'var(--ink-0)' }}
                    aria-label="Add content to this section"
                >
                    Add Content
                </button>
            )}
        </div>
    );
}
