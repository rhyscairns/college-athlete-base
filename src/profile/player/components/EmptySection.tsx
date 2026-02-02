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
            className={`bg-white/5 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-white/10 border-dashed text-center ${className}`}
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
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
                {title}
            </h3>

            {/* Description */}
            <p className="text-base text-slate-400 mb-6 max-w-md mx-auto">
                {description}
            </p>

            {/* Edit Button for Owners */}
            {isOwner && showEditButton && onEdit && (
                <button
                    onClick={onEdit}
                    className="min-h-[44px] px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-semibold rounded-lg transition-all shadow-lg hover:shadow-xl hover:scale-105 touch-manipulation"
                    aria-label="Add content to this section"
                >
                    Add Content
                </button>
            )}
        </div>
    );
}
