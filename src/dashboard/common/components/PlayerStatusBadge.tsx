'use client';

import React from 'react';

type PlayerStatus = 'available' | 'interested' | 'contacted';

interface PlayerStatusBadgeProps {
    status: PlayerStatus;
}

const STATUS_STYLES: Record<PlayerStatus, string> = {
    available: 'bg-green-500 text-white',
    interested: 'bg-orange-500 text-white',
    contacted: 'bg-red-500 text-white',
};

const STATUS_LABELS: Record<PlayerStatus, string> = {
    available: 'Available',
    interested: 'Interested',
    contacted: 'Contacted',
};

/**
 * Displays a status badge for a player card indicating their recruitment status.
 * The badge is positioned absolutely in the top-right corner of its container.
 * 
 * @param props - Component props
 * @param props.status - The player's current status (available, interested, or contacted)
 * @returns Status badge component with appropriate styling and accessibility attributes
 * 
 * @example
 * ```tsx
 * <PlayerStatusBadge status="available" />
 * <PlayerStatusBadge status="interested" />
 * <PlayerStatusBadge status="contacted" />
 * ```
 */
export const PlayerStatusBadge: React.FC<PlayerStatusBadgeProps> = ({ status }): React.ReactElement => {
    return (
        <div className="absolute top-3 right-3">
            <span
                className={`px-3 py-1 rounded-full text-sm font-semibold shadow-lg ${STATUS_STYLES[status]}`}
                role="status"
                aria-label={`Status: ${STATUS_LABELS[status]}`}
            >
                {STATUS_LABELS[status]}
            </span>
        </div>
    );
};
