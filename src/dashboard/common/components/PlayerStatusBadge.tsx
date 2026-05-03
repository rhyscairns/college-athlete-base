'use client';

import React from 'react';

type PlayerStatus = 'available' | 'interested' | 'contacted';

interface PlayerStatusBadgeProps {
    status: PlayerStatus;
}

const STATUS_STYLES: Record<PlayerStatus, React.CSSProperties> = {
    available:  { background: 'var(--status-success)', color: 'var(--text-hi)' },
    interested: { background: 'var(--status-warning)', color: 'var(--ink-0)' },
    contacted:  { background: 'var(--status-danger)',  color: 'var(--text-hi)' },
};

const STATUS_LABELS: Record<PlayerStatus, string> = {
    available: 'Available',
    interested: 'Interested',
    contacted: 'Contacted',
};

export const PlayerStatusBadge: React.FC<PlayerStatusBadgeProps> = ({ status }): React.ReactElement => {
    return (
        <div className="absolute top-3 left-3" data-testid="status-badge-wrapper">
            <span
                className="px-3 py-1 rounded-full text-sm font-semibold shadow-lg"
                style={STATUS_STYLES[status]}
                role="status"
                aria-label={`Status: ${STATUS_LABELS[status]}`}
                data-testid="status-badge"
            >
                {STATUS_LABELS[status]}
            </span>
        </div>
    );
};
