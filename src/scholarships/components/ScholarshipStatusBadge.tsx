import type { ScholarshipStatusBadgeProps } from '../types';

const STATUS_CONFIG = {
    pending: {
        label: 'Pending',
        background: 'oklch(75% 0.18 85 / 0.15)',
        border: 'oklch(75% 0.18 85 / 0.4)',
        color: 'oklch(75% 0.18 85)',
    },
    accepted: {
        label: 'Accepted',
        background: 'oklch(68% 0.22 150 / 0.15)',
        border: 'oklch(68% 0.22 150 / 0.4)',
        color: 'oklch(68% 0.22 150)',
    },
    rejected: {
        label: 'Rejected',
        background: 'oklch(65% 0.24 25 / 0.12)',
        border: 'oklch(65% 0.24 25 / 0.3)',
        color: 'var(--status-danger)',
    },
    countered: {
        label: 'Countered',
        background: 'oklch(75% 0.18 85 / 0.15)',
        border: 'oklch(75% 0.18 85 / 0.4)',
        color: 'oklch(75% 0.18 85)',
    },
} as const;

export function ScholarshipStatusBadge({ status }: ScholarshipStatusBadgeProps) {
    const config = STATUS_CONFIG[status];
    return (
        <span
            data-testid={`status-badge-${status}`}
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold"
            style={{
                background: config.background,
                border: `1px solid ${config.border}`,
                color: config.color,
            }}
        >
            {config.label}
        </span>
    );
}
